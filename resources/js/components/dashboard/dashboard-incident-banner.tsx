import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type Props = {
    message: string;
    className?: string;
};

export function DashboardIncidentBanner({ message, className }: Props) {
    return (
        <Alert
            className={cn(
                'border-amber-500/70 bg-amber-50 text-amber-950 shadow-sm dark:border-amber-500/50 dark:bg-amber-950/45 dark:text-amber-50',
                '*:data-[slot=alert-description]:text-amber-950/90 dark:*:data-[slot=alert-description]:text-amber-50/90',
                'rounded-xl border-2 px-4 py-4 sm:px-5 sm:py-5',
                className,
            )}
        >
            <AlertTriangle
                className="size-5 shrink-0 text-amber-700 dark:text-amber-300 sm:size-6"
                aria-hidden
            />
            <AlertTitle className="font-heading text-base font-semibold tracking-tight sm:text-lg">
                Important: OpenAI API keys — we’re fixing this now
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-3 text-sm leading-relaxed sm:text-base">
                {message.split(/\n\n+/).map((para, i) => (
                    <p key={i}>{para}</p>
                ))}
            </AlertDescription>
        </Alert>
    );
}
