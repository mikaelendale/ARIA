import { Link } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import {
    ArrowRight,
    Radar,
    Mic,
    Zap,
    TrendingUp,
    Brain,
    Megaphone,
} from 'lucide-react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { login } from '@/routes';

const iconBase = {
    size: 22,
    strokeWidth: 1.5,
    className: 'shrink-0',
} as const;

const agents = [
    {
        name: 'SENTINEL',
        role: 'Monitoring Agent',
        description:
            'Detects delays, tracks occupancy, and scans weather & flights around the clock — firing events the moment something needs attention.',
        icon: <Radar {...iconBase} />,
        color: '#F97316',
        bgAccent: 'bg-orange-50',
        borderAccent: 'hover:border-orange-200',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        tag: 'Always watching',
    },
    {
        name: 'HERMES',
        role: 'Voice Agent',
        description:
            'Talks to guests in natural Amharic & English, resolves requests in real time, and only escalates when truly needed.',
        icon: <Mic {...iconBase} />,
        color: '#3B82F6',
        bgAccent: 'bg-blue-50',
        borderAccent: 'hover:border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        tag: 'Multilingual',
    },
    {
        name: 'NEXUS',
        role: 'Operations Agent',
        description:
            'Dispatches housekeeping, alerts kitchens, and auto-escalates when SLAs are breached — keeping everything running smoothly.',
        icon: <Zap {...iconBase} />,
        color: '#F59E0B',
        bgAccent: 'bg-amber-50',
        borderAccent: 'hover:border-amber-200',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        tag: 'Instant dispatch',
    },
    {
        name: 'PULSE',
        role: 'Revenue Agent',
        description:
            'Adjusts pricing based on demand, pushes upsells at the perfect moment, and generates flash promotions autonomously.',
        icon: <TrendingUp {...iconBase} />,
        color: '#10B981',
        bgAccent: 'bg-emerald-50',
        borderAccent: 'hover:border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        tag: 'Revenue optimizer',
    },
    {
        name: 'VERA',
        role: 'Guest Intelligence',
        description:
            'Builds memory profiles, scores churn risk, tags VIP behaviors — every interaction becomes deeply personalized.',
        icon: <Brain {...iconBase} />,
        color: '#8B5CF6',
        bgAccent: 'bg-violet-50',
        borderAccent: 'hover:border-violet-200',
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
        tag: 'Deep personalization',
    },
    {
        name: 'ECHO',
        role: 'Reputation Agent',
        description:
            'Monitors reviews across platforms, drafts public responses, sends recovery offers, and flags repeating patterns.',
        icon: <Megaphone {...iconBase} />,
        color: '#EC4899',
        bgAccent: 'bg-pink-50',
        borderAccent: 'hover:border-pink-200',
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-600',
        tag: 'Brand protector',
    },
];

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    },
};

type AgentsShowcaseProps = {
    variant?: 'default' | 'hero';
};

export default function AgentsShowcase({ variant = 'default' }: AgentsShowcaseProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    const isHero = variant === 'hero';

    return (
        <section
            id="agents-showcase"
            className={cn(
                'relative',
                isHero
                    ? 'z-10 flex min-h-screen flex-col justify-center px-5 py-28 sm:px-8 lg:px-12'
                    : 'bg-white py-24 md:py-32 lg:py-40',
            )}
        >
            {!isHero && (
                <>
                    <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-50/60 blur-[120px]" />
                    <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-violet-50/40 blur-[100px]" />
                </>
            )}

            <div
                className={cn(
                    'relative mx-auto w-full',
                    isHero ? 'max-w-6xl' : 'max-w-7xl px-5 sm:px-8 lg:px-12',
                )}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                    className={cn('mb-12 md:mb-16', isHero && 'mb-10 md:mb-12')}
                >
                    <span
                        className={cn(
                            'mb-4 inline-block rounded-full border px-4 py-1.5 text-xs font-medium tracking-widest uppercase',
                            isHero
                                ? 'border-white/15 bg-white/[0.06] text-white/70'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700',
                        )}
                    >
                        Meet the agents
                    </span>
                    <h2
                        className={cn(
                            'mt-4 max-w-2xl text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.12]',
                            isHero
                                ? 'font-medium text-white'
                                : 'font-medium text-gray-900',
                        )}
                    >
                        One brain.{' '}
                        <span
                            className={
                                isHero ? 'text-emerald-300/95' : 'text-emerald-700'
                            }
                        >
                            Six specialists.
                        </span>
                    </h2>
                    <p
                        className={cn(
                            'mt-5 max-w-xl text-base leading-relaxed md:text-lg',
                            isHero ? 'text-white/55' : 'text-gray-500',
                        )}
                    >
                        ARIA coordinates a team of AI agents — each with a focused job,
                        real tools, and the autonomy to act without waiting for a human.
                    </p>
                </motion.div>

                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'show' : 'hidden'}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
                >
                    {agents.map((agent) => (
                        <motion.div
                            key={agent.name}
                            variants={cardVariants}
                            className={cn(
                                'group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-300 md:min-h-[220px] md:p-8',
                                isHero
                                    ? 'border-white/[0.1] bg-white/[0.04] backdrop-blur-md hover:border-white/[0.14] hover:bg-white/[0.06]'
                                    : cn(
                                          'border-gray-100',
                                          agent.bgAccent,
                                          agent.borderAccent,
                                          'hover:shadow-lg',
                                      ),
                            )}
                        >
                            <div>
                                <div className="mb-5 flex items-start justify-between">
                                    <div
                                        className={cn(
                                            'flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-[1.02]',
                                            isHero
                                                ? 'border border-white/10 bg-white/[0.06] text-white/85'
                                                : cn(
                                                      'rounded-2xl',
                                                      agent.iconBg,
                                                      agent.iconColor,
                                                  ),
                                        )}
                                    >
                                        {agent.icon}
                                    </div>
                                    <span
                                        className={cn(
                                            'mt-1 rounded-full border px-3 py-1 text-[10px] font-medium tracking-wide uppercase',
                                            isHero
                                                ? 'border-white/10 bg-black/20 text-white/55'
                                                : 'border-gray-200 bg-white text-gray-500',
                                        )}
                                    >
                                        {agent.tag}
                                    </span>
                                </div>

                                <h3
                                    className={cn(
                                        'text-lg tracking-tight',
                                        isHero
                                            ? 'font-medium text-white'
                                            : 'font-medium text-gray-900',
                                    )}
                                >
                                    {agent.name}
                                </h3>
                                <p
                                    className={cn(
                                        'mt-0.5 text-sm',
                                        isHero ? 'text-white/45' : 'font-medium text-gray-400',
                                    )}
                                >
                                    {agent.role}
                                </p>
                                <p
                                    className={cn(
                                        'mt-3 text-sm leading-relaxed',
                                        isHero ? 'text-white/50' : 'text-gray-500',
                                    )}
                                >
                                    {agent.description}
                                </p>
                            </div>

                            <div className="mt-6 h-1 w-12 rounded-full bg-white/10 transition-all duration-500 group-hover:w-full">
                                <div
                                    className="h-full w-0 rounded-full transition-all duration-700 group-hover:w-full"
                                    style={{ backgroundColor: agent.color }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-10 flex items-center justify-center md:mt-14"
                >
                    <Link
                        href={login()}
                        className={cn(
                            'group inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-medium transition-all duration-300',
                            isHero
                                ? 'border border-white/15 bg-white text-gray-900 hover:bg-white/95'
                                : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-xl',
                        )}
                    >
                        <span>Explore all agents</span>
                        <ArrowRight
                            size={18}
                            strokeWidth={1.5}
                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
