import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { UserRole, UserStatus } from "../../../pages/SuperAdmin/UsersPage";
import AddUserReviewModal from "./AddUserReviewModal";

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
  tempPassword: string;
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

// ✅ Improved regex: ensures domain extension is at least 2 chars
function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

// ✅ Validates PH Mobile: 09 + 9 digits
function isValidPHPhone(v: string) {
  return /^09\d{9}$/.test(v);
}

function validate(payload: AddUserFormState): AddUserErrors {
  const e: AddUserErrors = {};

  const req = (k: keyof AddUserFormState, msg: string) => {
    const val = String(payload[k] ?? "").trim();
    if (!val) e[k] = msg;
  };

  req("firstName", "First name is required.");
  req("lastName", "Last name is required.");
  req("idNumber", "ID number is required.");
  req("email", "Email is required.");
  req("phone", "Phone number is required.");
  req("gender", "Gender is required.");
  req("role", "Role is required.");
  req("department", "Department is required.");

  // Note: Status is effectively always valid now, but we keep the check for safety
  req("status", "Status is required.");

  if (payload.idNumber.trim() && payload.idNumber.trim().length < 4) {
    e.idNumber = "ID number looks too short.";
  }

  if (payload.email.trim() && !isValidEmail(payload.email.trim())) {
    e.email = "Enter a valid email (e.g., user@school.edu).";
  }

  if (payload.phone.trim() && !isValidPHPhone(payload.phone.trim())) {
    e.phone = "Format: 09xxxxxxxxx (11 digits).";
  }

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

  // ✅ AUTOMATICALLY ACTIVE: Initialize as "active"
  const [status, setStatus] = useState<UserStatus>("active");

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
    ]
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
    setStatus("active");

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
            // ✅ DO NOT call onClose() here. Let parent close on success.
            onSubmit(payload);
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
                  <div className="users-field">
                    <label className={labelClass("firstName")}>
                      First Name <span className="req">*</span>
                    </label>
                    <input
                      className={inputClass("firstName")}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={() => setFirstName(toTitleCase(firstName))}
                      placeholder="Enter first name"
                    />
                    <div className="users-invalid-feedback">
                      {errorText("firstName")}
                    </div>
                  </div>

                  <div className="users-field">
                    <label className="users-label">Middle Name</label>
                    <input
                      className="users-input"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      onBlur={() => setMiddleName(toTitleCase(middleName))}
                      placeholder="Optional"
                    />
                    <div className="users-invalid-feedback">&nbsp;</div>
                  </div>

                  <div className="users-field">
                    <label className={labelClass("lastName")}>
                      Last Name <span className="req">*</span>
                    </label>
                    <input
                      className={inputClass("lastName")}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={() => setLastName(toTitleCase(lastName))}
                      placeholder="Enter last name"
                    />
                    <div className="users-invalid-feedback">
                      {errorText("lastName")}
                    </div>
                  </div>
                </div>

                {/* Row 2: ID + Email + Phone */}
                <div className="users-row-3 users-col-span-2">
                  <div className="users-field">
                    <label className={labelClass("idNumber")}>
                      ID Number <span className="req">*</span>
                    </label>
                    <input
                      className={inputClass("idNumber")}
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="e.g., STU-2024-001"
                    />
                    <div className="users-invalid-feedback">
                      {errorText("idNumber")}
                    </div>
                  </div>

                  <div className="users-field">
                    <label className={labelClass("email")}>
                      Email <span className="req">*</span>
                    </label>
                    <input
                      className={inputClass("email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      type="email"
                    />
                    <div className="users-invalid-feedback">
                      {errorText("email")}
                    </div>
                  </div>

                  <div className="users-field">
                    <label className={labelClass("phone")}>
                      Phone <span className="req">*</span>
                    </label>
                    <input
                      className={inputClass("phone")}
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="09xxxxxxxxx"
                      inputMode="numeric"
                      maxLength={11}
                    />
                    <div className="users-invalid-feedback">
                      {errorText("phone")}
                    </div>
                  </div>
                </div>

                {/* Row 3: Gender + Status */}
                <div className="users-row-2 users-col-span-2">
                  <div className="users-field has-select">
                    <label className={labelClass("gender")}>
                      Gender <span className="req">*</span>
                    </label>
                    <select
                      className={selectClass("gender")}
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender | "")}
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
                    <div className="users-invalid-feedback">
                      {errorText("gender")}
                    </div>
                  </div>

                  {/* ✅ STATUS IS NOW READ-ONLY & FIXED */}
                  <div className="users-field">
                    <label className="users-label">
                      Status <span className="req">*</span>
                    </label>
                    <input
                      /* ✅ Added users-status-active class here */
                      className="users-input users-status-active"
                      value="Active"
                      readOnly
                      disabled
                    />
                    <div className="users-invalid-feedback">&nbsp;</div>
                  </div>
                </div>

                {/* Row 4: Portal Role + Department */}
                <div className="users-row-2 users-col-span-2">
                  <div className="users-field has-select">
                    <label className={labelClass("role")}>
                      Portal Role <span className="req">*</span>
                    </label>
                    <select
                      className={selectClass("role")}
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole | "")}
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
                    <div className="users-invalid-feedback">
                      {errorText("role")}
                    </div>
                  </div>

                  <div className="users-field has-select">
                    <label className={labelClass("department")}>
                      Department <span className="req">*</span>
                    </label>
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
                    onChange={(e) => setNotes(e.target.value)}
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