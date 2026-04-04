import { Link } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div
            className={cn(
                'relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-6 md:p-10',
                'bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,oklch(0.72_0.14_250/0.18),transparent_55%)]',
                'dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,oklch(0.45_0.12_250/0.25),transparent_55%)]',
            )}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            <main className="relative z-10 w-full max-w-md">
                <div className="mb-8 flex flex-col items-center gap-5 text-center">
                    <Link
                        href={home()}
                        className="group flex flex-col items-center gap-3 transition-opacity hover:opacity-90"
                        aria-label="Go to home page"
                    >
                        <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm dark:bg-card/50">
                            <AppLogoIcon className="size-7 fill-foreground" />
                        </div>
                        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
                            <Sparkles className="size-3.5 text-amber-600/80 dark:text-amber-400/80" aria-hidden />
                            Kuriftu Resort
                        </span>
                    </Link>

                    <div className="space-y-2">
                        <h1 className="text-foreground text-2xl font-semibold tracking-tight md:text-[1.65rem]">
                            {title}
                        </h1>
                        <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
                            {description}
                        </p>
                    </div>

                    <Link
                        href={home()}
                        className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
                    >
                        ← Back to home
                    </Link>
                </div>

                <div className="border-border/60 bg-card/90 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.25)] backdrop-blur-md dark:shadow-[0_24px_80px_-24px_rgba(0,0,0,0.5)] rounded-2xl border p-8 md:p-9">
                    {children}
                </div>
            </main>
        </div>
    );
}
