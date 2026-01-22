import { useMemo, useState } from "react";
import type { HelpCategory } from "./HelpCategoryGrid";
import { SendHorizonal } from "lucide-react";

export type HelpRequestPayload = {
  categoryKey: string;
  subject: string;
  description: string;
};

type Props = {
  category: HelpCategory;
  onSubmit: (payload: HelpRequestPayload) => void | Promise<void>;
};

export default function HelpRequestForm({ category, onSubmit }: Props) {
  const Icon = category.icon;

  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");

  const remaining = useMemo(() => 1000 - desc.length, [desc]);
  const canSubmit = subject.trim().length > 0 && desc.trim().length > 0;

  return (
    <div className="card border-1 shadow-sm help-form-card">
      <div className="card-body p-3 p-md-4">
        {/* Header */}
        <div className="d-flex align-items-start gap-3 mb-4">
          <div className="help-form-icon d-flex align-items-center justify-content-center flex-shrink-0">
            <Icon size={20} />
          </div>

          <div className="min-w-0">
            <h4 className="fw-bold mb-1">{category.title}</h4>
            <p className="text-muted mb-0">
              Tell us more about your concern so we can assist you better
            </p>
          </div>
        </div>

        {/* Subject */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Subject <span className="text-danger">*</span>
          </label>
          <input
            className="form-control"
            placeholder="Brief summary of your issue"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Description <span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control"
            rows={8}
            maxLength={1000}
            placeholder="Please describe your issue in detail. Include any relevant information that might help us assist you better."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <div className="d-flex justify-content-end mt-1">
            <small className="text-muted">{Math.max(0, remaining)}/1000</small>
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2"
          style={{ height: 48, borderRadius: 12 }}
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              categoryKey: category.key,
              subject: subject.trim(),
              description: desc.trim(),
            })
          }
        >
          <SendHorizonal size={18} />
          Submit Request
        </button>
      </div>
    </div>
  );
}
