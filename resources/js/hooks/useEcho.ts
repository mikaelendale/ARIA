import { useMemo } from 'react';
import { setupEcho } from '@/app/echo';

export function useEcho() {
    const echo = useMemo(() => setupEcho(), []);

    return echo;
}
