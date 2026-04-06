import React, { Suspense, useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { Button } from '@/components/ui/button';
import {
    ArrowRight,
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
        icon: <Radar size={20} strokeWidth={1.5} />,
        accent: '#F97316',
    },
    {
        name: 'HERMES',
        role: 'Voice',
        line: 'Talks to guests in natural Amharic & English to resolve issues live.',
        icon: <Microphone weight="duotone" size={20} />,
        accent: '#3B82F6',
    },
    {
        name: 'NEXUS',
        role: 'Operations',
        line: 'Dispatches housekeeping, alerts kitchens, and auto-escalates delays.',
        icon: <Lightning weight="duotone" size={20} />,
        accent: '#F59E0B',
    },
    {
        name: 'PULSE',
        role: 'Revenue',
        line: 'Modifies pricing thresholds and pushes targeted upsells seamlessly.',
        icon: <TrendUp weight="duotone" size={20} />,
        accent: '#3B82F6',
    },
    {
        name: 'VERA',
        role: 'Intelligence',
        line: 'Builds memory profiles, scores churn risk, and tags VIP behaviors.',
        icon: <Brain weight="duotone" size={20} />,
        accent: '#8B5CF6',
    },
    {
        name: 'ECHO',
        role: 'Reputation',
        line: 'Monitors reviews, drafts replies, and handles social recovery.',
        icon: <Megaphone weight="duotone" size={20} />,
        accent: '#EC4899',
    },
];

export default function Hero({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="relative z-10 flex h-full w-full flex-col">
            {/* ─── 3D Background (full bleed behind everything) ─── */}
            <div className="absolute inset-0 z-0">
                <Suspense
                    fallback={
                        <div className="absolute inset-0 flex items-center justify-center bg-[#030303]">
                            <div className="h-48 w-48 rounded-full bg-blue-500/5 blur-[100px] animate-pulse" />
                        </div>
                    }
                >
                    <Spline
                        scene="https://prod.spline.design/EWSvUcC4WEeEP2JB/scene.splinecode"
                        className="h-full w-full object-cover transform-gpu"
                    />
                </Suspense>

                {/* Cinematic overlays */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            </div>

            {/* ─── Content Layer ─── */}
            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-between px-6 pt-24 pb-6 sm:px-10 sm:pb-8 lg:px-16 lg:pb-10">
                
                {/* ─── Top: Headline Area ─── */}
                <div className="flex flex-1 items-center">
                    <div className="w-full">
                        {/* Two-column layout: left = text, right = 3D scene shows through */}
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
                            {/* Left Column: Editorial Typography */}
                            <div
                                className="max-w-xl transition-all duration-1000 ease-out"
                                style={{
                                    opacity: mounted ? 1 : 0,
                                    transform: mounted ? 'translateY(0)' : 'translateY(24px)',
                                }}
                            >
                                {/* Pill badge */}
                                <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 backdrop-blur-sm">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
                                    </span>
                                    <span className="text-[11px] font-medium tracking-[0.2em] text-white/60 uppercase">
                                        Autonomous Resort Intelligence Agent · 6 Specialists
                                    </span>
                                </div>

                                {/* Headline — editorial, clean */}
                                <h1 className="text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-white">
                                    Meet ARIA. The AI
                                    <br />
                                    <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                                        that runs your hotel
                                    </span>
                                </h1>

                                {/* Subtext */}
                                <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-white/45 font-normal">
                                    ARIA monitors every signal, resolves issues before
                                    guests notice, and drives revenue — autonomously,
                                    in real time.
                                </p>

                                {/* CTA Buttons */}
                                <div className="mt-10 flex items-center gap-3">
                                    {auth.user ? (
                                        <Button
                                            asChild
                                            className="h-12 rounded-full bg-white px-8 text-[13px] font-semibold tracking-wide text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                                        >
                                            <Link href={dashboard()}>
                                                Go to Dashboard
                                            </Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                asChild
                                                className="group h-12 rounded-full bg-white px-8 text-[13px] font-semibold tracking-wide text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                                            >
                                                <Link href={login()}>
                                                    <span className="flex items-center gap-2">
                                                        Get Started
                                                        <ArrowRight
                                                            size={15}
                                                            weight="bold"
                                                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                                                        />
                                                    </span>
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                className="h-12 rounded-full px-7 text-[13px] font-medium text-white/60 transition-all duration-300 hover:bg-white/[0.06] hover:text-white"
                                            >
                                                <Link href={login()}>
                                                    Request Demo
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: intentionally empty — 3D scene shows through */}
                            <div className="hidden lg:block" />
                        </div>
                    </div>
                </div>

                {/* ─── Bottom: Agents Strip ─── */}
                <div
                    className="w-full transition-all duration-1000 ease-out"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '300ms',
                    }}
                >
                    {/* Thin separator */}
                    <div className="mb-5 flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] via-white/[0.06] to-transparent" />
                        <span className="text-[10px] font-medium tracking-[0.3em] text-white/25 uppercase">
                            One brain · Six specialists
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-white/[0.08] via-white/[0.06] to-transparent" />
                    </div>

                    {/* Agent cards row */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
                        {agents.map((agent, i) => (
                            <div
                                key={agent.name}
                                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.05]"
                                style={{
                                    opacity: mounted ? 1 : 0,
                                    transform: mounted
                                        ? 'translateY(0)'
                                        : 'translateY(16px)',
                                    transitionDelay: `${400 + i * 60}ms`,
                                    transitionProperty: 'all',
                                    transitionDuration: '700ms',
                                    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                                }}
                            >
                                {/* Hover glow */}
                                <div
                                    className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-30"
                                    style={{ backgroundColor: agent.accent }}
                                />

                                {/* Icon */}
                                <div
                                    className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-white/40 transition-all duration-500 group-hover:border-white/[0.12] group-hover:text-white/80"
                                >
                                    {agent.icon}
                                </div>

                                {/* Name */}
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[12px] font-semibold tracking-[0.08em] text-white/80 uppercase">
                                        {agent.name}
                                    </h3>
                                    <span
                                        className="h-1 w-1 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                        style={{
                                            backgroundColor: agent.accent,
                                            boxShadow: `0 0 8px ${agent.accent}`,
                                        }}
                                    />
                                </div>

                                {/* Role */}
                                <p className="mt-0.5 text-[11px] font-normal text-white/25">
                                    {agent.role}
                                </p>

                                {/* Description — shows on hover on larger screens */}
                                <p className="mt-2.5 hidden text-[11px] leading-[1.6] text-white/20 transition-colors duration-500 group-hover:text-white/55 sm:block">
                                    {agent.line}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
