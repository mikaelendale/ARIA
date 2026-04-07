import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';

const navLinks = [
    { label: 'System', href: '#aria-system-hero' },
    { label: 'Layers', href: '#aria-highlight-cards' },
    { label: 'Agents', href: '#agents-showcase' },
    { label: 'How it works', href: '#stats-section' },
    { label: 'About', href: '#about-section' },
    { label: 'Contact', href: '#footer' },
];

export default function Navbar({
    canRegister = true,
    variant = 'dark',
}: {
    canRegister?: boolean;
    variant?: 'dark' | 'light';
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

    const isLight = variant === 'light';
    const surfaceLight = isLight || scrolled;

    return (
        <nav
            className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
                isLight
                    ? scrolled
                        ? 'border-b border-border bg-background/95 shadow-sm backdrop-blur-xl'
                        : 'border-b border-border bg-background/85 backdrop-blur-xl'
                    : scrolled
                      ? 'border-b border-border bg-background/90 backdrop-blur-xl'
                      : 'border-b border-transparent bg-black/30 backdrop-blur-md'
            }`}
        >
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                    <span
                        className={`text-lg font-medium tracking-tight transition-colors duration-300 ${
                            surfaceLight ? 'text-foreground' : 'text-white'
                        }`}
                    >
                        ARIA
                    </span>
                </Link>

                <div className="hidden flex-wrap items-center justify-center gap-x-4 gap-y-1 lg:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={(e) => handleAnchorClick(e, link.href)}
                            className={`cursor-pointer text-sm font-medium transition-colors ${
                                surfaceLight
                                    ? 'text-muted-foreground hover:text-foreground'
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
                            variant={surfaceLight ? 'default' : 'outline'}
                            className={
                                surfaceLight
                                    ? 'rounded-full px-5 text-sm font-medium'
                                    : 'rounded-full border-white/25 bg-white px-5 text-sm font-medium text-gray-900 hover:bg-white/90'
                            }
                        >
                            <Link href={dashboard()}>Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                className={`rounded-full px-4 text-sm font-medium ${
                                    surfaceLight
                                        ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Link href={login()}>Request a demo</Link>
                            </Button>
                            {canRegister && (
                                <Button
                                    asChild
                                    variant={surfaceLight ? 'default' : 'outline'}
                                    className={
                                        surfaceLight
                                            ? 'rounded-full px-5 text-sm font-medium'
                                            : 'rounded-full border-white/25 bg-white px-5 text-sm font-medium text-gray-900 hover:bg-white/90'
                                    }
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
                        surfaceLight
                            ? 'text-foreground hover:bg-muted'
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
                        surfaceLight
                            ? 'border-border bg-background/95'
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
                                        surfaceLight
                                            ? 'text-foreground/90 hover:text-foreground'
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
                                    variant={surfaceLight ? 'default' : 'outline'}
                                    className={
                                        surfaceLight
                                            ? 'w-full rounded-full font-medium'
                                            : 'w-full rounded-full border-white/25 bg-white font-medium text-gray-900 hover:bg-white/90'
                                    }
                                >
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className={
                                            surfaceLight
                                                ? 'w-full rounded-full font-medium'
                                                : 'w-full rounded-full border-white/20 bg-transparent font-medium text-white hover:bg-white/10'
                                        }
                                    >
                                        <Link href={login()}>Request a demo</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button
                                            asChild
                                            variant={surfaceLight ? 'default' : 'outline'}
                                            className={
                                                surfaceLight
                                                    ? 'w-full rounded-full font-medium'
                                                    : 'w-full rounded-full border-white/25 bg-white font-medium text-gray-900 hover:bg-white/90'
                                            }
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
