import { Send } from "lucide-react";

type Props = {
  value: string;
  onChange: (val: string) => void;
  onSend: (text: string) => void;
  disabled?: boolean; // ✅ allow disabled
};

export default function RegistrarAIAssistantInput({
  value,
  onChange,
  onSend,
  disabled = false, // ✅ default value
}: Props) {

  const submit = () => {
      console.log("SUBMIT CLICKED");
    if (disabled) return;        // ✅ prevent double send
    const t = value.trim();
    if (!t) return;
    onSend(t);
    onChange("");
  };

  return (
    <div className="registrar-ai-input-wrap">
      <input
        className="registrar-ai-input form-control"
        placeholder="Ask about enrollment, applications, reports..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        disabled={disabled}        // ✅ disable input
      />

      <button
        type="button"
        className="registrar-ai-send-btn"
        onClick={submit}
        aria-label="Send"
        disabled={disabled}        // ✅ disable button
      >
        <Send size={18} />
      </button>
    </div>
  );
}
