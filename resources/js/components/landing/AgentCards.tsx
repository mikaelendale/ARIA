const agents = [
    {
        name: 'SENTINEL',
        role: 'Monitoring Agent',
        description:
            'Watches every signal in real time — room service timers, weather, flights, occupancy — and fires events the moment something needs attention.',
        icon: (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
            </svg>
        ),
        accent: 'from-red-500/20 to-orange-500/10',
        border: 'border-red-500/10',
        dot: 'bg-red-400',
    },
    {
        name: 'HERMES',
        role: 'Voice Agent',
        description:
            'Answers guest calls in Amharic or English, resolves requests live, and only escalates when she truly cannot handle it herself.',
        icon: (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
        ),
        accent: 'from-blue-500/20 to-cyan-500/10',
        border: 'border-blue-500/10',
        dot: 'bg-blue-400',
    },
    {
        name: 'NEXUS',
        role: 'Operations Agent',
        description:
            'Routes issues to the right department, tracks resolution, and auto-escalates when SLAs are breached — keeping everything running.',
        icon: (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        ),
        accent: 'from-amber-500/20 to-yellow-500/10',
        border: 'border-amber-500/10',
        dot: 'bg-amber-400',
    },
    {
        name: 'PULSE',
        role: 'Revenue Agent',
        description:
            'Adjusts pricing dynamically based on occupancy, fires upsells at the perfect moment, and generates flash promotions autonomously.',
        icon: (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
            </svg>
        ),
        accent: 'from-blue-500/20 to-sky-500/10',
        border: 'border-blue-500/10',
        dot: 'bg-blue-400',
    },
    {
        name: 'VERA',
        role: 'Guest Intelligence',
        description:
            'Builds live profiles for every guest — churn risk scores, VIP flags, preference tags — so every interaction is deeply personalized.',
        icon: (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        accent: 'from-violet-500/20 to-purple-500/10',
        border: 'border-violet-500/10',
        dot: 'bg-violet-400',
    },
    {
        name: 'ECHO',
        role: 'Reputation Agent',
        description:
            'Monitors reviews and social mentions 24/7, drafts public responses, sends private recovery offers, and flags repeating patterns.',
        icon: (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        accent: 'from-pink-500/20 to-rose-500/10',
        border: 'border-pink-500/10',
        dot: 'bg-pink-400',
    },
];

export default function AgentCards() {
    return (
        <section className="relative z-10 px-4 pb-24 md:pb-32">
            <div className="mx-auto max-w-6xl">
                <div className="mb-14 text-center md:mb-20">
                    <p className="mb-3 text-sm font-medium tracking-widest text-white/40 uppercase">
                        6 Autonomous Agents
                    </p>
                    <h2 className="mx-auto max-w-2xl text-3xl font-medium tracking-tight text-white md:text-4xl lg:text-5xl">
                        One brain. Six specialists.
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50">
                        ARIA coordinates a team of AI agents — each with a
                        focused job, real tools, and the autonomy to act without
                        waiting for a human.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {agents.map((agent) => (
                        <div
                            key={agent.name}
                            className={`group relative rounded-2xl border ${agent.border} bg-white/[0.03] p-6 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05] md:p-8`}
                        >
                            <div
                                className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${agent.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                            />

                            <div className="relative">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-white/70">
                                        {agent.icon}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold tracking-wide text-white">
                                                {agent.name}
                                            </h3>
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${agent.dot}`}
                                            />
                                        </div>
                                        <p className="text-xs text-white/40">
                                            {agent.role}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-[14px] leading-relaxed text-white/50">
                                    {agent.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3 md:mt-20">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center md:p-8">
                        <p className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                            &lt;90s
                        </p>
                        <p className="mt-2 text-sm text-white/40">
                            Average resolution time
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center md:p-8">
                        <p className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                            14
                        </p>
                        <p className="mt-2 text-sm text-white/40">
                            Autonomous tools at her disposal
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center md:p-8">
                        <p className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                            24/7
                        </p>
                        <p className="mt-2 text-sm text-white/40">
                            Always-on monitoring &amp; response
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
