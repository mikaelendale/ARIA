export function formatCurrencyETB(amount: number): string {
    return new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: 'ETB',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatCompactNumber(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(amount);
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
