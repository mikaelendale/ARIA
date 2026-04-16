import { useCallback, useEffect, useRef, useState } from 'react';
import type { AgentState } from '@/components/ui/orb';
import { Orb } from '@/components/ui/orb';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type VoiceState = 'idle' | 'listening' | 'transcribing' | 'thinking' | 'talking';

type Turn = {
    role: 'user' | 'assistant';
    content: string;
};

type ApiError = { error: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Split a reply into sentences so TTS requests can be parallelised.
 * Each sentence is fetched concurrently; they're played back in order.
 * Keeps punctuation with the sentence that ends with it.
 */
function splitSentences(text: string): string[] {
    // Split on sentence-ending punctuation followed by whitespace or end-of-string.
    const parts = text
        .split(/(?<=[.!?።፡])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

    // Never produce more than 4 TTS requests; merge trailing fragments.
    if (parts.length <= 4) return parts;
    const head = parts.slice(0, 3);
    head.push(parts.slice(3).join(' '));
    return head;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ORB_COLORS: [string, string] = ['#CADCFC', '#A0B9D1'];
const MAX_HISTORY = 20; // 10 pairs

function voiceStateToOrb(state: VoiceState): AgentState {
    if (state === 'listening' || state === 'transcribing') return 'listening';
    if (state === 'thinking') return 'thinking';
    if (state === 'talking') return 'talking';
    return null;
}

const STATE_LABEL: Record<VoiceState, string> = {
    idle: 'Tap to speak',
    listening: 'Listening…',
    transcribing: 'Transcribing…',
    thinking: 'Hermes is thinking…',
    talking: 'Hermes is speaking…',
};

// ─── Hook: MediaRecorder-based mic capture ────────────────────────────────────

function useMicRecorder() {
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const start = useCallback(async (): Promise<void> => {
        // 16 kHz mono is sufficient for Whisper and cuts upload size ~6× vs default stereo 48 kHz.
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
        });
        chunksRef.current = [];

        // Prefer webm/opus at low bitrate; opus 16 kbps ≈ 2 KB/s — fast uploads.
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : MediaRecorder.isTypeSupported('audio/webm')
              ? 'audio/webm'
              : '';

        const recorder = new MediaRecorder(stream, {
            ...(mimeType ? { mimeType } : {}),
            audioBitsPerSecond: 16_000,
        });
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        recorder.start(100); // 100 ms chunks → minimal buffering before stop
    }, []);

    const stop = useCallback((): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const recorder = recorderRef.current;

            if (!recorder) {
                reject(new Error('No active recorder'));
                return;
            }

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, {
                    type: recorder.mimeType || 'audio/webm',
                });
                recorder.stream.getTracks().forEach((t) => t.stop());
                recorderRef.current = null;
                resolve(blob);
            };

            recorder.stop();
        });
    }, []);

    return { start, stop };
}

// ─── Transcript bubble ────────────────────────────────────────────────────────

function Bubble({ turn }: { turn: Turn }) {
    const isUser = turn.role === 'user';

    return (
        <div className={cn('flex', isUser ? 'justify-start' : 'justify-end')}>
            <div
                className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-snug',
                    isUser
                        ? 'bg-muted text-foreground rounded-tl-sm'
                        : 'bg-primary text-primary-foreground rounded-tr-sm',
                )}
            >
                {turn.content}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HermesVoiceOrb() {
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [history, setHistory] = useState<Turn[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [micDenied, setMicDenied] = useState(false);

    const transcriptEndRef = useRef<HTMLDivElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { start: startRecording, stop: stopRecording } = useMicRecorder();

    // Auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    // ── Step 1: transcribe ──────────────────────────────────────────────────
    const transcribe = useCallback(async (blob: Blob): Promise<string> => {
        const form = new FormData();
        // Extension must match accepted mimes on the server
        const ext = blob.type.includes('webm') ? 'webm' : blob.type.split('/')[1] ?? 'webm';
        form.append('audio', blob, `recording.${ext}`);

        const res = await fetch('/api/hermes/transcribe', {
            method: 'POST',
            body: form,
            headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
            const body = (await res.json().catch(() => ({}))) as ApiError;
            throw new Error(body.error ?? `Transcription error ${res.status}`);
        }

        const { transcript } = (await res.json()) as { transcript: string };
        return transcript;
    }, []);

    // ── Step 2: respond ─────────────────────────────────────────────────────
    const respond = useCallback(
        async (transcript: string, currentHistory: Turn[]): Promise<string> => {
            const res = await fetch('/api/hermes/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    transcript,
                    history: currentHistory.map((t) => ({ role: t.role, content: t.content })),
                }),
            });

            if (!res.ok) {
                const body = (await res.json().catch(() => ({}))) as ApiError;
                throw new Error(body.error ?? `Response error ${res.status}`);
            }

            const { reply } = (await res.json()) as { reply: string };
            return reply;
        },
        [],
    );

    // ── Step 3a: fetch one TTS blob ─────────────────────────────────────────
    const fetchSpeakBlob = useCallback(async (text: string): Promise<Blob> => {
        const res = await fetch('/api/hermes/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
            body: JSON.stringify({ text }),
        });

        if (!res.ok) throw new Error(`TTS error ${res.status}`);
        return res.blob();
    }, []);

    // ── Step 3b: play one blob, resolve when done ───────────────────────────
    const playBlob = useCallback((blob: Blob): Promise<void> => {
        const url = URL.createObjectURL(blob);

        return new Promise((resolve) => {
            const audio = new Audio(url);
            audioRef.current = audio;

            const cleanup = () => {
                URL.revokeObjectURL(url);
                if (audioRef.current === audio) audioRef.current = null;
                resolve();
            };

            audio.onended = cleanup;
            audio.onerror = cleanup;
            audio.play().catch(cleanup);
        });
    }, []);

    // ── Step 3: speak — parallel fetch, sequential playback ─────────────────
    // All sentence TTS requests fire simultaneously. Sentence 2 finishes downloading
    // while sentence 1 is playing — no gap between sentences, and first audio
    // starts as soon as the first sentence is synthesised (~300 ms for short text).
    const speakAbortRef = useRef(false);

    const speak = useCallback(
        async (text: string): Promise<void> => {
            const sentences = splitSentences(text);
            speakAbortRef.current = false;

            // Fire every TTS fetch in parallel.
            const blobPromises = sentences.map((s) => fetchSpeakBlob(s));

            for (const blobPromise of blobPromises) {
                if (speakAbortRef.current) break;

                const blob = await blobPromise;
                if (speakAbortRef.current) break;

                await playBlob(blob);
            }
        },
        [fetchSpeakBlob, playBlob],
    );

    // ── Full turn ───────────────────────────────────────────────────────────
    const runTurn = useCallback(
        async (blob: Blob) => {
            setError(null);

            try {
                setVoiceState('transcribing');
                const transcript = await transcribe(blob);

                if (!transcript.trim()) {
                    setVoiceState('idle');
                    return;
                }

                const userTurn: Turn = { role: 'user', content: transcript };
                const nextHistory = [...history, userTurn].slice(-MAX_HISTORY);
                setHistory(nextHistory);

                setVoiceState('thinking');
                const reply = await respond(transcript, history);

                const assistantTurn: Turn = { role: 'assistant', content: reply };
                setHistory((prev) => [...prev, assistantTurn].slice(-MAX_HISTORY));

                setVoiceState('talking');
                await speak(reply);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Something went wrong.');
            } finally {
                setVoiceState('idle');
            }
        },
        [history, transcribe, respond, speak],
    );

    // ── Mic button handler ──────────────────────────────────────────────────
    const handleMicPress = useCallback(async () => {
        // Barge-in: stop all pending TTS sentences and start recording immediately.
        if (voiceState === 'talking') {
            speakAbortRef.current = true;
            audioRef.current?.pause();
            audioRef.current = null;
        }

        if (voiceState !== 'idle' && voiceState !== 'talking') return;

        setError(null);

        try {
            await startRecording();
            setVoiceState('listening');
        } catch {
            setMicDenied(true);
            setVoiceState('idle');
            setError('Microphone access was denied. Please allow it in your browser settings.');
        }
    }, [voiceState, startRecording]);

    const handleMicRelease = useCallback(async () => {
        if (voiceState !== 'listening') return;

        try {
            const blob = await stopRecording();
            void runTurn(blob);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Recording failed.');
            setVoiceState('idle');
        }
    }, [voiceState, stopRecording, runTurn]);

    // ── Keyboard support (Space / Enter = push-to-talk) ─────────────────────
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                void handleMicPress();
            }
        },
        [handleMicPress],
    );

    const handleKeyUp = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                void handleMicRelease();
            }
        },
        [handleMicRelease],
    );

    const isBusy = voiceState !== 'idle' && voiceState !== 'talking';
    const orbState = voiceStateToOrb(voiceState);

    return (
        <div className="flex h-full w-full flex-col gap-4">
            {/* Orb + mic button */}
            <div className="flex flex-col items-center gap-3">
                {/* Orb */}
                <div
                    className={cn(
                        'relative mx-auto rounded-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]',
                        'h-[min(52vmin,18rem)] w-[min(52vmin,18rem)] max-w-full',
                        'bg-muted',
                        // pulse ring while listening
                        voiceState === 'listening' && 'ring-primary/50 ring-4 ring-offset-2',
                    )}
                >
                    <div className="bg-background h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]">
                        <Orb colors={ORB_COLORS} seed={1000} agentState={orbState} />
                    </div>
                </div>

                {/* State label */}
                <p
                    aria-live="polite"
                    className={cn(
                        'text-muted-foreground text-center text-xs font-medium uppercase tracking-[0.18em] transition-colors',
                        voiceState === 'listening' && 'text-primary',
                        voiceState === 'talking' && 'text-chart-2',
                    )}
                >
                    {STATE_LABEL[voiceState]}
                </p>

                {/* Mic button (push-to-talk) */}
                {micDenied ? (
                    <p className="text-destructive max-w-88 text-center text-xs leading-snug">
                        🎙 Mic access denied — enable it in your browser settings and reload.
                    </p>
                ) : (
                    <button
                        type="button"
                        aria-label={voiceState === 'listening' ? 'Release to send' : 'Hold to speak'}
                        disabled={isBusy}
                        onPointerDown={(e) => {
                            e.currentTarget.setPointerCapture(e.pointerId);
                            void handleMicPress();
                        }}
                        onPointerUp={() => void handleMicRelease()}
                        onPointerCancel={() => void handleMicRelease()}
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyUp}
                        className={cn(
                            'focus-visible:ring-ring inline-flex size-14 items-center justify-center rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                            voiceState === 'idle'
                                ? 'border-border bg-background hover:bg-muted active:scale-95'
                                : voiceState === 'listening'
                                  ? 'border-primary bg-primary text-primary-foreground scale-110'
                                  : voiceState === 'talking'
                                    ? 'border-chart-2 bg-chart-2/10 text-chart-2 cursor-pointer'
                                    : 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-60',
                        )}
                    >
                        {voiceState === 'listening' ? (
                            <StopIcon />
                        ) : voiceState === 'talking' ? (
                            <VolumeIcon />
                        ) : (
                            <MicIcon />
                        )}
                    </button>
                )}

                {/* Hint */}
                {voiceState === 'idle' && !micDenied && (
                    <p className="text-muted-foreground text-center text-[11px]">
                        Hold button · speak · release
                    </p>
                )}
                {voiceState === 'talking' && (
                    <p className="text-muted-foreground text-center text-[11px]">
                        Hold button to interrupt &amp; respond
                    </p>
                )}

                {error && (
                    <p
                        role="alert"
                        className="text-destructive max-w-88 text-center text-xs leading-snug"
                    >
                        {error}
                    </p>
                )}
            </div>

            {/* Transcript */}
            {history.length > 0 && (
                <div className="flex min-h-0 flex-1 flex-col">
                    <p className="text-muted-foreground mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em]">
                        Conversation
                    </p>
                    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                        {history.map((turn, i) => (
                            <Bubble key={i} turn={turn} />
                        ))}
                        <div ref={transcriptEndRef} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Inline SVG icons (no extra dep) ─────────────────────────────────────────

function MicIcon() {
    return (
        <svg
            aria-hidden
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
    );
}

function StopIcon() {
    return (
        <svg
            aria-hidden
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
    );
}

function VolumeIcon() {
    return (
        <svg
            aria-hidden
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
    );
}
