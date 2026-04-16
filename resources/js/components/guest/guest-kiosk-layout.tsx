import { GuestActivityMock } from '@/components/guest/guest-activity-mock';
import { GuestGlanceMock } from '@/components/guest/guest-glance-mock';
import { GuestWhatsAppMock, type WhatsappKioskProps } from '@/components/guest/guest-whatsapp-mock';
import { HERMES } from '@/components/guest/hermes-brand';
import { HermesVoiceOrb } from '@/components/guest/hermes-voice-orb';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type GuestTab = 'whatsapp' | 'activity' | 'glance';

const tabs: { id: GuestTab; label: string; short: string }[] = [
    { id: 'whatsapp', label: 'Messages', short: 'WA' },
    { id: 'activity', label: 'Live', short: 'Live' },
    { id: 'glance', label: 'Today', short: 'Today' },
];

/** Same fixed scroll height for Messages, Live, and Today body areas */
export const GUEST_TAB_SCROLL_REGION_CLASS = 'h-[min(50vh,420px)] min-h-[200px]';

/**
 * Equal split (md+): voice orb | tabbed panel. Messages / Live / Today share one fixed-height scroll box each.
 */
export function GuestKioskLayout({ whatsappKiosk }: { whatsappKiosk: WhatsappKioskProps }) {
    const [tab, setTab] = useState<GuestTab>('whatsapp');

    return (
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col md:flex-row">
            {/* Left: voice — 50% */}
            <section
                data-tour="guest-voice"
                className="border-border flex min-h-[min(36vh,300px)] shrink-0 flex-col border-b px-4 py-6 sm:px-6 md:min-h-0 md:min-w-0 md:flex-1 md:basis-0 md:border-r md:border-b-0 md:py-8"
            >
                <div className="mb-4 shrink-0 text-center md:mb-5">
                    <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em]">Voice layer</p>
                    <h2 className="text-foreground mt-1 text-lg font-semibold tracking-tight">{HERMES.name}</h2>
                    <p className="text-muted-foreground mt-1 text-xs leading-snug">{HERMES.pitch}</p>
                </div>
                <div className="flex w-full min-h-0 flex-1 flex-col items-center overflow-y-auto md:min-h-0 px-2">
                    <HermesVoiceOrb />
                </div>
            </section>

            {/* Right: tabs — 50% */}
            <div data-tour="guest-tabs" className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col">
                <div
                    role="tablist"
                    aria-label="Guest information"
                    className="border-border bg-muted/30 flex shrink-0 gap-1 border-b px-2 py-2 sm:px-4"
                >
                    {tabs.map((t) => {
                        const selected = tab === t.id;

                        return (
                            <button
                                key={t.id}
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                id={`guest-tab-${t.id}`}
                                aria-controls={`guest-panel-${t.id}`}
                                tabIndex={selected ? 0 : -1}
                                className={cn(
                                    'text-muted-foreground focus-visible:ring-ring min-h-11 flex-1 rounded-md px-2 py-2 text-center text-xs font-medium transition-colors sm:px-3 sm:text-sm',
                                    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                                    selected
                                        ? 'bg-background text-foreground border-border shadow-sm border'
                                        : 'hover:bg-background/60 hover:text-foreground border border-transparent',
                                )}
                                onClick={() => setTab(t.id)}
                            >
                                <span className="sm:hidden">{t.short}</span>
                                <span className="hidden sm:inline">{t.label}</span>
                            </button>
                        );
                    })}
                </div>

                {tab === 'whatsapp' ? (
                    <div
                        role="tabpanel"
                        id="guest-panel-whatsapp"
                        aria-labelledby="guest-tab-whatsapp"
                        className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5"
                    >
                        <div data-tour="guest-whatsapp" className="flex min-h-0 flex-1 flex-col">
                            <GuestWhatsAppMock
                                scrollRegionClassName={GUEST_TAB_SCROLL_REGION_CLASS}
                                whatsappKiosk={whatsappKiosk}
                            />
                        </div>
                    </div>
                ) : null}
                {tab === 'activity' ? (
                    <div
                        role="tabpanel"
                        id="guest-panel-activity"
                        aria-labelledby="guest-tab-activity"
                        className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5"
                    >
                        <div data-tour="guest-activity" className="flex min-h-0 flex-1 flex-col">
                            <GuestActivityMock scrollRegionClassName={GUEST_TAB_SCROLL_REGION_CLASS} />
                        </div>
                    </div>
                ) : null}
                {tab === 'glance' ? (
                    <div
                        role="tabpanel"
                        id="guest-panel-glance"
                        aria-labelledby="guest-tab-glance"
                        className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5"
                    >
                        <div data-tour="guest-glance" className="flex min-h-0 flex-1 flex-col">
                            <GuestGlanceMock scrollRegionClassName={GUEST_TAB_SCROLL_REGION_CLASS} />
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
