import { useMemo, useState } from "react";
import FacultyAIHero from "../../components/Faculty/AIAssistant/FacultyAIHero";
import FacultyAISuggestions from "../../components/Faculty/AIAssistant/FacultyAISuggestions";
import FacultyAIComposer from "../../components/Faculty/AIAssistant/FacultyAIComposer";

import "../../styles/faculty-aiassistant.css";

type Suggestion = { id: string; text: string };

export default function FacultyAIAssistantPage() {
  const suggestions: Suggestion[] = useMemo(
    () => [
      { id: "s1", text: "What classes am I teaching today?" },
      { id: "s2", text: "How many students are in my CS201 section?" },
      { id: "s3", text: "Show my teaching schedule this week." },
      { id: "s4", text: "How do I post an announcement to my class?" },
      { id: "s5", text: "How do I upload course materials?" },
      { id: "s6", text: "How do I submit grades for midterms?" },
    ],
    []
  );

  const [input, setInput] = useState("");

  return (
    <div className="faculty-ai-page">
      <div className="container-fluid py-4 faculty-ai-shell">
        {/* Center content */}
        <div className="faculty-ai-center">
          <FacultyAIHero />

          <FacultyAISuggestions
            items={suggestions}
            onPick={(text) => setInput(text)}
          />
        </div>

        {/* Bottom composer */}
        <div className="faculty-ai-bottom">
          <FacultyAIComposer
            value={input}
            onChange={setInput}
            onSend={() => {
              if (!input.trim()) return;
              // ✅ later: push to chat messages
              alert(`Send: ${input}`);
              setInput("");
            }}
          />

          <div className="faculty-ai-footer text-muted small text-center mt-2">
            AI Assistant can help with schedules, classes, grades, and faculty tasks.
          </div>
        </div>
      </div>
    </div>
  );
}
