import { useState } from "react";
import StudentAIAssistantHero from "../../components/Student/AI/StudentAIAssistantHero";
import StudentAIAssistantSuggestions from "../../components/Student/AI/StudentAIAssistantSuggestions";
import StudentAIAssistantInput from "../../components/Student/AI/StudentAIAssistantInput";
import "../../styles/student-ai-assistant.css";

export default function StudentAIAssistantPage() {
  const [inputText, setInputText] = useState("");

  const handleSuggestionClick = (text: string) => setInputText(text);

  const handleSend = (text: string) => {
    console.log("Send:", text);
  };

  return (
    <div className="student-ai-page">
      <div className="student-ai-shell">
        <div className="student-ai-body">
          <StudentAIAssistantHero />
          <StudentAIAssistantSuggestions onPick={handleSuggestionClick} />
        </div>

        <div className="student-ai-footer mt-4">
          <StudentAIAssistantInput
            value={inputText}
            onChange={setInputText}
            onSend={handleSend}
          />
          <div className="text-muted small text-center mt-2">
            AI Assistant can help with schedules, grades, fees, and campus info.
          </div>
        </div>
      </div>
    </div>
  );
}
