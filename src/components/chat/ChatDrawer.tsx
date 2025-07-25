/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { Button } from "../botton";
import { Send, Loader2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import api from "../../services/api";

interface ChatMessage {
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentIndexes: { index: number; title: string }[];
  onResponseUpdate: (index: number, response: any) => void;
  activeTab: number | null;
}

const ChatDrawer = ({
  open,
  onOpenChange,
  agentIndexes,
  onResponseUpdate,
  activeTab,
}: ChatDrawerProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [dots, setDots] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect for animating dots
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      interval = setInterval(() => {
        setDots((prev) => {
          if (prev === "") return ".";
          if (prev === ".") return "..";
          if (prev === "..") return "...";
          return "";
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  useEffect(() => {
    if (open && agentIndexes.length > 0) {
      if (
        activeTab !== null &&
        agentIndexes.some((agent) => agent.index === activeTab)
      ) {
        setSelectedAgent(activeTab);
      } else if (selectedAgent === null) {
        setSelectedAgent(agentIndexes[0].index);
      }
      setMessages([
        {
          role: "agent",
          content:
            "How would you like to refine the search results? For example, you can ask to focus on specific regions, industries, or company sizes.",
          timestamp: new Date(),
        },
      ]);
    }
  }, [open, agentIndexes, activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || selectedAgent === null || isLoading) return;

    const userMessage = {
      role: "user" as const,
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await api.runPrompt(selectedAgent, inputMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "I've updated the results based on your request.",
          timestamp: new Date(),
        },
      ]);
      onResponseUpdate(selectedAgent, response);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "Sorry, I encountered an error processing your request.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAgentChange = (value: string) => {
    const index = parseInt(value, 10);
    setSelectedAgent(index);
    setMessages([
      {
        role: "agent",
        content:
          "How would you like to refine the search results? For example, you can ask to focus on specific regions, industries, or company sizes.",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div
      className={`
        fixed bottom-24 right-6 z-[9999] w-[500px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200
        transition-all duration-300 ease-out flex flex-col
        ${
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }
      `}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between bg-purple-700 text-white rounded-t-2xl">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-semibold text-sm">Prompt Refinement</span>
          </div>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Agent Selector */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <Select
          value={selectedAgent?.toString()}
          onValueChange={handleAgentChange}
        >
          <SelectTrigger className="w-full border border-gray-300 bg-white focus:ring-purple-500 focus:border-purple-500 text-sm h-10">
            <SelectValue
              placeholder="Select agent"
              className="whitespace-normal break-words"
            />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-xl w-full max-h-[200px] overflow-y-auto z-[10000]">
            {agentIndexes.map((agent) => (
              <SelectItem
                key={agent.index}
                value={agent.index.toString()}
                className="cursor-pointer hover:bg-gray-50 px-4 py-2 text-sm"
              >
                <span
                  className="block whitespace-normal break-words"
                  title={agent.title}
                >
                  {agent.title}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            } animate-fade-in`}
          >
            <div className="max-w-[85%]">
              {/* Message bubble */}
              <div
                className={`p-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                  message.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="text-sm leading-relaxed break-words">
                  {message.content}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === "user" ? "text-blue-100" : "text-gray-500"
                  } opacity-70`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[85%]">
              <div className="p-3 rounded-2xl bg-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  <div className="text-sm text-gray-700">
                    Analyzing request
                    <span className="text-purple-500">{dots}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-3 bg-white rounded-b-2xl">
        <div className="flex items-center space-x-3 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-purple-400/50 focus-within:border-purple-300 transition-all duration-200">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to refine your search..."
            className="flex-1 p-3 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 resize-none text-sm"
            disabled={isLoading || selectedAgent === null}
          />
          <Button
            onClick={handleSendMessage}
            disabled={
              isLoading || !inputMessage.trim() || selectedAgent === null
            }
            className="m-2 rounded-full bg-purple-700 text-white h-12 w-12 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatDrawer;
