import { X } from "lucide-react";
import type { SectionItem } from "./types";
import { useEffect, useMemo, useRef, useState } from "react";

type CourseOption = {
  id: string;
  code: string;
  name: string;
  yearLevels: number;
  status: "Active" | "Inactive";
};

type Payload = {
  code: string;
  yearLevel: string;
  program: string;
  capacity: number | "";
  room: string;
  schedule: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: SectionItem | null;
  onCreate: (item: SectionItem) => void;
  onUpdate: (item: SectionItem) => void;
  courses: CourseOption[];
  maxCapacity: number;
};

function makeId(code: string) {
  return code.toLowerCase().replace(/\s+/g, "-");
}

function normalizeCode(input: string) {
  return input.trim().toUpperCase();
}

function isLikelyTimeSchedule(v: string) {
  const s = v.trim();
  if (!s) return false;
  const hasDigit = /\d/.test(s);
  const hasTimeHint = /am|pm|:|-/.test(s.toLowerCase());
  return hasDigit && hasTimeHint;
}

function yearLabel(n: number) {
  const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  return `${n}${suffix} Year`;
}

type Errors = Partial<Record<keyof Payload, string>>;

export default function AddSectionModal({
  open,
  onClose,
  initial,
  onCreate,
  onUpdate,
  courses,
  maxCapacity,
}: Props) {
  const isEdit = !!initial;

  const courseList = useMemo(() => {
    const list = Array.isArray(courses) ? courses : [];
    return list.filter((c) => c.status === "Active");
  }, [courses]);

  const [form, setForm] = useState<Payload>({
    code: "",
    yearLevel: "",
    program: "",
    capacity: "",
    room: "",
    schedule: "",
  });

  const [initialForm, setInitialForm] = useState<Payload>({
    code: "",
    yearLevel: "",
    program: "",
    capacity: "",
    room: "",
    schedule: "",
  });

  const [touched, setTouched] = useState<Partial<Record<keyof Payload, boolean>>>(
    {},
  );
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const confirmingRef = useRef(false);

  const selectedCourse = useMemo(() => {
    if (!courseList.length || !form.program) return null;
    return courseList.find((c) => c.name === form.program) ?? null;
  }, [courseList, form.program]);

  const yearOptions = useMemo(() => {
    const maxYears = selectedCourse?.yearLevels ?? 0;
    if (!maxYears) return [];
    return Array.from({ length: maxYears }, (_, i) => yearLabel(i + 1));
  }, [selectedCourse]);

  useEffect(() => {
    if (!open) return;

    let nextForm: Payload;

    if (isEdit && initial) {
      const safeProgram =
        courseList.find((c) => c.name === initial.program)?.name ?? "";

      const safeCourse = courseList.find((c) => c.name === safeProgram) ?? null;

      const safeYearOptions = safeCourse?.yearLevels
        ? Array.from({ length: safeCourse.yearLevels }, (_, i) => yearLabel(i + 1))
        : [];

      const initialYear = (initial as any).yearLevel ?? "";
      const safeYear = safeYearOptions.includes(initialYear) ? initialYear : "";

      nextForm = {
        code: initial.code ?? "",
        yearLevel: safeYear,
        program: safeProgram,
        capacity:
          initial.capacity !== undefined && initial.capacity !== null
            ? Math.min(initial.capacity, maxCapacity)
            : "",
        room: initial.room ?? "",
        schedule: initial.schedule ?? "",
      };
    } else {
      nextForm = {
        code: "",
        yearLevel: "",
        program: "",
        capacity: "",
        room: "",
        schedule: "",
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
  }, [open, isEdit, initial, courseList, maxCapacity]);

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
      form.yearLevel !== initialForm.yearLevel ||
      form.program !== initialForm.program ||
      form.capacity !== initialForm.capacity ||
      form.room !== initialForm.room ||
      form.schedule !== initialForm.schedule
    );
  }, [form, initialForm]);

  const shouldWarnBeforeUnload = open && hasUnsavedChanges;

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
    if (confirmOpen) return;

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
  }, [open, confirmOpen, discardOpen, hasUnsavedChanges]);

  const validate = (data: Payload): Errors => {
    const e: Errors = {};

    const code = normalizeCode(data.code);
    if (!code) e.code = "Section Name is required.";
    else if (code.length < 4) e.code = "Use a longer section name (e.g., BSCS-1A).";
    else if (!/^[A-Z0-9- ]+$/.test(code)) {
      e.code = "Only letters, numbers, spaces, and '-' are allowed.";
    }

    if (!data.program) e.program = "Course/Program is required.";

    if (!data.yearLevel) e.yearLevel = "Year Level is required.";
    else if (yearOptions.length && !yearOptions.includes(data.yearLevel)) {
      e.yearLevel = "Year Level is not valid for the selected course.";
    }

    const cap = data.capacity === "" ? NaN : Number(data.capacity);
    if (!Number.isFinite(cap)) e.capacity = "Capacity is required.";
    else if (cap < 1) e.capacity = "Capacity must be at least 1.";
    else if (cap > maxCapacity) {
      e.capacity = `Capacity cannot exceed ${maxCapacity} (Registrar Settings).`;
    }

    if (!data.room.trim()) e.room = "Room is required.";
    else if (data.room.trim().length < 3) e.room = "Room is too short.";

    if (!data.schedule.trim()) e.schedule = "Schedule is required.";
    else if (!isLikelyTimeSchedule(data.schedule)) {
      e.schedule = 'Enter a schedule like "MWF 8:00-9:30 AM".';
    }

    if (!courseList.length) {
      e.program = "No ACTIVE courses available. Activate/add a course first.";
    }

    return e;
  };

  const setField = <K extends keyof Payload>(key: K, val: Payload[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (touched[key]) setErrors(validate(next));
      return next;
    });
  };

  const markTouched = (key: keyof Payload) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors(validate(form));
  };

  const onProgramChange = (programName: string) => {
    const course = courseList.find((c) => c.name === programName) ?? null;

    const nextYearOptions = course?.yearLevels
      ? Array.from({ length: course.yearLevels }, (_, i) => yearLabel(i + 1))
      : [];

    setForm((prev) => {
      const nextYear = nextYearOptions.includes(prev.yearLevel)
        ? prev.yearLevel
        : "";

      const next = {
        ...prev,
        program: programName,
        yearLevel: nextYear,
      };

      if (touched.program || touched.yearLevel) {
        setErrors(validate(next));
      }

      return next;
    });
  };

  const onSubmit = () => {
    setTouched({
      code: true,
      yearLevel: true,
      program: true,
      capacity: true,
      room: true,
      schedule: true,
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

  const onConfirm = () => {
    if (confirmingRef.current) return;
    confirmingRef.current = true;

    const code = normalizeCode(form.code);
    const capRaw = Number(form.capacity);
    const cap = Math.min(Math.max(capRaw, 1), maxCapacity);

    if (isEdit && initial) {
      const updated: SectionItem = {
        ...initial,
        code,
        program: form.program,
        room: form.room.trim(),
        schedule: form.schedule.trim(),
        capacity: cap,
      };
      (updated as any).yearLevel = form.yearLevel;

      onUpdate(updated);

      setConfirmOpen(false);
      setDiscardOpen(false);
      confirmingRef.current = false;
      onClose();
      return;
    }

    const newItem: SectionItem = {
      id: makeId(code) + "-" + Date.now(),
      code,
      program: form.program,
      adviser: "TBA",
      room: form.room.trim(),
      schedule: form.schedule.trim(),
      enrolled: 0,
      capacity: cap,
    };
    (newItem as any).yearLevel = form.yearLevel;

    onCreate(newItem);

    setConfirmOpen(false);
    setDiscardOpen(false);
    confirmingRef.current = false;
    onClose();
  };

  if (!open) return null;

  const fieldError = (k: keyof Payload) => (touched[k] ? errors[k] : "");

  return (
    <div
      className="sec-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit Section" : "Add New Section"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !confirmOpen && !discardOpen) {
          requestClose();
        }
      }}
    >
      <div className="sec-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="sec-modal-header">
          <div className="sec-modal-title">
            {isEdit ? "Edit Section" : "Add New Section"}
          </div>

          <button
            type="button"
            className="sec-modal-close app-icon-btn app-icon-btn-sm"
            onClick={requestClose}
            aria-label="Close"
            title="Close"
            disabled={confirmOpen}
          >
            <X size={18} />
          </button>
        </div>

        <div className="sec-modal-body">
          <div className="sec-grid">
            <div className="sec-field">
              <label className="sec-label">Section Name</label>
              <input
                className={`form-control sec-input ${
                  fieldError("code") ? "is-invalid" : ""
                }`}
                placeholder="e.g., BSCS-1C"
                value={form.code}
                onChange={(e) => setField("code", e.target.value)}
                onBlur={() => markTouched("code")}
              />
              <div className="sec-error-slot">
                {fieldError("code") || "\u00A0"}
              </div>
            </div>

            <div className="sec-field">
              <label className="sec-label">Year Level</label>
              <select
                className={`form-select sec-select ${
                  fieldError("yearLevel") ? "is-invalid" : ""
                }`}
                value={form.yearLevel}
                onChange={(e) => setField("yearLevel", e.target.value)}
                onBlur={() => markTouched("yearLevel")}
                disabled={!form.program || !yearOptions.length}
              >
                <option value="">
                  {!form.program ? "Select course first" : "Select year level"}
                </option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <div className="sec-error-slot">
                {fieldError("yearLevel") || "\u00A0"}
              </div>
            </div>

            <div className="sec-field sec-span-2">
              <label className="sec-label">Course/Program</label>
              <select
                className={`form-select sec-select ${
                  fieldError("program") ? "is-invalid" : ""
                }`}
                value={form.program}
                onChange={(e) => onProgramChange(e.target.value)}
                onBlur={() => markTouched("program")}
                disabled={!courseList.length}
              >
                {!courseList.length ? (
                  <option value="">No ACTIVE courses available</option>
                ) : (
                  <>
                    <option value="">Select course</option>
                    {courseList.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <div className="sec-error-slot">
                {fieldError("program") || "\u00A0"}
              </div>
            </div>

            <div className="sec-field">
              <label className="sec-label">
                Capacity{" "}
                <span className="text-muted small">(Max {maxCapacity})</span>
              </label>
              <input
                className={`form-control sec-input ${
                  fieldError("capacity") ? "is-invalid" : ""
                }`}
                type="number"
                min={1}
                max={maxCapacity}
                placeholder="Enter capacity"
                value={form.capacity}
                onChange={(e) =>
                  setField(
                    "capacity",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                onBlur={() => markTouched("capacity")}
              />
              <div className="sec-error-slot">
                {fieldError("capacity") || "\u00A0"}
              </div>
            </div>

            <div className="sec-field">
              <label className="sec-label">Room</label>
              <input
                className={`form-control sec-input ${
                  fieldError("room") ? "is-invalid" : ""
                }`}
                placeholder="Room 301"
                value={form.room}
                onChange={(e) => setField("room", e.target.value)}
                onBlur={() => markTouched("room")}
              />
              <div className="sec-error-slot">
                {fieldError("room") || "\u00A0"}
              </div>
            </div>

            <div className="sec-field sec-span-2">
              <label className="sec-label">Schedule</label>
              <input
                className={`form-control sec-input ${
                  fieldError("schedule") ? "is-invalid" : ""
                }`}
                placeholder="e.g., MWF 8:00-9:30 AM"
                value={form.schedule}
                onChange={(e) => setField("schedule", e.target.value)}
                onBlur={() => markTouched("schedule")}
              />
              <div className="sec-error-slot">
                {fieldError("schedule") || "\u00A0"}
              </div>
            </div>
          </div>

          {formError ? <div className="sec-form-error">{formError}</div> : null}
        </div>

        <div className="sec-modal-footer">
          <button
            type="button"
            className="btn btn-light"
            onClick={requestClose}
            disabled={confirmOpen}
          >
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={onSubmit}>
            {isEdit ? "Save Changes" : "Create Section"}
          </button>
        </div>

        {confirmOpen ? (
          <div
            className="sec-confirm-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={isEdit ? "Confirm Save" : "Confirm Create"}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setConfirmOpen(false);
            }}
          >
            <div
              className="sec-confirm-popup"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="sec-confirm-header">
                <div className="sec-confirm-title">
                  {isEdit ? "Confirm Update" : "Confirm Creation"}
                </div>

                <button
                  type="button"
                  className="app-icon-btn app-icon-btn-sm"
                  onClick={() => setConfirmOpen(false)}
                  aria-label="Close"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="sec-confirm-body">
                <div className="fw-bold mb-1">
                  {isEdit ? "Save changes?" : "Create this section?"}
                </div>
                <div className="text-muted small">
                  {isEdit
                    ? "This will update the section details."
                    : "This will add a new section to the list."}
                </div>
              </div>

              <div className="sec-confirm-footer">
                <button
                  className="btn btn-light"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={onConfirm}>
                  Yes, {isEdit ? "Save" : "Create"}
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
              if (e.target === e.currentTarget) setDiscardOpen(false);
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
                >
                  Keep Editing
                </button>
                <button className="btn btn-danger" onClick={forceClose}>
                  Discard & Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}