import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
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

  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const [deleteChatTitle, setDeleteChatTitle] = useState("");

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const openDeletePopup = (
    e: React.MouseEvent<HTMLButtonElement>,
    chatId: string,
    title: string
  ) => {
    e.stopPropagation();
    setDeleteChatId(chatId);
    setDeleteChatTitle(title);
  };

  const confirmDelete = () => {
    if (deleteChatId) {
      onDeleteChat(deleteChatId);
    }
    closeModal();
  };

  const closeModal = () => {
    setDeleteChatId(null);
    setDeleteChatTitle("");
  };

  return (
    <>
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
                <div className="ai-empty">No chat history yet.</div>
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
                      onClick={(e) =>
                        openDeletePopup(e, chat.id, chat.title)
                      }
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

      {/* MODAL USING PORTAL */}
      {deleteChatId &&
        createPortal(
          <div className="ai-delete-overlay" onClick={closeModal}>
            <div
              className="ai-delete-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Delete Chat</h3>

              <p>
                Are you sure you want to delete{" "}
                <strong>"{deleteChatTitle}"</strong>?
              </p>

              <div className="ai-delete-actions">
                <button
                  className="ai-btn cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  className="ai-btn delete"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}