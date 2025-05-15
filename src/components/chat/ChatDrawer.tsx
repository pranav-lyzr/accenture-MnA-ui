import { useState, useRef, useEffect } from 'react';
import { Button } from "../botton";
import { Send, Loader2, ChevronRight, MessageSquare } from "lucide-react";
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

  return (
    <>
      {/* Toggle Button (shown when drawer is closed) */}
      {!open && (
        <button
          onClick={() => onOpenChange(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-purple-600 hover:bg-purple-700 shadow-lg flex items-center justify-center z-50 transition-all duration-300"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Chat Drawer */}
      <aside 
        className={`
          bg-white border-l border-gray-200 h-screen flex flex-col fixed top-0 right-0 z-40 
          w-[350px] sm:w-[400px] shadow-2xl
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-purple-700 text-white h-16">
          <div className="flex items-center">
            <button 
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-md hover:bg-purple-500 mr-2 flex-shrink-0 transition-colors"
              aria-label="Close chat"
            >
              <ChevronRight size={20} />
            </button>
            
            <span className="font-semibold text-lg">Prompt Refinement</span>
          </div>
          
          <Select 
            value={selectedAgent?.toString()} 
            onValueChange={handleAgentChange}
          >
            <SelectTrigger className="w-[160px] border border-purple-400 bg-purple-500 text-white focus:ring-purple-300 text-xs h-12">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {agentIndexes.map((agent) => (
                <SelectItem key={agent.index} value={agent.index.toString()}>
                  {agent.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md' 
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                <div 
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                  } flex justify-end`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="border-t border-gray-200 p-3 bg-white">
          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-purple-400 focus-within:border-transparent">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              className="flex-1 p-3 bg-transparent focus:outline-none text-gray-700"
              disabled={isLoading || selectedAgent === null}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim() || selectedAgent === null}
              className="m-1 rounded-md bg-purple-500 hover:bg-purple-700 text-white h-12 w-12 flex items-center justify-center"
              aria-label="Send message"
            >
              {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-8" />}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ChatDrawer;