import { useMemo } from 'react';
import { getEcho, setupEcho } from '@/app/echo';

export function useEcho() {
    return useMemo(() => {
        setupEcho();

        return getEcho();
    }, []);
}
