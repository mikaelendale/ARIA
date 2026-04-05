import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { type AgentState, Orb } from '@/components/ui/orb';
import { cn } from '@/lib/utils';

const ORB_PALETTES: [string, string][] = [
    ['#CADCFC', '#A0B9D1'],
];

export function OrbDemo({
    small = false,
    /** Kiosk column: no card chrome, smaller orb, no duplicate headings */
    embedded = false,
}: {
    small?: boolean;
    embedded?: boolean;
}) {
    const [agent, setAgent] = useState<AgentState>(null);
    const palettes = small ? [ORB_PALETTES[0]!] : ORB_PALETTES;

    const orbSize = embedded
        ? 'h-[min(52vmin,18rem)] w-[min(52vmin,18rem)] max-w-full p-1.5'
        : small
          ? 'h-40 w-40 p-1'
          : 'h-[min(82vmin,32rem)] w-[min(82vmin,32rem)] max-w-[95vw] p-2';

    return (
        <div
            className={cn(
                'w-full',
                embedded ? 'p-0' : 'bg-card rounded-lg border p-6',
            )}
        >
            {!embedded ? (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Agent Orbs</h3>
                    <p className="text-muted-foreground text-sm">Interactive orb visualization with agent states</p>
                </div>
            ) : null}

            <div className={cn('space-y-4', embedded && 'space-y-3')}>
                <div className="flex justify-center gap-8">
                    {palettes.map((colors, index) => (
                        <div
                            key={`${colors[0]}-${colors[1]}-${index}`}
                            className={`relative ${palettes.length === 1 ? 'block' : index === 1 ? 'block md:block' : 'hidden md:block'}`}
                        >
                            <div
                                className={cn(
                                    'bg-muted relative mx-auto rounded-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]',
                                    orbSize,
                                )}
                            >
                                <div className="bg-background h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]">
                                    <Orb colors={colors} seed={(index + 1) * 1000} agentState={agent} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setAgent(null)} disabled={agent === null}>
                        Idle
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAgent('listening')}
                        disabled={agent === 'listening'}
                    >
                        Listening
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={agent === 'talking'}
                        onClick={() => setAgent('talking')}
                    >
                        Talking
                    </Button>
                </div>
            </div>
        </div>
    );
}
