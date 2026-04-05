/**
 * Hermes — ARIA’s voice agent (see app/Ai/Agents/HermesAgent.php).
 * Twilio voice + OpenAI Realtime; bilingual Amharic & English; same orchestrator tools as text ARIA.
 */
export const HERMES = {
    name: 'Hermes',
    fullLabel: 'Hermes · Voice of ARIA',
    /** Browser tab title */
    pageTitle: 'Hermes — Kuriftu ARIA Voice',
    /** One-line pitch for hero / header */
    pitch: 'Bilingual Amharic & English voice assistant for Kuriftu Resort — same ARIA orchestrator as chat.',
    /** Technical hook for judges */
    stackLine: 'Twilio · OpenAI Realtime · shared tool orchestration with ARIA',
    /** Footer / demo disclaimer */
    footerDemo:
        'Demo surfaces: Hermes routes voice through the same ARIA orchestrator as text. Realtime audio runs in a dedicated worker with Twilio Media Streams (see HermesAgent).',
    /** WhatsApp panel header */
    messagesTitle: 'Outbound from Hermes',
    messagesSubtitle:
        'Same send_whatsapp tool as ARIA — live send when GUEST_KIOSK_WHATSAPP_GUEST_ID is set; otherwise preview only.',
} as const;
