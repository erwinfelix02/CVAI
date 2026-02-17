// src/components/SuperAdmin/Knowledge/AddFaqModal.tsx

import { useState, useEffect } from "react";
import axios from "axios";

const ROLES = [
  "Super Admin",
  "Registrar",
  "Faculty",
  "Student",
  "Finance",
  "Dept Head"
];

export default function AddFaqModal({
  category,
  onClose,
  onSuccess,
  initialData
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
  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ======================================
     Initialize when editing
  ====================================== */
  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question || "");
      setAnswer(initialData.answer || "");
      setRoleVisibility(initialData.role_visibility || []);
      setIsDraft(initialData.status === "draft");

      if (
        initialData.role_visibility &&
        initialData.role_visibility.length === ROLES.length
      ) {
        setVisibleToAll(true);
      }
    }
  }, [initialData]);

  /* ======================================
     Close modal on ESC
  ====================================== */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  /* ======================================
     Role Handling
  ====================================== */
  const toggleRole = (role: string) => {
    setRoleVisibility((prev) => {
      const updated = prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role];

      // Auto-detect if all selected
      if (updated.length === ROLES.length) {
        setVisibleToAll(true);
      } else {
        setVisibleToAll(false);
      }

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

  /* ======================================
     Submit Handler
  ====================================== */
  const handleSubmit = async () => {
    if (!question.trim()) {
      alert("Question is required.");
      return;
    }

    if (!answer.trim()) {
      alert("Answer is required.");
      return;
    }

    if (roleVisibility.length === 0) {
      alert("Please select at least one role.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        category,
        question: question.trim(),
        answer: answer.trim(),
        role_visibility: roleVisibility,
        status: isDraft ? "draft" : "published"
      };

      if (initialData) {
        await axios.put(
          `http://localhost:5000/api/faqs/${initialData.id}`,
          payload
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/faqs",
          payload
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  /* ======================================
     Render
  ====================================== */
  return (
    <div
      className="kb-modal-overlay"
      onClick={onClose}
    >
      <div
        className="kb-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="kb-modal-header">
          <h5>{initialData ? "Edit FAQ" : "Add FAQ"}</h5>
          <button
            className="kb-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="kb-modal-body">

          {/* Question */}
          <input
            className="form-control mb-3"
            placeholder="Enter FAQ question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          {/* Answer */}
          <textarea
            className="form-control mb-3"
            placeholder="Enter detailed answer..."
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          {/* ROLE VISIBILITY */}
          <div className="kb-role-section">
            <label className="fw-semibold mb-2 d-block">
              Visible To Roles
            </label>

            {/* Visible to All */}
            <label className="kb-visible-all mb-2">
              <input
                type="checkbox"
                checked={visibleToAll}
                onChange={handleVisibleToAll}
              />
              Visible to All Roles
            </label>

            {/* Individual Role Chips */}
            <div className="kb-role-grid">
              {ROLES.map((role) => (
                <label
                  key={role}
                  className={`kb-role-chip ${
                    roleVisibility.includes(role)
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={roleVisibility.includes(role)}
                    disabled={visibleToAll}
                    onChange={() => toggleRole(role)}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          {/* DRAFT OPTION */}
          <label className="kb-draft-toggle">
            <input
              type="checkbox"
              checked={isDraft}
              onChange={() => setIsDraft(!isDraft)}
            />
            Save as Draft
          </label>
        </div>

        {/* FOOTER */}
        <div className="kb-modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : initialData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
