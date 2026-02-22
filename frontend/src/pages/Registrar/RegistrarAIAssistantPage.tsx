import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, User } from "lucide-react";
import RegistrarAIAssistantHero from "../../components/Registrar/AI/RegistrarAIAssistantHero";
import RegistrarAIAssistantSuggestions from "../../components/Registrar/AI/RegistrarAIAssistantSuggestions";
import RegistrarAIAssistantInput from "../../components/Registrar/AI/RegistrarAIAssistantInput";
import RegistrarAIChatSidebar from "../../components/Registrar/AI/RegistrarAIChatSidebar";
import axios from "axios";
import "../../styles/registrar-ai-assistant.css";

type Message = {
  type: "user" | "ai";
  text: string;
  confidence?: number;
};

type Chat = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
};

export default function RegistrarAIAssistantPage() {
  const [inputText, setInputText] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId) || null,
    [chats, activeChatId],
  );

  // =========================
  // FETCH HISTORY
  // =========================
  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("sessionToken");

      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/ai/history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const grouped = res.data;
        if (!grouped || Object.keys(grouped).length === 0) {
          return;
        }

        const chatsArray: Chat[] = Object.keys(grouped).map((sessionId) => {
          const logs = grouped[sessionId];

          return {
            id: sessionId,
            title: logs[0]?.message?.slice(0, 30) || "Chat",
            createdAt: new Date(logs[0].createdAt).getTime(),
            updatedAt: new Date(logs[logs.length - 1].updatedAt).getTime(),
            messages: logs.flatMap((log: any) => [
              { type: "user", text: log.message },
              {
                type: "ai",
                text: log.answer,
                confidence: log.confidence,
              },
            ]),
          };
        });

        const sorted = chatsArray.reverse();
        setChats(sorted);
        setActiveChatId(sorted[0]?.id ?? null);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };

    fetchHistory();
  }, []);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages.length]);

  // =========================
  // CREATE CHAT
  // =========================
  const createChat = (firstTitle?: string) => {
    const id = crypto?.randomUUID?.() ?? String(Date.now());
    const now = Date.now();

    const newChat: Chat = {
      id,
      title: firstTitle?.slice(0, 30) || "New Chat",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);

    return id;
  };

  const handleNewChat = () => {
    createChat();
    setInputText("");
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const handleDeleteChat = async (chatId: string) => {
    const token = localStorage.getItem("sessionToken");

    if (!token) return;

    try {
      await axios.delete(`http://localhost:5000/api/ai/history/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChats((prev) => prev.filter((c) => c.id !== chatId));

      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const handleSend = async (text: string) => {
    if (isSending) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    const token = localStorage.getItem("sessionToken");

    if (!token) {
      alert("Session expired. Please login again.");
      return;
    }

    setIsSending(true);

    let chatId = activeChatId;
    if (!chatId) {
      chatId = createChat(trimmed);
    }

    // ADD USER MESSAGE
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [...c.messages, { type: "user", text: trimmed }],
              updatedAt: Date.now(),
            }
          : c,
      ),
    );

    setInputText("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/chat",
        {
          message: trimmed,
          role: "Registrar",
          sessionId: chatId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // ADD AI MESSAGE
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    type: "ai",
                    text: res.data.answer ?? "No response.",
                    confidence: res.data.confidence,
                  },
                ],
                updatedAt: Date.now(),
              }
            : c,
        ),
      );
    } catch (err) {
      console.error("AI Error:", err);

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    type: "ai",
                    text: "⚠️ Something went wrong.",
                  },
                ],
              }
            : c,
        ),
      );
    }

    setIsSending(false);
  };

  // =========================
  // UI
  // =========================
  return (
      <div className="registrar-ai-page">
    <div className="registrar-ai-layout">
      <RegistrarAIChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      <div className="registrar-ai-main">
        <div className="registrar-ai-body">
          {/* ✅ HERO ALWAYS VISIBLE */}
          <RegistrarAIAssistantHero />

          {/* ✅ Suggestions only when no messages */}
          {(!activeChat || activeChat.messages.length === 0) && (
            <RegistrarAIAssistantSuggestions onPick={setInputText} />
          )}

          {/* ✅ Messages show below hero */}
          {activeChat && activeChat.messages.length > 0 && (
            <div className="chat-messages">
              {activeChat.messages.map((msg, i) => (
                <div key={i} className={`chat-row ${msg.type}`}>
                  {msg.type === "ai" ? (
                    <>
                      <div className="chat-avatar ai">
                        <Bot size={18} />
                      </div>
                      <div className="chat-bubble ai">
                        <p>{msg.text}</p>
                        {msg.confidence !== undefined && (
                          <small>Confidence: {msg.confidence}</small>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="chat-bubble user">
                        <p>{msg.text}</p>
                      </div>
                      <div className="chat-avatar user">
                        <User size={18} />
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="registrar-ai-footer">
          <RegistrarAIAssistantInput
            value={inputText}
            onChange={setInputText}
            onSend={handleSend}
            disabled={isSending}
          />
        </div>
      </div>
      </div>
    </div>
  );
}
