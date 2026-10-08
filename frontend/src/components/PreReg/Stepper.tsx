import {
  CheckCircle2,
  User,
  BookOpen,
  FileText,
  ClipboardCheck,
} from "lucide-react";

export type StepKey = "personal" | "academic" | "documents" | "review";
type Step = { key: StepKey; label: string };

const stepIcon: Record<StepKey, React.ElementType> = {
  personal: User,
  academic: BookOpen,
  documents: FileText,
  review: ClipboardCheck,
};

export default function Stepper({
  steps,
  active,
  onChange,
  maxAllowedKey, // ✅ optional: last allowed step
}: {
  steps: Step[];
  active: StepKey;
  onChange: (k: StepKey) => void;
  maxAllowedKey?: StepKey;
}) {
  const activeIndex = steps.findIndex((s) => s.key === active);
  const maxAllowedIndex =
    maxAllowedKey != null ? steps.findIndex((s) => s.key === maxAllowedKey) : activeIndex;

  return (
    <div className="prereg-stepper" role="tablist" aria-label="Pre-registration steps">
      {steps.map((s, i) => {
        const isActive = i === activeIndex;
        const isDone = i < activeIndex;
        const isLocked = i > maxAllowedIndex;

        const Icon = stepIcon[s.key];

        return (
          <div className="prereg-stepper-item" key={s.key}>
            <button
              type="button"
              className={[
                "prereg-stepper-pill",
                isActive ? "active" : "",
                isDone ? "done" : "",
                isLocked ? "locked" : "",
              ].join(" ")}
              onClick={() => !isLocked && onChange(s.key)}
              disabled={isLocked}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="prereg-step-icon" aria-hidden="true">
                {isDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
              </span>

              <span className="prereg-step-label">{s.label}</span>
            </button>

            {/* connector line (screenshot style) */}
            {i !== steps.length - 1 && (
              <span
                className={`prereg-stepper-line ${isDone ? "done" : ""}`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
