import { GuestActivityMock } from '@/components/guest/guest-activity-mock';
import { GuestGlanceMock } from '@/components/guest/guest-glance-mock';
import { GuestWhatsAppMock } from '@/components/guest/guest-whatsapp-mock';
import { OrbDemo } from '@/components/guest/orb-demo';

/** 2×2 grid: gap-px + bg-border yields thin dividers between cells (shadcn pattern). */
const cell =
    'flex min-h-[min(44vh,300px)] min-h-0 min-w-0 flex-col bg-background p-4 sm:p-5 md:min-h-[min(36vh,340px)]';

export function GuestKioskLayout() {
    return (
        <div className="bg-border grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border md:grid-cols-2 md:grid-rows-2">
            <section className={cell}>
                <GuestWhatsAppMock />
            </section>
            <section className={cell}>
                <GuestActivityMock />
            </section>
            <section className={cell}>
                <div className="mb-3 shrink-0">
                    <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em]">Voice</p>
                    <h2 className="text-foreground mt-1 text-sm font-semibold text-balance">Voice agent</h2>
                    <p className="text-muted-foreground mt-0.5 text-xs">Tap a state to preview the orb.</p>
                </div>
                <div className="flex min-h-0 flex-1 flex-col justify-center">
                    <OrbDemo embedded />
                </div>
            </section>
            <section className={cell}>
                <GuestGlanceMock />
            </section>
        </div>
    );
}
