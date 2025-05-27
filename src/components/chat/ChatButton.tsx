import { MessageSquare } from 'lucide-react';
import { Button } from '../botton';

interface ChatButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isLoading?: boolean; // New prop to indicate if loader is active
}

const ChatButton = ({ onClick, isActive = false, isLoading = false }: ChatButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-6 right-6 rounded-full w-14 h-14 ${
        isActive ? 'bg-purple-700' : 'bg-purple-600'
      } hover:bg-purple-700 shadow-lg flex items-center justify-center z-50 transition-all duration-300 ${
        isLoading ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100'
      }`} // Apply blur and fade when loading
      aria-label={isActive ? "Close chat" : "Open chat"}
    >
      <MessageSquare className="h-6 w-6 text-white" />
      {isActive && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
      )}
    </Button>
  );
};

export default ChatButton;