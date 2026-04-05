import { Head } from '@inertiajs/react';
import { GuestKioskLayout } from '@/components/guest/guest-kiosk-layout';

/**
 * Public kiosk-style page for guests: no app chrome — WhatsApp mock, activity, voice orb, at a glance.
 */
export default function GuestVoice() {
    return (
        <>
            <Head title="Guest concierge" />
            <div className="bg-background text-foreground flex min-h-dvh flex-col">
                <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
                    <p className="text-muted-foreground mb-6 text-center text-xs font-medium uppercase tracking-[0.35em]">
                        Kuriftu ARIA
                    </p>
                    <div className="mx-auto w-full max-w-5xl flex-1">
                        <GuestKioskLayout />
                    </div>
                    <p className="text-muted-foreground mx-auto mt-10 max-w-lg text-center text-sm leading-relaxed">
                        Demo display — WhatsApp and activity feeds are illustrative. Voice orb is interactive; speak when
                        your host enables listening.
                    </p>
                </main>
            </div>
        </>
    );
}
