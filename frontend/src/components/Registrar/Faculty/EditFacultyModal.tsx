import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, TriangleAlert, AlertTriangle } from "lucide-react";
import "../../../styles/faculty.css";
import { getActiveDepartments } from "../../../api/departmentService";

type DepartmentDB = {
  _id: string;
  code: string;
  name: string;
  status: "Active" | "Inactive";
};

type Props = {
  open: boolean;
  loading: boolean;
  faculty: {
    id: string;
    name: string;
    email: string;
    idNumber: string;
    phone?: string;
    department?: string;
    status?: "active" | "inactive";
  } | null;
  onClose: () => void;
  onSave: (payload: {
    phone: string;
    department: string;
    status: "active" | "inactive";
  }) => void;
  isSaving: boolean;
};

const backdropBlurStyle: React.CSSProperties = {
  backgroundColor: "rgba(15, 23, 42, 0.45)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};

export default function EditFacultyModal({
  open,
  loading,
  faculty,
  onClose,
  onSave,
  isSaving,
}: Props) {
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("inactive");

  // Initial values to detect unsaved changes
  const [initialPhone, setInitialPhone] = useState("");
  const [initialDepartment, setInitialDepartment] = useState("");
  const [initialStatus, setInitialStatus] = useState<"active" | "inactive">("inactive");

  // Confirmation popups
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const [departments, setDepartments] = useState<DepartmentDB[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState("");

  // Sync initial faculty data into form states
  useEffect(() => {
    if (!faculty) return;

    const currentPhone = faculty.phone || "";
    const currentDept = faculty.department || "";
    const currentStatus = faculty.status || "inactive";

    setPhone(currentPhone);
    setDepartment(currentDept);
    setStatus(currentStatus);

    setInitialPhone(currentPhone);
    setInitialDepartment(currentDept);
    setInitialStatus(currentStatus);

    setConfirmOpen(false);
    setExitConfirmOpen(false);
  }, [faculty]);

  // Load active departments when opened
  useEffect(() => {
    if (!open) return;

    let mounted = true;

    const loadDepartments = async () => {
      try {
        setDeptLoading(true);
        setDeptError("");

        const data: DepartmentDB[] = await getActiveDepartments();

        if (!mounted) return;
        setDepartments(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (!mounted) return;
        setDepartments([]);
        setDeptError(err?.message || "Failed to load departments.");
      } finally {
        if (mounted) setDeptLoading(false);
      }
    };

    loadDepartments();
    return () => {
      mounted = false;
    };
  }, [open]);

  // Check if user changed any field
  const isDirty = useMemo(() => {
    return (
      phone !== initialPhone ||
      department !== initialDepartment ||
      status !== initialStatus
    );
  }, [phone, initialPhone, department, initialDepartment, status, initialStatus]);

  // Intercept close requests
  const handleAttemptClose = () => {
    if (isSaving) return;

    if (isDirty) {
      setExitConfirmOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmExit = () => {
    setExitConfirmOpen(false);
    setConfirmOpen(false);
    onClose();
  };

  // Keyboard navigation & lock body scroll
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isSaving) return;

      if (exitConfirmOpen) {
        setExitConfirmOpen(false);
        return;
      }

      if (confirmOpen) {
        setConfirmOpen(false);
        return;
      }

      if (open) {
        handleAttemptClose();
      }
    };

    if (open || confirmOpen || exitConfirmOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, confirmOpen, exitConfirmOpen, isSaving, isDirty]);

  const departmentOptions = useMemo(() => {
    const names = new Set(departments.map((d) => d.name));
    const list = [...departments];

    if (department && !names.has(department)) {
      list.unshift({
        _id: "__current__",
        code: "",
        name: department,
        status: "Active",
      });
    }

    return list;
  }, [departments, department]);

  if (!open) return null;

  const canSave =
    !!faculty && phone.trim().length > 0 && department.trim().length > 0;

  const handleAskSave = () => {
    if (!canSave || isSaving) return;
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (isSaving) return;
    setConfirmOpen(false);
  };

  const handleConfirmSave = () => {
    onSave({
      phone: phone.trim(),
      department: department.trim(),
      status,
    });
    setConfirmOpen(false);
  };

  const modalContent = (
    <>
      {/* MAIN EDIT FACULTY MODAL BACKDROP */}
      <div
        className="fdm-backdrop"
        style={{ ...backdropBlurStyle, zIndex: 1050 }}
        onClick={handleAttemptClose}
        role="presentation"
      >
        <div
          className="fdm-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Edit Faculty"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="fdm-header">
            <h5 className="mb-0 fw-bold">Edit Faculty Account</h5>
            <button
              className="fdm-close"
              onClick={handleAttemptClose}
              aria-label="Close"
              disabled={isSaving}
            >
              <X size={18} />
            </button>
          </div>

          <div className="fdm-body">
            {loading ? (
              <div className="text-muted">Loading faculty…</div>
            ) : !faculty ? (
              <div className="text-muted">No faculty selected.</div>
            ) : (
              <div className="fdm-card">
                <div className="mb-3">
                  <div className="fw-semibold">{faculty.name}</div>
                  <div className="text-muted small">{faculty.email}</div>
                  <div className="text-muted small">{faculty.idNumber}</div>
                </div>

                <div className="fdm-grid">
                  <div className="fdm-item">
                    <div className="fdm-label">Phone</div>
                    <input
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="fdm-item">
                    <div className="fdm-label">Department</div>

                    <select
                      className="form-select"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={deptLoading || isSaving}
                    >
                      <option value="">
                        {deptLoading ? "Loading departments..." : "Select department"}
                      </option>

                      {departmentOptions.map((d) => (
                        <option key={d._id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>

                    {deptError && (
                      <div className="text-danger small mt-1">{deptError}</div>
                    )}
                  </div>

                  <div className="fdm-item" style={{ gridColumn: "1 / -1" }}>
                    <div className="fdm-label">Status</div>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as "active" | "inactive")
                      }
                      disabled={isSaving}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="fdm-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleAttemptClose}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={!canSave || isSaving}
              onClick={handleAskSave}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM SAVE POPUP */}
      {confirmOpen && (
        <div
          className="faculty-confirm-backdrop"
          style={{ ...backdropBlurStyle, zIndex: 2000 }}
          onClick={handleCloseConfirm}
        >
          <div
            className="faculty-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="faculty-confirm-close"
              onClick={handleCloseConfirm}
              disabled={isSaving}
            >
              <X size={18} />
            </button>

            <div className="faculty-confirm-icon">
              <TriangleAlert size={22} />
            </div>

            <h5 className="fw-bold mb-2 text-center">Confirm Save</h5>

            <p className="text-muted text-center mb-0">
              Are you sure you want to save the changes to this faculty account?
            </p>

            <div className="faculty-confirm-actions">
              <button
                type="button"
                className="btn btn-light border"
                onClick={handleCloseConfirm}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Yes, Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXIT / DISCARD CONFIRMATION POPUP */}
      {exitConfirmOpen && (
        <div
          className="faculty-confirm-backdrop"
          style={{ ...backdropBlurStyle, zIndex: 2010 }}
          onClick={() => !isSaving && setExitConfirmOpen(false)}
        >
          <div
            className="faculty-confirm-modal"
            style={{ maxWidth: "420px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-danger" />
              <h5 className="fw-bold mb-0 text-dark">Discard Changes?</h5>
            </div>

            <p className="text-muted mb-4 small">
              You have unsaved changes in this form. Closing this modal will discard your entries.
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setExitConfirmOpen(false)}
                disabled={isSaving}
              >
                Keep Editing
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmExit}
                disabled={isSaving}
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(modalContent, document.body);
}