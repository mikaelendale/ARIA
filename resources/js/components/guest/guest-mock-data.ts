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
        body: 'Welcome — I’m Hermes, ARIA’s voice layer. I speak Amharic and English. Ask for dining, spa, or room help here.',
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
    {
        id: '6',
        body: 'Your wake-up call is set for 6:30 AM with coffee service. Reply SKIP to cancel.',
        timeLabel: '20:10',
    },
    {
        id: '7',
        body: 'Laundry: your items are ready for pickup at the front desk.',
        timeLabel: 'Yesterday',
    },
    {
        id: '8',
        body: 'Boat tour of Lake Tana: tomorrow 10:00 AM — two seats held under your name. Reply YES to confirm.',
        timeLabel: 'Yesterday',
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
    {
        id: 'a6',
        kind: 'order',
        title: 'Pool bar',
        detail: 'Two cocktails — charging to Room 412',
        timeLabel: '55m ago',
    },
    {
        id: 'a7',
        kind: 'housekeeping',
        title: 'Extra towels',
        detail: 'Delivered to Room 201',
        timeLabel: '1h ago',
    },
    {
        id: 'a8',
        kind: 'concierge',
        title: 'Tour guide',
        detail: 'Amharic & English guide booked for 3:00 PM',
        timeLabel: '1h ago',
    },
];

export const MOCK_GLANCE = {
    weatherLine: 'Bahir Dar · 28°C · Light breeze',
    hoursLine: 'Concierge 24/7 · Spa 9:00–21:00',
    tagline: 'Hermes · same brain as ARIA · Lake Tana shoreline',
    wifiName: 'Kuriftu-Guest',
    wifiHint: 'Ask front desk for the daily password.',
    emergencyLine: 'Front desk 0 · Medical +251…',
    diningLine: 'Breakfast 6:30–10:30 · Dinner 18:30–22:00',
    events: [
        { id: 'e1', title: 'Sunset yoga', time: '18:00 · Lakeside deck' },
        { id: 'e2', title: 'Kids club', time: '15:00–17:00 · Activity centre' },
        { id: 'e3', title: 'Wine tasting', time: '20:00 · Cellar bar' },
    ],
} as const;
