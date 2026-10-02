import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type { DepartmentItem, DepartmentStatus } from "./types";

type Payload = {
  code: string;
  name: string;
  description: string;
  status: DepartmentStatus;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: DepartmentItem | null;
  onCreate: (payload: Omit<DepartmentItem, "id" | "head">) => void;
  onUpdate: (payload: DepartmentItem) => void;
  isLoading?: boolean;
};

type Errors = Partial<Record<keyof Payload, string>>;

function normalizeCode(v: string) {
  return v.trim().toUpperCase();
}

const EMPTY_FORM: Payload = {
  code: "",
  name: "",
  description: "",
  status: "Active",
};

export default function AddDepartmentModal({
  open,
  onClose,
  initial,
  onCreate,
  onUpdate,
  isLoading = false,
}: Props) {
  const isEdit = Boolean(initial);
  const confirmingRef = useRef(false);

  const [form, setForm] = useState<Payload>({ ...EMPTY_FORM });
  const [initialForm, setInitialForm] = useState<Payload>({ ...EMPTY_FORM });

  const [touched, setTouched] = useState<
    Partial<Record<keyof Payload, boolean>>
  >({});
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    let nextForm: Payload;

    if (initial?.id) {
      nextForm = {
        code: initial.code ?? "",
        name: initial.name ?? "",
        description: initial.description ?? "",
        status: initial.status ?? "Active",
      };
    } else {
      nextForm = { ...EMPTY_FORM };
    }

    setForm(nextForm);
    setInitialForm(nextForm);
    setTouched({});
    setErrors({});
    setFormError("");
    setConfirmOpen(false);
    setDiscardOpen(false);
    confirmingRef.current = false;
  }, [open, initial?.id, initial]);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const hasUnsavedChanges = useMemo(() => {
    return (
      form.code !== initialForm.code ||
      form.name !== initialForm.name ||
      form.description !== initialForm.description ||
      form.status !== initialForm.status
    );
  }, [form, initialForm]);

  const shouldWarnBeforeUnload =
    open && hasUnsavedChanges && !confirmOpen && !isLoading;

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
    if (isLoading) return;

    if (confirmOpen) {
      setConfirmOpen(false);
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
    setConfirmOpen(false);
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isLoading) return;

        if (confirmOpen) {
          setConfirmOpen(false);
          return;
        }

        if (discardOpen) {
          setDiscardOpen(false);
          return;
        }

        requestClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, confirmOpen, discardOpen, isLoading, hasUnsavedChanges]);

  const validate = (data: Payload): Errors => {
    const e: Errors = {};

    const code = normalizeCode(data.code);
    if (!code) {
      e.code = "Department Code is required.";
    } else if (code.length < 2) {
      e.code = "Department Code is too short.";
    } else if (!/^[A-Z0-9- ]+$/.test(code)) {
      e.code = "Only letters, numbers, spaces, and '-' are allowed.";
    }

    if (!data.name.trim()) {
      e.name = "Department Name is required.";
    } else if (data.name.trim().length < 3) {
      e.name = "Department Name is too short.";
    }

    if (data.description.trim() && data.description.trim().length < 5) {
      e.description = "Description is too short.";
    }

    if (!data.status) {
      e.status = "Status is required.";
    }

    return e;
  };

  const setField = <K extends keyof Payload>(key: K, value: Payload[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (touched[key]) {
        setErrors(validate(next));
      }

      return next;
    });
  };

  const markTouched = (key: keyof Payload) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors(validate(form));
  };

  const canSubmit = useMemo(() => {
    return Object.keys(validate(form)).length === 0;
  }, [form]);

  const requestSubmit = () => {
    setTouched({
      code: true,
      name: true,
      description: true,
      status: true,
    });

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFormError("Please fix the highlighted fields.");
      return;
    }

    setFormError("");
    setConfirmOpen(true);
  };

  const confirmSubmit = () => {
    if (confirmingRef.current || isLoading) return;
    confirmingRef.current = true;

    const payload = {
      code: normalizeCode(form.code),
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
    };

    if (initial) {
      onUpdate({
        ...initial,
        ...payload,
      });
    } else {
      onCreate(payload);
    }

    setConfirmOpen(false);
    setDiscardOpen(false);
    confirmingRef.current = false;
  };

  if (!open) return null;

  const fieldError = (key: keyof Payload) => (touched[key] ? errors[key] : "");

  return (
    <div
      className="dept-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit Department" : "Add Department"}
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !confirmOpen &&
          !discardOpen &&
          !isLoading
        ) {
          requestClose();
        }
      }}
    >
      <div className="dept-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="dept-modal-header">
          <div className="dept-modal-title">
            {isEdit ? "Edit Department" : "Add Department"}
          </div>

          <button
            type="button"
            className="dept-modal-close app-icon-btn app-icon-btn-sm"
            onClick={requestClose}
            aria-label="Close"
            title="Close"
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        </div>

        <div className="dept-modal-body">
          <div className="dept-grid">
            <div className="dept-field">
              <label className="dept-label">Department Code *</label>
              <input
                className={`form-control dept-input ${
                  fieldError("code") ? "is-invalid" : ""
                }`}
                placeholder="e.g. CICS"
                value={form.code}
                onChange={(e) => setField("code", e.target.value)}
                onBlur={() => markTouched("code")}
                disabled={isLoading}
              />
              <div className="dept-error-slot">
                {fieldError("code") || "\u00A0"}
              </div>
            </div>

            <div className="dept-field">
              <label className="dept-label">Department Head</label>
              <input
                className="form-control dept-input"
                value={
                  initial?.head?.trim() ? initial.head : "Not assigned yet"
                }
                readOnly
                disabled
              />
              <div className="dept-error-slot">
                Department Head is managed by Super Admin.
              </div>
            </div>

            <div className="dept-field">
              <label className="dept-label">Department Name *</label>
              <input
                className={`form-control dept-input ${
                  fieldError("name") ? "is-invalid" : ""
                }`}
                placeholder="e.g. College of Information and Computing Sciences"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                onBlur={() => markTouched("name")}
                disabled={isLoading}
              />
              <div className="dept-error-slot">
                {fieldError("name") || "\u00A0"}
              </div>
            </div>

            <div className="dept-field">
              <label className="dept-label">Status</label>
              <select
                className={`form-select dept-select ${
                  fieldError("status") ? "is-invalid" : ""
                }`}
                value={form.status}
                onChange={(e) =>
                  setField("status", e.target.value as DepartmentStatus)
                }
                onBlur={() => markTouched("status")}
                disabled={isLoading}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className="dept-error-slot">
                {fieldError("status") || "\u00A0"}
              </div>
            </div>

            <div className="dept-field dept-span-2">
              <label className="dept-label">Description</label>
              <textarea
                className={`form-control dept-textarea ${
                  fieldError("description") ? "is-invalid" : ""
                }`}
                placeholder="Brief description of the department..."
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                onBlur={() => markTouched("description")}
                rows={4}
                disabled={isLoading}
              />
              <div className="dept-error-slot">
                {fieldError("description") || "\u00A0"}
              </div>
            </div>
          </div>

          {formError ? (
            <div className="dept-form-error">{formError}</div>
          ) : null}
        </div>

        <div className="dept-modal-footer">
          <button
            className="btn btn-light"
            type="button"
            onClick={requestClose}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            type="button"
            onClick={requestSubmit}
            disabled={isLoading || !canSubmit}
          >
            {isEdit ? "Save" : "Create"}
          </button>
        </div>

        {confirmOpen && (
          <div
            className="dept-confirm-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={
              isEdit ? "Confirm Save Department" : "Confirm Create Department"
            }
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isLoading) {
                setConfirmOpen(false);
              }
            }}
          >
            <div
              className="dept-confirm-card"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="dept-confirm-header">
                <div className="dept-confirm-title">
                  {isEdit ? "Confirm Save" : "Confirm Create"}
                </div>

                <button
                  type="button"
                  className="app-icon-btn app-icon-btn-sm"
                  onClick={() => setConfirmOpen(false)}
                  aria-label="Close"
                  title="Close"
                  disabled={isLoading}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="dept-confirm-body">
                <div className="fw-bold mb-1">
                  {isEdit ? "Save changes?" : "Create this department?"}
                </div>

                <div className="text-muted small">
                  {isEdit
                    ? "This will update the department details."
                    : "This will create a new department."}
                </div>

                <div className="mt-3 small text-start w-100">
                  <div>
                    <span className="text-muted">Code:</span>{" "}
                    <span className="fw-semibold">{normalizeCode(form.code)}</span>
                  </div>
                  <div>
                    <span className="text-muted">Name:</span>{" "}
                    <span className="fw-semibold">{form.name.trim()}</span>
                  </div>
                  <div>
                    <span className="text-muted">Status:</span>{" "}
                    <span className="fw-semibold">{form.status}</span>
                  </div>
                  {form.description.trim() ? (
                    <div>
                      <span className="text-muted">Description:</span>{" "}
                      <span className="fw-semibold">
                        {form.description.trim()}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="dept-confirm-actions">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setConfirmOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={confirmSubmit}
                  disabled={isLoading}
                >
                  Yes, {isEdit ? "Save" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {discardOpen && (
          <div
            className="dept-confirm-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Discard Department Changes"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isLoading) {
                setDiscardOpen(false);
              }
            }}
          >
            <div
              className="dept-confirm-card"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="dept-confirm-header">
                <div className="dept-confirm-title">Discard changes?</div>

                <button
                  type="button"
                  className="app-icon-btn app-icon-btn-sm"
                  onClick={() => setDiscardOpen(false)}
                  aria-label="Close"
                  title="Close"
                  disabled={isLoading}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="dept-confirm-body">
                <div className="fw-bold mb-1">
                  You have unsaved input in this form.
                </div>
                <div className="text-muted small">
                  Closing this modal will discard your changes.
                </div>
              </div>

              <div className="dept-confirm-actions">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setDiscardOpen(false)}
                  disabled={isLoading}
                >
                  Keep Editing
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={forceClose}
                  disabled={isLoading}
                >
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