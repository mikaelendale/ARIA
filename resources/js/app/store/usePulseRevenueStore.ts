import { create } from 'zustand';

interface PulseRevenueState {
    /** Sum of revenue_impact today for PULSE-related agent actions (ETB). */
    pulseRevenueToday: number;
    incrementPulse: (amount: number) => void;
    setPulseRevenueToday: (amount: number) => void;
}

export const usePulseRevenueStore = create<PulseRevenueState>((set) => ({
    pulseRevenueToday: 0,
    incrementPulse: (amount) =>
        set((state) => ({
            pulseRevenueToday: state.pulseRevenueToday + amount,
        })),
    setPulseRevenueToday: (amount) => set({ pulseRevenueToday: amount }),
}));
