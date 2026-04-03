import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Echo?: Echo<'reverb'>;
        Pusher: typeof Pusher;
    }
}

window.Pusher = Pusher;

export type EchoInstance = Echo<'reverb'>;

/**
 * Returns the Laravel Echo singleton after setup (or undefined if Reverb key missing).
 */
export function getEcho(): EchoInstance | undefined {
    return window.Echo;
}

/**
 * Creates Echo once and attaches optional dev connection logging.
 */
export function setupEcho(): EchoInstance | undefined {
    const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;

    if (!reverbKey || window.Echo) {
        return window.Echo;
    }

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: reverbKey,
        wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
        wsPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
        wssPort: Number(import.meta.env.VITE_REVERB_PORT || 443),
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });

    if (import.meta.env.DEV) {
        const conn = window.Echo.connector?.pusher?.connection;
        if (conn && typeof conn.bind === 'function') {
            conn.bind('connected', () => {
                // eslint-disable-next-line no-console -- intentional dev aid (Phase 10)
                console.info('[Echo] Connected to Reverb');
            });
            conn.bind('error', (err: unknown) => {
                // eslint-disable-next-line no-console -- intentional dev aid (Phase 10)
                console.warn('[Echo] Connection error', err);
            });
        }
    }

    return window.Echo;
}
