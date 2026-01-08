import { Send } from "lucide-react";
import "../../styles/messageinput.css";

export default function MessageInput() {
  return (
    <div className="message-input">
      <input
        type="text"
        placeholder="Ask me anything about campus..."
      />
      <button className="send-btn">
        <Send className="send-icon" />
      </button>
    </div>
  );
}
