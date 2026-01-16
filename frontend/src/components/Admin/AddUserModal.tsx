import { X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import "../../styles/admin-users.css";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserAdded?: () => void;
}

/* =========================
   CUSTOM DROPDOWN
========================= */
function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select",
  error,
}: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="custom-dropdown-wrapper">
      <div
        className={`custom-dropdown ${open ? "open" : ""} ${error ? "invalid" : ""}`}
      >
        <div className="selected" onClick={() => setOpen(!open)}>
          <span className={error ? "text-error" : ""}>
            {value || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`dropdown-icon ${open ? "rotate" : ""}`}
          />
        </div>

        {open && (
          <div className="options">
            {options.map((opt) => (
              <div
                key={opt}
                className={`option ${opt === value ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="error-message">{error || <>&nbsp;</>}</div>
    </div>
  );
}

/* =========================
   HELPER TO GET ID PREFIX
========================= */
const getIdPrefix = (role: "Student" | "Faculty") => {
  const year = new Date().getFullYear();
  return role === "Student" ? `GIPSTUD-${year}-` : `GIPFACU-${year}-`;
};

/* =========================
   MAIN MODAL
========================= */
export default function AddUserModal({
  open,
  onClose,
  onUserAdded,
}: AddUserModalProps) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"Student" | "Faculty" | "">("");
  const [idPrefix, setIdPrefix] = useState("");
  const [idSuffix, setIdSuffix] = useState(""); // Admin types last 5 digits
  const [courseOrDept, setCourseOrDept] = useState("");
  const [yearOrPosition, setYearOrPosition] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    fullName: "",
    idNumber: "",
    role: "",
    courseOrDept: "",
    yearOrPosition: "",
  });

  /* RESET FORM WHEN MODAL CLOSES */
  useEffect(() => {
    if (!open) {
      setFullName("");
      setRole("");
      setIdPrefix("");
      setIdSuffix("");
      setCourseOrDept("");
      setYearOrPosition("");
      setErrors({
        fullName: "",
        idNumber: "",
        role: "",
        courseOrDept: "",
        yearOrPosition: "",
      });
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  /* =========================
     HANDLE SUBMIT
  ========================== */
  const handleAddUser = async () => {
    const newErrors = {
      fullName: "",
      idNumber: "",
      role: "",
      courseOrDept: "",
      yearOrPosition: "",
    };
    let hasError = false;

    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required";
      hasError = true;
    }
    if (!role) {
      newErrors.role = "Please select a role";
      hasError = true;
    }
    if (!idSuffix || idSuffix.length !== 5) {
      newErrors.idNumber = "Enter 5-digit ID number";
      hasError = true;
    }
    if (role && !courseOrDept) {
      newErrors.courseOrDept =
        role === "Student"
          ? "Please select a course"
          : "Please select a department";
      hasError = true;
    }
    if (role && !yearOrPosition) {
      newErrors.yearOrPosition =
        role === "Student"
          ? "Please select a year level"
          : "Please select a position";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    const idNumber = `${idPrefix}${idSuffix}`;

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          idNumber,
          role,
          courseOrDept,
          yearOrPosition,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert((data as any).message || "Error adding user");
        return;
      }

      alert("User added successfully!");
      onUserAdded?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="modal-header">
          <h2>Add New User</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {/* Full Name */}
          <div className="form-group">
            <label className={errors.fullName ? "label-error" : ""}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={fullName}
              className={errors.fullName ? "input-error text-error" : ""}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors({ ...errors, fullName: "" });
              }}
            />
            <div className="error-message">
              {errors.fullName || <>&nbsp;</>}
            </div>
          </div>

          {/* Role & Status */}
          <div className="form-row">
            <div className="form-group">
              <label className={errors.role ? "label-error" : ""}>Role</label>
              <CustomDropdown
                options={["Student", "Faculty"]}
                value={role}
                onChange={(val) => {
                  const selected = val as "Student" | "Faculty";
                  setRole(selected);
                  setIdPrefix(getIdPrefix(selected));
                  setIdSuffix(""); // reset last 5 digits
                  setErrors({ ...errors, role: "", idNumber: "" });
                }}
                placeholder="Select role"
                error={errors.role}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <input value="Inactive" disabled />
            </div>
          </div>

          {/* ID Number */}
          <div className="form-group">
            <label className={errors.idNumber ? "label-error" : ""}>
              ID Number
            </label>

            <div className="id-input-row">
              <input
                value={idPrefix}
                placeholder="School ID "
                disabled
                className={`id-prefix ${errors.idNumber ? "input-error" : ""}`}
              />

              <input
                value={idSuffix}
                maxLength={5}
                placeholder="Enter 5 digit number"
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setIdSuffix(val);
                  setErrors({ ...errors, idNumber: "" });
                }}
                className={`id-suffix ${errors.idNumber ? "input-error" : ""}`}
              />
            </div>
          </div>
          <br></br>
          {/* Conditional Fields */}
          {role && (
            <div className="form-row conditional">
              <div className="form-group">
                <label className={errors.courseOrDept ? "label-error" : ""}>
                  {role === "Student" ? "Course" : "Department"}
                </label>
                <CustomDropdown
                  options={
                    role === "Student"
                      ? ["BSIT", "BSCS"]
                      : ["IT Department", "Admin Department"]
                  }
                  value={courseOrDept}
                  onChange={(val) => {
                    setCourseOrDept(val);
                    setErrors({ ...errors, courseOrDept: "" });
                  }}
                  placeholder={
                    role === "Student" ? "Select course" : "Select department"
                  }
                  error={errors.courseOrDept}
                />
              </div>

              <div className="form-group">
                <label className={errors.yearOrPosition ? "label-error" : ""}>
                  {role === "Student" ? "Year Level" : "Position"}
                </label>
                <CustomDropdown
                  options={
                    role === "Student"
                      ? ["1st Year", "2nd Year", "3rd Year", "4th Year"]
                      : ["Instructor", "Professor", "Staff"]
                  }
                  value={yearOrPosition}
                  onChange={(val) => {
                    setYearOrPosition(val);
                    setErrors({ ...errors, yearOrPosition: "" });
                  }}
                  placeholder={
                    role === "Student" ? "Select year" : "Select position"
                  }
                  error={errors.yearOrPosition}
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="add-user-btn"
            onClick={handleAddUser}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
}
