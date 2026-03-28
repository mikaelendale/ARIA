import { useEffect } from 'react';
import { useActionFeedStore } from '@/app/store/useActionFeedStore';
import { useAgentStore } from '@/app/store/useAgentStore';
import { useRevenueStore } from '@/app/store/useRevenueStore';
import { useEcho } from '@/hooks/useEcho';
import type { ActionFeedItem, AgentName } from '@/types/ops';

interface ActionPayload {
    id?: string;
    agent: AgentName;
    tool: string;
    message: string;
    timestamp: string;
    revenueImpact?: number;
}

function normalizeAction(payload: ActionPayload): ActionFeedItem {
    return {
        id: payload.id ?? `${payload.agent}-${payload.tool}-${payload.timestamp}`,
        agent: payload.agent,
        tool: payload.tool,
        message: payload.message,
        timestamp: payload.timestamp,
        revenueImpact: payload.revenueImpact ?? 0,
    };
}

export function useDashboardEvents() {
    const echo = useEcho();
    const addAction = useActionFeedStore((state) => state.addAction);
    const updateAgentLastRun = useAgentStore((state) => state.updateAgentLastRun);
    const increment = useRevenueStore((state) => state.increment);

    useEffect(() => {
        if (!echo) {
return;
}

        const channel = echo.channel('aria-live');

        channel.listen('AriaActionFired', (event: { action: ActionPayload }) => {
            const action = normalizeAction(event.action);
            addAction(action);
            updateAgentLastRun(action.agent, action.timestamp);
        });

        channel.listen(
            'PricingAdjusted',
            (event: { amount: number; timestamp: string; agent?: AgentName }) => {
                increment(event.amount);

                if (event.agent) {
                    updateAgentLastRun(event.agent, event.timestamp);
                }
            },
        );

        channel.listen(
            'GuestChurnFlagged',
            (event: { agent: AgentName; timestamp: string; message?: string }) => {
                updateAgentLastRun(event.agent, event.timestamp);
                addAction({
                    id: `churn-${event.agent}-${event.timestamp}`,
                    agent: event.agent,
                    tool: 'churn-monitor',
                    message: event.message ?? 'Guest churn risk flagged.',
                    timestamp: event.timestamp,
                    revenueImpact: 0,
                });
            },
        );

        channel.listen(
            'IncidentResolved',
            (event: { agent: AgentName; timestamp: string; message?: string }) => {
                updateAgentLastRun(event.agent, event.timestamp);
                addAction({
                    id: `incident-${event.agent}-${event.timestamp}`,
                    agent: event.agent,
                    tool: 'incident-resolver',
                    message: event.message ?? 'Incident resolved.',
                    timestamp: event.timestamp,
                    revenueImpact: 0,
                });
            },
        );

        return () => {
            echo.leave('aria-live');
        };
    }, [echo, addAction, updateAgentLastRun, increment]);
}
