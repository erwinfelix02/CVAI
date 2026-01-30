import { Bot } from "lucide-react";

export default function FacultyAIHero() {
  return (
    <div className="text-center faculty-ai-hero">
      <div className="faculty-ai-hero-icon mx-auto mb-3">
        <Bot size={26} />
      </div>

      <h2 className="fw-bold mb-2">Campus AI Assistant</h2>
      <p className="text-muted mb-0 faculty-ai-hero-sub">
        I can help you with your teaching schedule, classes, announcements,
        materials, and other faculty-related questions!
      </p>
    </div>
  );
}
