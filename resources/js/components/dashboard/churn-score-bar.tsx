import { cn } from '@/lib/utils';

export function churnBarTone(score: number): string {
    if (score <= 40) {
        return 'bg-green-500';
    }

    if (score <= 70) {
        return 'bg-amber-500';
    }

    return 'bg-red-500';
}

interface ChurnScoreBarProps {
    score: number;
    /** Shown on the left of the numeric score (e.g. guest name). */
    label?: string;
    className?: string;
}

export function ChurnScoreBar({ score, label, className }: ChurnScoreBarProps) {
    const clamped = Math.min(100, Math.max(0, score));

    return (
        <div className={cn('w-full min-w-[100px]', className)}>
            <div className="mb-0.5 flex items-center justify-between gap-2 text-xs">
                {label ? <span className="text-muted-foreground truncate font-medium">{label}</span> : null}
                <span
                    className={cn('shrink-0 tabular-nums font-semibold', !label && 'ml-auto')}
                >
                    {Math.round(clamped)}
                </span>
            </div>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div
                    className={cn('h-full rounded-full transition-all duration-300', churnBarTone(clamped))}
                    style={{ width: `${clamped}%` }}
                />
            </div>
        </div>
    );
}
