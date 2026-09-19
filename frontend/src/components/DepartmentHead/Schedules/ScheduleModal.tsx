// ✅ src/components/DepartmentHead/Schedules/ScheduleModal.tsx

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X, AlertCircle, Lock } from "lucide-react";
import type { ScheduleRow } from "./types";

export interface SubjectOption {
  _id?: string;
  code: string;
  name: string;
  program?: string | any;
  year?: string | number;
  department?: string;
}

export interface SectionOption {
  _id?: string;
  code: string;
  program?: string | any;
  yearLevel?: string | number;
  room?: string;
  department?: string;
}

export interface FacultyOption {
  _id?: string;
  name: string;
  idNumber?: string;
  department?: string;
  status?: string;
  isActive?: boolean;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ScheduleRow) => void;
  editingRow: ScheduleRow | null;
  subjects?: SubjectOption[];
  sections?: SectionOption[];
  facultyList?: FacultyOption[];
  isLoadingSubjects?: boolean;
  isLoadingSections?: boolean;
  isLoadingFaculty?: boolean;
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ScheduleFormSnapshot {
  code: string;
  faculty: string;
  room: string;
  section: string;
  status: "Active" | "Inactive";
  selectedDays: string[];
  startTime: string;
  endTime: string;
}

const DEFAULT_FORM_STATE: ScheduleFormSnapshot = {
  code: "",
  faculty: "",
  room: "",
  section: "",
  status: "Active",
  selectedDays: [],
  startTime: "",
  endTime: "",
};

const safeString = (val: any): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object") {
    return val.code || val.name || val.program || val.title || "";
  }
  return String(val);
};

const normalizeProgramTokens = (val: any) => {
  const str = safeString(val).toLowerCase().trim();
  if (!str) return { raw: "", tokens: "", acronyms: new Set<string>() };

  let clean = str.replace(/\([^)]*\)/g, "").trim();

  clean = clean
    .replace(/managment/g, "management")
    .replace(/\b(system|curriculum|track|major|program)\b/g, "")
    .trim();

  const acronyms = new Set<string>();

  if (clean.includes("-")) {
    const parts = clean.split("-");
    const prefix = parts[0].trim().replace(/[^a-z0-9]/g, "");
    if (prefix) acronyms.add(prefix);
    clean = parts.slice(1).join(" ").trim();
  }

  const words = clean
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w && !["bachelor", "bs", "science", "of", "in", "and", "or", "the"].includes(w));

  const tokens = words.join("");

  if (words.length > 0) {
    const firstLetters = words.map((w) => w[0]).join("");
    acronyms.add(firstLetters);
    acronyms.add(`bs${firstLetters}`);

    if (tokens.includes("hospitality")) {
      acronyms.add("htm");
      acronyms.add("bshm");
      acronyms.add("hm");
    }
    if (tokens.includes("tourism")) {
      acronyms.add("tm");
      acronyms.add("bstm");
    }
  }

  const raw = clean.replace(/[^a-z0-9]/g, "");
  if (raw.length <= 6) acronyms.add(raw);

  return { raw, tokens, acronyms };
};

const isProgramMatch = (subjectProg?: any, sectionProg?: any): boolean => {
  if (!subjectProg || !sectionProg) return true;

  const p1 = normalizeProgramTokens(subjectProg);
  const p2 = normalizeProgramTokens(sectionProg);

  if (!p1.raw || !p2.raw) return true;

  for (const ac1 of p1.acronyms) {
    if (p2.acronyms.has(ac1)) return true;
  }

  if (
    p1.tokens &&
    p2.tokens &&
    (p1.tokens === p2.tokens || p1.tokens.includes(p2.tokens) || p2.tokens.includes(p1.tokens))
  ) {
    return true;
  }

  return p1.raw.includes(p2.raw) || p2.raw.includes(p1.raw);
};

const extractYearDigit = (val?: any): string => {
  const s = safeString(val);
  if (!s) return "";
  const match = s.match(/\d+/);
  return match ? match[0] : "";
};

const isYearMatch = (subjectYear?: any, sectionYear?: any): boolean => {
  const y1 = extractYearDigit(subjectYear);
  const y2 = extractYearDigit(sectionYear);

  if (!y1 || !y2) return true;
  return y1 === y2;
};

export default function ScheduleModal({
  isOpen,
  onClose,
  onSave,
  editingRow,
  subjects = [],
  sections = [],
  facultyList = [],
  isLoadingSubjects = false,
  isLoadingSections = false,
  isLoadingFaculty = false,
}: Props) {
  const [code, setCode] = useState("");
  const [faculty, setFaculty] = useState("");
  const [room, setRoom] = useState("");
  const [section, setSection] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [initialSnapshot, setInitialSnapshot] = useState<ScheduleFormSnapshot>(DEFAULT_FORM_STATE);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const selectedSubjectObj = useMemo(() => {
    if (!code) return null;
    return subjects.find((s) => s.code === code) || null;
  }, [code, subjects]);

  const filteredSections = useMemo(() => {
    if (!selectedSubjectObj) return [];

    const subjProg = selectedSubjectObj.program;
    const subjYear = selectedSubjectObj.year;

    return sections.filter((sec) => {
      const matchProg = isProgramMatch(subjProg, sec.program);
      const matchYear = isYearMatch(subjYear, sec.yearLevel);
      return matchProg && matchYear;
    });
  }, [sections, selectedSubjectObj]);

  const filteredFacultyList = useMemo(() => {
    const userJson = localStorage.getItem("user");
    const currentUser = userJson ? JSON.parse(userJson) : null;
    const userDept = currentUser?.department;

    return facultyList.filter((f) => {
      const isActive =
        f.status !== undefined
          ? f.status.toLowerCase() === "active"
          : f.isActive !== undefined
          ? Boolean(f.isActive)
          : true;

      const isSameDepartment =
        !userDept || !f.department
          ? true
          : f.department.toLowerCase() === userDept.toLowerCase();

      return isActive && isSameDepartment;
    });
  }, [facultyList]);

  useEffect(() => {
    if (isOpen) {
      let snapshot: ScheduleFormSnapshot;

      if (editingRow) {
        let parsedDays: string[] = [];
        if (editingRow.days === "MWF") {
          parsedDays = ["Mon", "Wed", "Fri"];
        } else if (editingRow.days === "TTh") {
          parsedDays = ["Tue", "Thu"];
        } else if (editingRow.days) {
          const parsed = editingRow.days
            .split(/[\s,]+/)
            .filter((d) => WEEK_DAYS.includes(d));
          parsedDays = parsed.length > 0 ? parsed : [editingRow.days];
        }

        let parsedStart = "";
        let parsedEnd = "";
        if (editingRow.time && editingRow.time.includes("-")) {
          const [start, end] = editingRow.time.split("-");
          parsedStart = start.trim();
          parsedEnd = end.trim();
        }

        snapshot = {
          code: editingRow.code || "",
          faculty: editingRow.faculty || "Unassigned",
          room: editingRow.room || "",
          section: editingRow.section || "",
          status: editingRow.status || "Active",
          selectedDays: parsedDays,
          startTime: parsedStart,
          endTime: parsedEnd,
        };
      } else {
        snapshot = DEFAULT_FORM_STATE;
      }

      setCode(snapshot.code);
      setFaculty(snapshot.faculty);
      setRoom(snapshot.room);
      setSection(snapshot.section);
      setStatus(snapshot.status);
      setSelectedDays(snapshot.selectedDays);
      setStartTime(snapshot.startTime);
      setEndTime(snapshot.endTime);

      setInitialSnapshot(snapshot);
      setConfirmExitOpen(false);
      setConfirmSaveOpen(false);
    }
  }, [editingRow, isOpen]);

  const handleSubjectChange = (newCode: string) => {
    setCode(newCode);
    setSection("");
    setRoom("");
  };

  const handleSectionChange = (selectedSectionCode: string) => {
    setSection(selectedSectionCode);

    // Look up the matching section across all sections to get its assigned room
    const matchedSec = sections.find(
      (s) => s.code === selectedSectionCode || s._id === selectedSectionCode
    );

    if (matchedSec && matchedSec.room && matchedSec.room.trim() !== "") {
      setRoom(matchedSec.room);
    } else {
      setRoom("Unassigned");
    }
  };

  const isDirty = useMemo(() => {
    const currentSnapshot: ScheduleFormSnapshot = {
      code,
      faculty,
      room,
      section,
      status,
      selectedDays,
      startTime,
      endTime,
    };
    return JSON.stringify(currentSnapshot) !== JSON.stringify(initialSnapshot);
  }, [code, faculty, room, section, status, selectedDays, startTime, endTime, initialSnapshot]);

  if (!isOpen) return null;

  const handleSafeClose = () => {
    if (isDirty) {
      setConfirmExitOpen(true);
    } else {
      onClose();
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedDays.length === 0) {
      alert("Please select at least one day from Monday to Saturday.");
      return;
    }

    setConfirmSaveOpen(true);
  };

  const handleExecuteSave = () => {
    setConfirmSaveOpen(false);

    const userJson = localStorage.getItem("user");
    const currentUser = userJson ? JSON.parse(userJson) : null;

    const matchedSubject = subjects.find((s) => s.code === code);

    const fullUserName = currentUser
      ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
        currentUser.email
      : "Department Head";

    let formattedDays = selectedDays.join(", ");
    if (
      selectedDays.length === 3 &&
      selectedDays.includes("Mon") &&
      selectedDays.includes("Wed") &&
      selectedDays.includes("Fri")
    ) {
      formattedDays = "MWF";
    } else if (
      selectedDays.length === 2 &&
      selectedDays.includes("Tue") &&
      selectedDays.includes("Thu")
    ) {
      formattedDays = "TTh";
    }

    onSave({
      id: editingRow ? editingRow.id : "",
      code,
      title: matchedSubject
        ? matchedSubject.name
        : editingRow?.title || "Subject",
      faculty: faculty || "Unassigned",
      room: room || "Unassigned",
      section,
      days: formattedDays as any,
      time: `${startTime}-${endTime}`,
      status,

      department: currentUser?.department || editingRow?.department || "",
      createdBy: {
        userId: currentUser?._id || currentUser?.id || "",
        userName: fullUserName,
        userRole: currentUser?.role || "Dept Head",
      },
    });
  };

  return createPortal(
    <>
      <div className="schedule-modal-backdrop" onClick={handleSafeClose}>
        <div
          className="schedule-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="schedule-modal-header">
            <h3 className="schedule-modal-title">
              {editingRow ? "Edit Schedule" : "Create New Schedule"}
            </h3>
            <button
              type="button"
              className="schedule-modal-close"
              onClick={handleSafeClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmitAttempt}>
            <div className="schedule-modal-body">
              {/* Subject Dropdown */}
              <div className="schedule-field">
                <label>Subject</label>
                <div className="select-input-wrapper">
                  <select
                    value={code}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    required
                    disabled={isLoadingSubjects}
                  >
                    <option value="" disabled>
                      {isLoadingSubjects
                        ? "Loading subjects..."
                        : "Select subject"}
                    </option>
                    {subjects.map((s) => (
                      <option key={s._id || s.code} value={s.code}>
                        {s.code} - {s.name} {s.program ? `(${safeString(s.program)})` : ""} {s.year ? `[Year ${safeString(s.year)}]` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="select-arrow" />
                </div>
              </div>

              {/* Faculty Dropdown */}
              <div className="schedule-field">
                <label>Faculty</label>
                <div className="select-input-wrapper">
                  <select
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    required
                    disabled={isLoadingFaculty}
                  >
                    <option value="" disabled>
                      {isLoadingFaculty
                        ? "Loading faculty..."
                        : "Assign faculty"}
                    </option>

                    {filteredFacultyList.length === 0 ? (
                      <option value="Unassigned">-- No faculty available --</option>
                    ) : (
                      filteredFacultyList.map((f) => (
                        <option key={f._id || f.name} value={f.name}>
                          {f.name}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown size={18} className="select-arrow" />
                </div>
              </div>

              {/* Section, Room & Status Row */}
              <div className="schedule-row">
                <div className="schedule-field flex-1">
                  <label>Section</label>
                  <div className="select-input-wrapper">
                    <select
                      value={section}
                      onChange={(e) => handleSectionChange(e.target.value)}
                      required
                      disabled={isLoadingSections || !code}
                    >
                      <option value="" disabled>
                        {isLoadingSections
                          ? "Loading sections..."
                          : !code
                          ? "Select subject first"
                          : filteredSections.length === 0
                          ? `No sections found for ${safeString(selectedSubjectObj?.program) || "Program"} Year ${safeString(selectedSubjectObj?.year) || "N/A"}`
                          : "Select section"}
                      </option>
                      {filteredSections.map((sec) => (
                        <option key={sec._id || sec.code} value={sec.code}>
                          {sec.code} {sec.program ? `(${safeString(sec.program)})` : ""} {sec.yearLevel ? `[Year ${safeString(sec.yearLevel)}]` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="select-arrow" />
                  </div>
                </div>

                {/* Read-Only Room Field */}
                <div className="schedule-field flex-1">
                  <label className="d-flex align-items-center justify-content-between">
                    <span>Room</span>
                    <small className="text-muted d-inline-flex align-items-center gap-1">
                      <Lock size={12} /> Auto-assigned
                    </small>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={room}
                      placeholder={
                        !section
                          ? "Select section first"
                          : room || "No room assigned to section"
                      }
                      readOnly
                      disabled
                      className="bg-light text-secondary border-secondary-subtle"
                      style={{ cursor: "not-allowed" }}
                    />
                  </div>
                </div>

                <div className="schedule-field flex-1">
                  <label>Status</label>
                  <div className="select-input-wrapper">
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as "Active" | "Inactive")
                      }
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown size={18} className="select-arrow" />
                  </div>
                </div>
              </div>

              {/* Day(s) Selector */}
              <div className="schedule-field">
                <label>Day(s)</label>
                <div className="d-flex flex-wrap gap-2 mt-1">
                  {WEEK_DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 py-1 border transition-all ${
                          isSelected
                            ? "btn-primary text-white shadow-sm"
                            : "btn-light text-dark border-secondary-subtle"
                        }`}
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Time & End Time */}
              <div className="schedule-row">
                <div className="schedule-field flex-1">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="schedule-field flex-1">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="schedule-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleSafeClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                {editingRow ? "Save Changes" : "Create Schedule"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {confirmExitOpen && (
        <div className="schedule-centered-confirm-overlay">
          <div className="schedule-centered-confirm-box">
            <div className="d-flex align-items-center gap-2 mb-2 text-danger">
              <AlertCircle size={22} />
              <h5 className="fw-bold mb-0 text-dark">Unsaved Changes</h5>
            </div>
            <p className="text-muted small mb-4">
              You have unsaved changes. Are you sure you want to discard them and exit?
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light btn-sm px-3 fw-medium border"
                onClick={() => setConfirmExitOpen(false)}
              >
                Keep Editing
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm px-3 fw-medium"
                onClick={() => {
                  setConfirmExitOpen(false);
                  onClose();
                }}
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmSaveOpen && (
        <div className="schedule-centered-confirm-overlay">
          <div className="schedule-centered-confirm-box">
            <div className="d-flex align-items-center gap-2 mb-2 text-primary">
              <AlertCircle size={22} />
              <h5 className="fw-bold mb-0 text-dark">
                {editingRow ? "Confirm Updates" : "Confirm Schedule"}
              </h5>
            </div>
            <p className="text-muted small mb-4">
              {editingRow
                ? "Are you sure you want to save these updates to the schedule?"
                : "Are you sure you want to create this new class schedule?"}
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light btn-sm px-3 fw-medium border"
                onClick={() => setConfirmSaveOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm px-3 fw-medium"
                onClick={handleExecuteSave}
              >
                {editingRow ? "Save Changes" : "Create Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}