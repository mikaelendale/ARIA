import { useDemoScenarioRunStore } from '@/app/store/useDemoScenarioRunStore';

/**
 * Fixed top bar shown while a demo/practice scenario HTTP request is running.
 * Sits above the guided tour mask (z-index).
 */
export function DemoScenarioRunProgress() {
    const title = useDemoScenarioRunStore((s) => s.runningTitle);

    if (!title) {
        return null;
    }

    return (
        <div
            className="border-border bg-background/95 pointer-events-none fixed top-0 right-0 left-0 z-[100020] border-b backdrop-blur-sm"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="bg-muted relative h-1 w-full overflow-hidden">
                <div className="bg-primary aria-demo-run-indeterminate absolute inset-y-0 left-0 w-[38%]" />
            </div>
            <p className="text-muted-foreground px-3 py-1.5 text-center text-xs font-medium">
                Running practice: <span className="text-foreground">{title}</span>
            </p>
        </div>
    );
}
