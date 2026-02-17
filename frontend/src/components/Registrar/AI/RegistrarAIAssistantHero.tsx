import { Bot } from "lucide-react";

export default function RegistrarAIAssistantHero() {
  return (
    <div className="text-center registrar-ai-hero">
      <div className="registrar-ai-icon mx-auto mb-3">
        <Bot size={26} />
      </div>

      <h2 className="registrar-ai-title mb-2">Registrar AI Assistant</h2>

      <p className="registrar-ai-subtitle mb-0">
        I can help you manage applications, enrollment,
        <br className="d-none d-md-block" />
        student records, sections, and institutional reports.
      </p>
    </div>
  );
}
