import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Bot,
  User,
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  Trash2,
  History,
  MessageCircle,
} from "lucide-react";
import { AI_API_BASE_URL } from "../../config"; // adjust relative path if needed
import "../../styles/student-ai-assistant.css";

type Message = {
  sender: "user" | "bot";
  text: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

const suggestions = [
  "What are my upcoming classes today?",
  "How can I request a transcript?",
  "What's my current GPA?",
  "When is the deadline for enrollment?",
  "How do I pay my tuition fees?",
  "Where is the registrar's office?",
];

export default function StudentAIAssistantPage() {
  const [inputText, setInputText] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const getUserKey = () => {
    try {
      const userStr =
        localStorage.getItem("user") || localStorage.getItem("studentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || user.email || user.studentId || "default_student";
      }
    } catch (e) {
      console.error("Error reading user session:", e);
    }
    return "guest_student";
  };

  const storageKey = `campus_ai_sessions_${getUserKey()}`;

  // 1. Load saved sessions on mount, but always start with a brand-new chat
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    let loadedSessions: ChatSession[] = [];

    if (saved) {
      try {
        const parsed: ChatSession[] = JSON.parse(saved);
        // Only keep sessions that actually have messages
        loadedSessions = parsed.filter(
          (s) => s.messages && s.messages.length > 0,
        );
      } catch (e) {
        console.error("Failed to parse sessions:", e);
      }
    }

    // Create a fresh new chat session for the current landing view
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
    };

    // Combine loaded history with the new empty chat at the top
    setSessions([newSession, ...loadedSessions]);
    setActiveSessionId(newSession.id);
  }, [storageKey]);

  // 2. Only persist sessions that contain messages to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      const validSessions = sessions.filter(
        (s) => s.messages && s.messages.length > 0,
      );
      localStorage.setItem(storageKey, JSON.stringify(validSessions));
    }
  }, [sessions, storageKey]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [sessions, activeSessionId, loading, activeTab]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  const createNewChat = () => {
    // Check if there's already an empty active session to avoid redundant blank tabs
    if (activeSession && activeSession.messages.length === 0) return;

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveTab("chat");
  };

  const deleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    const validUpdated = updated.filter(
      (s) => s.messages && s.messages.length > 0,
    );

    if (
      updated.length === 0 ||
      (validUpdated.length === updated.length && activeSessionId === id)
    ) {
      const fresh: ChatSession = {
        id: Date.now().toString(),
        title: "New Conversation",
        messages: [],
        createdAt: Date.now(),
      };
      setSessions([fresh, ...validUpdated]);
      setActiveSessionId(fresh.id);
    } else {
      setSessions(updated);
      if (activeSessionId === id) {
        const nextActive =
          updated.find((s) => s.messages.length > 0) || updated[0];
        setActiveSessionId(nextActive.id);
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(validUpdated));
  };

  const handleSuggestionClick = (text: string) => {
    setInputText("");
    handleSend(text);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMessage: Message = { sender: "user", text };

    const updatedSessions = sessions.map((session) => {
      if (session.id === activeSessionId) {
        const title =
          session.messages.length === 0
            ? text.length > 25
              ? text.substring(0, 25) + "..."
              : text
            : session.title;
        return {
          ...session,
          title,
          messages: [...session.messages, userMessage],
        };
      }
      return session;
    });

    setSessions(updatedSessions);
    setInputText("");
    setLoading(true);
try {
      // 🔄 Changed from hardcoded localhost to use config for local/AWS Nginx proxy switching
      const response = await axios.post(`${AI_API_BASE_URL}/api/chat`, {
        message: text,
      });

      const botReply =
        response.data.reply || "I am sorry, I couldn't process that.";

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [
                ...session.messages,
                { sender: "bot", text: botReply },
              ],
            };
          }
          return session;
        }),
      );
    } catch (err) {
      console.error("Chat communication error:", err);
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [
                ...session.messages,
                {
                  sender: "bot",
                  text: "⚠️ Sorry, I'm having trouble connecting to the campus server right now. Please try again later.",
                },
              ],
            };
          }
          return session;
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter out empty sessions from showing up in the History tab list view
  const savedHistorySessions = sessions.filter(
    (s) => s.messages && s.messages.length > 0,
  );

  return (
    <div
      className="student-ai-page d-flex flex-column h-100 w-100 bg-white"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      {/* Top Navigation Tab Bar Only */}
      <div className="bg-white py-2 px-3 border-bottom d-flex align-items-center justify-content-end gap-2 flex-shrink-0">
        <button
          onClick={() => setActiveTab("chat")}
          className={`btn btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-1.5 ${
            activeTab === "chat"
              ? "btn-primary shadow-sm"
              : "btn-light text-muted"
          }`}
        >
          <MessageCircle size={15} />{" "}
          <span className="d-none d-sm-inline">Chat</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`btn btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-1.5 ${
            activeTab === "history"
              ? "btn-primary shadow-sm"
              : "btn-light text-muted"
          }`}
        >
          <History size={15} />{" "}
          <span className="d-none d-sm-inline">History</span>
          {savedHistorySessions.length > 0 && (
            <span className="badge bg-light text-dark rounded-pill ms-1">
              {savedHistorySessions.length}
            </span>
          )}
        </button>
        <button
          onClick={createNewChat}
          className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 d-flex align-items-center gap-1"
          title="Start New Chat"
        >
          <Plus size={15} /> <span className="d-none d-sm-inline">New</span>
        </button>
      </div>

      {/* Tab Content: HISTORY VIEW */}
      {activeTab === "history" && (
        <div className="flex-grow-1 overflow-auto p-3 p-md-4 bg-light w-100">
          <div className="mx-auto" style={{ maxWidth: "800px" }}>
            <h6
              className="fw-bold text-muted text-uppercase mb-3"
              style={{ fontSize: "0.75rem" }}
            >
              Your Past Conversations
            </h6>
            {savedHistorySessions.length === 0 ? (
              <div className="text-center py-5 text-muted bg-white rounded-3 border p-4">
                <History size={36} className="mb-2 opacity-50" />
                <p className="mb-1 fw-semibold">No past conversations found.</p>
                <p className="small text-muted mb-3">
                  Conversations will appear here once you start chatting with
                  the AI.
                </p>
                <button
                  onClick={createNewChat}
                  className="btn btn-sm btn-primary rounded-pill px-3"
                >
                  Start Chatting
                </button>
              </div>
            ) : (
              <div className="row g-2">
                {savedHistorySessions.map((session) => (
                  <div key={session.id} className="col-12">
                    <div
                      onClick={() => {
                        setActiveSessionId(session.id);
                        setActiveTab("chat");
                      }}
                      className={`border shadow-sm p-3 rounded-3 d-flex flex-row align-items-center justify-content-between bg-white cursor-pointer ${
                        session.id === activeSessionId
                          ? "border-primary border-2"
                          : ""
                      }`}
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                    >
                      <div className="d-flex align-items-center gap-3 text-truncate pe-3">
                        <div className="bg-primary-subtle text-primary p-2 rounded-circle">
                          <MessageSquare size={18} />
                        </div>
                        <div className="text-truncate">
                          <h6 className="mb-0 text-dark fw-semibold text-truncate small">
                            {session.title}
                          </h6>
                          <span
                            className="text-muted"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {session.messages.length} messages •{" "}
                            {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteChat(e, session.id)}
                        className="btn btn-sm btn-light text-danger rounded-circle p-2 flex-shrink-0"
                        title="Delete Conversation"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: ACTIVE CHAT VIEW */}
      {activeTab === "chat" && (
        <div className="d-flex flex-column flex-grow-1 overflow-hidden w-100">
          {/* Scrollable Message Log & Hero */}
          <div
            className="flex-grow-1 overflow-auto p-3 p-md-4"
            ref={chatScrollRef}
          >
            <div className="mx-auto w-100" style={{ maxWidth: "800px" }}>
              {/* Hero Section */}
              {messages.length === 0 && (
                <div className="text-center my-4 py-2">
                  <div
                    className="mx-auto mb-3 shadow-sm d-flex align-items-center justify-content-center text-white rounded-4"
                    style={{
                      width: 64,
                      height: 64,
                      background: "linear-gradient(135deg, #0d6efd, #3b82f6)",
                    }}
                  >
                    <Bot size={30} />
                  </div>
                  <h4 className="fw-bold text-dark mb-1">
                    How can I help you today?
                  </h4>
                  <p
                    className="text-muted small mx-auto"
                    style={{ maxWidth: "450px" }}
                  >
                    Select a suggested question below or type your inquiry
                    regarding your schedule, grades, or campus fees.
                  </p>
                </div>
              )}

              {/* Suggestions Grid */}
              {messages.length === 0 && (
                <div className="row g-2 mb-4">
                  {suggestions.map((text) => (
                    <div key={text} className="col-12 col-sm-6">
                      <button
                        type="button"
                        className="btn btn-light w-100 text-start p-2.5 border rounded-3 bg-white shadow-sm d-flex align-items-center text-dark"
                        onClick={() => handleSuggestionClick(text)}
                        style={{ fontSize: "0.85rem", minHeight: "48px" }}
                      >
                        <span className="text-primary me-2 flex-shrink-0">
                          <Sparkles size={15} />
                        </span>
                        <span className="text-truncate">{text}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Message Bubbles */}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`d-flex my-3 align-items-start ${
                    msg.sender === "user"
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div
                      className="bg-primary text-white rounded-circle p-1.5 me-2 shadow-sm flex-shrink-0"
                      style={{
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-4 shadow-sm ${
                      msg.sender === "user"
                        ? "bg-primary text-white rounded-end-0"
                        : "bg-light text-dark border rounded-start-0"
                    }`}
                    style={{
                      maxWidth: "80%",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: "0.9rem",
                    }}
                  >
                    {msg.text}
                  </div>

                  {msg.sender === "user" && (
                    <div
                      className="bg-secondary text-white rounded-circle p-1.5 ms-2 shadow-sm flex-shrink-0"
                      style={{
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Animation */}
              {loading && (
                <div className="d-flex my-3 align-items-start justify-content-start">
                  <div
                    className="bg-primary text-white rounded-circle p-1.5 me-2 shadow-sm flex-shrink-0"
                    style={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Bot size={16} />
                  </div>
                  <div className="px-3 py-2 rounded-4 bg-light text-muted border rounded-start-0 shadow-sm d-flex align-items-center gap-1">
                    <span className="dot-flashing"></span>
                    <span className="dot-flashing mx-1"></span>
                    <span className="dot-flashing"></span>
                    <span
                      className="ms-2 small fst-italic"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Assistant is typing...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pinned Input Footer */}
          <div className="p-3 bg-white border-top mt-auto flex-shrink-0 w-100">
            <div className="mx-auto" style={{ maxWidth: "800px" }}>
              <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                <input
                  className="form-control border-0 px-4 py-2.5 shadow-none"
                  placeholder="Ask me anything about your campus..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  style={{ fontSize: "0.9rem" }}
                />
                <button
                  type="button"
                  className="btn btn-primary px-4 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "#0d6efd", border: "none" }}
                  onClick={() => handleSend()}
                  aria-label="Send"
                >
                  <Send size={16} />
                </button>
              </div>
              <div
                className="text-muted text-center mt-2"
                style={{ fontSize: "0.68rem" }}
              >
                AI Assistant can help with schedules, grades, fees, and campus
                info.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
