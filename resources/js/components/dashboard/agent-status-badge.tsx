import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { friendlyAgentName } from '@/lib/aria-agent-copy';
import { formatRelativeTime, formatTimeAgo } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { AgentMeta } from '@/types/ops';

const statusDot: Record<AgentMeta['status'], string> = {
    green: 'bg-green-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
};

interface AgentStatusBadgeProps {
    agent: AgentMeta;
    className?: string;
}

export function AgentStatusBadge({ agent, className }: AgentStatusBadgeProps) {
    const rowClass = 'flex min-w-0 items-center gap-2';

    const inner = (
        <>
            <span className={cn('size-2 shrink-0 rounded-full', statusDot[agent.status])} aria-hidden />
            <span className="truncate text-sm">{friendlyAgentName(agent.name)}</span>
        </>
    );

    if (!agent.lastRun) {
        return <div className={cn(rowClass, className)}>{inner}</div>;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        rowClass,
                        '-mx-1 max-w-full rounded-sm px-1 text-left',
                        className,
                    )}
                >
                    {inner}
                </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
                <p className="text-primary-foreground/70 text-[10px] uppercase tracking-wide">System name: {agent.name}</p>
                <p className="font-medium">{formatTimeAgo(agent.lastRun)}</p>
                <p className="text-primary-foreground/80">{formatRelativeTime(agent.lastRun)}</p>
            </TooltipContent>
        </Tooltip>
    );
}
