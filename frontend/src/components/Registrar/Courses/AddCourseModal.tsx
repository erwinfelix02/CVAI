import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CourseItem, CourseStatus } from "./types";

type Payload = {
  code: string;
  name: string;
  yearLevels: number | "";
  department: string;
  status: CourseStatus;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: CourseItem | null;
  onCreate: (item: CourseItem) => Promise<void> | void;
  onUpdate: (item: CourseItem) => Promise<void> | void;
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
  departmentOptions = [],
}: Props) {
  const isEdit = !!initial;

  const activeDepartments = useMemo(() => {
    const list = Array.isArray(departmentOptions) ? departmentOptions : [];
    return list
      .map((d) => String(d || "").trim())
      .filter(Boolean)
      .filter((d, i, arr) => arr.indexOf(d) === i)
      .sort((a, b) => a.localeCompare(b));
  }, [departmentOptions]);

  const [form, setForm] = useState<Payload>({
    code: "",
    name: "",
    yearLevels: "",
    department: "",
    status: "Active",
  });

  const [initialForm, setInitialForm] = useState<Payload>({
    code: "",
    name: "",
    yearLevels: "",
    department: "",
    status: "Active",
  });

  const [touched, setTouched] = useState<
    Partial<Record<keyof Payload, boolean>>
  >({});
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const confirmingRef = useRef(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;

    let nextForm: Payload;

    if (isEdit && initial) {
      nextForm = {
        code: initial.code ?? "",
        name: initial.name ?? "",
        yearLevels: initial.yearLevels ?? "",
        department: initial.department ?? "",
        status: (initial.status ?? "Active") as CourseStatus,
      };
    } else {
      nextForm = {
        code: "",
        name: "",
        yearLevels: "",
        department: "",
        status: "Active",
      };
    }

    setForm(nextForm);
    setInitialForm(nextForm);
    setTouched({});
    setErrors({});
    setFormError("");
    setConfirmOpen(false);
    setDiscardOpen(false);
    confirmingRef.current = false;
    setConfirming(false);
  }, [open, isEdit, initial]);

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
      form.yearLevels !== initialForm.yearLevels ||
      form.department !== initialForm.department ||
      form.status !== initialForm.status
    );
  }, [form, initialForm]);

  const shouldWarnBeforeUnload =
    open && hasUnsavedChanges && !confirming && !confirmOpen;

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
    if (confirmOpen || confirming) return;

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
        if (confirming) return;

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
  }, [open, confirmOpen, discardOpen, confirming, hasUnsavedChanges]);

  const validate = (data: Payload): Errors => {
    const e: Errors = {};

    const code = normalizeCode(data.code);
    if (!code) e.code = "Course Code is required.";
    else if (code.length < 3) e.code = "Course Code is too short.";
    else if (!/^[A-Z0-9- ]+$/.test(code)) {
      e.code = "Only letters, numbers, spaces, and '-' are allowed.";
    }

    if (!data.name.trim()) e.name = "Course Name is required.";
    else if (data.name.trim().length < 6) e.name = "Course Name is too short.";

    const y = data.yearLevels === "" ? NaN : Number(data.yearLevels);
    if (!Number.isFinite(y)) e.yearLevels = "Year Levels is required.";
    else if (y < 1 || y > 10) e.yearLevels = "Year Levels must be 1–10.";

    if (!data.department.trim()) {
      e.department = "Department is required.";
    } else if (
      activeDepartments.length > 0 &&
      !activeDepartments.includes(data.department)
    ) {
      e.department = "Selected department is not active.";
    } else if (activeDepartments.length === 0) {
      e.department = "No active departments available.";
    }

    if (!data.status) e.status = "Status is required.";

    return e;
  };

  const setField = <K extends keyof Payload>(key: K, val: Payload[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
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

  const onSubmit = () => {
    setTouched({
      code: true,
      name: true,
      yearLevels: true,
      department: true,
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
      status: form.status,
    };

    try {
      if (isEdit && initial) await onUpdate(payload);
      else await onCreate(payload);

      setConfirmOpen(false);
      setDiscardOpen(false);
      onClose();
    } catch {
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
        if (
          e.target === e.currentTarget &&
          !confirmOpen &&
          !discardOpen &&
          !confirming
        ) {
          requestClose();
        }
      }}
    >
      <div className="modal-dialog modal-dialog-centered courses-modal-dialog">
        <div
          className="modal-content border-0 shadow-lg courses-modal"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {isEdit ? "Edit Course" : "Add New Course"}
            </h5>

            <button
              type="button"
              className="app-icon-btn app-icon-btn-sm"
              onClick={requestClose}
              aria-label="Close"
              title="Close"
              disabled={confirmOpen || confirming}
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal-body pt-3">
            <div className="row g-3">
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
                    setField(
                      "yearLevels",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  onBlur={() => markTouched("yearLevels")}
                  disabled={confirmOpen || confirming}
                >
                  <option value="">Select year levels</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Year" : "Years"}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">
                  {fieldError("yearLevels")}
                </div>
              </div>

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
                  disabled={
                    confirmOpen || confirming || activeDepartments.length === 0
                  }
                >
                  <option value="">
                    {activeDepartments.length
                      ? "Select department"
                      : "No active departments"}
                  </option>

                  {activeDepartments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <div className="invalid-feedback">
                  {fieldError("department")}
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">
                  Status <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select courses-input ${
                    fieldError("status") ? "is-invalid" : ""
                  }`}
                  value={form.status}
                  onChange={(e) =>
                    setField("status", e.target.value as CourseStatus)
                  }
                  onBlur={() => markTouched("status")}
                  disabled={confirmOpen || confirming}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <div className="invalid-feedback">{fieldError("status")}</div>
              </div>
            </div>

            {formError ? (
              <div className="alert alert-danger mt-3 mb-0">{formError}</div>
            ) : null}
          </div>

          <div className="modal-footer border-0 pt-0">
            <button
              className="btn btn-light courses-btn-cancel"
              onClick={requestClose}
              disabled={confirmOpen || confirming}
              type="button"
            >
              Cancel
            </button>

            <button
              className="btn btn-primary courses-btn-primary"
              onClick={onSubmit}
              disabled={confirming}
              type="button"
            >
              {isEdit ? "Save Changes" : "Add Course"}
            </button>
          </div>

          {confirmOpen ? (
            <div
              className="sec-confirm-backdrop"
              role="dialog"
              aria-modal="true"
              aria-label={isEdit ? "Confirm Update" : "Confirm Add"}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget && !confirming) {
                  setConfirmOpen(false);
                }
              }}
            >
              <div
                className="sec-confirm-popup"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="sec-confirm-header">
                  <div className="sec-confirm-title">
                    {isEdit ? "Confirm Update" : "Confirm Add"}
                  </div>

                  <button
                    type="button"
                    className="app-icon-btn app-icon-btn-sm"
                    onClick={() => setConfirmOpen(false)}
                    aria-label="Close"
                    title="Close"
                    disabled={confirming}
                  >
                    <X size={16} />
                  </button>
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
                    <div>
                      <span className="text-muted">Status:</span>{" "}
                      <span className="fw-semibold">{form.status}</span>
                    </div>
                  </div>
                </div>

                <div className="sec-confirm-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => setConfirmOpen(false)}
                    disabled={confirming}
                    type="button"
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={onConfirm}
                    disabled={confirming}
                    type="button"
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

          {discardOpen ? (
            <div
              className="sec-confirm-backdrop"
              role="dialog"
              aria-modal="true"
              aria-label="Confirm Discard Changes"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget && !confirming) {
                  setDiscardOpen(false);
                }
              }}
            >
              <div
                className="sec-confirm-popup"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="sec-confirm-header">
                  <div className="sec-confirm-title">Discard changes?</div>

                  <button
                    type="button"
                    className="app-icon-btn app-icon-btn-sm"
                    onClick={() => setDiscardOpen(false)}
                    aria-label="Close"
                    title="Close"
                    disabled={confirming}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="sec-confirm-body">
                  <div className="fw-bold mb-1">
                    You have unsaved input in this form.
                  </div>
                  <div className="text-muted small">
                    Closing this modal will discard your changes.
                  </div>
                </div>

                <div className="sec-confirm-footer">
                  <button
                    className="btn btn-light"
                    onClick={() => setDiscardOpen(false)}
                    type="button"
                  >
                    Keep Editing
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={forceClose}
                    type="button"
                  >
                    Discard & Close
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