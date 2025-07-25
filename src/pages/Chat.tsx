/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Bot,
  Building2,
  ChevronDown,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "../components/botton";
import { CollectionModal } from "../components/chat/CollectionModel";
import { CompanyCard } from "../components/chat/CompanyCard";
import { GenericResponse } from "../components/chat/GenericResponse";
import { SingleCompanyProfile } from "../components/chat/SingleCompanyPreview";
import Layout from "../components/layout/Layout";
import api, {
  ChatMessage,
  ChatMessageCreate,
  ChatSessionSummary,
} from "../services/api";

const suggestedQuestions = [
  "What are the key considerations for M&A due diligence?",
  "How do you value a target company?",
  "What are the regulatory requirements for mergers?",
  "Explain post-merger integration strategies",
  "What are the tax implications of acquisitions?",
  "How to assess cultural fit in M&A deals?",
];

const USER_ID = "demo-user";
const AGENT_ID = "default-agent";

const Chat = () => {
  const [chatSessions, setChatSessions] = useState<ChatSessionSummary[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [newSessionPending, setNewSessionPending] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<any[]>([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Parse extracted JSON from response
  const parseExtractedJson = (response: string) => {
    try {
      // Look for JSON between triple backticks or within the response
      const jsonMatch =
        response.match(/```json\s*([\s\S]*?)\s*```/) ||
        response.match(/```\s*([\s\S]*?)\s*```/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try to parse the entire response as JSON
      return JSON.parse(response);
    } catch (e) {
      return null;
    }
  };

  // Fetch chat sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessions = await api.getChatSessions();
        setChatSessions(sessions);
        if (sessions.length > 0) {
          setCurrentSessionId(sessions[0].session_id);
        } else {
          setCurrentSessionId(null);
        }
      } catch (e) {
        setChatSessions([]);
      }
    };
    fetchSessions();
  }, []);

  // Fetch messages when currentSessionId changes
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      try {
        const msgs = await api.getChatMessages(currentSessionId);
        setMessages(msgs);
      } catch (e) {
        setMessages([]);
      }
    };
    fetchMessages();
  }, [currentSessionId]);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Start a new chat session (pending until first message is sent)
  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setNewSessionPending(true);
    setShowChatHistory(false);
    setSelectedCompanies([]);
  };

  // Select an existing chat session
  const selectChatSession = (session: ChatSessionSummary) => {
    setCurrentSessionId(session.session_id);
    setMessages([]);
    setShowChatHistory(false);
    setNewSessionPending(false);
    setSelectedCompanies([]);
  };

  // Send a message (creates new session if needed)
  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage;
    if (!messageToSend.trim() || isLoading) return;
    setIsLoading(true);
    setInputMessage("");
    setSelectedCompanies([]);

    try {
      let sessionId = currentSessionId;
      // If new session, generate a new session_id (timestamp-based)
      if (!sessionId) {
        sessionId = Date.now().toString();
      }
      const payload: ChatMessageCreate = {
        session_id: sessionId,
        user_id: USER_ID,
        agent_id: AGENT_ID,
        message: messageToSend,
      };
      const response = await api.sendChatMessage(payload);
      // If this was a new session, refresh sessions list and set current
      if (!currentSessionId) {
        const sessions = await api.getChatSessions();
        setChatSessions(sessions);
        setCurrentSessionId(response.session_id);
        setNewSessionPending(false);
      }
      // Fetch updated messages for the session
      const msgs = await api.getChatMessages(response.session_id);
      setMessages(msgs);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: -1,
          session_id: currentSessionId || "",
          user_id: USER_ID,
          agent_id: AGENT_ID,
          message: "",
          response:
            "I apologize, but I encountered an error processing your request. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
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

  const handleCompanySelect = (company: any) => {
    setSelectedCompanies((prev) => {
      const isSelected = prev.some((c) => c.name === company.name);
      if (isSelected) {
        return prev.filter((c) => c.name !== company.name);
      } else {
        return [...prev, company];
      }
    });
  };

  const handleAddToCollection = (
    collectionId: string | null,
    collectionName?: string
  ) => {
    // Mock implementation - in real app, this would call an API
    console.log("Adding companies to collection:", {
      collectionId,
      collectionName,
      companies: selectedCompanies,
    });

    // Show success message or update UI
    alert(
      `Successfully added ${selectedCompanies.length} companies to ${
        collectionName || "collection"
      }!`
    );
    setSelectedCompanies([]);
  };

  // const handleFollowUpClick = (question: string) => {
  //   handleSendMessage(question);
  // };

  // Render message content based on query type
  const renderMessageContent = (message: ChatMessage) => {
    const extractedJson = parseExtractedJson(message.response);

    if (extractedJson) {
      switch (extractedJson.query_type) {
        case "COMPANY_SEARCH":
          return (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">
                    Company Search Results
                  </h3>
                </div>
                <p className="text-sm text-blue-800">
                  Found {extractedJson.total_results} companies matching your
                  criteria
                </p>
                <div className="mt-2">
                  <p className="text-xs text-blue-700">
                    <strong>Agent:</strong> {extractedJson.selected_agent} |
                    <strong> Confidence:</strong>{" "}
                    {extractedJson.confidence_level}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {extractedJson.companies?.map((company: any, idx: number) => (
                  <CompanyCard
                    key={idx}
                    company={company}
                    isSelected={selectedCompanies.some(
                      (c) => c.name === company.name
                    )}
                    onSelect={handleCompanySelect}
                  />
                ))}
              </div>

              {/* {selectedCompanies.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">
                      {selectedCompanies.length} companies selected
                    </span>
                  </div>
                  <Button
                    onClick={() => setShowCollectionModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Add to Collection
                  </Button>
                </div>
              )} */}
            </div>
          );

        case "SINGLE_COMPANY":
          return (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">
                    Company Profile
                  </h3>
                </div>
                <p className="text-xs text-green-700">
                  <strong>Agent:</strong> {extractedJson.selected_agent} |
                  <strong> Confidence:</strong> {extractedJson.confidence_level}
                </p>
              </div>
              <SingleCompanyProfile
                companyProfile={extractedJson.company_profile}
              />
            </div>
          );

        case "GENERIC_QUERY":
          return (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">AI Analysis</h3>
                </div>
                <p className="text-xs text-purple-700">
                  <strong> Confidence:</strong> {extractedJson.confidence_level}
                </p>
              </div>
              <GenericResponse
                response={extractedJson.response}
                followUpSuggestions={extractedJson.follow_up_suggestions}
              />
            </div>
          );

        default:
          // Fallback to regular markdown rendering
          return (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.response
                  .replace(/<strong>/g, "**")
                  .replace(/<\/strong>/g, "**")
                  .replace(/<br\s*\/?\>/gi, "\n")
                  .replace(/\\n/g, "\n")}
              </ReactMarkdown>
            </div>
          );
      }
    }

    // Fallback to regular markdown rendering
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.response
            .replace(/<strong>/g, "**")
            .replace(/<\/strong>/g, "**")
            .replace(/<br\s*\/?\>/gi, "\n")
            .replace(/\\n/g, "\n")}
        </ReactMarkdown>
      </div>
    );
  };

  // Get current session summary for heading
  const currentSessionSummary = chatSessions.find(
    (s) => s.session_id === currentSessionId
  );

  return (
    <Layout>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {currentSessionSummary?.first_message
                  ? currentSessionSummary.first_message.slice(0, 50) + "..."
                  : newSessionPending
                  ? "New Chat"
                  : "M&A Assistant"}
              </h2>
              <p className="text-sm text-gray-500">
                Mergers & Acquisitions Expert
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={startNewChat}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
              <div className="relative">
                <Button
                  onClick={() => setShowChatHistory(!showChatHistory)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  History
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showChatHistory ? "rotate-180" : ""
                    }`}
                  />
                </Button>
                {showChatHistory && (
                  <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700">
                        Recent Chats
                      </h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {chatSessions.length === 0 ? (
                        <p className="text-sm text-gray-500 p-3 text-center">
                          No chat history yet
                        </p>
                      ) : (
                        chatSessions.slice(0, 5).map((session) => (
                          <button
                            key={session.session_id}
                            onClick={() => selectChatSession(session)}
                            className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                              currentSessionId === session.session_id
                                ? "bg-purple-50 border border-purple-200"
                                : ""
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {session.first_message || "(No message)"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(session.timestamp).toLocaleDateString()}
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
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-[90%] mx-auto px-6 py-4">
            {/* Welcome Screen */}
            {messages.length === 0 && !newSessionPending && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Hello! How can I assist you with M&A?
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  I'm here to help with mergers, acquisitions, due diligence,
                  valuations, and integration strategies.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                  {suggestedQuestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-lg text-left transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-sm text-gray-900 font-medium leading-relaxed">
                          {suggestion}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* New Session Pending */}
            {messages.length === 0 && newSessionPending && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to help!
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Type your question below to start a new conversation.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, idx) => (
              <div key={message.id || idx} className="mb-6">
                {/* User Message */}
                {message.message && (
                  <div className="flex justify-end mb-4">
                    <div className="max-w-[90%]">
                      <div className="px-4 py-3 rounded-2xl bg-purple-600 text-white">
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.message}
                        </div>
                        <div className="text-xs mt-2 text-purple-200">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Response */}
                {message.response && (
                  <div className="flex justify-start mb-4">
                    <div className="max-w-[90%]">
                      <div className="px-4 py-3 rounded-2xl  bg-gray-50 text-gray-900">
                        {renderMessageContent(message)}
                        <div className="text-xs mt-2 text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[90%]">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
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
        <div className="bg-white border-t border-gray-200 p-6 pb-4 flex-shrink-0">
          <div className="w-[90%] mx-auto">
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl border border-gray-200 p-4 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about M&A..."
                className="flex-1 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500 resize-none min-h-[20px] max-h-32 "
                disabled={isLoading}
                rows={1}
                style={{
                  height: "auto",
                  minHeight: "24px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height =
                    Math.min(target.scrollHeight, 128) + "px";
                }}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="rounded-full  bg-purple-600 hover:bg-purple-700 text-white h-12 w-12 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 "
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
      </div>

      {/* Collection Modal */}
      <CollectionModal
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        selectedCompanies={selectedCompanies}
        onAddToCollection={handleAddToCollection}
      />
    </Layout>
  );
};

export default Chat;
