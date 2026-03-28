import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

function scoreColor(score: number) {
    if (score <= 40) {
return 'bg-green-500';
}

    if (score <= 70) {
return 'bg-amber-500';
}

    return 'bg-red-500';
}

export function ChurnBoard({ score }: { score: number }) {
    return (
        <Card className="bg-background border-muted rounded-xl p-4 shadow-sm">
            <div className="mb-2 text-sm font-semibold">Churn Board</div>
            <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Current risk</span>
                <span className="font-medium">{score}%</span>
            </div>
            <Progress value={score} indicatorClassName={scoreColor(score)} />
        </Card>
    );
}
