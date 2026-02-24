import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CourseItem, CourseStatus } from "./types";

type Payload = {
  code: string;
  name: string;
  yearLevels: number;
  department: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: CourseItem | null; // edit mode if present
  onCreate: (item: CourseItem) => Promise<void> | void; // ✅ allow async
  onUpdate: (item: CourseItem) => Promise<void> | void; // ✅ allow async
  departmentOptions?: string[];
};

type Errors = Partial<Record<keyof Payload, string>>;

function normalizeCode(input: string) {
  return input.trim().toUpperCase();
}

export default function AddCourseModal({
  open,
  onClose,
  initial,
  onCreate,
  onUpdate,
  departmentOptions = [
    "College of Computer Studies",
    "College of Business",
    "College of Nursing",
    "College of Engineering",
  ],
}: Props) {
  const isEdit = !!initial;

  const [form, setForm] = useState<Payload>({
    code: "",
    name: "",
    yearLevels: 4,
    department: "",
  });

  const [touched, setTouched] = useState<Partial<Record<keyof Payload, boolean>>>(
    {}
  );
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");

  // ✅ confirm popup inside modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmingRef = useRef(false);

  // ✅ show "Creating..." / "Saving..." while processing
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (isEdit && initial) {
      setForm({
        code: initial.code ?? "",
        name: initial.name ?? "",
        yearLevels: initial.yearLevels ?? 4,
        department: initial.department ?? "",
      });
    } else {
      setForm({
        code: "",
        name: "",
        yearLevels: 4,
        department: "",
      });
    }

    setTouched({});
    setErrors({});
    setFormError("");
    setConfirmOpen(false);
    confirmingRef.current = false;
    setConfirming(false);
  }, [open, isEdit, initial]);

  // ✅ lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ✅ esc closes confirmation first, then modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmOpen) setConfirmOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, confirmOpen]);

  const validate = (data: Payload): Errors => {
    const e: Errors = {};

    const code = normalizeCode(data.code);
    if (!code) e.code = "Course Code is required.";
    else if (code.length < 3) e.code = "Course Code is too short.";
    else if (!/^[A-Z0-9- ]+$/.test(code))
      e.code = "Only letters, numbers, spaces, and '-' are allowed.";

    if (!data.name.trim()) e.name = "Course Name is required.";
    else if (data.name.trim().length < 6) e.name = "Course Name is too short.";

    if (!data.department.trim()) e.department = "Department is required.";

    const y = Number(data.yearLevels);
    if (!Number.isFinite(y)) e.yearLevels = "Year Levels is required.";
    else if (y < 1 || y > 10) e.yearLevels = "Year Levels must be 1–10.";

    return e;
  };

  const setField = <K extends keyof Payload>(key: K, val: Payload[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (touched[key]) setErrors(validate({ ...form, [key]: val } as Payload));
  };

  const markTouched = (key: keyof Payload) => {
    setTouched((p) => ({ ...p, [key]: true }));
    setErrors(validate(form));
  };

  // ✅ Step 1: validate then open confirmation popup
  const onSubmit = () => {
    setTouched({
      code: true,
      name: true,
      yearLevels: true,
      department: true,
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

  // ✅ Step 2: confirmed => create/update (async-safe)
  const onConfirm = async () => {
    if (confirmingRef.current) return;
    confirmingRef.current = true;
    setConfirming(true);

    const payload: CourseItem = {
      id: isEdit && initial ? initial.id : crypto.randomUUID(),
      code: normalizeCode(form.code),
      name: form.name.trim(),
      yearLevels: Number(form.yearLevels),
      department: form.department.trim(),
      status: (initial?.status ?? "Active") as CourseStatus,
    };

    try {
      if (isEdit && initial) {
        await onUpdate(payload);
      } else {
        await onCreate(payload);
      }

      // close confirm + modal after successful call
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      // optional: show generic error on modal
      setFormError("Something went wrong. Please try again.");
    } finally {
      setConfirming(false);
      confirmingRef.current = false;
    }
  };

  if (!open) return null;

  const fieldError = (k: keyof Payload) => (touched[k] ? errors[k] : "");

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit Course" : "Add New Course"}
      onMouseDown={(e) => {
        // click outside closes modal (unless confirm is open)
        if (e.target === e.currentTarget && !confirmOpen) onClose();
      }}
    >
      {/* MAIN MODAL */}
      <div className="modal-dialog modal-dialog-centered courses-modal-dialog">
        <div
          className="modal-content border-0 shadow-lg courses-modal"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {isEdit ? "Edit Course" : "Add New Course"}
            </h5>

            <button
              className="btn p-0 d-flex align-items-center justify-content-center"
              type="button"
              onClick={onClose}
              aria-label="Close"
              disabled={confirmOpen || confirming}
              style={{ width: 34, height: 34, borderRadius: 10 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body pt-3">
            <div className="row g-3">
              {/* Course Code */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">
                  Course Code <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control courses-input ${
                    fieldError("code") ? "is-invalid" : ""
                  }`}
                  placeholder="e.g. BSIT"
                  value={form.code}
                  onChange={(e) => setField("code", e.target.value)}
                  onBlur={() => markTouched("code")}
                  disabled={confirmOpen || confirming}
                />
                <div className="invalid-feedback">{fieldError("code")}</div>
              </div>

              {/* Year Levels */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">
                  Year Levels <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select courses-input ${
                    fieldError("yearLevels") ? "is-invalid" : ""
                  }`}
                  value={form.yearLevels}
                  onChange={(e) =>
                    setField("yearLevels", Number(e.target.value))
                  }
                  onBlur={() => markTouched("yearLevels")}
                  disabled={confirmOpen || confirming}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Year" : "Years"}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">{fieldError("yearLevels")}</div>
              </div>

              {/* Course Name */}
              <div className="col-12">
                <label className="form-label fw-semibold">
                  Course Name <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control courses-input courses-input-focus ${
                    fieldError("name") ? "is-invalid" : ""
                  }`}
                  placeholder="e.g. Bachelor of Science in Information Technology"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  onBlur={() => markTouched("name")}
                  disabled={confirmOpen || confirming}
                />
                <div className="invalid-feedback">{fieldError("name")}</div>
              </div>

              {/* Department */}
              <div className="col-12">
                <label className="form-label fw-semibold">
                  Department <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select courses-input ${
                    fieldError("department") ? "is-invalid" : ""
                  }`}
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                  onBlur={() => markTouched("department")}
                  disabled={confirmOpen || confirming}
                >
                  <option value="">Select department</option>
                  {departmentOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">{fieldError("department")}</div>
              </div>
            </div>

            {formError ? (
              <div className="alert alert-danger mt-3 mb-0">{formError}</div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 pt-0">
            <button
              className="btn btn-light courses-btn-cancel"
              onClick={onClose}
              disabled={confirmOpen || confirming}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary courses-btn-primary"
              onClick={onSubmit}
              disabled={confirming}
            >
              {isEdit ? "Save Changes" : "Add Course"}
            </button>
          </div>

          {/* ✅ CONFIRM POPUP INSIDE MODAL */}
          {confirmOpen ? (
            <div
              className="sec-confirm-backdrop"
              role="dialog"
              aria-modal="true"
              aria-label={isEdit ? "Confirm Update" : "Confirm Add"}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget && !confirming)
                  setConfirmOpen(false);
              }}
            >
              <div
                className="sec-confirm-popup"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="sec-confirm-header">
                  {isEdit ? "Confirm Update" : "Confirm Add"}
                </div>

                <div className="sec-confirm-body">
                  <div className="fw-bold mb-1">
                    {isEdit ? "Save changes?" : "Create this course?"}
                  </div>

                  <div className="text-muted small">
                    {isEdit
                      ? "This will update the course details."
                      : "This will create a new course and save it to the database."}
                  </div>

                  {/* summary (nice to have) */}
                  <div className="mt-3 small">
                    <div>
                      <span className="text-muted">Code:</span>{" "}
                      <span className="fw-semibold">
                        {normalizeCode(form.code)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">Name:</span>{" "}
                      <span className="fw-semibold">{form.name.trim()}</span>
                    </div>
                    <div>
                      <span className="text-muted">Years:</span>{" "}
                      <span className="fw-semibold">{form.yearLevels}</span>
                    </div>
                    <div>
                      <span className="text-muted">Department:</span>{" "}
                      <span className="fw-semibold">{form.department}</span>
                    </div>
                  </div>
                </div>

                <div className="sec-confirm-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => setConfirmOpen(false)}
                    disabled={confirming}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={onConfirm}
                    disabled={confirming}
                  >
                    {confirming
                      ? isEdit
                        ? "Saving..."
                        : "Creating..."
                      : `Yes, ${isEdit ? "Save" : "Create"}`}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}