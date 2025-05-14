import { useState, useRef, useEffect } from 'react';
import { Button } from "../botton";
import { Send, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import api from "../../services/api";

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentIndexes: { index: number, title: string }[];
  onResponseUpdate: (index: number, response: any) => void;
}

const ChatDrawer = ({ open, onOpenChange, agentIndexes, onResponseUpdate }: ChatDrawerProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && agentIndexes.length > 0 && selectedAgent === null) {
      setSelectedAgent(agentIndexes[0].index);
      setMessages([
        {
          role: 'agent',
          content: 'How would you like to refine the search results? For example, you can ask to focus on specific regions, industries, or company sizes.',
          timestamp: new Date()
        }
      ]);
    }
  }, [open, agentIndexes, selectedAgent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || selectedAgent === null || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.runPrompt(selectedAgent, inputMessage);
      
      // Add agent response
      setMessages(prev => [...prev, {
        role: 'agent',
        content: 'I\'ve updated the results based on your request.',
        timestamp: new Date()
      }]);
      
      // Update results in parent component
      onResponseUpdate(selectedAgent, response);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'agent',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAgentChange = (value: string) => {
    const index = parseInt(value, 10);
    setSelectedAgent(index);
    setMessages([
      {
        role: 'agent',
        content: 'How would you like to refine the search results? For example, you can ask to focus on specific regions, industries, or company sizes.',
        timestamp: new Date()
      }
    ]);
  };

  // If not open, don't render
  if (!open) return null;

  return (
    <aside 
      className={`bg-white border-l border-gray-200 h-screen flex flex-col fixed top-0 right-0 z-40 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-[350px] sm:w-[400px]'
      } shadow-lg`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center justify-between w-full">
            <span className="font-bold text-lg">Agent Chat</span>
            <Select 
              value={selectedAgent?.toString()} 
              onValueChange={handleAgentChange}
            >
              <SelectTrigger className="w-[180px] border border-gray-200">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agentIndexes.map((agent) => (
                  <SelectItem key={agent.index} value={agent.index.toString()}>
                    {agent.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <span onClick={() => setCollapsed(!collapsed)} className="font-bold text-lg">Chat</span>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100 ml-2 flex-shrink-0"
        >
          {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      
      {/* Messages area - only show when not collapsed */}
      {!collapsed && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                    message.role === 'user' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {message.content}
                  <div 
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <div className="border-t border-gray-200 p-4 flex items-center bg-white">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for refinements..."
              className="flex-1 p-2 border border-gray-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading || selectedAgent === null}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim() || selectedAgent === null}
              className="rounded-l-none rounded-r-md bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </>
      )}

      {/* When collapsed, show only icons in vertical layout */}
      {collapsed && (
        <div className="flex flex-col items-center mt-4 space-y-4">
          {selectedAgent !== null && (
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {selectedAgent}
            </div>
          )}
        </div>
      )}

      
    </aside>
  );
};

export default ChatDrawer;