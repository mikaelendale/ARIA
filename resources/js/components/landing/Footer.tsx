import { Link } from '@inertiajs/react';
import { login } from '@/routes';
import { ArrowRight } from '@phosphor-icons/react';

const footerLinks = {
    Product: ['Agents', 'Dashboard'],
    Resources: ['Documentation', 'Support'],
    Company: ['About', 'Contact'],
};

const techStack = ['Laravel', 'Twilio', 'WhatsApp', 'Reverb'];

export default function Footer() {
    return (
        <footer
            id="footer"
            className="relative bg-gray-950 text-white"
        >
            {/* CTA Banner */}
            <div className="border-b border-white/5">
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center md:py-20 lg:px-12">
                    <div>
                        <h3 className="text-2xl font-medium tracking-tight sm:text-3xl md:text-4xl">
                            Ready to automate{' '}
                            <span className="text-blue-400">your hotel?</span>
                        </h3>
                        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50 md:text-base">
                            See how ARIA can reduce guest wait times, boost
                            revenue, and free up your team — all autonomously.
                        </p>
                    </div>
                    <Link
                        href={login()}
                        className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold text-gray-900 transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                    >
                        <span>Request a Demo</span>
                        <ArrowRight
                            size={18}
                            weight="bold"
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </Link>
                </div>
            </div>

            {/* Main Footer */}
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
                    {/* Brand Column */}
                    <div className="col-span-2 sm:col-span-4 lg:col-span-1">
                        <Link
                            href="/"
                            className="text-2xl font-extrabold tracking-tight text-white"
                        >
                            ARIA
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">
                            Autonomous Resort Intelligence Agent. The AI that
                            runs your hotel.
                        </p>

                        {/* Tech stack badges */}
                        <div className="mt-6 flex flex-wrap gap-2">
                            {techStack.map((tech) => (
                                <span
                                    key={tech}
                                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wider text-white/50 uppercase"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="mb-4 text-xs font-semibold tracking-widest text-white/30 uppercase">
                                {title}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link}>
                                        <button className="text-sm text-white/50 transition-colors duration-200 hover:text-white">
                                            {link}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
                    <p className="text-xs text-white/30">
                        © {new Date().getFullYear()} ARIA. All rights reserved.
                    </p>
                    {/* Status indicator */}
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
                        </span>
                        <span className="text-[10px] font-medium tracking-wider text-white/40 uppercase">
                            All systems operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
