import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Folder, HelpCircle, MessageSquareText, Users } from "lucide-react";
import AuthAlert from "../../Authentication/AuthAlert";

const ROLES = [
  "Super Admin",
  "Registrar",
  "Faculty",
  "Student",
  "Finance",
  "Dept Head",
];

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  const [roleVisibility, setRoleVisibility] = useState<string[]>([]);
  const [visibleToAll, setVisibleToAll] = useState(false);
  const [step, setStep] = useState<"form" | "review">("form");
  const [loading, setLoading] = useState(false);

  // ✅ prevent double submit + keep UI stable while showing success before close
  const [isClosing, setIsClosing] = useState(false);

  const QUESTION_MAX = 120;
  const ANSWER_MAX = 250;

  // ✅ AUTH ALERT STATE
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const closeTimerRef = useRef<number | null>(null);

  const showAlert = (message: string, type: "success" | "error") => {
    setAnimateAlert(false);
    window.setTimeout(() => {
      setAlertMessage(message);
      setAlertType(type);
      setAnimateAlert(true);
    }, 50);
  };

  // Clear alert when switching steps (keeps UI clean)
  useEffect(() => {
    setAlertMessage("");
    setAnimateAlert(false);
  }, [step]);

  // Auto-hide alert after 3s
  useEffect(() => {
    if (!animateAlert) return;
    const t = window.setTimeout(() => setAnimateAlert(false), 3000);
    return () => window.clearTimeout(t);
  }, [animateAlert]);

  // Cleanup any pending close timer when unmounting
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question || "");
      setAnswer(initialData.answer || "");
      setRoleVisibility(initialData.role_visibility || []);
      if (initialData.role_visibility?.length === ROLES.length) {
        setVisibleToAll(true);
      } else {
        setVisibleToAll(false);
      }
    }
    setIsClosing(false);
    setStep("form");
  }, [initialData]);

  const toggleRole = (role: string) => {
    setRoleVisibility((prev) => {
      const updated = prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role];
      setVisibleToAll(updated.length === ROLES.length);
      return updated;
    });
  };

  const handleVisibleToAll = () => {
    if (visibleToAll) {
      setRoleVisibility([]);
      setVisibleToAll(false);
    } else {
      setRoleVisibility(ROLES);
      setVisibleToAll(true);
    }
  };

  const validate = () => {
    if (!question.trim()) {
      showAlert("Question is required.", "error");
      return false;
    }
    if (!answer.trim()) {
      showAlert("Answer is required.", "error");
      return false;
    }
    if (roleVisibility.length === 0) {
      showAlert("Please select at least one role.", "error");
      return false;
    }
    return true;
  };

  const closeAfterSuccess = () => {
    setIsClosing(true);

    // give user time to see success alert before closing
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
        role_visibility: roleVisibility,
        status: "published",
      };

      if (initialData) {
        await axios.put(
          `http://localhost:5000/api/faqs/${initialData.id}`,
          payload,
          { headers: { ...getAuthHeaders() } },
        );
        showAlert("FAQ updated successfully.", "success");
      } else {
        await axios.post("http://localhost:5000/api/faqs", payload, {
          headers: { ...getAuthHeaders() },
        });
        showAlert("FAQ added successfully.", "success");
      }

      // refresh list on parent
      onSuccess();

      // show alert then close
      closeAfterSuccess();
    } catch (err: any) {
      console.error(err);

      const status = err?.response?.status;
      if (status === 401) {
        showAlert("Unauthorized. Please login again.", "error");
        return;
      }

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong.";
      showAlert(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const disableActions = loading || isClosing;

  return (
    <div className="kb-modal-overlay" onClick={disableActions ? undefined : onClose}>
      <div className="kb-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="kb-modal-header">
          <h5>{initialData ? "Edit FAQ" : "Add FAQ"}</h5>
          <button className="kb-close-btn" onClick={onClose} disabled={disableActions as any}>
            ✕
          </button>
        </div>

        {/* ✅ AuthAlert inside modal (shows before auto-close) */}
        <AuthAlert
          message={alertMessage}
          type={alertType}
          visible={animateAlert}
          loading={loading}
        />

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

              <div className="kb-role-section">
                <label className="fw-semibold mb-2 d-block">Visible To Roles</label>
                <label className="kb-visible-all mb-2">
                  <input
                    type="checkbox"
                    checked={visibleToAll}
                    onChange={handleVisibleToAll}
                    disabled={disableActions}
                  />{" "}
                  Visible to All Roles
                </label>

                <div className="kb-role-grid">
                  {ROLES.map((role) => (
                    <label
                      key={role}
                      className={`kb-role-chip ${
                        roleVisibility.includes(role) ? "selected" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={roleVisibility.includes(role)}
                        disabled={disableActions || visibleToAll}
                        onChange={() => toggleRole(role)}
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="kb-review">
                <div className="kb-review-card">
                  <div className="kb-review-item">
                    <div className="kb-review-label">
                      <Folder size={15} className="kb-review-icon" />
                      Category
                    </div>
                    <div className="kb-review-value">{category}</div>
                  </div>

                  <div className="kb-review-item">
                    <div className="kb-review-label">
                      <HelpCircle size={15} className="kb-review-icon" />
                      Question
                    </div>
                    <div className="kb-review-value">{question.trim()}</div>
                  </div>

                  <div className="kb-review-item">
                    <div className="kb-review-label">
                      <MessageSquareText size={15} className="kb-review-icon" />
                      Answer
                    </div>
                    <div className="kb-review-value kb-review-answer">
                      {answer.trim()}
                    </div>
                  </div>

                  <div className="kb-review-item">
                    <div className="kb-review-label">
                      <Users size={15} className="kb-review-icon" />
                      Visible To
                    </div>
                    <div className="kb-review-value">
                      {visibleToAll ? "All Roles" : roleVisibility.join(", ")}
                    </div>
                  </div>
                </div>

                <div className="kb-review-note">
                  Please review your FAQ details. Click <b>Confirm</b> to save to
                  the database.
                </div>
              </div>
            </>
          )}
        </div>

        <div className="kb-modal-footer">
          {step === "form" ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={onClose}
                disabled={disableActions}
              >
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
              <button
                className="btn btn-secondary"
                onClick={() => setStep("form")}
                disabled={disableActions}
              >
                Back
              </button>

              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={disableActions}
              >
                {loading
                  ? "Saving..."
                  : initialData
                    ? "Confirm & Update"
                    : "Confirm & Save"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}