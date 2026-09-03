// ✅ src/components/DepartmentHead/Schedules/ScheduleModal.tsx

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X, AlertCircle } from "lucide-react";
import type { ScheduleRow } from "./types";

export interface SubjectOption {
  _id?: string;
  code: string;
  name: string;
  program?: string;
}

export interface SectionOption {
  _id?: string;
  code: string;
  program?: string;
  yearLevel?: string;
  room?: string;
}

export interface RoomOption {
  _id?: string;
  name: string;
  building?: string;
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
  rooms?: RoomOption[];
  facultyList?: FacultyOption[];
  isLoadingSubjects?: boolean;
  isLoadingSections?: boolean;
  isLoadingRooms?: boolean;
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

export default function ScheduleModal({
  isOpen,
  onClose,
  onSave,
  editingRow,
  subjects = [],
  sections = [],
  rooms = [],
  facultyList = [],
  isLoadingSubjects = false,
  isLoadingSections = false,
  isLoadingRooms = false,
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

  /* =========================================================
     INITIAL SNAPSHOT & CONFIRMATION DIALOG STATES
     ========================================================= */
  const [initialSnapshot, setInitialSnapshot] = useState<ScheduleFormSnapshot>(DEFAULT_FORM_STATE);

  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  /* =========================================================
     FILTER FACULTY BY DEPARTMENT & ACTIVE STATUS
     ========================================================= */
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

  /* =========================================================
     INITIALIZE / POPULATE FORM STATE & SNAPSHOT
     ========================================================= */
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

  /* =========================================================
     COMPUTE DIRTY STATUS
     ========================================================= */
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

  /* =========================================================
     EXIT GUARD HANDLER
     ========================================================= */
  const handleSafeClose = () => {
    if (isDirty) {
      setConfirmExitOpen(true);
    } else {
      onClose();
    }
  };

  const handleSectionChange = (selectedSectionCode: string) => {
    setSection(selectedSectionCode);
    const matchedSec = sections.find((s) => s.code === selectedSectionCode);
    if (matchedSec?.room && !room) {
      setRoom(matchedSec.room);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  /* =========================================================
     SUBMIT / SAVE GUARD HANDLER
     ========================================================= */
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
      room,
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
      {/* MAIN FORM MODAL */}
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
                    onChange={(e) => setCode(e.target.value)}
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
                        {s.code} - {s.name} {s.program ? `(${s.program})` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="select-arrow" />
                </div>
              </div>

              {/* Dynamic Faculty Dropdown */}
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

              {/* Room, Section & Status Row */}
              <div className="schedule-row">
                <div className="schedule-field flex-1">
                  <label>Room</label>
                  <div className="select-input-wrapper">
                    <select
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      required
                      disabled={isLoadingRooms}
                    >
                      <option value="" disabled>
                        {isLoadingRooms ? "Loading rooms..." : "Select room"}
                      </option>
                      {rooms.map((r) => (
                        <option key={r._id || r.name} value={r.name}>
                          {r.name} {r.building ? `(${r.building})` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="select-arrow" />
                  </div>
                </div>

                <div className="schedule-field flex-1">
                  <label>Section</label>
                  <div className="select-input-wrapper">
                    <select
                      value={section}
                      onChange={(e) => handleSectionChange(e.target.value)}
                      required
                      disabled={isLoadingSections}
                    >
                      <option value="" disabled>
                        {isLoadingSections
                          ? "Loading sections..."
                          : "Select section"}
                      </option>
                      {sections.map((sec) => (
                        <option key={sec._id || sec.code} value={sec.code}>
                          {sec.code} {sec.program ? `(${sec.program})` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="select-arrow" />
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

      {/* CENTERED CONFIRMATION OVERLAY FOR EXITING WITH UNSAVED CHANGES */}
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

      {/* CENTERED CONFIRMATION OVERLAY FOR SAVING CHANGES */}
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