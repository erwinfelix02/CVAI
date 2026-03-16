import { useEffect } from "react";
import type { ReactNode } from "react";
import { X, Lightbulb } from "lucide-react";
import type { QuickGuideItem } from "./helpData";

type Props = {
  open: boolean;
  guide: QuickGuideItem | null;
  icon: ReactNode;
  onClose: () => void;
};

export default function QuickGuideModal({
  open,
  guide,
  icon,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open || !guide) return null;

  return (
    <>
      <div className="rh-guide-modal-backdrop" onClick={onClose} />

      <div className="rh-guide-modal-wrap">
        <div
          className="rh-guide-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-guide-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rh-guide-modal-header">
            <div className="rh-guide-modal-title-wrap">
              <div className="rh-guide-modal-icon">{icon}</div>

              <div className="min-w-0">
                <h3 id="quick-guide-title" className="rh-guide-modal-title">
                  {guide.title}
                </h3>
                <p className="rh-guide-modal-subtitle mb-0">{guide.subtitle}</p>
              </div>
            </div>

            <button
              type="button"
              className="rh-guide-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="rh-guide-modal-body">
            <h4 className="rh-guide-steps-heading">Step-by-step Guide</h4>

            <div className="rh-guide-steps-list">
              {guide.steps.map((step) => (
                <div className="rh-guide-step-item" key={`${guide.id}-${step.step}`}>
                  <div className="rh-guide-step-number">{step.step}</div>

                  <div className="rh-guide-step-content">
                    <div className="rh-guide-step-title">{step.title}</div>
                    <div className="rh-guide-step-description">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rh-guide-tips-card">
              <div className="rh-guide-tips-title">
                <Lightbulb size={18} />
                <span>Tips</span>
              </div>

              <ul className="rh-guide-tips-list">
                {guide.tips.map((tip, index) => (
                  <li key={`${guide.id}-tip-${index}`}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}