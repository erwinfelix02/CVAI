// ✅ src/components/DepartmentHead/Dashboard/ResolveConflictsModal.tsx

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  AlertTriangle,
  DoorClosed,
  Clock,
  CheckCircle,
  ChevronDown,
  ArrowRight,
  HelpCircle,
  Loader2,
} from "lucide-react";
import type { ConflictRow } from "./ScheduleConflictsCard";

export type ConflictItem = {
  id: string;
  scheduleId1: string;
  scheduleId2: string;
  selectedScheduleToMove: string;
  subjectToMoveName: string;
  room: string;
  time: string;
  subject1: string;
  subject2: string;
  resolutionType: "Move to another room" | "Move to another time slot" | "Unassigned / Pending" | "";
  selectedTarget: string;
};

interface ScheduleRecord {
  _id: string;
  room?: string;
  days?: string;
  time?: string;
  code?: string;
  faculty?: string;
}

interface ResolveConflictsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawConflicts?: ConflictRow[];
  allSchedules?: ScheduleRecord[]; // Pass active schedules to compute occupied slots dynamically
  onResolutionsApplied?: () => void;
}

// Master pool of valid room and time slot options across campus/department
const MASTER_ROOM_OPTIONS = ["Room 405", "Room 302", "Lab 1", "Lab 3", "Room 101", "Room 204"];
const MASTER_TIME_OPTIONS = [
  "MWF 7:30-9:00",
  "MWF 9:00-10:30",
  "MWF 10:30-12:00",
  "MWF 1:00-2:30",
  "MWF 2:30-4:00",
  "TTh 8:30-10:00",
  "TTh 10:00-11:30",
  "TTh 1:00-2:30",
  "TTh 2:30-4:00",
];

export default function ResolveConflictsModal({
  isOpen,
  onClose,
  rawConflicts = [],
  allSchedules = [],
  onResolutionsApplied,
}: ResolveConflictsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);

  // Map incoming raw conflict rows from API into editable state
  const formattedInitialConflicts = useMemo<ConflictItem[]>(() => {
    return rawConflicts.map((c: any, index) => {
      const subjectsPart = c.details.replace("Conflicting subjects:", "").trim();
      const [s1, s2] = subjectsPart.split("&").map((s: string) => s.trim());

      const firstScheduleId = c.schedules && c.schedules.length > 0 ? c.schedules[0]._id : "";
      const secondScheduleId = c.schedules && c.schedules.length > 1 ? c.schedules[1]._id : "";

      return {
        id: `conflict-${index + 1}`,
        scheduleId1: firstScheduleId,
        scheduleId2: secondScheduleId,
        selectedScheduleToMove: "", // Forces explicit choice
        subjectToMoveName: "",
        room: c.room,
        time: c.time,
        subject1: s1 || "Subject A",
        subject2: s2 || "Subject B",
        resolutionType: "",
        selectedTarget: "",
      };
    });
  }, [rawConflicts]);

  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setConflicts(formattedInitialConflicts);
      setShowApplyConfirm(false);
      setShowExitConfirm(false);
    }
  }, [isOpen, formattedInitialConflicts]);

  const isDirty = useMemo(() => {
    return JSON.stringify(conflicts) !== JSON.stringify(formattedInitialConflicts);
  }, [conflicts, formattedInitialConflicts]);

  const resolvedCount = useMemo(() => {
    return conflicts.filter(
      (c) =>
        c.selectedScheduleToMove.trim() !== "" &&
        c.resolutionType !== "" &&
        c.resolutionType !== "Unassigned / Pending" &&
        c.selectedTarget.trim() !== ""
    ).length;
  }, [conflicts]);

  if (!isOpen) return null;

  const handleRequestClose = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      handleResetAndClose();
    }
  };

  const handleResetAndClose = () => {
    setShowExitConfirm(false);
    setShowApplyConfirm(false);
    setConflicts(formattedInitialConflicts);
    onClose();
  };

  const handleSubjectToMoveChange = (id: string, selectedScheduleId: string) => {
    setConflicts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const isFirst = selectedScheduleId === item.scheduleId1;
        const subjectName = isFirst ? item.subject1 : item.subject2;

        return {
          ...item,
          selectedScheduleToMove: selectedScheduleId,
          subjectToMoveName: selectedScheduleId ? subjectName : "",
          resolutionType: "",
          selectedTarget: "",
        };
      })
    );
  };

  // Dynamically calculate non-conflicting available targets for a selected conflict item
  const getAvailableTargets = (item: ConflictItem) => {
    if (!item.resolutionType) return [];

    // Filter out busy room/time slots from existing database schedules
    if (item.resolutionType === "Move to another room") {
      // Find all rooms currently occupied during this specific conflict time
      const busyRooms = new Set(
        allSchedules
          .filter((s) => {
            const slot = `${s.days || ""} ${s.time || ""}`.trim();
            return slot.toLowerCase() === item.time.trim().toLowerCase();
          })
          .map((s) => s.room?.trim().toLowerCase())
      );

      // Return only rooms that are NOT busy at this time slot
      const availableRooms = MASTER_ROOM_OPTIONS.filter(
        (r) => !busyRooms.has(r.toLowerCase())
      );

      return availableRooms.length > 0 ? availableRooms : ["No conflict-free rooms available"];
    }

    if (item.resolutionType === "Move to another time slot") {
      // Find all time slots currently occupied in this specific room
      const busyTimes = new Set(
        allSchedules
          .filter((s) => s.room?.trim().toLowerCase() === item.room.trim().toLowerCase())
          .map((s) => `${s.days || ""} ${s.time || ""}`.trim().toLowerCase())
      );

      // Return only time slots that are NOT busy in this room
      const availableTimes = MASTER_TIME_OPTIONS.filter(
        (t) => !busyTimes.has(t.toLowerCase())
      );

      return availableTimes.length > 0 ? availableTimes : ["No conflict-free time slots available"];
    }

    return [];
  };

  const handleTypeChange = (id: string, newType: ConflictItem["resolutionType"]) => {
    setConflicts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const targetOptions = getAvailableTargets({ ...item, resolutionType: newType });
        const defaultTarget = targetOptions.length > 0 && !targetOptions[0].includes("No conflict-free")
          ? targetOptions[0]
          : "";

        return {
          ...item,
          resolutionType: newType,
          selectedTarget: defaultTarget,
        };
      })
    );
  };

  const handleTargetChange = (id: string, target: string) => {
    setConflicts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selectedTarget: target } : item))
    );
  };

  const handleConfirmApply = async () => {
    const validResolutions = conflicts
      .filter(
        (item) =>
          item.selectedScheduleToMove &&
          item.resolutionType &&
          item.resolutionType !== "Unassigned / Pending" &&
          item.selectedTarget &&
          !item.selectedTarget.includes("No conflict-free")
      )
      .map((item) => ({
        scheduleId: item.selectedScheduleToMove,
        subjectMoved: item.subjectToMoveName,
        resolutionType: item.resolutionType,
        targetValue: item.selectedTarget,
      }));

    if (validResolutions.length > 0) {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/schedules/resolve-conflicts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolutions: validResolutions }),
        });

        if (res.ok && onResolutionsApplied) {
          onResolutionsApplied();
        }
      } catch (err) {
        console.error("Error applying conflict resolutions:", err);
      } finally {
        setIsSubmitting(false);
      }
    }

    setShowApplyConfirm(false);
    onClose();
  };

  return createPortal(
    <>
      <div className="resolve-conflicts-backdrop" onClick={handleRequestClose}>
        <div className="resolve-conflicts-card" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="resolve-conflicts-header">
            <div className="d-flex align-items-start gap-2 gap-sm-3">
              <div className="warning-icon-wrapper">
                <AlertTriangle size={20} className="text-warning-emphasis" />
              </div>
              <div>
                <h5 className="fw-bold mb-1 text-dark modal-title-text">
                  Resolve Schedule Conflicts
                </h5>
                <p className="text-muted small mb-0">
                  Choose which subject to move and pick a guaranteed conflict-free slot.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close-modal"
              onClick={handleRequestClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="resolve-conflicts-body">
            <div className="resolution-progress-card mb-3">
              <span className="progress-label">Resolution progress</span>
              <span className="progress-pill">
                {resolvedCount} of {conflicts.length} resolved
              </span>
            </div>

            {conflicts.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {conflicts.map((item) => {
                  const targetOptions = getAvailableTargets(item);
                  const isResolved =
                    item.selectedScheduleToMove.trim() !== "" &&
                    item.resolutionType !== "" &&
                    item.resolutionType !== "Unassigned / Pending" &&
                    item.selectedTarget.trim() !== "" &&
                    !item.selectedTarget.includes("No conflict-free");

                  return (
                    <div key={item.id} className="conflict-item-card border rounded-4 p-3 p-sm-4">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="fw-bold text-dark d-inline-flex align-items-center gap-1">
                            <DoorClosed size={17} className="text-secondary" />
                            {item.room}
                          </span>
                          <span className="text-muted small d-inline-flex align-items-center gap-1">
                            <Clock size={15} />
                            {item.time}
                          </span>
                        </div>

                        {isResolved && (
                          <span className="resolved-status-pill">
                            <CheckCircle size={14} />
                            <span>Resolved</span>
                          </span>
                        )}
                      </div>

                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="badge subject-code-badge">{item.subject1}</span>
                        {item.subject2 && <span className="text-muted small fw-medium">vs</span>}
                        {item.subject2 && (
                          <span className="badge subject-code-badge">{item.subject2}</span>
                        )}
                      </div>

                      <hr className="my-3 border-light-subtle" />

                      {/* 3-Column Inputs Row */}
                      <div className="row g-2 g-sm-3 mb-2">
                        {/* 1. Subject Choice */}
                        <div className="col-12 col-md-4">
                          <label className="form-label small fw-medium text-secondary mb-1">
                            Subject to Adjust
                          </label>
                          <div className="select-wrapper">
                            <select
                              className="form-select custom-conflict-select"
                              value={item.selectedScheduleToMove}
                              onChange={(e) => handleSubjectToMoveChange(item.id, e.target.value)}
                            >
                              <option value="" disabled>-- Select Subject --</option>
                              <option value={item.scheduleId1}>
                                Move {item.subject1}
                              </option>
                              {item.scheduleId2 && (
                                <option value={item.scheduleId2}>
                                  Move {item.subject2}
                                </option>
                              )}
                            </select>
                            <ChevronDown size={18} className="select-arrow" />
                          </div>
                        </div>

                        {/* 2. Resolution Action */}
                        <div className="col-12 col-md-4">
                          <label className="form-label small fw-medium text-secondary mb-1">
                            Resolution Action
                          </label>
                          <div className="select-wrapper">
                            <select
                              className="form-select custom-conflict-select"
                              value={item.resolutionType}
                              onChange={(e) =>
                                handleTypeChange(
                                  item.id,
                                  e.target.value as ConflictItem["resolutionType"]
                                )
                              }
                              disabled={!item.selectedScheduleToMove}
                            >
                              <option value="" disabled>-- Select Resolution --</option>
                              <option value="Move to another room">Move to another room</option>
                              <option value="Move to another time slot">Move to another time slot</option>
                            </select>
                            <ChevronDown size={18} className="select-arrow" />
                          </div>
                        </div>

                        {/* 3. Target Allocation (Guaranteed Conflict-Free Options) */}
                        <div className="col-12 col-md-4">
                          <label className="form-label small fw-medium text-secondary mb-1">
                            {item.resolutionType === "Move to another time slot"
                              ? "Conflict-Free Time Slot"
                              : item.resolutionType === "Move to another room"
                              ? "Available Room"
                              : "Target Allocation"}
                          </label>
                          <div className="select-wrapper">
                            <select
                              className="form-select custom-conflict-select"
                              value={item.selectedTarget}
                              onChange={(e) => handleTargetChange(item.id, e.target.value)}
                              disabled={
                                !item.resolutionType ||
                                item.resolutionType === "Unassigned / Pending" ||
                                targetOptions[0]?.includes("No conflict-free")
                              }
                            >
                              {!item.resolutionType ? (
                                <option value="" disabled>Select resolution first</option>
                              ) : (
                                targetOptions.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))
                              )}
                            </select>
                            <ChevronDown size={18} className="select-arrow" />
                          </div>
                        </div>
                      </div>

                      {isResolved && (
                        <div className="text-secondary small d-flex align-items-center gap-1 mt-2">
                          <span className="fw-semibold">{item.subjectToMoveName}</span>
                          <ArrowRight size={14} className="text-muted" />
                          <span className="fw-semibold text-dark">{item.selectedTarget}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <CheckCircle size={36} className="text-success mb-2" />
                <h6 className="fw-semibold text-dark mb-1">No Conflicts to Resolve</h6>
                <p className="small text-muted mb-0">There are currently no active schedule or room overlaps.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="resolve-conflicts-footer">
            <button
              type="button"
              className="btn btn-light conflict-btn-cancel"
              onClick={handleRequestClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary conflict-btn-apply d-inline-flex align-items-center gap-2"
              onClick={() => setShowApplyConfirm(true)}
              disabled={conflicts.length === 0 || resolvedCount === 0 || isSubmitting}
            >
              {isSubmitting && <Loader2 size={16} className="spinner-border spinner-border-sm" />}
              <span>Apply Resolutions</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM APPLY RESOLUTIONS MODAL */}
      {showApplyConfirm && (
        <div className="report-confirm-overlay">
          <div className="report-confirm-box">
            <div className="d-flex align-items-center gap-2 mb-2 text-primary">
              <CheckCircle size={22} />
              <h5 className="fw-bold mb-0 text-dark">Confirm Resolutions?</h5>
            </div>
            <p className="text-muted small mb-3">
              You are about to apply <strong>{resolvedCount}</strong> schedule resolution{resolvedCount > 1 ? "s" : ""}. This will update active rooms and times across your department schedule.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light btn-sm px-3 fw-medium border"
                onClick={() => setShowApplyConfirm(false)}
                disabled={isSubmitting}
              >
                Go Back
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm px-3 fw-medium d-inline-flex align-items-center gap-1"
                onClick={handleConfirmApply}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 size={14} className="spinner-border spinner-border-sm" />}
                <span>Confirm & Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCARD CHANGES MODAL */}
      {showExitConfirm && (
        <div className="report-confirm-overlay">
          <div className="report-confirm-box">
            <div className="d-flex align-items-center gap-2 mb-2 text-warning-emphasis">
              <HelpCircle size={22} />
              <h5 className="fw-bold mb-0 text-dark">Discard Changes?</h5>
            </div>
            <p className="text-muted small mb-4">
              Are you sure you want to close without saving? Any unsaved conflict resolution adjustments will be lost.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light btn-sm px-3 fw-medium border"
                onClick={() => setShowExitConfirm(false)}
              >
                Keep Editing
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm px-3 fw-medium"
                onClick={handleResetAndClose}
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}