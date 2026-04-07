import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles, Megaphone, Mouse } from 'lucide-react';
import { login } from '@/routes';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import AppLogoIcon from '../app-logo-icon';
import { Eye, GraphIcon, MathOperationsIcon, MicrophoneIcon, QuestionMarkIcon } from '@phosphor-icons/react';

const subAgents = [
    { name: 'SENTINEL', tag: 'Monitor', icon: Eye, accent: 'text-chart-1', bg: 'bg-chart-1/10', border: 'border-chart-1/25', fill: 'fill-chart-1', shadow: 'shadow-chart-1/20', delay: 0 },
    { name: 'HERMES', tag: 'Voice', icon: MicrophoneIcon, accent: 'text-chart-2', bg: 'bg-chart-2/10', border: 'border-chart-2/25', fill: 'fill-chart-2', shadow: 'shadow-chart-2/20', delay: 70 },
    { name: 'NEXUS', tag: 'Operations', icon: MathOperationsIcon, accent: 'text-chart-3', bg: 'bg-chart-3/10', border: 'border-chart-3/25', fill: 'fill-chart-3', shadow: 'shadow-chart-3/20', delay: 140 },
    { name: 'PULSE', tag: 'Revenue', icon: GraphIcon, accent: 'text-chart-4', bg: 'bg-chart-4/10', border: 'border-chart-4/25', fill: 'fill-chart-4', shadow: 'shadow-chart-4/20', delay: 210 },
    { name: 'VERA', tag: 'Guest intel', icon: QuestionMarkIcon, accent: 'text-chart-5', bg: 'bg-chart-5/10', border: 'border-chart-5/25', fill: 'fill-chart-5', shadow: 'shadow-chart-5/20', delay: 280 },
    { name: 'ECHO', tag: 'Reputation', icon: Megaphone, accent: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/25', fill: 'fill-primary', shadow: 'shadow-primary/20', delay: 350 },
] as const;

const agentXs = [83, 250, 417, 583, 750, 917];

function ConnectorDesktop() {
    const paths = agentXs.map(x => `M 500 0 C 500 58, ${x} 58, ${x} 116`);
    return (
        <svg className="h-full w-full" viewBox="0 0 1000 120" preserveAspectRatio="xMidYMid meet" aria-hidden>
            <defs>
                <linearGradient id="aria-connector-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.06" />
                </linearGradient>
            </defs>

            {paths.map((d, i) => (
                <path
                    key={i}
                    d={d}
                    stroke="url(#aria-connector-gradient)"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
            ))}

            {paths.map((d, i) => (
                <circle key={i} r="3.5" className={subAgents[i].fill} opacity="0">
                    <animateMotion dur={`${1.6 + i * 0.28}s`} begin={`${i * 0.42}s`} repeatCount="indefinite" path={d} />
                    <animate attributeName="opacity" values="0;1;1;0"  dur={`${1.6 + i * 0.28}s`} begin={`${i * 0.42}s`} repeatCount="indefinite" />
                    <animate attributeName="r"       values="2;3.5;2"  dur={`${1.6 + i * 0.28}s`} begin={`${i * 0.42}s`} repeatCount="indefinite" />
                </circle>
            ))}
        </svg>
    );
}

export default function AriaSystemHero({ canRegister = true }: { canRegister?: boolean }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

    return (
        <>
            <style>{`
                @keyframes float-brain { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
                @keyframes pulse-ring  { 0% { transform: scale(1); opacity: .5; } 80%,100% { transform: scale(2.4); opacity: 0; } }
                @keyframes blink-dot   { 0%,100% { opacity: .2; } 50% { opacity: 1; } }
                @keyframes fade-up     { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fade-in     { from { opacity: 0; } to { opacity: 1; } }

                .agent-card {
                    opacity: 0;
                    transform: translateY(14px);
                    transition: opacity .45s ease, transform .45s ease, box-shadow .2s ease;
                }
                .agent-card.in {
                    opacity: 1;
                    transform: translateY(0);
                }
                .agent-card:hover {
                    transform: translateY(-4px) scale(1.04);
                }
            `}</style>

            <section
                id="aria-system-hero"
                className="relative overflow-hidden pt-10 pb-20 md:pb-28"
            >
                <div className="pointer-events-none absolute inset-0 bg-background" />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.45]"
                    style={{
                        backgroundImage:
                            'radial-gradient(var(--border) 1px, transparent 1px)',
                        backgroundSize: '22px 22px',
                    }}
                />

                <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                    {/* ── Hero copy (headline first) ── */}
                    <div className="mx-auto max-w-3xl text-center">
                        <div
                            style={{ animation: 'fade-up .6s ease .08s both' }}
                            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-foreground shadow-sm backdrop-blur-sm"
                        >
                            <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                            Autonomous Resort Intelligence Agent
                        </div>

                        <h1
                            style={{ animation: 'fade-up .65s ease .14s both' }}
                            className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-[3.15rem] md:leading-[1.06]"
                        >
                            <span className="block bg-linear-to-r from-primary via-chart-3 to-chart-5 bg-clip-text text-transparent">
                                She doesn&apos;t assist your staff.
                            </span>
                            <span className="mt-1 block text-foreground md:mt-1.5">
                                She runs the hotel.
                            </span>
                        </h1>

                        <p
                            className="mx-auto mt-2 max-w-xl text-sm font-medium text-muted-foreground md:text-base"
                            style={{ animation: 'fade-up .65s ease .2s both' }}
                        >
                            And calls you when she needs you.
                        </p>

                        <p
                            style={{ animation: 'fade-up .7s ease .26s both' }}
                            className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg"
                        >
                            Built for{' '}
                            <span className="font-medium text-foreground">Kuriftu Resort</span>
                            : always-on monitoring, autonomous decisions, and{' '}
                            <span className="font-medium text-foreground">
                                real actions
                            </span>{' '}
                            across WhatsApp, voice, kitchen, pricing, and more—
                            <span className="font-medium text-foreground">
                                {' '}
                                no chatbot queue, no &ldquo;waiting to be asked.&rdquo;
                            </span>
                        </p>

                        <div
                            style={{ animation: 'fade-up .7s ease .34s both' }}
                            className="mt-8 flex flex-wrap items-center justify-center gap-3"
                        >
                            <Link
                                href={login()}
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                            >
                                {canRegister ? 'Get started' : 'Sign in'}
                                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                            </Link>
                            <a
                                href="#agents-showcase"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary/80"
                            >
                                See what she does
                                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                            </a>
                        </div>
                    </div>

                    {/* ── Diagram ── */}
                    <div className="mx-auto mt-16 max-w-5xl md:mt-20">

                        {/* Brain */}
                        <div style={{ animation: 'fade-up .8s ease .55s both' }}
                            className="relative z-10 mx-auto flex max-w-xs justify-center">

                            {/* Pulse rings */}
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    className="pointer-events-none absolute rounded-full border border-primary/20"
                                    style={{
                                        inset: `-${28 + i * 22}px`,
                                        animation: `pulse-ring ${2.4 + i * 0.8}s ease-out ${i * 0.65}s infinite`,
                                    }}
                                />
                            ))}

                            {/* Card */}
                            <div
                                className="relative z-10 w-full rounded-3xl  px-6 py-5 text-center"
                                style={{ animation: 'float-brain 4.5s ease-in-out infinite' }}
                            >
                                <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
                                    <div
                                        className="absolute inset-0 rounded-2xl bg-primary/15"
                                        style={{ animation: 'pulse-ring 2s ease-out infinite' }}
                                    />
                                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary-foreground shadow-inner ring-1 ring-primary/30">
                                    <AppLogoIcon className="size-14 fill-current" />
                                    </div>
                                </div>


                                <p className="mt-2 text-[10px] font-bold tracking-widest text-primary uppercase">
                                    ARIA Orchestrator
                                </p>
                                <p className="mt-0.5 text-sm font-semibold text-foreground">
                                    Operating brain of the hotel
                                </p>
                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                    GPT-4o · tool-calling · memory · full audit on the live dashboard
                                </p>

                                <div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-muted/50 py-2.5">
                                    {[
                                        { value: '<90s', label: 'To act' },
                                        { value: '24/7', label: 'Live' },
                                        { value: '2', label: 'Languages' },
                                    ].map((row) => (
                                        <div key={row.label} className="flex flex-col items-center px-1">
                                            <span className="text-sm font-bold text-primary">
                                                {row.value}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {row.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Curved connectors — desktop */}
                        <div style={{ animation: 'fade-in .6s ease .9s both' }}
                            className="relative hidden h-32 w-full md:block">
                            <ConnectorDesktop />
                        </div>

                        {/* Mobile fallback */}
                        <div className="mt-4 flex justify-center md:hidden">
                            <div className="h-8 w-px bg-linear-to-b from-primary/40 to-transparent" aria-hidden />
                        </div>

                        {/* Agent cards */}
                        <ul className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
                            {subAgents.map((agent, i) => {
                                const Icon = agent.icon;
                                return (
                                    <li key={agent.name}>
                                        <div
                                            className={cn(
                                                'agent-card flex h-full flex-col rounded-2xl border bg-card/90 p-4 text-center shadow-md backdrop-blur-sm',
                                                agent.border,
                                                agent.shadow,
                                                visible && 'in',
                                            )}
                                            style={{ transitionDelay: `${agent.delay}ms` }}
                                        >
                                            <div
                                                className={cn(
                                                    'mx-auto flex h-10 w-10 items-center justify-center rounded-xl',
                                                    agent.bg,
                                                )}
                                            >
                                                <Icon className={cn('h-5 w-5', agent.accent)} strokeWidth={1.75} />
                                            </div>
                                            <p className="mt-2.5 font-mono text-[11px] font-bold tracking-wide text-foreground">
                                                {agent.name}
                                            </p>
                                            <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                                                {agent.tag}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Scroll hint */}
                    <div style={{ animation: 'fade-in 1s ease 1.2s both' }}
                        className="mt-12 flex flex-col items-center gap-1.5 text-muted-foreground">
                        <Mouse className="h-4 w-4" strokeWidth={1.5} />
                        <span className="text-[11px] font-medium tracking-wide">Scroll down</span>
                    </div>
                </div>
            </section>
        </>
    );
}