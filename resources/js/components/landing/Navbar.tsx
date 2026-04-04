import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { dashboard, login, register } from '@/routes';
import { Button } from '@/components/ui/button';

const navLinks = [
    'Product',
    'Solutions',
    'Pricing',
    'Developers',
    'Resources',
    'Company',
];

export default function Navbar({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 right-0 left-0 z-50">
            {/* Full-width, integrated design */}
            <div className="flex w-full items-center justify-between border-b border-white/5 bg-black/40 px-6 py-4 backdrop-blur-xl lg:px-10">
                <Link
                    href="/"
                    className="flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                    <span className="text-xl font-extrabold tracking-tight text-white">
                        ARIA
                    </span>
                </Link>

                <div className="hidden items-center gap-8 lg:flex">
                    {navLinks.map((link) => (
                        <button
                            key={link}
                            className="cursor-pointer text-sm font-medium text-white/60 transition-colors duration-200 hover:text-white"
                        >
                            {link}
                        </button>
                    ))}
                </div>

                <div className="hidden items-center gap-4 lg:flex">
                    {auth.user ? (
                        <Button
                            asChild
                            className="rounded-full font-semibold text-black hover:bg-white/90 px-6"
                        >
                            <Link href={dashboard()}>Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                className="font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white rounded-full px-6"
                            >
                                <Link href={login()}>Request a demo</Link>
                            </Button>
                            {canRegister && (
                                <Button
                                    asChild
                                    className="rounded-full font-semibold text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.05)] px-6"
                                >
                                    <Link href={register()}>Sign up</Link>
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="flex h-9 w-9 items-center justify-center text-white lg:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? (
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Nav Content */}
            {mobileOpen && (
                <div className="absolute top-full right-0 left-0 border-b border-white/5 bg-black/95 px-6 pb-6 pt-4 backdrop-blur-xl">
                    <div className="flex flex-col gap-5">
                        {navLinks.map((link) => (
                            <button
                                key={link}
                                className="text-left text-base font-medium text-white/80 transition-colors hover:text-white"
                            >
                                {link}
                            </button>
                        ))}
                    </div>
                    <div className="mt-8 flex flex-col gap-3">
                        {auth.user ? (
                            <Button
                                asChild
                                className="w-full rounded-full font-semibold text-black hover:bg-white/90"
                            >
                                <Link href={dashboard()}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full rounded-full border-white/20 bg-transparent font-semibold text-white hover:bg-white/5"
                                >
                                    <Link href={login()}>Request a demo</Link>
                                </Button>
                                {canRegister && (
                                    <Button
                                        asChild
                                        className="w-full rounded-full font-semibold text-black hover:bg-white/90"
                                    >
                                        <Link href={register()}>Sign up</Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
