import * as React from 'react';
import * as RechartsPrimitive from 'recharts';

import { cn } from '@/lib/utils';

const ChartContainer = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & {
        children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
    }
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex h-[320px] w-full flex-col justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/60 [&_.recharts-text]:fill-muted-foreground',
            className,
        )}
        {...props}
    >
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
    </div>
));
ChartContainer.displayName = 'ChartContainer';

export { ChartContainer };
