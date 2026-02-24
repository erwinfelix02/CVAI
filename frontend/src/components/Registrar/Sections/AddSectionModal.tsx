import { X } from "lucide-react";
import type { SectionItem } from "./types";
import { useEffect, useMemo, useRef, useState } from "react";

type CourseOption = {
  id: string;
  code: string;
  name: string; // display name
  yearLevels: number; // 1..N
};

type Payload = {
  code: string;
  yearLevel: string;
  program: string; // store course NAME (or change to courseId if you want)
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

  // ✅ now based on DB
  courses: CourseOption[];
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
  const suffix =
    n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
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
}: Props) {
  const isEdit = !!initial;

  // ✅ courses from DB; fallback when empty
  const courseList = useMemo(() => Array.isArray(courses) ? courses : [], [courses]);

  // ✅ pick selected course details
  const selectedCourse = useMemo(() => {
    if (!courseList.length) return null;
    const selectedName =
      (initial?.program as string | undefined) ??
      (courseList[0]?.name ?? "");
    return courseList.find((c) => c.name === selectedName) ?? courseList[0];
  }, [courseList, initial]);

  // ✅ year options depend on selected course yearLevels
  const yearOptions = useMemo(() => {
    const maxYears = selectedCourse?.yearLevels ?? 0;
    if (!maxYears) return [];
    return Array.from({ length: maxYears }, (_, i) => yearLabel(i + 1));
  }, [selectedCourse]);

  const [form, setForm] = useState<Payload>({
    code: "",
    yearLevel: "",
    program: "",
    capacity: 40,
    room: "",
    schedule: "",
  });

  const [touched, setTouched] = useState<Partial<Record<keyof Payload, boolean>>>(
    {}
  );
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>("");

  // ✅ confirm popup state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmingRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    // ✅ default program when opening
    const defaultProgram = courseList[0]?.name ?? "";

    if (isEdit && initial) {
      const existingProgram = initial.program ?? defaultProgram;

      // if course list changed and existing program no longer exists, fallback safely
      const safeProgram =
        courseList.find((c) => c.name === existingProgram)?.name ?? defaultProgram;

      const safeCourse = courseList.find((c) => c.name === safeProgram) ?? null;
      const safeYears = safeCourse?.yearLevels ?? 0;
      const safeYearOptions = safeYears
        ? Array.from({ length: safeYears }, (_, i) => yearLabel(i + 1))
        : [];

      // keep yearLevel only if still valid
      const initialYear = (initial as any).yearLevel ?? "";
      const safeYear = safeYearOptions.includes(initialYear)
        ? initialYear
        : safeYearOptions[0] ?? "";

      setForm({
        code: initial.code ?? "",
        yearLevel: safeYear,
        program: safeProgram,
        capacity: initial.capacity ?? 40,
        room: initial.room ?? "",
        schedule: initial.schedule ?? "",
      });
    } else {
      const safeCourse = courseList[0] ?? null;
      const safeYears = safeCourse?.yearLevels ?? 0;
      const safeYear = safeYears ? yearLabel(1) : "";

      setForm({
        code: "",
        yearLevel: safeYear,
        program: defaultProgram,
        capacity: 40,
        room: "",
        schedule: "",
      });
    }

    setTouched({});
    setErrors({});
    setFormError("");
    setConfirmOpen(false);
    confirmingRef.current = false;
  }, [open, isEdit, initial, courseList]);

  // lock body scroll while modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // esc to close: closes confirm first, then main modal
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
    if (!code) e.code = "Section Name is required.";
    else if (code.length < 4) e.code = "Use a longer section name (e.g., BSCS-1A).";
    else if (!/^[A-Z0-9- ]+$/.test(code))
      e.code = "Only letters, numbers, spaces, and '-' are allowed.";

    if (!data.program) e.program = "Course/Program is required.";

    // ✅ year level must be one of dynamic options
    if (!data.yearLevel) e.yearLevel = "Year Level is required.";
    else if (yearOptions.length && !yearOptions.includes(data.yearLevel))
      e.yearLevel = "Year Level is not valid for the selected course.";

    const cap = data.capacity === "" ? NaN : Number(data.capacity);
    if (!Number.isFinite(cap)) e.capacity = "Capacity is required.";
    else if (cap < 1) e.capacity = "Capacity must be at least 1.";
    else if (cap > 500) e.capacity = "Capacity looks too large (max 500).";

    if (!data.room.trim()) e.room = "Room is required.";
    else if (data.room.trim().length < 3) e.room = "Room is too short.";

    if (!data.schedule.trim()) e.schedule = "Schedule is required.";
    else if (!isLikelyTimeSchedule(data.schedule))
      e.schedule = "Enter a schedule like “MWF 8:00-9:30 AM”.";

    // ✅ if no courses exist at all
    if (!courseList.length) e.program = "No courses available. Please add a course first.";

    return e;
  };

  const setField = <K extends keyof Payload>(key: K, val: Payload[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (touched[key]) setErrors(validate({ ...form, [key]: val }));
  };

  const markTouched = (key: keyof Payload) => {
    setTouched((p) => ({ ...p, [key]: true }));
    setErrors(validate(form));
  };

  // ✅ when program changes, refresh year options + default year
  const onProgramChange = (programName: string) => {
    setField("program", programName);

    const course = courseList.find((c) => c.name === programName) ?? null;
    const maxYears = course?.yearLevels ?? 0;

    const nextYearOptions = maxYears
      ? Array.from({ length: maxYears }, (_, i) => yearLabel(i + 1))
      : [];

    // reset year if invalid
    setForm((prev) => {
      const nextYear =
        nextYearOptions.includes(prev.yearLevel)
          ? prev.yearLevel
          : nextYearOptions[0] ?? "";
      return { ...prev, program: programName, yearLevel: nextYear };
    });
  };

  // Step 1: validate then open confirmation popup
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

  // Step 2: confirmed => create/update
  const onConfirm = () => {
    if (confirmingRef.current) return;
    confirmingRef.current = true;

    const code = normalizeCode(form.code);
    const cap = Number(form.capacity);

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
        if (e.target === e.currentTarget && !confirmOpen) onClose();
      }}
    >
      <div className="sec-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="sec-modal-header">
          <div className="sec-modal-title">
            {isEdit ? "Edit Section" : "Add New Section"}
          </div>
          <button
            className="sec-modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close"
            disabled={confirmOpen}
          >
            <X size={18} />
          </button>
        </div>

        <div className="sec-modal-body">
          <div className="sec-grid">
            {/* Section Name */}
            <div className="sec-field">
              <label className="sec-label">Section Name</label>
              <input
                className={`form-control sec-input ${fieldError("code") ? "is-invalid" : ""}`}
                placeholder="e.g., BSCS-1C"
                value={form.code}
                onChange={(e) => setField("code", e.target.value)}
                onBlur={() => markTouched("code")}
              />
              <div className="sec-error-slot">{fieldError("code") || "\u00A0"}</div>
            </div>

            {/* Year Level (dynamic) */}
            <div className="sec-field">
              <label className="sec-label">Year Level</label>
              <select
                className={`form-select sec-select ${fieldError("yearLevel") ? "is-invalid" : ""}`}
                value={form.yearLevel}
                onChange={(e) => setField("yearLevel", e.target.value)}
                onBlur={() => markTouched("yearLevel")}
                disabled={!yearOptions.length}
              >
                {!yearOptions.length ? (
                  <option value="">No year levels</option>
                ) : (
                  yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))
                )}
              </select>
              <div className="sec-error-slot">{fieldError("yearLevel") || "\u00A0"}</div>
            </div>

            {/* Program (from DB courses) */}
            <div className="sec-field sec-span-2">
              <label className="sec-label">Course/Program</label>
              <select
                className={`form-select sec-select ${fieldError("program") ? "is-invalid" : ""}`}
                value={form.program}
                onChange={(e) => onProgramChange(e.target.value)}
                onBlur={() => markTouched("program")}
                disabled={!courseList.length}
              >
                {!courseList.length ? (
                  <option value="">No courses available</option>
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
              <div className="sec-error-slot">{fieldError("program") || "\u00A0"}</div>
            </div>

            {/* Capacity */}
            <div className="sec-field">
              <label className="sec-label">Capacity</label>
              <input
                className={`form-control sec-input ${fieldError("capacity") ? "is-invalid" : ""}`}
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) =>
                  setField("capacity", e.target.value === "" ? "" : Number(e.target.value))
                }
                onBlur={() => markTouched("capacity")}
              />
              <div className="sec-error-slot">{fieldError("capacity") || "\u00A0"}</div>
            </div>

            {/* Room */}
            <div className="sec-field">
              <label className="sec-label">Room</label>
              <input
                className={`form-control sec-input ${fieldError("room") ? "is-invalid" : ""}`}
                placeholder="Room 301"
                value={form.room}
                onChange={(e) => setField("room", e.target.value)}
                onBlur={() => markTouched("room")}
              />
              <div className="sec-error-slot">{fieldError("room") || "\u00A0"}</div>
            </div>

            {/* Schedule */}
            <div className="sec-field sec-span-2">
              <label className="sec-label">Schedule</label>
              <input
                className={`form-control sec-input ${fieldError("schedule") ? "is-invalid" : ""}`}
                placeholder="e.g., MWF 8:00-9:30 AM"
                value={form.schedule}
                onChange={(e) => setField("schedule", e.target.value)}
                onBlur={() => markTouched("schedule")}
              />
              <div className="sec-error-slot">{fieldError("schedule") || "\u00A0"}</div>
            </div>
          </div>

          {formError ? <div className="sec-form-error">{formError}</div> : null}
        </div>

        <div className="sec-modal-footer">
          <button type="button" className="btn btn-light" onClick={onClose} disabled={confirmOpen}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={onSubmit}>
            {isEdit ? "Save Changes" : "Create Section"}
          </button>
        </div>

        {/* CONFIRM POPUP */}
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
            <div className="sec-confirm-popup" onMouseDown={(e) => e.stopPropagation()}>
              <div className="sec-confirm-header">
                {isEdit ? "Confirm Update" : "Confirm Creation"}
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
                <button className="btn btn-light" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={onConfirm}>
                  Yes, {isEdit ? "Save" : "Create"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}