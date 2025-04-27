import { useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';

export const Sonner = () => {
  const { show, title, description, variant } = useToast();

  useEffect(() => {
    if (show) {
      // You can replace this with your preferred toast implementation
      console.log(`[${variant}] ${title}: ${description}`);
    }
  }, [show, title, description, variant]);

  return null;
}; 