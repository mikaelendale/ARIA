import React, { Suspense } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Button } from '@/components/ui/button';
import {
    Microphone,
    Lightning,
    TrendUp,
    Brain,
    Megaphone,
} from '@phosphor-icons/react';
import { Radar } from 'lucide-react';

const Spline = React.lazy(() => import('@splinetool/react-spline'));

const agents = [
    {
        name: 'SENTINEL',
        role: 'Monitoring',
        line: 'Detects delays, tracks occupancy, and scans weather & flights 24/7.',
        accent: 'from-orange-500/20 to-red-500/0',
        dot: 'bg-orange-500',
        icon: <Radar size={20} />,
    },
    {
        name: 'HERMES',
        role: 'Voice',
        line: 'Talks to guests in natural Amharic & English to resolve issues live.',
        accent: 'from-blue-500/20 to-cyan-500/0',
        dot: 'bg-blue-500',
        icon: <Microphone weight="duotone" size={20} />,
    },
    {
        name: 'NEXUS',
        role: 'Operations',
        line: 'Dispatches housekeeping, alerts kitchens, and auto-escalates delays.',
        accent: 'from-amber-500/20 to-yellow-500/0',
        dot: 'bg-amber-500',
        icon: <Lightning weight="duotone" size={20} />,
    },
    {
        name: 'PULSE',
        role: 'Revenue',
        line: 'Modifies pricing thresholds and pushes targeted upsells seamlessly.',
        accent: 'from-emerald-500/20 to-green-500/0',
        dot: 'bg-emerald-500',
        icon: <TrendUp weight="duotone" size={20} />,
    },
    {
        name: 'VERA',
        role: 'Intelligence',
        line: 'Builds memory profiles, scores churn risk, and tags VIP behaviors.',
        accent: 'from-violet-500/20 to-purple-500/0',
        dot: 'bg-violet-500',
        icon: <Brain weight="duotone" size={20} />,
    },
    {
        name: 'ECHO',
        role: 'Reputation',
        line: 'Monitors online reviews, drafts replies, and handles social recovery.',
        accent: 'from-pink-500/20 to-rose-500/0',
        dot: 'bg-pink-500',
        icon: <Megaphone weight="duotone" size={20} />,
    },
];

export default function Hero({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <section className="relative z-10 flex h-full w-full items-center justify-center p-3 sm:p-5 md:p-8">
            {/* The Framed "Screen" Canvas */}
            <div className="relative w-full h-full max-w-[1800px] rounded-[2rem] lg:rounded-[2.5rem] border border-white/10 bg-[#050505] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                
                {/* 3D Scene Layer */}
                <div className="absolute inset-0 z-0 pointer-events-auto">
                    <Suspense fallback={
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-64 w-64 rounded-full bg-indigo-500/5 blur-[100px] animate-pulse"></div>
                        </div>
                    }>
                        <Spline 
                            scene="https://prod.spline.design/EWSvUcC4WEeEP2JB/scene.splinecode" 
                            className="w-full h-full object-cover scale-[1.02] transform-gpu"
                        />
                    </Suspense>
                    
                    {/* Subtle Top-Left shadow so text is always readable against the 3D model */}
                    <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-gradient-to-br from-black/80 via-black/20 to-transparent pointer-events-none" />
                </div>

                {/* Overlaid UI Layer */}
                <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 sm:p-8 lg:p-12 pointer-events-none">
                    
                    {/* Top Section: Typography cleanly integrated on the surface */}
                    <div className="w-full max-w-2xl text-left pointer-events-auto">
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-3.5 py-1.5 backdrop-blur-md shadow-lg">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                                </span>
                                <span className="text-xs font-semibold tracking-widest text-white/90 uppercase">
                                    Autonomous Hotel Core
                                </span>
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.5rem] lg:leading-[1.05] drop-shadow-2xl">
                            The AI that runs <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-white/90 to-white/40 bg-clip-text text-transparent">your hotel</span>
                        </h1>

                        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg font-medium drop-shadow-md">
                            ARIA monitors every signal, resolves issues before guests
                            notice, and drives revenue — autonomously, in real time.
                        </p>

                        <div className="mt-8 flex items-center justify-start gap-4">
                            {auth.user ? (
                                <Button
                                    asChild
                                    className="rounded-full px-8 py-6 text-sm font-semibold tracking-wide text-black bg-white transition-all hover:scale-105 shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] focus:outline-none"
                                >
                                    <Link href={dashboard()}>Go to Actions</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="rounded-full border-white/20 bg-black/30 px-8 py-6 text-sm font-medium tracking-wide text-white transition-all hover:border-white/40 hover:bg-white/10 focus:outline-none backdrop-blur-md"
                                    >
                                        <Link href={login()}>Request Demo</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button
                                            asChild
                                            className="relative group rounded-full px-8 py-6 text-sm font-semibold tracking-wide text-black bg-white shadow-xl transition-all hover:scale-105 hover:bg-white/95 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] focus:outline-none overflow-hidden"
                                        >
                                            <Link href={register()}>
                                                <span className="relative z-10 flex items-center gap-2">
                                                    Get Started
                                                </span>
                                                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bottom Section: Bento Box precisely framed */}
                    <div className="w-full mt-auto pointer-events-auto">
                        <div className="rounded-3xl bg-black/30 backdrop-blur-xl p-4 sm:p-5 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                            <div className="mb-4 flex items-center justify-between px-2">
                                <p className="text-[10px] font-semibold tracking-[0.25em] text-white/60 uppercase">
                                    6 Specialized Agents
                                </p>
                                <div className="hidden items-center gap-6 text-[11px] font-medium tracking-wider text-white/50 uppercase md:flex">
                                    <span className="flex items-center gap-2">
                                        <span className="h-1 w-1 rounded-full bg-white/40"></span>
                                        &lt;90s Response
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="h-1 w-1 rounded-full bg-white/40"></span>
                                        14 System Tools
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></span>
                                        Always Active
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 relative">
                                {agents.map((agent) => (
                                    <div
                                        key={agent.name}
                                        className="group relative flex min-h-[130px] flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5 transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] md:min-h-[160px]"
                                    >
                                        <div
                                            className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${agent.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                                        />

                                        <div className="relative z-10">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all duration-500 group-hover:bg-white/20 group-hover:text-white border border-white/5 group-hover:border-white/20 shadow-inner">
                                                    {agent.icon}
                                                </div>
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${agent.dot} opacity-0 shadow-[0_0_12px_currentColor] transition-all duration-500 group-hover:opacity-100`}
                                                />
                                            </div>
                                            <h3 className="text-xs font-bold tracking-widest text-white/95 uppercase drop-shadow-md">
                                                {agent.name}
                                            </h3>
                                            <p className="mt-1 text-[10px] font-medium tracking-wide text-white/60">
                                                {agent.role}
                                            </p>
                                            <p className="mt-2.5 hidden text-[11px] leading-relaxed text-white/50 transition-colors duration-500 group-hover:text-white/90 sm:block">
                                                {agent.line}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
