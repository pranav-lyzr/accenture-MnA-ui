import { MessageSquare } from 'lucide-react';
import { Button } from '../botton';

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton = ({ onClick }: ChatButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-8 left-8 rounded-full w-12 h-12 bg-purple-500 hover:bg-purple-600 shadow-lg flex items-center justify-center"
    >
      <MessageSquare className="h-6 w-6 text-white" />
    </Button>
  );
};

export default ChatButton;