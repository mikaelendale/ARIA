import { ChurnScoreBar } from '@/components/dashboard/churn-score-bar';
import { Card } from '@/components/ui/card';

export function ChurnBoard({ score }: { score: number }) {
    return (
        <Card className="border-border/50 bg-muted/15 rounded-lg border p-3 shadow-none">
            <div className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-[0.18em]">
                Churn risk (property)
            </div>
            <ChurnScoreBar score={score} label="Aggregate" />
        </Card>
    );
}
