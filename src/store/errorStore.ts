import { create } from 'zustand';

interface ErrorState {
  error: string | null;
}

interface ErrorActions {
  setError: (error: string | null) => void;
  clearError: () => void;
}

const useErrorStore = create<ErrorState & ErrorActions>(set => ({
  error: null,
  setError: error => set({ error }),
  clearError: () => set({ error: null }),
}));

export default useErrorStore;
