import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { login } from '@/routes';
import { ArrowRight } from '@phosphor-icons/react';

export default function AboutSection() {
    return (
        <section
            id="about-section"
            className="relative bg-white py-24 md:py-32 lg:py-40"
        >
            <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <span className="mb-4 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold tracking-widest text-emerald-700 uppercase">
                            About us
                        </span>
                        <h2 className="mt-4 text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
                            Built with experts{' '}
                            <span className="text-emerald-700">
                                for real-world hospitality
                            </span>
                        </h2>
                        <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-500 md:text-lg">
                            ARIA was built alongside hotel operators and service
                            leaders who understand the reality of modern
                            hospitality. From guest communication to revenue
                            optimization, every workflow reflects how care
                            actually happens — not how legacy systems force it to
                            happen.
                        </p>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Link
                                href={login()}
                                className="group inline-flex items-center gap-3 rounded-full bg-gray-900 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-gray-800 hover:shadow-xl"
                            >
                                <span>Learn More</span>
                                <ArrowRight
                                    size={16}
                                    weight="bold"
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right — Feature highlights */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.15,
                        }}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    >
                        {[
                            {
                                title: 'Real-time monitoring',
                                desc: 'Every signal — from flight delays to room service timers — is tracked and acted on instantly.',
                                emoji: '📡',
                            },
                            {
                                title: 'Multilingual voice',
                                desc: 'Natural conversations in Amharic & English, handling guest calls without human intervention.',
                                emoji: '🗣️',
                            },
                            {
                                title: 'Smart revenue',
                                desc: 'Dynamic pricing, targeted upsells, and flash promotions that drive occupancy and RevPAR.',
                                emoji: '📈',
                            },
                            {
                                title: 'Guest intelligence',
                                desc: 'Memory profiles, churn risk scoring, and VIP identification for personalized service.',
                                emoji: '🧠',
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.1 * i,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 transition-all duration-300 hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-md"
                            >
                                <span className="text-2xl">{feature.emoji}</span>
                                <h3 className="mt-3 text-sm font-medium tracking-tight text-gray-900">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
