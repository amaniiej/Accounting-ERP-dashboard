import { create } from 'zustand';
import { Lang } from '../types';

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  language: Lang;
  setLanguage: (lang: Lang) => void;
  globalSearch: string;
  setGlobalSearch: (term: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  globalSearch: '',
  setGlobalSearch: (term) => set({ globalSearch: term }),
}));