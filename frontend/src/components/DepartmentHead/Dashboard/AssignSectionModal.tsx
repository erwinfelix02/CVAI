// ✅ src/components/DepartmentHead/Dashboard/AssignSectionModal.tsx

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Users, CheckCircle, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../../config";

interface AssignSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionsList: any[];
  onAssigned?: () => void;
}

export default function AssignSectionModal({
  isOpen,
  onClose,
  sectionsList = [],
  onAssigned,
}: AssignSectionModalProps) {
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [targetSection, setTargetSection] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch unassigned students when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUnassignedStudents();
      setSelectedStudentIds([]);
      setTargetSection("");
    }
  }, [isOpen]);

  const fetchUnassignedStudents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("sessionToken") || "";
      const res = await fetch(`${API_BASE_URL}/students/unassigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnassignedStudents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching unassigned students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudentIds(unassignedStudents.map((s) => s._id || s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAssignSubmit = async () => {
    if (selectedStudentIds.length === 0 || !targetSection) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("sessionToken") || "";
      const res = await fetch(`${API_BASE_URL}/students/assign-section`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentIds: selectedStudentIds,
          sectionName: targetSection,
        }),
      });

      if (res.ok) {
        if (onAssigned) onAssigned();
        onClose();
      }
    } catch (err) {
      console.error("Error assigning students to section:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="resolve-conflicts-backdrop" onClick={onClose}>
      <div
        className="resolve-conflicts-card modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "600px", width: "100%" }}
      >
        {/* Header */}
        <div className="resolve-conflicts-header">
          <div className="d-flex align-items-center gap-3">
            <div className="warning-icon-wrapper bg-primary-subtle text-primary p-2 rounded-circle">
              <Users size={20} />
            </div>
            <div>
              <h5 className="fw-bold mb-1 text-dark">Assign Students to Section</h5>
              <p className="text-muted small mb-0">
                Select unassigned students and place them into an approved section.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="resolve-conflicts-body p-4">
          {isLoading ? (
            <div className="text-center py-5">
              <Loader2 className="spinner-border text-primary" size={28} />
              <p className="text-muted small mt-2">Loading unassigned students...</p>
            </div>
          ) : (
            <>
              {/* Target Section Selector */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">
                  Target Section
                </label>
                <select
                  className="form-select custom-conflict-select"
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                >
                  <option value="" disabled>
                    -- Select Section --
                  </option>
                  {sectionsList.map((sec: any) => (
                    <option key={sec._id || sec.name} value={sec.name}>
                      {sec.name} ({sec.room || "TBA"} • {sec.schedule || "TBA"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Students List */}
              <div className="mb-2">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small fw-semibold text-secondary">
                    Unassigned Students ({unassignedStudents.length})
                  </span>
                  {unassignedStudents.length > 0 && (
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="selectAllStudents"
                        checked={
                          selectedStudentIds.length === unassignedStudents.length &&
                          unassignedStudents.length > 0
                        }
                        onChange={handleToggleSelectAll}
                      />
                      <label className="form-check-label small" htmlFor="selectAllStudents">
                        Select All
                      </label>
                    </div>
                  )}
                </div>

                <div
                  className="border rounded-3 p-2 bg-light"
                  style={{ maxHeight: "220px", overflowY: "auto", scrollbarWidth: "thin" }}
                >
                  {unassignedStudents.length > 0 ? (
                    unassignedStudents.map((s: any) => {
                      const id = s._id || s.id;
                      const name = `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.name;
                      const isSelected = selectedStudentIds.includes(id);

                      return (
                        <div
                          key={id}
                          className="d-flex align-items-center justify-content-between p-2 bg-white rounded-2 mb-1 border-bottom"
                        >
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`student-${id}`}
                              checked={isSelected}
                              onChange={() => handleToggleStudent(id)}
                            />
                            <label
                              className="form-check-label fw-medium text-dark ms-1"
                              htmlFor={`student-${id}`}
                            >
                              {name}
                            </label>
                          </div>
                          <span className="text-muted small">
                            {s.studentNo || "2024-0000"} · {s.year || "Year 1"}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-muted small">
                      <CheckCircle size={24} className="text-success mb-1" />
                      <p className="mb-0">All students are already assigned to sections!</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="resolve-conflicts-footer">
          <button type="button" className="btn btn-light conflict-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary conflict-btn-apply d-inline-flex align-items-center gap-2"
            onClick={handleAssignSubmit}
            disabled={selectedStudentIds.length === 0 || !targetSection || isSubmitting}
          >
            {isSubmitting && <Loader2 size={16} className="spinner-border spinner-border-sm" />}
            <span>Assign to Section</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}