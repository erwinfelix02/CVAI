import { useEffect, useState } from "react";
import AddUserReviewModal from "../../shared/AddUserReviewModal";
import {
  User,
  Hash,
  Mail,
  Phone,
  Users,
  Building2,
  ShieldCheck,
  X,
} from "lucide-react";
import { getActiveDepartments } from "../../../api/departmentService";

const GENDERS = ["Male", "Female", "Prefer not to say"] as const;
type Gender = (typeof GENDERS)[number];

type FacultyForm = {
  firstName: string;
  middleName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  gender: Gender | "";
  department: string | "";
  notes: string;
};

type Errors = Partial<Record<keyof FacultyForm, string>>;
type Touched = Partial<Record<keyof FacultyForm, boolean>>;

type DepartmentDB = {
  _id: string;
  code: string;
  name: string;
  status: "Active" | "Inactive";
  head?: string;
  description?: string;
};

function capitalizeWords(value: string) {
  return value
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function sanitizeInput(value: string) {
  return value
    .replace(/['";`\\]/g, "")
    .replace(/\s+/g, " ")
    .trimStart();
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

function isValidPHPhonePlus63(v: string) {
  return /^\+639\d{9}$/.test(v.trim());
}

const NAME_REGEX = /^[A-Za-z\s'-]+$/;
const MAX_NAME_LENGTH = 50;

function hasErrors(obj: Record<string, unknown>) {
  return Object.keys(obj).length > 0;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FacultyForm & { status: "inactive"; role: "Faculty" }) => void;
  isLoading: boolean;
};

export default function AddFacultyModal({
  open,
  onClose,
  onSubmit,
  isLoading,
}: Props) {
  const currentYear = new Date().getFullYear();
  const idPrefix = `GIP-${currentYear}-`;
  const phonePrefix = "+63";

  const [form, setForm] = useState<FacultyForm>({
    firstName: "",
    middleName: "",
    lastName: "",
    idNumber: "",
    email: "",
    phone: "",
    gender: "",
    department: "",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Touched>({});
  const [localErrors, setLocalErrors] = useState<Errors>({});
  const [showReview, setShowReview] = useState(false);

  const [departments, setDepartments] = useState<DepartmentDB[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState("");

  const [idLoading, setIdLoading] = useState(false);
  const [idError, setIdError] = useState("");

  useEffect(() => {
    if (!open) return;

    let mounted = true;

    const loadDepartments = async () => {
      try {
        setDeptLoading(true);
        setDeptError("");

        const data: DepartmentDB[] = await getActiveDepartments();

        if (!mounted) return;

        const activeOnly = (data || []).filter((d) => d.status === "Active");
        setDepartments(activeOnly);
      } catch (err: any) {
        if (!mounted) return;
        setDeptError(err?.message || "Failed to load departments.");
        setDepartments([]);
      } finally {
        if (mounted) setDeptLoading(false);
      }
    };

    loadDepartments();

    return () => {
      mounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadFacultyId = async () => {
      try {
        setIdLoading(true);
        setIdError("");

        const res = await fetch("/api/users/reserve-faculty-id", {
          method: "GET",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to generate faculty ID.");
        }

        if (!cancelled) {
          const generatedId = data?.idNumber || "";

          setForm((prev) => ({
            ...prev,
            idNumber: generatedId,
          }));

          if (!generatedId) {
            setIdError("Failed to load automatic faculty ID.");
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setForm((prev) => ({
            ...prev,
            idNumber: "",
          }));
          setIdError(err?.message || "Failed to load automatic faculty ID.");
        }
      } finally {
        if (!cancelled) {
          setIdLoading(false);
        }
      }
    };

    loadFacultyId();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const validateField = (k: keyof FacultyForm, raw?: string): string => {
    const v = (raw ?? (form as any)[k] ?? "") as string;

    const first = k === "firstName" ? v.trim() : form.firstName.trim();
    const middle = k === "middleName" ? v.trim() : form.middleName.trim();
    const last = k === "lastName" ? v.trim() : form.lastName.trim();
    const id = k === "idNumber" ? v.trim() : form.idNumber.trim();
    const email = k === "email" ? v.trim() : form.email.trim();
    const phone = k === "phone" ? v.trim() : form.phone.trim();
    const gender = k === "gender" ? (v as Gender | "") : form.gender;
    const dept = k === "department" ? v.trim() : form.department;

    switch (k) {
      case "firstName":
        if (!first) return "First name is required.";
        if (!NAME_REGEX.test(first)) return "Only letters allowed.";
        if (first.length < 2) return "Minimum 2 characters required.";
        if (first.length > MAX_NAME_LENGTH) return "Maximum 50 characters allowed.";
        return "";

      case "middleName":
        if (!middle) return "";
        if (!NAME_REGEX.test(middle)) return "Only letters allowed.";
        if (middle.length > MAX_NAME_LENGTH) return "Maximum 50 characters allowed.";
        return "";

      case "lastName":
        if (!last) return "Last name is required.";
        if (!NAME_REGEX.test(last)) return "Only letters allowed.";
        if (last.length < 2) return "Minimum 2 characters required.";
        if (last.length > MAX_NAME_LENGTH) return "Maximum 50 characters allowed.";
        return "";

      case "idNumber": {
        if (idLoading) return "";
        if (idError) return idError;
        if (!id) return "Faculty ID could not be generated.";

        const pattern = new RegExp(`^GIP-${currentYear}-\\d{3}$`);
        if (!pattern.test(id)) return `Format: ${idPrefix}### (3 digits).`;
        return "";
      }

      case "email":
        if (!email) return "Email is required.";
        if (!isValidEmail(email)) return "Enter a valid email.";
        return "";

      case "phone":
        if (!phone) return "Phone number is required.";
        if (!isValidPHPhonePlus63(phone)) return "Format: +639XXXXXXXXX";
        return "";

      case "gender":
        if (!gender) return "Gender is required.";
        return "";

      case "department":
        if (!dept) return "Department is required.";
        return "";

      case "notes":
        if (v && v.length > 300) return "Maximum 300 characters allowed.";
        return "";

      default:
        return "";
    }
  };

  const validateAll = () => {
    const next: Errors = {};
    (Object.keys(form) as (keyof FacultyForm)[]).forEach((k) => {
      const msg = validateField(k);
      if (msg) next[k] = msg;
    });
    setLocalErrors(next);
    return next;
  };

  const onBlurField = (k: keyof FacultyForm) => {
    setTouched((p) => ({ ...p, [k]: true }));
    const msg = validateField(k);
    setLocalErrors((p) => ({ ...p, [k]: msg }));
  };

  const invalid = (k: keyof FacultyForm) =>
    (submitted || touched[k]) && !!localErrors[k];

  const errorText = (k: keyof FacultyForm) =>
    invalid(k) ? localErrors[k] : "\u00A0";

  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        if (showReview) setShowReview(false);
        else onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose, isLoading, showReview]);

  useEffect(() => {
    if (!open) return;

    setForm({
      firstName: "",
      middleName: "",
      lastName: "",
      idNumber: "",
      email: "",
      phone: "",
      gender: "",
      department: "",
      notes: "",
    });

    setSubmitted(false);
    setTouched({});
    setLocalErrors({});
    setShowReview(false);
    setIdLoading(false);
    setIdError("");
  }, [open]);

  if (!open) return null;

  const update = (key: keyof FacultyForm, value: string) => {
    const cleanValue = sanitizeInput(value);

    setForm((prev) => ({ ...prev, [key]: cleanValue }));

    if (submitted || touched[key]) {
      const msg = validateField(key, cleanValue);
      setLocalErrors((p) => ({ ...p, [key]: msg }));
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);

    const all = validateAll();
    if (hasErrors(all as Record<string, unknown>) || idLoading) return;

    setShowReview(true);
  };

  const handleConfirm = () => {
    onSubmit({
      ...form,
      status: "inactive",
      role: "Faculty",
    });
  };

  const idFieldError = submitted ? validateField("idNumber") : "";

  return (
    <>
      {!showReview && (
        <div className="users-modal-backdrop" onMouseDown={onClose}>
          <div
            className="users-modal users-modal-compact"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="users-modal-header">
              <div>
                <h3 className="users-modal-title">Add Faculty Account</h3>
                <p className="users-modal-subtitle">
                  Create a new faculty user with portal access.
                </p>
              </div>

              <button
                type="button"
                className="users-modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="users-modal-body">
              <div className="users-form-grid">
                <div className="users-name-row users-col-span-2">
                  <div className="users-field users-input-with-icon">
                    <label
                      className={`users-label ${invalid("firstName") ? "is-invalid-label" : ""}`}
                    >
                      First Name <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <User className="users-input-icon" size={16} />
                      <input
                        className={`users-input ${invalid("firstName") ? "is-invalid" : ""}`}
                        value={form.firstName}
                        onChange={(e) =>
                          update("firstName", capitalizeWords(e.target.value))
                        }
                        onBlur={() => onBlurField("firstName")}
                        placeholder="Enter first name"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("firstName")}
                    </div>
                  </div>

                  <div className="users-field users-input-with-icon">
                    <label
                      className={`users-label ${invalid("middleName") ? "is-invalid-label" : ""}`}
                    >
                      Middle Name
                    </label>

                    <div className="users-input-wrapper">
                      <User className="users-input-icon" size={16} />
                      <input
                        className={`users-input ${invalid("middleName") ? "is-invalid" : ""}`}
                        value={form.middleName}
                        onChange={(e) =>
                          update("middleName", capitalizeWords(e.target.value))
                        }
                        onBlur={() => onBlurField("middleName")}
                        placeholder="Optional"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {invalid("middleName")
                        ? errorText("middleName")
                        : "\u00A0"}
                    </div>
                  </div>

                  <div className="users-field users-input-with-icon">
                    <label
                      className={`users-label ${invalid("lastName") ? "is-invalid-label" : ""}`}
                    >
                      Last Name <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <User className="users-input-icon" size={16} />
                      <input
                        className={`users-input ${invalid("lastName") ? "is-invalid" : ""}`}
                        value={form.lastName}
                        onChange={(e) =>
                          update("lastName", capitalizeWords(e.target.value))
                        }
                        onBlur={() => onBlurField("lastName")}
                        placeholder="Enter last name"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("lastName")}
                    </div>
                  </div>
                </div>

                <div className="users-row-3 users-col-span-2">
                  <div className="users-field users-input-with-icon">
                    <label
                      className={`users-label ${idFieldError ? "is-invalid-label" : ""}`}
                    >
                      ID Number <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <Hash className="users-input-icon" size={16} />
                      <input
                        className={`users-input ${idFieldError ? "is-invalid" : ""}`}
                        value={idLoading ? "Loading..." : form.idNumber}
                        disabled
                        readOnly
                        placeholder={`e.g., ${idPrefix}001`}
                        style={{
                          opacity: 1,
                          backgroundColor: "#e9ecef",
                          cursor: "not-allowed",
                        }}
                      />
                    </div>

                    <div className="text-muted small mt-1">
                      Auto-generated by the system.
                    </div>

                    <div className="users-invalid-feedback">
                      {submitted ? idFieldError || "\u00A0" : "\u00A0"}
                    </div>
                  </div>

                  <div className="users-field users-input-with-icon">
                    <label
                      className={`users-label ${invalid("email") ? "is-invalid-label" : ""}`}
                    >
                      Email <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <Mail className="users-input-icon" size={16} />
                      <input
                        className={`users-input ${invalid("email") ? "is-invalid" : ""}`}
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        onBlur={() => onBlurField("email")}
                        placeholder="Enter email address"
                        type="email"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("email")}
                    </div>
                  </div>

                  <div className="users-field users-input-with-icon">
                    <label
                      className={`users-label ${invalid("phone") ? "is-invalid-label" : ""}`}
                    >
                      Phone <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <Phone className="users-input-icon" size={16} />
                      <input
                        className={`users-input ${invalid("phone") ? "is-invalid" : ""}`}
                        value={form.phone}
                        onChange={(e) => {
                          let value = e.target.value;

                          if (value.startsWith(phonePrefix)) {
                            value = value.replace(phonePrefix, "");
                          }

                          let digits = value.replace(/\D/g, "");

                          if (digits.length > 0 && digits[0] !== "9") {
                            digits = "9" + digits.slice(1);
                          }

                          digits = digits.slice(0, 10);

                          const finalValue =
                            digits.length > 0 ? "+63" + digits : "";
                          update("phone", finalValue);
                        }}
                        onBlur={() => onBlurField("phone")}
                        placeholder="+639XXXXXXXXX"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("phone")}
                    </div>
                  </div>
                </div>

                <div className="users-row-2 users-col-span-2">
                  <div className="users-field users-input-with-icon has-select">
                    <label
                      className={`users-label ${invalid("gender") ? "is-invalid-label" : ""}`}
                    >
                      Gender <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <Users className="users-input-icon" size={16} />
                      <select
                        className={`users-select ${invalid("gender") ? "is-invalid" : ""}`}
                        value={form.gender}
                        onChange={(e) => update("gender", e.target.value)}
                        onBlur={() => onBlurField("gender")}
                      >
                        <option value="">Select gender</option>
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("gender")}
                    </div>
                  </div>

                  <div className="users-field users-input-with-icon has-select">
                    <label
                      className={`users-label ${invalid("department") ? "is-invalid-label" : ""}`}
                    >
                      Department <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <Building2 className="users-input-icon" size={16} />
                      <select
                        className={`users-select ${invalid("department") ? "is-invalid" : ""}`}
                        value={form.department}
                        onChange={(e) => update("department", e.target.value)}
                        onBlur={() => onBlurField("department")}
                        disabled={deptLoading}
                      >
                        <option value="">
                          {deptLoading
                            ? "Loading departments..."
                            : "Select department"}
                        </option>

                        {departments.map((d) => (
                          <option key={d._id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="users-invalid-feedback">
                      {deptError ? deptError : errorText("department")}
                    </div>
                  </div>
                </div>

                <div className="users-row-2 users-col-span-2">
                  <div className="users-field users-input-with-icon">
                    <label className="users-label">Status</label>

                    <div className="users-input-wrapper">
                      <ShieldCheck className="users-input-icon" size={16} />
                      <input
                        className="users-input users-status-inactive text-center"
                        value="Inactive"
                        readOnly
                      />
                    </div>

                    <div className="users-invalid-feedback">&nbsp;</div>
                  </div>

                  <div className="users-field users-input-with-icon">
                    <label className="users-label">Portal Role</label>
                    <div className="users-input-wrapper">
                      <ShieldCheck className="users-input-icon" size={16} />
                      <input
                        className="users-input users-status-active text-center"
                        value="Faculty"
                        readOnly
                      />
                    </div>
                    <div className="users-invalid-feedback">&nbsp;</div>
                  </div>
                </div>

                <div className="users-field users-col-span-2">
                  <label className="users-label">
                    Notes <span className="optional">(Optional)</span>
                  </label>

                  <textarea
                    className="users-textarea"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    onBlur={() => onBlurField("notes")}
                    placeholder="Add additional remarks if necessary"
                    rows={3}
                  />

                  <div className="users-invalid-feedback">
                    {invalid("notes") ? errorText("notes") : "\u00A0"}
                  </div>
                </div>
              </div>
            </div>

            <div className="users-modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isLoading || idLoading}
              >
                Review
              </button>
            </div>
          </div>
        </div>
      )}

      <AddUserReviewModal
        open={showReview}
        data={{
          ...form,
          role: "Faculty",
          status: "Inactive",
        }}
        onBack={() => !isLoading && setShowReview(false)}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </>
  );
}