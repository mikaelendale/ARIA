import { Head } from '@inertiajs/react';
import { GuestKioskLayout } from '@/components/guest/guest-kiosk-layout';
import { GuestKioskTourProvider, GuestKioskTourTrigger } from '@/components/guest/guest-tour';
import { HERMES } from '@/components/guest/hermes-brand';

export type GuestVoicePageProps = {
    whatsappKiosk: {
        sendEnabled: boolean;
        guestLabel: string | null;
    };
};

/**
 * Public Hermes kiosk: voice orb (Hermes) + tabbed guest surfaces.
 */
export default function GuestVoice({ whatsappKiosk }: GuestVoicePageProps) {
    return (
        <>
            <Head title={HERMES.pageTitle} />
            <GuestKioskTourProvider>
                <div className="bg-background text-foreground flex min-h-dvh flex-col">
                    <header
                        data-tour="guest-intro"
                        className="border-border grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b px-3 py-3 sm:px-4"
                    >
                        <div aria-hidden className="min-w-0" />
                        <div className="text-foreground min-w-0 text-center">
                            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.28em]">
                                Kuriftu ARIA
                            </p>
                            <p className="text-primary mt-0.5 text-sm font-semibold tracking-tight">{HERMES.fullLabel}</p>
                            <p className="text-muted-foreground mt-0.5 hidden text-[11px] leading-snug sm:block">
                                {HERMES.stackLine}
                            </p>
                        </div>
                        <div className="flex min-w-0 justify-end">
                            <GuestKioskTourTrigger />
                        </div>
                    </header>
                    <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
                        <GuestKioskLayout whatsappKiosk={whatsappKiosk} />
                    </main>
                    <footer className="text-muted-foreground shrink-0 border-t border-border px-4 py-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] text-center text-[11px] leading-relaxed sm:text-xs">
                        {HERMES.footerDemo}
                    </footer>
                </div>
            </GuestKioskTourProvider>
        </>
    );
}
