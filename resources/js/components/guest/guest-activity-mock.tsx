import { MOCK_ACTIVITY_ITEMS, type MockActivityItem } from '@/components/guest/guest-mock-data';
import { cn } from '@/lib/utils';
import { Car, ChefHat, Headphones, Sparkles } from 'lucide-react';

function ActivityIcon({ kind }: { kind: MockActivityItem['kind'] }) {
    const cls = 'size-4 shrink-0';
    switch (kind) {
        case 'order':
            return <ChefHat className={cls} aria-hidden />;
        case 'housekeeping':
            return <Sparkles className={cls} aria-hidden />;
        case 'concierge':
            return <Headphones className={cls} aria-hidden />;
        case 'transport':
            return <Car className={cls} aria-hidden />;
    }
}

export function GuestActivityMock({
    className,
    scrollRegionClassName,
}: {
    className?: string;
    scrollRegionClassName?: string;
}) {
    return (
        <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', className)}>
            <div className="mb-3 shrink-0">
                <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em]">Live</p>
                <h2 className="text-foreground mt-1 text-sm font-semibold text-balance">What’s happening</h2>
                <p className="text-muted-foreground mt-0.5 text-xs">
                    What Hermes and ops see — orders, housekeeping, transport (demo feed). Scroll for more.
                </p>
            </div>
            <ul
                className={cn(
                    'border-border flex flex-col gap-0 rounded-xl border [-webkit-overflow-scrolling:touch]',
                    scrollRegionClassName
                        ? cn('shrink-0 overflow-y-auto overscroll-y-contain', scrollRegionClassName)
                        : 'min-h-0 flex-1 overflow-y-auto overscroll-y-contain',
                )}
                aria-label="Mock activity feed"
            >
                {MOCK_ACTIVITY_ITEMS.map((item, i) => (
                    <li
                        key={item.id}
                        className={cn(
                            'flex gap-3 px-3 py-3',
                            i > 0 && 'border-border border-t',
                        )}
                    >
                        <div className="text-primary mt-0.5">
                            <ActivityIcon kind={item.kind} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                                <p className="text-foreground text-xs font-medium">{item.title}</p>
                                <span className="text-muted-foreground shrink-0 text-[10px] tabular-nums">
                                    {item.timeLabel}
                                </span>
                            </div>
                            <p className="text-muted-foreground mt-0.5 text-xs leading-snug">{item.detail}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
