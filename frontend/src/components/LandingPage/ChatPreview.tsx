import "../../styles/chat-preview.css";
import AiIcon from "../../assets/ai.png";

export default function ChatPreview() {
  return (
    <div className="chat-preview">
      <div className="chat-header">
        <span className="chat-dot red" />
        <span className="chat-dot yellow" />
        <span className="chat-dot green" />
        <span className="chat-title">CampusAI Chat</span>
      </div>

      <div className="chat-body">
        {/* AI message */}
        <div className="chat-row">
          <div className="chat-avatar">
            <img src={AiIcon} alt="" />
          </div>
          <div className="chat-bubble ai">
            Hi! 👋 I'm your CampusAI assistant. How can I help you today?
          </div>
        </div>

        {/* User message */}
        <div className="chat-row user">
          <div className="chat-bubble user">
            When is the deadline for course registration?
          </div>
        </div>

        {/* AI response */}
        <div className="chat-row">
          <div className="chat-avatar">
            <img src={AiIcon} alt="" />
          </div>
          <div className="chat-bubble ai">
            The course registration deadline for Spring 2025 is
            <strong> January 15th</strong>. Would you like me to help you find
            available courses or check prerequisites?
          </div>
        </div>
      </div>
    </div>
  );
}
