import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
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

  // ✅ Active departments list
  const [departments, setDepartments] = useState<DepartmentDB[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState("");

  // ✅ keep form in sync with selected faculty
  useEffect(() => {
    if (!faculty) return;
    setPhone(faculty.phone || "");
    setDepartment(faculty.department || "");
    setStatus(faculty.status || "inactive");
  }, [faculty]);

  // ✅ fetch active departments when modal opens
  useEffect(() => {
    if (!open) return;

    let mounted = true;

    const loadDepartments = async () => {
      try {
        setDeptLoading(true);
        setDeptError("");

        // recommended: backend already filters by status=Active
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

  // ✅ keep current department visible even if not active anymore
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

  // ✅ IMPORTANT: return null AFTER hooks (prevents hooks order crash)
  if (!open) return null;

  const canSave =
    !!faculty && phone.trim().length > 0 && department.trim().length > 0;

  return (
    <div className="fdm-backdrop" onClick={onClose} role="presentation">
      <div
        className="fdm-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Edit Faculty"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fdm-header">
          <h5 className="mb-0 fw-bold">Edit Faculty Account</h5>
          <button className="fdm-close" onClick={onClose} aria-label="Close">
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
                  />
                </div>

                <div className="fdm-item">
                  <div className="fdm-label">Department</div>

                  <select
                    className="form-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={deptLoading}
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
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            disabled={!canSave || isSaving}
            onClick={() =>
              onSave({
                phone: phone.trim(),
                department: department.trim(),
                status,
              })
            }
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}