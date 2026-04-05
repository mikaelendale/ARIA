import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';

const navLinks = [
    { label: 'Agents', href: '#agents-showcase' },
    { label: 'How it works', href: '#stats-section' },
    { label: 'About', href: '#about-section' },
    { label: 'Contact', href: '#footer' },
];

export default function Navbar({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 48);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const el = document.querySelector(href);

            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                setMobileOpen(false);
            }
        }
    };

    return (
        <nav
            className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
                scrolled
                    ? 'border-b border-gray-200/80 bg-white/90 backdrop-blur-xl'
                    : 'border-b border-transparent bg-black/30 backdrop-blur-md'
            }`}
        >
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                    <span
                        className={`text-lg font-medium tracking-tight transition-colors duration-300 ${
                            scrolled ? 'text-gray-900' : 'text-white'
                        }`}
                    >
                        ARIA
                    </span>
                </Link>

                <div className="hidden items-center gap-8 lg:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={(e) => handleAnchorClick(e, link.href)}
                            className={`cursor-pointer text-sm font-medium transition-colors ${
                                scrolled
                                    ? 'text-gray-600 hover:text-gray-900'
                                    : 'text-white/70 hover:text-white'
                            }`}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="hidden items-center gap-3 lg:flex">
                    {auth.user ? (
                        <Button
                            asChild
                            className={`rounded-full px-5 text-sm font-medium ${
                                scrolled
                                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                                    : 'bg-white text-gray-900 hover:bg-white/90'
                            }`}
                        >
                            <Link href={dashboard()}>Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                className={`rounded-full px-4 text-sm font-medium ${
                                    scrolled
                                        ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Link href={login()}>Request a demo</Link>
                            </Button>
                            {canRegister && (
                                <Button
                                    asChild
                                    className={`rounded-full px-5 text-sm font-medium ${
                                        scrolled
                                            ? 'bg-gray-900 text-white hover:bg-gray-800'
                                            : 'bg-white text-gray-900 hover:bg-white/90'
                                    }`}
                                >
                                    <Link href={login()}>Get Started</Link>
                                </Button>
                            )}
                        </>
                    )}
                </div>

                <button
                    type="button"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors lg:hidden ${
                        scrolled
                            ? 'text-gray-900 hover:bg-gray-100'
                            : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? (
                        <X size={20} strokeWidth={1.5} />
                    ) : (
                        <Menu size={20} strokeWidth={1.5} />
                    )}
                </button>
            </div>

            {mobileOpen && (
                <div
                    className={`border-t px-4 pb-5 pt-3 backdrop-blur-xl sm:px-6 lg:hidden ${
                        scrolled
                            ? 'border-gray-200 bg-white/95'
                            : 'border-white/10 bg-black/85'
                    }`}
                >
                    <div className="mx-auto max-w-4xl">
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={(e) => handleAnchorClick(e, link.href)}
                                    className={`text-left text-sm font-medium ${
                                        scrolled
                                            ? 'text-gray-700 hover:text-gray-900'
                                            : 'text-white/80 hover:text-white'
                                    }`}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                        <div className="mt-6 flex flex-col gap-2">
                            {auth.user ? (
                                <Button
                                    asChild
                                    className={`w-full rounded-full font-medium ${
                                        scrolled
                                            ? 'bg-gray-900 text-white hover:bg-gray-800'
                                            : 'bg-white text-gray-900 hover:bg-white/90'
                                    }`}
                                >
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className={`w-full rounded-full font-medium ${
                                            scrolled
                                                ? 'border-gray-300 text-gray-800 hover:bg-gray-50'
                                                : 'border-white/20 bg-transparent text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <Link href={login()}>Request a demo</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button
                                            asChild
                                            className={`w-full rounded-full font-medium ${
                                                scrolled
                                                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                                                    : 'bg-white text-gray-900 hover:bg-white/90'
                                            }`}
                                        >
                                            <Link href={login()}>Get Started</Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
