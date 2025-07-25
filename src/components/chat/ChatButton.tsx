import { MessageSquare, Sparkles, X } from "lucide-react";

interface ChatButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isLoading?: boolean;
}

const ChatButton = ({
  onClick,
  isActive = false,
  isLoading = false,
}: ChatButtonProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating button with enhanced styling */}
      <div
        onClick={onClick}
        className={`
          relative rounded-full w-16 h-16 shadow-2xl transition-all duration-300 cursor-pointer
          ${
            isActive
              ? "bg-purple-600 hover:bg-purple-700 scale-110"
              : "bg-purple-600 hover:bg-purple-700"
          }
          ${
            isLoading
              ? "opacity-50 blur-[1px] pointer-events-none scale-95"
              : "opacity-100 hover:scale-110 active:scale-105"
          }
          border-2 border-white/20 backdrop-blur-sm
          group overflow-hidden
          aspect-square
          flex items-center justify-center
          z-[9998]
        `}
        aria-label={isActive ? "Close chat" : "Open chat"}
      >
        {/* Icon container */}
        <div className="relative flex items-center justify-center">
          {isActive ? (
            <X className="h-7 w-7 text-white transition-transform duration-200 group-hover:scale-110" />
          ) : (
            <MessageSquare className="h-7 w-7 text-white transition-transform duration-200 group-hover:scale-110" />
          )}

          {/* Sparkle decoration */}
          {!isLoading && !isActive && (
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 opacity-80 animate-pulse" />
          )}
        </div>

        {/* Active indicator */}
        {isActive && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-purple-600 shadow-lg animate-pulse z-[9999]" />
        )}

        {/* Ripple effect on hover */}
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 group-hover:opacity-0 transition-all duration-500 opacity-100" />
      </div>

      {/* Tooltip */}
      {!isLoading && (
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            {isActive ? "Close AI Assistant" : "Chat with AI Assistant"}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatButton;
