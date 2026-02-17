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

  // ✅ auto-generated (review step)
  tempPassword?: string;
};

type AddUserFormState = Omit<
  AddUserPayload,
  "gender" | "role" | "status" | "department" | "tempPassword"
> & {
  gender: Gender | "";
  role: UserRole | "";
  status: UserStatus; // ✅ Always defined as UserStatus now
  department: string | "";
};

type AddUserErrors = Partial<Record<keyof AddUserFormState, string>>;

const ROLES: UserRole[] = ["Registrar", "Dept Head", "Finance", "Super Admin"];

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

// ✅ Improved regex: ensures domain extension is at least 2 chars
function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

// ✅ Validates PH Mobile: 09 + 9 digits
function isValidPHPhone(v: string) {
  return /^09\d{9}$/.test(v);
}

function validate(form: AddUserFormState): AddUserErrors {
  const e: AddUserErrors = {};

  const first = form.firstName.trim();
  const middle = form.middleName.trim();
  const last = form.lastName.trim();

  // ✅ FIRST NAME
  if (!first) {
    e.firstName = "First name is required.";
  } else if (!NAME_REGEX.test(first)) {
    e.firstName = "Only letters allowed.";
  } else if (first.length < 2) {
    e.firstName = "Minimum 2 characters required.";
  } else if (first.length > MAX_NAME_LENGTH) {
    e.firstName = "Maximum 50 characters allowed.";
  }

  // ✅ MIDDLE NAME (Optional)
  if (middle) {
    if (!NAME_REGEX.test(middle)) {
      e.middleName = "Only letters allowed.";
    } else if (middle.length > MAX_NAME_LENGTH) {
      e.middleName = "Maximum 50 characters allowed.";
    }
  }

  // ✅ LAST NAME
  if (!last) {
    e.lastName = "Last name is required.";
  } else if (!NAME_REGEX.test(last)) {
    e.lastName = "Only letters allowed.";
  } else if (last.length < 2) {
    e.lastName = "Minimum 2 characters required.";
  } else if (last.length > MAX_NAME_LENGTH) {
    e.lastName = "Maximum 50 characters allowed.";
  }

  // ✅ ID NUMBER
  if (!form.idNumber.trim()) {
    e.idNumber = "ID number is required.";
  } else if (!/^[A-Za-z0-9-]+$/.test(form.idNumber)) {
    e.idNumber = "ID can only contain letters, numbers, and dashes.";
  }

  // ✅ EMAIL
  if (!form.email.trim()) {
    e.email = "Email is required.";
  } else if (!isValidEmail(form.email.trim())) {
    e.email = "Enter a valid email.";
  }

  // ✅ PHONE
  if (!form.phone.trim()) {
    e.phone = "Phone number is required.";
  } else if (!isValidPHPhone(form.phone.trim())) {
    e.phone = "Format: 09xxxxxxxxx (11 digits).";
  }

  // ✅ REQUIRED SELECTS
  if (!form.gender) e.gender = "Gender is required.";
  if (!form.role) e.role = "Role is required.";
  if (!form.department) e.department = "Department is required.";
  if (!form.status) e.status = "Status is required.";

  return e;
}

function hasErrors(obj: Record<string, unknown>) {
  return Object.keys(obj).length > 0;
}

// ✅ Updated Props Interface
type AddUserModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddUserPayload) => void;
  isLoading: boolean; // <--- ✅ NEW PROP
};

export default function AddUserModal({
  open,
  onClose,
  onSubmit,
  isLoading, // <--- ✅ Destructured here
}: AddUserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [idNumber, setIdNumber] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [gender, setGender] = useState<Gender | "">("");
  const [role, setRole] = useState<UserRole | "">("");

  const [status, setStatus] = useState<UserStatus>("inactive");

  const [department, setDepartment] = useState<string | "">("");
  const [notes, setNotes] = useState("");

  const [submitted, setSubmitted] = useState(false);

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

  const errors = useMemo(() => validate(form), [form]);

  const invalid = (k: keyof AddUserFormState) => submitted && !!errors[k];

  const labelClass = (k: keyof AddUserFormState) =>
    `users-label ${invalid(k) ? "is-invalid-label" : ""}`;

  const inputClass = (k: keyof AddUserFormState) =>
    `users-input ${invalid(k) ? "is-invalid is-invalid-placeholder" : ""}`;

  const selectClass = (k: keyof AddUserFormState) =>
    `users-select ${invalid(k) ? "is-invalid" : ""}`;

  const errorText = (k: keyof AddUserFormState) =>
    invalid(k) ? errors[k] : "\u00A0";

  // ESC to close + body scroll lock
  useEffect(() => {
    if (!open) return;

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        // ✅ Prevent closing via ESC if loading
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

    // ✅ Reset to "active" every time modal opens
    setStatus("inactive");

    setDepartment("");
    setNotes("");

    setSubmitted(false);

    setShowReview(false);
    setReviewData(null);
  }, [open]);

  if (!open) return null;

  // ✅ Helper to restrict phone input to numbers only
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (val.length <= 11) {
      setPhone(val);
    }
  };

  const openReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (hasErrors(errors as Record<string, unknown>)) return;

    // ✅ Clean names before review
    const cleanFirst = toTitleCase(firstName);
    const cleanMiddle = toTitleCase(middleName);
    const cleanLast = toTitleCase(lastName);

    // Update form state to reflect changes in UI
    setFirstName(cleanFirst);
    setMiddleName(cleanMiddle);
    setLastName(cleanLast);

    setReviewData({
      firstName: cleanFirst,
      middleName: cleanMiddle,
      lastName: cleanLast,
      idNumber,
      email,
      phone,
      gender: gender as Gender,
      role: role as UserRole,
      status: status, // This is always "active" now
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
          isLoading={isLoading} // ✅ PASS LOADING STATE
          onBack={() => {
            if (!isLoading) setShowReview(false);
          }}
          onConfirm={(payload) => {
            const finalPayload: AddUserPayload = {
              ...payload,
              middleName: payload.middleName ?? "", // ✅ FIX HERE
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
                          setFirstName(
                            sanitizeInput(toTitleCase(e.target.value)),
                          )
                        }
                        onBlur={() => setFirstName(toTitleCase(firstName))}
                        placeholder="Enter first name"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("firstName")}
                    </div>
                  </div>

                  <div className="users-field users-input-with-icon">
                    <label className="users-label">Middle Name</label>

                    <div className="users-input-wrapper">
                      <User className="users-input-icon" size={16} />
                      <input
                        className="users-input"
                        value={middleName}
                        onChange={(e) =>
                          setMiddleName(
                            sanitizeInput(toTitleCase(e.target.value)),
                          )
                        }
                        onBlur={() => setMiddleName(toTitleCase(middleName))}
                        placeholder="Optional"
                      />
                    </div>

                    <div className="users-invalid-feedback">&nbsp;</div>
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
                          setLastName(
                            sanitizeInput(toTitleCase(e.target.value)),
                          )
                        }
                        onBlur={() => setLastName(toTitleCase(lastName))}
                        placeholder="Enter last name"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("lastName")}
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
                        onChange={(e) =>
                          setIdNumber(sanitizeInput(e.target.value))
                        }
                        placeholder="e.g., STU-2024-001"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("idNumber")}
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
                        onChange={(e) =>
                          setEmail(sanitizeInput(e.target.value))
                        }
                        placeholder="Enter email address"
                        type="email"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("email")}
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
                        placeholder="09xxxxxxxxx"
                        inputMode="numeric"
                        maxLength={11}
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("phone")}
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
                        onChange={(e) =>
                          setGender(e.target.value as Gender | "")
                        }
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
                      {errorText("gender")}
                    </div>
                  </div>

                  {/* ✅ STATUS IS NOW READ-ONLY & FIXED */}
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
                        onChange={(e) =>
                          setRole(e.target.value as UserRole | "")
                        }
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
                      {errorText("role")}
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
                        onChange={(e) => setDepartment(e.target.value)}
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
                      {errorText("department")}
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
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={onClose}
                >
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
