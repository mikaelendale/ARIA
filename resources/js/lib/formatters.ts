function finiteNumber(amount: number): number {
    const n = typeof amount === 'number' ? amount : Number(amount);

    return Number.isFinite(n) ? n : 0;
}

export function formatCurrencyETB(amount: number): string {
    return new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: 'ETB',
        maximumFractionDigits: 0,
    }).format(finiteNumber(amount));
}

export function formatCompactNumber(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(finiteNumber(amount));
}

export function formatRelativeTime(timestamp: string): string {
    const date = new Date(timestamp);

    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

/** Short relative label for timelines (e.g. "3m ago", "2h ago"). */
export function formatTimeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const sec = Math.floor(diffMs / 1000);

    if (sec < 45) {
        return 'just now';
    }

    const min = Math.floor(sec / 60);

    if (min < 60) {
        return `${min}m ago`;
    }

    const hr = Math.floor(min / 60);

    if (hr < 48) {
        return `${hr}h ago`;
    }

    const day = Math.floor(hr / 24);

    return `${day}d ago`;
}
