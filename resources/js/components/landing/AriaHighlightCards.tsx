import { Radio, Mic, LayoutDashboard } from 'lucide-react';

const cards = [
    {
        title: 'ARIA EARS',
        caption: 'Every signal, one stream',
        blurb: 'Weather, flights, reviews, occupancy, WhatsApp, and kitchen timers — monitored continuously and turned into structured events.',
        icon: Radio,
        rotation: '-rotate-[2.5deg]',
        gradient: 'from-muted/80 via-background to-background',
    },
    {
        title: 'ARIA BRAIN',
        caption: 'Reasons before it acts',
        blurb: 'The orchestrator decides what matters, which agent to invoke, and when to escalate — with a full audit trail on the live dashboard.',
        icon: LayoutDashboard,
        rotation: 'rotate-[2.5deg]',
        gradient: 'from-accent via-background to-muted/30',
    },
] as const;

export default function AriaHighlightCards() {
    return (
        <section
            id="aria-highlight-cards"
            className="relative border-t border-border bg-background py-20 md:py-28"
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.4]"
                style={{
                    backgroundImage:
                        'radial-gradient(var(--border) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                }}
            />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        Three layers.{' '}
                        <span className="bg-linear-to-r from-primary to-chart-3 bg-clip-text text-transparent">
                            One system.
                        </span>
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                        The same architecture described in ARIA — ears that
                        listen, a brain that decides, and a voice guests
                        actually use — not bolted-on chatbots.
                    </p>
                </div>

                <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_minmax(0,22rem)_1fr] lg:items-center lg:gap-8">
                    {cards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.title}
                                className={`flex flex-col items-center ${
                                    index === 0 ? 'lg:justify-self-end' : ''
                                } ${index === 1 ? 'lg:justify-self-start lg:order-3' : ''}`}
                            >
                                <div
                                    className={`w-full max-w-md origin-center transition-transform duration-300 hover:scale-[1.02] ${card.rotation}`}
                                >
                                    <div
                                        className={`relative overflow-hidden rounded-[1.75rem] border border-border bg-linear-to-b ${card.gradient} shadow-lg shadow-primary/10`}
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,color-mix(in_oklch,var(--background)_92%,transparent)_88%)]" />
                                        <div className="relative aspect-4/3 p-8 md:p-10">
                                            <div className="flex h-full flex-col justify-between">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                                                    <Icon
                                                        className="h-7 w-7"
                                                        strokeWidth={1.5}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-mono text-xs font-bold tracking-widest text-primary uppercase">
                                                        {card.title}
                                                    </p>
                                                    <p className="mt-2 text-lg font-semibold text-foreground md:text-xl">
                                                        {card.caption}
                                                    </p>
                                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                                        {card.blurb}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div className="order-first flex flex-col items-center justify-center text-center lg:order-2">
                        <div className="rounded-3xl border border-border bg-card/90 px-8 py-10 shadow-sm backdrop-blur-md">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md ring-1 ring-primary/25">
                                <Mic className="h-7 w-7" strokeWidth={1.5} />
                            </div>
                            <p className="mt-5 font-mono text-xs font-bold tracking-widest text-primary uppercase">
                                ARIA VOICE
                            </p>
                            <p className="mt-2 text-xl font-semibold text-foreground">
                                Hermes on the line
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                A dedicated voice agent for guest calls in
                                Amharic and English — same tool orchestration as
                                the rest of ARIA.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
