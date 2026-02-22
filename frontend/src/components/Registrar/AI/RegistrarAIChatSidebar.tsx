import { useState } from "react";
import {
  Plus,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,   // ✅ Added
} from "lucide-react";

type Chat = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: any[];
};

type Props = {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
};

export default function RegistrarAIChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: Props) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`ai-sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* HEADER */}
      <div className="ai-sidebar-top">
        {!collapsed && (
          <div className="ai-sidebar-title">AI Assistant</div>
        )}

        <button
          className="ai-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* NEW CHAT */}
      {!collapsed && (
        <button className="ai-new-chat" onClick={onNewChat}>
          <Plus size={16} />
          New Chat
        </button>
      )}

      {/* COLLAPSED MODE */}
      {collapsed && (
  <div className="ai-sidebar-collapsed">
    <button onClick={onNewChat}>
      <Plus size={18} />
    </button>
  </div>
)}

      {/* EXPANDED MODE */}
      {!collapsed && (
        <>
          <div className="ai-search">
            <Search size={16} />
            <input
              placeholder="Search chats"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ai-chat-list">
  {filtered.length === 0 ? (
    <div className="ai-empty">
      No chat history yet.
    </div>
  ) : (
    filtered.map((chat) => (
      <div
        key={chat.id}
        className={`ai-chat-item ${
          activeChatId === chat.id ? "active" : ""
        }`}
        onClick={() => onSelectChat(chat.id)}
      >
        <span className="ai-chat-title">{chat.title}</span>

        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteChat(chat.id);
          }}
          aria-label="Delete chat"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ))
  )}
</div>
        </>
      )}
    </div>
  );
}
