import { createContext, ReactNode } from 'react';

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const TooltipProvider = ({ children }: { children: ReactNode }) => {
  return (
    <TooltipContext.Provider value={{ open: false, setOpen: () => {} }}>
      {children}
    </TooltipContext.Provider>
  );
}; 