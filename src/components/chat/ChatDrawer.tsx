import { useState, useRef, useEffect } from 'react';
import { Button } from "../botton";
import { Send, Loader2, ChevronRight, Bot, User } from "lucide-react";
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
  activeTab: number | null;
}

const ChatDrawer = ({ open, onOpenChange, agentIndexes, onResponseUpdate, activeTab }: ChatDrawerProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [dots, setDots] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect for animating dots
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      interval = setInterval(() => {
        setDots((prev) => {
          if (prev === '') return '.';
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          return '';
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  useEffect(() => {
    if (open && agentIndexes.length > 0) {
      if (activeTab !== null && agentIndexes.some(agent => agent.index === activeTab)) {
        setSelectedAgent(activeTab);
      } else if (selectedAgent === null) {
        setSelectedAgent(agentIndexes[0].index);
      }
      setMessages([
        {
          role: 'agent',
          content: 'How would you like to refine the search results? For example, you can ask to focus on specific regions, industries, or company sizes.',
          timestamp: new Date()
        }
      ]);
    }
  }, [open, agentIndexes, activeTab]);

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
      setMessages(prev => [...prev, {
        role: 'agent',
        content: 'I\'ve updated the results based on your request.',
        timestamp: new Date()
      }]);
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
    <aside 
      className={`
        bg-gradient-to-b from-slate-50 to-white border-l border-slate-200/80 h-screen flex flex-col fixed top-0 right-0 z-40 
        w-[380px] sm:w-[420px] shadow-2xl backdrop-blur-sm
        transition-all duration-300 ease-out
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-200/50 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <button 
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
            aria-label="Close chat"
          >
            <ChevronRight size={20} />
          </button>
          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-semibold text-sm">Prompt Refinement</span>
          </div>
        </div>
        <div className="ml-3 flex-shrink-0">
          <Select 
            value={selectedAgent?.toString()} 
            onValueChange={handleAgentChange}
          >
            <SelectTrigger className="w-[220px] sm:w-[260px] border border-white/30 bg-white/10 text-white focus:ring-white/30 text-xs h-auto min-h-10 backdrop-blur-sm py-2">
              <SelectValue placeholder="Select agent" className="whitespace-normal break-words" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 shadow-xl w-[300px] sm:w-[340px] max-h-[300px] overflow-y-auto">
              {agentIndexes.map((agent) => (
                <SelectItem 
                  key={agent.index} 
                  value={agent.index.toString()}
                  className="cursor-pointer hover:bg-slate-50 px-4 py-2 text-xs"
                >
                  <span className="block whitespace-normal break-words" title={agent.title}>
                    {agent.title}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`flex items-start space-x-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
              }`}>
                {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              {/* Message bubble */}
              <div 
                className={`p-4 rounded-2xl shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md' 
                    : 'bg-white/80 text-slate-800 border border-slate-200/60 rounded-bl-md'
                }`}
              >
                <div className="text-sm leading-relaxed break-words">{message.content}</div>
                <div 
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                  } opacity-70`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-start space-x-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl rounded-bl-md bg-white/80 border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  <div className="text-sm text-slate-700">
                    Analyzing request<span className="text-purple-500">{dots}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-slate-200/50 p-4 bg-white/50 backdrop-blur-sm">
        <div className="flex items-end space-x-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-purple-400/50 focus-within:border-purple-300 transition-all duration-200">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to refine your search..."
            className="flex-1 p-4 bg-transparent focus:outline-none text-slate-700 placeholder-slate-400 resize-none"
            disabled={isLoading || selectedAgent === null}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim() || selectedAgent === null}
            className="m-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-10 w-10 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="text-xs text-slate-500 mt-2 text-center">
          Press Enter to send 
        </div>
      </div>
    </aside>
  );
};

export default ChatDrawer;