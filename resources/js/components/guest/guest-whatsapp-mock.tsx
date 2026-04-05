import { usePage } from '@inertiajs/react';
import { Loader2, SendHorizontal } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { HERMES } from '@/components/guest/hermes-brand';
import { MOCK_WHATSAPP_MESSAGES } from '@/components/guest/guest-mock-data';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import guest from '@/routes/guest';

export type WhatsappKioskProps = {
    sendEnabled: boolean;
    guestLabel: string | null;
};

function formatTimeLabel(): string {
    const d = new Date();
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function GuestWhatsAppMock({
    className,
    scrollRegionClassName,
    whatsappKiosk,
}: {
    className?: string;
    scrollRegionClassName?: string;
    whatsappKiosk: WhatsappKioskProps;
}) {
    const { csrfToken } = usePage<{ csrfToken: string }>().props;
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState<{ id: string; body: string; timeLabel: string }[]>([]);

    const sendUrl = useMemo(() => guest.whatsapp.send.url(), []);

    const sendMessage = useCallback(async () => {
        const message = draft.trim();
        if (!message || sending) {
            return;
        }

        setSending(true);
        try {
            const res = await fetch(sendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ message }),
            });

            const data = (await res.json().catch(() => ({}))) as { message?: string };

            if (!res.ok) {
                toast.error(
                    typeof data.message === 'string' ? data.message : 'Could not send WhatsApp. Try again.',
                );

                return;
            }

            setSent((prev) => [
                ...prev,
                { id: crypto.randomUUID(), body: message, timeLabel: formatTimeLabel() },
            ]);
            setDraft('');
            toast.success('Sent via WhatsApp (send_whatsapp)');
        } catch {
            toast.error('Network error. Check your connection.');
        } finally {
            setSending(false);
        }
    }, [csrfToken, draft, sendUrl, sending]);

    return (
        <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', className)}>
            <div className="mb-3 shrink-0">
                <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em]">WhatsApp</p>
                <h2 className="text-foreground mt-1 text-sm font-semibold text-balance">{HERMES.messagesTitle}</h2>
                <p className="text-muted-foreground mt-0.5 text-xs">{HERMES.messagesSubtitle} Scroll for more.</p>
                {whatsappKiosk.sendEnabled && whatsappKiosk.guestLabel ? (
                    <p className="text-primary mt-1 text-xs font-medium">
                        Live send → {whatsappKiosk.guestLabel}
                    </p>
                ) : (
                    <p className="text-muted-foreground mt-1 text-xs">
                        Set <code className="text-foreground font-mono text-[11px]">GUEST_KIOSK_WHATSAPP_GUEST_ID</code>{' '}
                        to enable outbound sends (Twilio WhatsApp required).
                    </p>
                )}
            </div>
            <div
                className={cn(
                    'border-border bg-muted/40 flex flex-col gap-3 rounded-xl border [-webkit-overflow-scrolling:touch]',
                    scrollRegionClassName
                        ? cn('shrink-0 overflow-y-auto overscroll-y-contain', scrollRegionClassName)
                        : 'min-h-0 flex-1 overflow-y-auto overscroll-y-contain',
                )}
                role="log"
                aria-label="WhatsApp messages from Hermes"
            >
                <div className="flex flex-col gap-3 p-3">
                    {MOCK_WHATSAPP_MESSAGES.map((m) => (
                        <div key={m.id} className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-foreground text-xs font-semibold">Hermes</span>
                                <span className="text-muted-foreground text-[10px] tabular-nums">{m.timeLabel}</span>
                            </div>
                            <div className="bg-primary text-primary-foreground max-w-[95%] rounded-lg rounded-tl-sm px-3 py-2 text-sm leading-relaxed shadow-sm">
                                {m.body}
                            </div>
                        </div>
                    ))}
                    {sent.map((m) => (
                        <div key={m.id} className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-foreground text-xs font-semibold">Hermes</span>
                                <span className="text-muted-foreground text-[10px] tabular-nums">{m.timeLabel}</span>
                                <span className="text-primary text-[10px] font-medium uppercase tracking-wide">Sent</span>
                            </div>
                            <div className="bg-primary text-primary-foreground max-w-[95%] rounded-lg rounded-tl-sm px-3 py-2 text-sm leading-relaxed shadow-sm ring-1 ring-primary/30">
                                {m.body}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="border-border mt-3 shrink-0 space-y-2 border-t pt-3">
                <label htmlFor="guest-wa-compose" className="text-muted-foreground sr-only">
                    Message to send
                </label>
                <textarea
                    id="guest-wa-compose"
                    rows={3}
                    maxLength={1600}
                    value={draft}
                    disabled={!whatsappKiosk.sendEnabled || sending}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={
                        whatsappKiosk.sendEnabled
                            ? 'Type a message — uses the same send_whatsapp tool as ARIA…'
                            : 'Configure kiosk guest ID to enable sending…'
                    }
                    className={cn(
                        'border-input bg-background placeholder:text-muted-foreground w-full resize-y rounded-xl border px-3 py-2 text-sm shadow-sm outline-none transition-[color,box-shadow]',
                        'focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-3',
                        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                />
                <Button
                    type="button"
                    size="sm"
                    className="w-full gap-2 sm:w-auto"
                    disabled={!whatsappKiosk.sendEnabled || sending || draft.trim() === ''}
                    onClick={() => void sendMessage()}
                >
                    {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <SendHorizontal className="size-4" aria-hidden />}
                    {whatsappKiosk.sendEnabled ? 'Send WhatsApp' : 'Sending disabled'}
                </Button>
            </div>
        </div>
    );
}
