import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { Folder, HelpCircle, MessageSquareText, X, AlertTriangle } from "lucide-react";
import AuthAlert from "../../Authentication/AuthAlert";
import { API_BASE_URL } from "../../../config"; // 👈 Import config base URL

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

type FormSnapshot = {
  question: string;
  answer: string;
  step: "form" | "review";
};

export default function AddFaqModal({
  category,
  onClose,
  onSuccess,
  initialData,
}: {
  category: string;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [step, setStep] = useState<"form" | "review">("form");
  const [loading, setLoading] = useState(false);

  const [isClosing, setIsClosing] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const QUESTION_MAX = 120;
  const ANSWER_MAX = 250;

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const closeTimerRef = useRef<number | null>(null);

  const [initialSnapshot, setInitialSnapshot] = useState<FormSnapshot>({
    question: "",
    answer: "",
    step: "form",
  });

  const showAlert = (message: string, type: "success" | "error") => {
    setAnimateAlert(false);
    window.setTimeout(() => {
      setAlertMessage(message);
      setAlertType(type);
      setAnimateAlert(true);
    }, 50);
  };

  useEffect(() => {
    setAlertMessage("");
    setAnimateAlert(false);
  }, [step]);

  useEffect(() => {
    if (!animateAlert) return;
    const t = window.setTimeout(() => setAnimateAlert(false), 3000);
    return () => window.clearTimeout(t);
  }, [animateAlert]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (initialData) {
      const nextQuestion = initialData.question || "";
      const nextAnswer = initialData.answer || "";

      setQuestion(nextQuestion);
      setAnswer(nextAnswer);

      setInitialSnapshot({
        question: nextQuestion,
        answer: nextAnswer,
        step: "form",
      });
    } else {
      setQuestion("");
      setAnswer("");

      setInitialSnapshot({
        question: "",
        answer: "",
        step: "form",
      });
    }

    setIsClosing(false);
    setStep("form");
    setDiscardOpen(false);
  }, [initialData, initialData?.id ?? "new"]);

  const validate = () => {
    if (!question.trim()) {
      showAlert("Question is required.", "error");
      return false;
    }
    if (!answer.trim()) {
      showAlert("Answer is required.", "error");
      return false;
    }
    return true;
  };

  const hasUnsavedChanges = useMemo(() => {
    return (
      question !== initialSnapshot.question ||
      answer !== initialSnapshot.answer ||
      step !== initialSnapshot.step
    );
  }, [question, answer, step, initialSnapshot]);

  const shouldWarnBeforeUnload = hasUnsavedChanges && !loading && !isClosing;

  useEffect(() => {
    if (!shouldWarnBeforeUnload) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldWarnBeforeUnload]);

  const requestClose = () => {
    if (loading || isClosing) return;
    if (step === "review") {
      setStep("form");
      return;
    }
    if (hasUnsavedChanges) {
      setDiscardOpen(true);
      return;
    }
    onClose();
  };

  const forceClose = () => {
    setDiscardOpen(false);
    setIsClosing(false);
    onClose();
  };

  const closeAfterSuccess = () => {
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleSubmit = async () => {
    if (loading || isClosing) return;
    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        category,
        question: question.trim(),
        answer: answer.trim(),
        status: "published",
      };

      if (initialData) {
        // 👈 Updated endpoint
        await axios.put(`${API_BASE_URL}/faqs/${initialData.id}`, payload, {
          headers: { ...getAuthHeaders() },
        });
        showAlert("FAQ updated successfully.", "success");
      } else {
        // 👈 Updated endpoint
        await axios.post(`${API_BASE_URL}/faqs`, payload, {
          headers: { ...getAuthHeaders() },
        });
        showAlert("FAQ added successfully.", "success");
      }

      onSuccess();
      closeAfterSuccess();
    } catch (err: any) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401) {
        showAlert("Unauthorized. Please login again.", "error");
        return;
      }
      const msg = err?.response?.data?.message || err?.message || "Something went wrong.";
      showAlert(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const disableActions = loading || isClosing;

  return (
    <div
      className="kb-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !disableActions) {
          requestClose();
        }
      }}
    >
      <div className="kb-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="kb-modal-header">
          <h5>{initialData ? "Edit FAQ" : "Add FAQ"}</h5>
          <button
            type="button"
            className="kb-close-btn app-icon-btn app-icon-btn-sm"
            onClick={requestClose}
            disabled={disableActions}
          >
            <X size={18} />
          </button>
        </div>

        <AuthAlert message={alertMessage} type={alertType} visible={animateAlert} loading={loading} />

        <div className="kb-modal-body">
          {step === "form" ? (
            <>
              <input
                className="form-control mb-2"
                placeholder="Enter FAQ question..."
                value={question}
                maxLength={QUESTION_MAX}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={disableActions}
              />
              <div className="kb-char-count text-muted text-end">
                {question.length}/{QUESTION_MAX} characters
              </div>

              <textarea
                className="form-control mb-2 kb-answer-textarea"
                placeholder="Enter detailed answer..."
                rows={4}
                maxLength={ANSWER_MAX}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={disableActions}
              />
              <div className="kb-char-count text-muted text-end">
                {answer.length}/{ANSWER_MAX} characters
              </div>
            </>
          ) : (
            <div className="kb-review">
              <div className="kb-review-card">
                <div className="kb-review-item">
                  <div className="kb-review-label">
                    <Folder size={15} className="kb-review-icon" /> Category
                  </div>
                  <div className="kb-review-value">{category}</div>
                </div>

                <div className="kb-review-item">
                  <div className="kb-review-label">
                    <HelpCircle size={15} className="kb-review-icon" /> Question
                  </div>
                  <div className="kb-review-value">{question.trim()}</div>
                </div>

                <div className="kb-review-item">
                  <div className="kb-review-label">
                    <MessageSquareText size={15} className="kb-review-icon" /> Answer
                  </div>
                  <div className="kb-review-value kb-review-answer">{answer.trim()}</div>
                </div>
              </div>

              <div className="kb-review-note">
                Please review your FAQ details. Click <b>Confirm</b> to save to the database.
              </div>
            </div>
          )}
        </div>

        <div className="kb-modal-footer">
          {step === "form" ? (
            <>
              <button className="btn btn-secondary" onClick={requestClose} disabled={disableActions}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={disableActions}
                onClick={() => {
                  if (!validate()) return;
                  setStep("review");
                }}
              >
                Review
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => setStep("form")} disabled={disableActions}>
                Back
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={disableActions}>
                {loading ? "Saving..." : initialData ? "Confirm & Update" : "Confirm & Save"}
              </button>
            </>
          )}
        </div>

        {discardOpen && (
          <div className="kb-modal-overlay" style={{ zIndex: 1060 }}>
            <div className="kb-modal-card kb-modal-card-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="kb-modal-header d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <AlertTriangle className="text-warning" size={20} />
                  <h5 className="mb-0">Discard changes?</h5>
                </div>
                <button type="button" className="kb-close-btn app-icon-btn app-icon-btn-sm" onClick={() => setDiscardOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="kb-modal-body py-2">
                <p className="mb-0 text-muted">You have unsaved changes in this FAQ. Closing now will discard them.</p>
              </div>
              <div className="kb-modal-footer">
                <button className="btn btn-secondary" onClick={() => setDiscardOpen(false)}>
                  Keep Editing
                </button>
                <button className="btn btn-danger" onClick={forceClose}>
                  Discard & Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}