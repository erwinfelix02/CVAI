import { useState } from "react";
import "../../styles/chat-preview.css";
import AiIcon from "../../assets/ai.png";
import TypingText from "./TypingText";

export default function ChatPreview() {
  const [step, setStep] = useState(1);
  const [loopKey, setLoopKey] = useState(0);

  const restartChat = () => {
    setTimeout(() => {
      setStep(1);
      setLoopKey((k) => k + 1); // forces typing reset
    }, 2000); // pause before repeating
  };

  return (
    <div className="chat-preview">
      <div className="chat-header">
        <span className="chat-dot red" />
        <span className="chat-dot yellow" />
        <span className="chat-dot green" />
        <span className="chat-title">CampusAI Chat</span>
      </div>

      <div className="chat-body">
        {/* AI Message 1 */}
        <div className="chat-row">
          <div className="chat-avatar">
            <img src={AiIcon} alt="AI assistant" />
          </div>

          <div className="chat-bubble ai">
            {step === 1 ? (
              <TypingText
                key={`ai1-${loopKey}`}
                text="Hi! 👋 I'm your CampusAI assistant. How can I help you today?"
                speed={35}
                onDone={() => setTimeout(() => setStep(2), 600)}
              />
            ) : (
              "Hi! 👋 I'm your CampusAI assistant. How can I help you today?"
            )}
          </div>
        </div>

        {/* USER MESSAGE */}
        {step >= 2 && (
          <div className="chat-row user">
            <div className="chat-bubble user">
              {step === 2 ? (
                <TypingText
                  key={`user-${loopKey}`}
                  text="When is the deadline for course registration?"
                  speed={30}
                  onDone={() => setTimeout(() => setStep(3), 600)}
                />
              ) : (
                "When is the deadline for course registration?"
              )}
            </div>
          </div>
        )}

        {/* AI MESSAGE 2 */}
        {step >= 3 && (
          <div className="chat-row">
            <div className="chat-avatar">
              <img src={AiIcon} alt="AI assistant" />
            </div>

            <div className="chat-bubble ai">
              {step === 3 ? (
                <TypingText
                  key={`ai2-${loopKey}`}
                  text="The course registration deadline for Spring 2025 is January 15th. Would you like me to help you find available courses or check prerequisites?"
                  speed={25}
                  onDone={restartChat}
                />
              ) : (
                "The course registration deadline for Spring 2025 is January 15th. Would you like me to help you find available courses or check prerequisites?"
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
