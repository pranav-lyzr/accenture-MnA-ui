import { create } from 'zustand';

interface ToastState {
  show: boolean;
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
  toast: (options: { title: string; description: string; variant?: 'default' | 'destructive' }) => void;
}

export const useToast = create<ToastState>((set) => ({
  show: false,
  title: '',
  description: '',
  variant: 'default',
  toast: ({ title, description, variant = 'default' }) => set({ show: true, title, description, variant }),
}));