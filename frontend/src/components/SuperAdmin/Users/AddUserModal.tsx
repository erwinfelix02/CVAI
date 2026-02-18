import { useEffect, useMemo, useState } from "react";
import {
  X,
  User,
  Hash,
  Mail,
  Phone,
  Users,
  ShieldCheck,
  Building2,
} from "lucide-react";
import type { UserRole, UserStatus } from "../../../pages/SuperAdmin/UsersPage";
import AddUserReviewModal from "../../shared/AddUserReviewModal";

const GENDERS = ["Male", "Female", "Prefer not to say"] as const;
type Gender = (typeof GENDERS)[number];

export type AddUserPayload = {
  firstName: string;
  middleName: string;
  lastName: string;

  idNumber: string;

  email: string;
  phone: string;
  gender: Gender;

  role: UserRole;
  status: UserStatus;
  department: string;
  notes: string;

  tempPassword?: string;
};

type AddUserFormState = Omit<
  AddUserPayload,
  "gender" | "role" | "status" | "department" | "tempPassword"
> & {
  gender: Gender | "";
  role: UserRole | "";
  status: UserStatus;
  department: string | "";
};

type AddUserErrors = Partial<Record<keyof AddUserFormState, string>>;
type Touched = Partial<Record<keyof AddUserFormState, boolean>>;

const ROLES: UserRole[] = ["Registrar", "Dept Head", "Finance"];

const DEPARTMENTS = [
  "Computer Science",
  "Registrar Office",
  "Finance Office",
  "Engineering",
  "Business",
  "Arts & Sciences",
];

// ✅ Helper: Formats "john doe" -> "John Doe"
function toTitleCase(str: string) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const NAME_REGEX = /^[A-Za-z\s'-]+$/;
const MAX_NAME_LENGTH = 50;

function sanitizeInput(value: string) {
  return value
    .replace(/['";`\\]/g, "")
    .replace(/\s+/g, " ")
    .trimStart();
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

function isValidPHPhone(v: string) {
  return /^09\d{9}$/.test(v.trim());
}

function hasErrors(obj: Record<string, unknown>) {
  return Object.keys(obj).length > 0;
}

type AddUserModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddUserPayload) => void;
  isLoading: boolean;
};

export default function AddUserModal({
  open,
  onClose,
  onSubmit,
  isLoading,
}: AddUserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [idNumber, setIdNumber] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [gender, setGender] = useState<Gender | "">("");
  const [role, setRole] = useState<UserRole | "">("");

  const [status] = useState<UserStatus>("inactive");

  const [department, setDepartment] = useState<string | "">("");
  const [notes, setNotes] = useState("");

  const [submitted, setSubmitted] = useState(false);

  // ✅ StepPersonal-style validation state
  const [localErrors, setLocalErrors] = useState<AddUserErrors>({});
  const [touched, setTouched] = useState<Touched>({});

  // ✅ review step state
  const [showReview, setShowReview] = useState(false);
  const [reviewData, setReviewData] = useState<Omit<
    AddUserPayload,
    "tempPassword"
  > | null>(null);

  const form = useMemo<AddUserFormState>(
    () => ({
      firstName,
      middleName,
      lastName,
      idNumber,
      email,
      phone,
      gender,
      role,
      status,
      department,
      notes,
    }),
    [
      firstName,
      middleName,
      lastName,
      idNumber,
      email,
      phone,
      gender,
      role,
      status,
      department,
      notes,
    ],
  );

  // ✅ Field-by-field validation (like StepPersonal)
  const validateField = (k: keyof AddUserFormState): string => {
    const first = firstName.trim();
    const middle = middleName.trim();
    const last = lastName.trim();
    const id = idNumber.trim();
    const em = email.trim();
    const ph = phone.trim();

    switch (k) {
      case "firstName":
        if (!first) return "First name is required.";
        if (!NAME_REGEX.test(first)) return "Only letters allowed.";
        if (first.length < 2) return "Minimum 2 characters required.";
        if (first.length > MAX_NAME_LENGTH)
          return "Maximum 50 characters allowed.";
        return "";

      case "middleName":
        if (!middle) return "";
        if (!NAME_REGEX.test(middle)) return "Only letters allowed.";
        if (middle.length > MAX_NAME_LENGTH)
          return "Maximum 50 characters allowed.";
        return "";

      case "lastName":
        if (!last) return "Last name is required.";
        if (!NAME_REGEX.test(last)) return "Only letters allowed.";
        if (last.length < 2) return "Minimum 2 characters required.";
        if (last.length > MAX_NAME_LENGTH)
          return "Maximum 50 characters allowed.";
        return "";

      case "idNumber":
        if (!id) return "ID number is required.";
        if (!/^[A-Za-z0-9-]+$/.test(id))
          return "ID can only contain letters, numbers, and dashes.";
        return "";

      case "email":
        if (!em) return "Email is required.";
        if (!isValidEmail(em)) return "Enter a valid email.";
        return "";

      case "phone":
        if (!ph) return "Phone number is required.";
        if (!isValidPHPhone(ph)) return "Format: 09xxxxxxxxx (11 digits).";
        return "";

      case "gender":
        if (!gender) return "Gender is required.";
        return "";

      case "role":
        if (!role) return "Role is required.";
        return "";

      case "department":
        if (!department) return "Department is required.";
        return "";

      case "status":
        if (!status) return "Status is required.";
        return "";

      default:
        return "";
    }
  };

  const validateAll = () => {
    const next: AddUserErrors = {};
    (Object.keys(form) as (keyof AddUserFormState)[]).forEach((k) => {
      const msg = validateField(k);
      if (msg) next[k] = msg;
    });
    setLocalErrors(next);
    return next;
  };

  const onBlurField = (k: keyof AddUserFormState) => {
    setTouched((prev) => ({ ...prev, [k]: true }));
    const msg = validateField(k);
    setLocalErrors((prev) => ({ ...prev, [k]: msg }));
  };

  const invalid = (k: keyof AddUserFormState) =>
    (submitted || touched[k]) && !!localErrors[k];

  const getError = (k: keyof AddUserFormState) => localErrors[k] || "";

  const labelClass = (k: keyof AddUserFormState) =>
    `users-label ${invalid(k) ? "is-invalid-label" : ""}`;

  const inputClass = (k: keyof AddUserFormState) =>
    `users-input ${invalid(k) ? "is-invalid is-invalid-placeholder" : ""}`;

  const selectClass = (k: keyof AddUserFormState) =>
    `users-select ${invalid(k) ? "is-invalid" : ""}`;

  // ESC to close + body scroll lock
  useEffect(() => {
    if (!open) return;

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        if (isLoading) return;

        if (showReview) setShowReview(false);
        else onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, showReview, isLoading]);

  // reset when open
  useEffect(() => {
    if (!open) return;

    setFirstName("");
    setMiddleName("");
    setLastName("");

    setIdNumber("");
    setEmail("");
    setPhone("");

    setGender("");
    setRole("");

    setDepartment("");
    setNotes("");

    setSubmitted(false);
    setTouched({});
    setLocalErrors({});

    setShowReview(false);
    setReviewData(null);
  }, [open]);

  if (!open) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 11) {
      setPhone(val);
      if (submitted || touched.phone) {
        setLocalErrors((p) => ({ ...p, phone: validateField("phone") }));
      }
    }
  };

  const openReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const all = validateAll();
    if (hasErrors(all as Record<string, unknown>)) return;

    const cleanFirst = toTitleCase(firstName);
    const cleanMiddle = toTitleCase(middleName);
    const cleanLast = toTitleCase(lastName);

    setFirstName(cleanFirst);
    setMiddleName(cleanMiddle);
    setLastName(cleanLast);

    setReviewData({
      firstName: cleanFirst,
      middleName: cleanMiddle,
      lastName: cleanLast,
      idNumber: idNumber.trim(),
      email: email.trim(),
      phone: phone.trim(),
      gender: gender as Gender,
      role: role as UserRole,
      status,
      department: department as string,
      notes,
    });

    setShowReview(true);
  };

  return (
    <>
      {/* ✅ REVIEW MODAL */}
      {reviewData && (
        <AddUserReviewModal
          open={showReview}
          data={reviewData}
          isLoading={isLoading}
          onBack={() => {
            if (!isLoading) setShowReview(false);
          }}
          onConfirm={(payload) => {
            const finalPayload: AddUserPayload = {
              ...payload,
              middleName: payload.middleName ?? "",
              gender: payload.gender as Gender,
              role: payload.role as UserRole,
              status: payload.status as UserStatus,
              notes,
            };
            onSubmit(finalPayload);
          }}
        />
      )}

      {/* ✅ FORM MODAL */}
      {!showReview && (
        <div className="users-modal-backdrop" onMouseDown={onClose}>
          <div
            className="users-modal users-modal-compact"
            role="dialog"
            aria-modal="true"
            aria-label="Add New Portal User"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="users-modal-header">
              <div>
                <h3 className="users-modal-title">Add New Portal User</h3>
                <p className="users-modal-subtitle">
                  Create a new user with portal access and assign a role.
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

            <form onSubmit={openReview} className="users-modal-body">
              <div className="users-form-grid">
                {/* Row 1: Name */}
                <div className="users-name-row users-col-span-2">
                  <div className="users-field users-input-with-icon">
                    <label className={labelClass("firstName")}>
                      First Name <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <User className="users-input-icon" size={16} />
                      <input
                        className={inputClass("firstName")}
                        value={firstName}
                        onChange={(e) =>
                          setFirstName(sanitizeInput(toTitleCase(e.target.value)))
                        }
                        onBlur={() => onBlurField("firstName")}
                        placeholder="Enter first name"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {invalid("firstName") ? getError("firstName") : "\u00A0"}
                    </div>
                  </div>

                  <div className="users-field users-input-with-icon">
                    <label className={labelClass("middleName")}>Middle Name</label>

                    <div className="users-input-wrapper">
                      <User className="users-input-icon" size={16} />
                      <input
                        className={inputClass("middleName")}
                        value={middleName}
                        onChange={(e) =>
                          setMiddleName(
                            sanitizeInput(toTitleCase(e.target.value)),
                          )
                        }
                        onBlur={() => onBlurField("middleName")}
                        placeholder="Optional"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {invalid("middleName") ? getError("middleName") : "\u00A0"}
                    </div>
                  </div>

                  <div className="users-field users-input-with-icon">
                    <label className={labelClass("lastName")}>
                      Last Name <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <User className="users-input-icon" size={16} />
                      <input
                        className={inputClass("lastName")}
                        value={lastName}
                        onChange={(e) =>
                          setLastName(sanitizeInput(toTitleCase(e.target.value)))
                        }
                        onBlur={() => onBlurField("lastName")}
                        placeholder="Enter last name"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {invalid("lastName") ? getError("lastName") : "\u00A0"}
                    </div>
                  </div>
                </div>

                {/* Row 2: ID + Email + Phone */}
                <div className="users-row-3 users-col-span-2">
                  <div className="users-field users-input-with-icon">
                    <label className={labelClass("idNumber")}>
                      ID Number <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <Hash className="users-input-icon" size={16} />
                      <input
                        className={inputClass("idNumber")}
                        value={idNumber}
                        onChange={(e) => setIdNumber(sanitizeInput(e.target.value))}
                        onBlur={() => onBlurField("idNumber")}
                        placeholder="e.g., STU-2024-001"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {invalid("idNumber") ? getError("idNumber") : "\u00A0"}
                    </div>
                  </div>

                  <div className="users-field users-input-with-icon">
                    <label className={labelClass("email")}>
                      Email <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <Mail className="users-input-icon" size={16} />
                      <input
                        className={inputClass("email")}
                        value={email}
                        onChange={(e) => setEmail(sanitizeInput(e.target.value))}
                        onBlur={() => onBlurField("email")}
                        placeholder="Enter email address"
                        type="email"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {invalid("email") ? getError("email") : "\u00A0"}
                    </div>
                  </div>

                  <div className="users-field users-input-with-icon">
                    <label className={labelClass("phone")}>
                      Phone <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <Phone className="users-input-icon" size={16} />
                      <input
                        className={inputClass("phone")}
                        value={phone}
                        onChange={handlePhoneChange}
                        onBlur={() => onBlurField("phone")}
                        placeholder="09xxxxxxxxx"
                        inputMode="numeric"
                        maxLength={11}
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {invalid("phone") ? getError("phone") : "\u00A0"}
                    </div>
                  </div>
                </div>

                {/* Row 3: Gender + Status */}
                <div className="users-row-2 users-col-span-2">
                  <div className="users-field users-input-with-icon has-select">
                    <label className={labelClass("gender")}>
                      Gender <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <Users className="users-input-icon" size={16} />
                      <select
                        className={selectClass("gender")}
                        value={gender}
                        onChange={(e) => {
                          setGender(e.target.value as Gender | "");
                          if (submitted || touched.gender) {
                            setLocalErrors((p) => ({
                              ...p,
                              gender: validateField("gender"),
                            }));
                          }
                        }}
                        onBlur={() => onBlurField("gender")}
                      >
                        <option value="" disabled>
                          Select gender
                        </option>
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="users-invalid-feedback">
                      {invalid("gender") ? getError("gender") : "\u00A0"}
                    </div>
                  </div>

                  {/* Status fixed */}
                  <div className="users-field users-input-with-icon">
                    <label className="users-label">
                      Status <span className="req">*</span>
                    </label>

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
                </div>

                {/* Row 4: Portal Role + Department */}
                <div className="users-row-2 users-col-span-2">
                  <div className="users-field users-input-with-icon has-select">
                    <label className={labelClass("role")}>
                      Portal Role <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <ShieldCheck className="users-input-icon" size={16} />
                      <select
                        className={selectClass("role")}
                        value={role}
                        onChange={(e) => {
                          setRole(e.target.value as UserRole | "");
                          if (submitted || touched.role) {
                            setLocalErrors((p) => ({
                              ...p,
                              role: validateField("role"),
                            }));
                          }
                        }}
                        onBlur={() => onBlurField("role")}
                      >
                        <option value="" disabled>
                          Select role
                        </option>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="users-invalid-feedback">
                      {invalid("role") ? getError("role") : "\u00A0"}
                    </div>
                  </div>

                  <div className="users-field users-input-with-icon has-select">
                    <label className={labelClass("department")}>
                      Department <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <Building2 className="users-input-icon" size={16} />
                      <select
                        className={selectClass("department")}
                        value={department}
                        onChange={(e) => {
                          setDepartment(e.target.value);
                          if (submitted || touched.department) {
                            setLocalErrors((p) => ({
                              ...p,
                              department: validateField("department"),
                            }));
                          }
                        }}
                        onBlur={() => onBlurField("department")}
                      >
                        <option value="" disabled>
                          Select department
                        </option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="users-invalid-feedback">
                      {invalid("department") ? getError("department") : "\u00A0"}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="users-field users-col-span-2">
                  <label className="users-label">Notes</label>
                  <textarea
                    className="users-textarea"
                    value={notes}
                    onChange={(e) => setNotes(sanitizeInput(e.target.value))}
                    placeholder="Optional notes"
                    rows={3}
                  />
                  <div className="users-invalid-feedback">&nbsp;</div>
                </div>
              </div>

              <div className="users-modal-footer">
                <button type="button" className="btn btn-light" onClick={onClose}>
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
