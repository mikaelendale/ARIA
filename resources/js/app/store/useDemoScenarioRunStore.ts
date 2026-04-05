import { create } from 'zustand';

type DemoScenarioRunState = {
    /** Human-readable title while a practice scenario request is in flight. */
    runningTitle: string | null;
    setRunningTitle: (title: string | null) => void;
};

export const useDemoScenarioRunStore = create<DemoScenarioRunState>((set) => ({
    runningTitle: null,
    setRunningTitle: (runningTitle) => set({ runningTitle }),
}));
