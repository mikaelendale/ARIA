import { create } from 'zustand';

interface RevenueStoreState {
    totalRevenue: number;
    increment: (amount: number) => void;
    setTotalRevenue: (amount: number) => void;
}

export const useRevenueStore = create<RevenueStoreState>((set) => ({
    totalRevenue: 0,
    increment: (amount) =>
        set((state) => ({
            totalRevenue: state.totalRevenue + amount,
        })),
    setTotalRevenue: (amount) => set({ totalRevenue: amount }),
}));
