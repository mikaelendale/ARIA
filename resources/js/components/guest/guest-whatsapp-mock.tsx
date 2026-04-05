import { MOCK_WHATSAPP_MESSAGES } from '@/components/guest/guest-mock-data';
import { cn } from '@/lib/utils';

export function GuestWhatsAppMock({ className }: { className?: string }) {
    return (
        <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', className)}>
            <div className="mb-3 shrink-0">
                <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em]">WhatsApp</p>
                <h2 className="text-foreground mt-1 text-sm font-semibold text-balance">Messages from ARIA</h2>
                <p className="text-muted-foreground mt-0.5 text-xs">Demo preview — not connected to Twilio.</p>
            </div>
            <div
                className="border-border bg-muted/40 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-y-contain rounded-xl border p-3"
                role="log"
                aria-label="Mock WhatsApp messages from ARIA"
            >
                {MOCK_WHATSAPP_MESSAGES.map((m) => (
                    <div key={m.id} className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-foreground text-xs font-semibold">ARIA</span>
                            <span className="text-muted-foreground text-[10px] tabular-nums">{m.timeLabel}</span>
                        </div>
                        <div className="bg-primary text-primary-foreground max-w-[95%] rounded-lg rounded-tl-sm px-3 py-2 text-sm leading-relaxed shadow-sm">
                            {m.body}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
