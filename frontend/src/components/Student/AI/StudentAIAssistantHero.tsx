import { Bot } from "lucide-react";

export default function StudentAIAssistantHero() {
  return (
    <div className="text-center student-ai-hero">
      <div className="student-ai-icon mx-auto mb-3">
        <Bot size={26} />
      </div>

      <h2 className="student-ai-title mb-2">Campus AI Assistant</h2>

      <p className="student-ai-subtitle mb-0">
        I can help you with your schedule, grades, fees, documents,
        <br className="d-none d-md-block" />
        and answer any campus-related questions!
      </p>
    </div>
  );
}
