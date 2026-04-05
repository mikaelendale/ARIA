import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { login } from '@/routes';
import { ArrowRight, Quotes } from '@phosphor-icons/react';

const stats = [
    {
        value: '<90s',
        label: 'Average time to resolve a guest issue from detection to action',
    },
    {
        value: '50%',
        label: 'Estimated reduction in manual workload for front-desk and operations teams',
    },
];

export default function StatsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <section
            id="stats-section"
            className="relative overflow-hidden bg-[#FAFBF9] py-24 md:py-32 lg:py-40"
        >
            {/* Subtle background decoration */}
            <div className="pointer-events-none absolute top-[50%] left-[50%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-50/60 blur-[150px]" />

            <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                {/* Section Label */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-14 md:mb-20"
                >
                    <span className="mb-4 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold tracking-widest text-emerald-700 uppercase">
                        ARIA at work
                    </span>
                    <h2 className="mt-4 max-w-lg text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
                        What it's like{' '}
                        <span className="text-emerald-700">working with ARIA</span>
                    </h2>
                </motion.div>

                {/* Bento Layout */}
                <div ref={ref} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Testimonial Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col justify-between rounded-3xl bg-emerald-100/60 border border-emerald-200/40 p-8 md:p-10 lg:row-span-2"
                    >
                        <div>
                            <Quotes size={40} weight="fill" className="mb-6 text-emerald-700/30" />
                            <blockquote className="text-lg font-medium leading-relaxed text-gray-800 md:text-xl">
                                "Our front-desk team used to spend hours dealing with routine requests.
                                ARIA handles them instantly — guests are happier, staff is
                                freed up for what matters."
                            </blockquote>
                        </div>

                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200 text-sm font-bold text-emerald-800">
                                KR
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Kuriftu Resort
                                </p>
                                <p className="text-xs text-gray-500">
                                    First autonomous AI hotel deployment
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Cards */}
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.value}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{
                                duration: 0.5,
                                delay: 0.1 * (i + 1),
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="flex flex-col justify-center rounded-3xl bg-emerald-50/80 border border-emerald-100 p-8 md:p-10"
                        >
                            <p className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
                                {stat.value}
                            </p>
                            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500 md:text-base">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}

                    {/* CTA Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{
                            duration: 0.5,
                            delay: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex items-end rounded-3xl bg-gray-900 p-8 md:p-10 lg:col-span-2"
                    >
                        <Link
                            href={login()}
                            className="group inline-flex items-center gap-4 text-white transition-opacity hover:opacity-80"
                        >
                            <span className="text-lg font-semibold md:text-xl">
                                See ARIA in action
                            </span>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:bg-white/20">
                                <ArrowRight
                                    size={22}
                                    weight="bold"
                                    className="text-white transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
