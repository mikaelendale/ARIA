export type MockWhatsAppMessage = {
    id: string;
    body: string;
    timeLabel: string;
};

export type MockActivityItem = {
    id: string;
    kind: 'order' | 'housekeeping' | 'concierge' | 'transport';
    title: string;
    detail: string;
    timeLabel: string;
};

export const MOCK_WHATSAPP_MESSAGES: MockWhatsAppMessage[] = [
    {
        id: '1',
        body: 'Welcome to Kuriftu ARIA. I can help with dining, spa bookings, and room requests — just reply here.',
        timeLabel: '09:12',
    },
    {
        id: '2',
        body: 'Your spa reservation for tomorrow at 4:00 PM is confirmed. Reply CHANGE if you need a different time.',
        timeLabel: '09:14',
    },
    {
        id: '3',
        body: 'Room service from Lakeside Kitchen is on the way. Estimated arrival: 12 minutes.',
        timeLabel: '11:03',
    },
    {
        id: '4',
        body: 'Housekeeping has refreshed your suite. Let me know if you need anything else.',
        timeLabel: '14:22',
    },
    {
        id: '5',
        body: 'Evening program: live music at the terrace bar from 7:30 PM. Would you like a table reserved?',
        timeLabel: '17:45',
    },
];

export const MOCK_ACTIVITY_ITEMS: MockActivityItem[] = [
    {
        id: 'a1',
        kind: 'order',
        title: 'Room 412 · Lunch order',
        detail: 'Grilled fish & garden salad — sent to kitchen',
        timeLabel: '2m ago',
    },
    {
        id: 'a2',
        kind: 'housekeeping',
        title: 'Turn-down service',
        detail: 'Suite 305 — completed',
        timeLabel: '8m ago',
    },
    {
        id: 'a3',
        kind: 'concierge',
        title: 'Airport transfer',
        detail: 'Vehicle dispatched for 6:00 AM pickup',
        timeLabel: '18m ago',
    },
    {
        id: 'a4',
        kind: 'order',
        title: 'Bar · Terrace',
        detail: 'Table for 2 — 7:30 PM confirmed',
        timeLabel: '32m ago',
    },
    {
        id: 'a5',
        kind: 'transport',
        title: 'Golf cart',
        detail: 'Guest en route to spa wing',
        timeLabel: '41m ago',
    },
];

export const MOCK_GLANCE = {
    weatherLine: 'Bahir Dar · 28°C · Light breeze',
    hoursLine: 'Concierge 24/7 · Spa 9:00–21:00',
    tagline: 'Lake Tana shoreline resort',
} as const;
