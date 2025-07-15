import { useState, useEffect, useRef } from "react";
import Layout from "../components/layout/Layout";
import { 
  Loader2, 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/botton";
import api from "../services/api";

interface ChatMessage {
  role: "user" | "agent";
  content: string; // Only string allowed here
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: Date;
}

const suggestedQuestions = [
  "What are the key considerations for M&A due diligence?",
  "How do you value a target company?",
  "What are the regulatory requirements for mergers?",
  "Explain post-merger integration strategies",
  "What are the tax implications of acquisitions?",
  "How to assess cultural fit in M&A deals?"
];

const Chat = () => {
  const [currentSession, setCurrentSession] = useState<ChatSession>({
    id: "1",
    title: "New Chat",
    messages: [],
    lastUpdated: new Date()
  });
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession.messages, isLoading]);

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage;
    if (!messageToSend.trim() || isLoading) return;
    
    const userMessage = {
      role: "user" as const,
      content: messageToSend,
      timestamp: new Date(),
    };
    
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      title: currentSession.messages.length === 0 ? messageToSend.slice(0, 50) + "..." : currentSession.title,
      lastUpdated: new Date()
    };
    
    setCurrentSession(updatedSession);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      const response = await api.runPrompt(0, messageToSend);
      const agentMessage = {
        role: "agent" as const,
        content: Array.isArray(response?.raw_response)
          ? JSON.stringify(response.raw_response)
          : (response?.raw_response || "I apologize, but I couldn't process your request at the moment. Please try again."),
        timestamp: new Date(),
      };
      
      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, agentMessage],
        lastUpdated: new Date()
      };
      
      setCurrentSession(finalSession);
      
      setChatSessions(prev => {
        const existingIndex = prev.findIndex(s => s.id === finalSession.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = finalSession;
          return updated;
        }
        return [finalSession, ...prev];
      });
      
    } catch (error) {
      const errorMessage = {
        role: "agent" as const,
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      
      const errorSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
        lastUpdated: new Date()
      };
      
      setCurrentSession(errorSession);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const startNewChat = () => {
    const newSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      lastUpdated: new Date()
    };
    setCurrentSession(newSession);
    setShowChatHistory(false);
  };

  const selectChatSession = (session: ChatSession) => {
    setCurrentSession(session);
    setShowChatHistory(false);
  };

  return (
    <Layout>
      

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-81px)]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <Button
              onClick={startNewChat}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
            
            <div className="relative">
              <Button
                onClick={() => setShowChatHistory(!showChatHistory)}
                variant="outline"
                className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg px-4 py-2"
              >
                <MessageSquare className="w-4 h-4" />
                Chat History
                <ChevronDown className={`w-4 h-4 transition-transform ${showChatHistory ? 'rotate-180' : ''}`} />
              </Button>
              
              {showChatHistory && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto duration-300">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700">Recent Chats</h3>
                  </div>
                  <div className="p-2">
                    {chatSessions.length === 0 ? (
                      <p className="text-sm text-gray-500 p-3 text-center">No chat history yet</p>
                    ) : (
                      chatSessions.map((session) => (
                        <button
                          key={session.id}
                          onClick={() => selectChatSession(session)}
                          className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                            currentSession.id === session.id ? 'bg-purple-50 border border-purple-200' : ''
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900 truncate">{session.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {session.lastUpdated.toLocaleDateString()}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Agent Info */}
          {/* <div className="bg-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">Accenture M&A Agent</h2>
                <p className="text-sm text-gray-500">Mergers & Acquisitions Expert</p>
              </div>
            </div>
          </div> */}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-6">
              {currentSession.messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-1">Hello! How can I assist you today with M&A?</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">I'm here to help with mergers, acquisitions, due diligence, valuations, and integration strategies.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-6xl mx-auto">
                    {suggestedQuestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="p-4 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl text-left transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h- bg-purple-100 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                          </div>
                          <p className="text-sm text-gray-900 font-medium">{suggestion}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {currentSession.messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-6`}
                >
                  <div className={`flex items-start gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user" ? "bg-gray-200" : "bg-gray-900"
                    }`}>
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.role === "user" 
                        ? "bg-purple-600 text-white" 
                        : "bg-white border border-gray-200 text-gray-900"
                    }`}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className={`text-xs mt-2 ${
                        message.role === "user" ? "text-purple-200" : "text-gray-500"
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                        <div className="text-sm text-gray-600">Thinking...</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-end gap-3 bg-gray-50 rounded-2xl border border-gray-200 p-3 focus-within:ring-2 focus-within:ring-purple-300 focus-within:border-purple-300">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your questions here..."
                  className="flex-1 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500 resize-none min-h-[20px] max-h-32 pb-2"
                  disabled={isLoading}
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '20px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white h-10 w-10 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
