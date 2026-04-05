import { Head } from '@inertiajs/react';
import { OrbDemo } from '@/components/guest/orb-demo';

/**
 * Public kiosk-style page for guests: no app chrome, WebGL orb + agent states.
 */
export default function GuestVoice() {
    return (
        <>
            <Head title="Voice assistant" />
            <div className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-100">
                <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
                    <p className="mb-10 text-center text-xs font-medium uppercase tracking-[0.35em] text-zinc-500">
                        Kuriftu ARIA
                    </p>
                    <div className="w-full max-w-4xl">
                        <OrbDemo />
                    </div>
                    <p className="mt-16 max-w-sm text-center text-sm leading-relaxed text-zinc-400">
                        Your voice concierge is ready. This is a preview display — speak when your host enables listening.
                    </p>
                </main>
            </div>
        </>
    );
}
