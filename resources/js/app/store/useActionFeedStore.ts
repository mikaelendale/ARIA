import { create } from 'zustand';
import type { ActionFeedItem } from '@/types/ops';

interface ActionFeedState {
    actions: ActionFeedItem[];
    addAction: (action: ActionFeedItem) => void;
    setInitialActions: (actions: ActionFeedItem[]) => void;
}

const MAX_ACTIONS = 50;

export const useActionFeedStore = create<ActionFeedState>((set) => ({
    actions: [],
    addAction: (action) =>
        set((state) => ({
            actions: [action, ...state.actions].slice(0, MAX_ACTIONS),
        })),
    setInitialActions: (actions) =>
        set({
            actions: actions.slice(0, MAX_ACTIONS),
        }),
}));
