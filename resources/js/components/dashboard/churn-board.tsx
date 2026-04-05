import { ChurnScoreBar } from '@/components/dashboard/churn-score-bar';
import { Card } from '@/components/ui/card';

export function ChurnBoard({ score }: { score: number }) {
    return (
        <Card className="border-border bg-muted/20 rounded-sm border p-3 shadow-none">
            <div className="text-muted-foreground mb-0.5 text-xs font-semibold uppercase tracking-[0.18em]">
                Guest departure risk
            </div>
            <p className="text-muted-foreground mb-2 text-[11px] leading-snug">
                Average score for everyone on file. Higher = more guests may need a personal touch.
            </p>
            <ChurnScoreBar score={score} label="Property average" />
        </Card>
    );
}
