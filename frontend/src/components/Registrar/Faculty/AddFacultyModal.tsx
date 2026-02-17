import { useEffect, useMemo, useState } from "react";
import AddUserReviewModal from "../../shared/AddUserReviewModal"; // adjust path if needed
import { User, Hash, Mail, Phone, Users, Building2,ShieldCheck, X } from "lucide-react";

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

function capitalizeWords(value: string) {
  return value
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
function sanitizeInput(value: string) {
  return value.replace(/['";`\\]/g, "").replace(/\s+/g, " ");
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

function isValidPHPhone(v: string) {
  return /^\+639\d{9}$/.test(v);
}

function validate(form: FacultyForm): Errors {
  const e: Errors = {};
  const NAME_REGEX = /^[A-Za-z\s'-]+$/;
  const MAX_NAME_LENGTH = 50;

  // FIRST NAME
  const first = form.firstName.trim();

  if (!first) {
    e.firstName = "First name is required.";
  } else if (!NAME_REGEX.test(first)) {
    e.firstName = "Only letters allowed.";
  } else if (first.length < 2) {
    e.firstName = "Minimum 2 characters required.";
  } else if (first.length > MAX_NAME_LENGTH) {
    e.firstName = "Maximum 50 characters allowed.";
  }

  // MIDDLE NAME (Optional)
  const middle = form.middleName.trim();

  if (middle) {
    if (!NAME_REGEX.test(middle)) {
      e.middleName = "Only letters allowed.";
    } else if (middle.length > MAX_NAME_LENGTH) {
      e.middleName = "Maximum 50 characters allowed.";
    }
  }

  // LAST NAME
  const last = form.lastName.trim();

  if (!last) {
    e.lastName = "Last name is required.";
  } else if (!NAME_REGEX.test(last)) {
    e.lastName = "Only letters allowed.";
  } else if (last.length < 2) {
    e.lastName = "Minimum 2 characters required.";
  } else if (last.length > MAX_NAME_LENGTH) {
    e.lastName = "Maximum 50 characters allowed.";
  }

  const currentYear = new Date().getFullYear();
  const idPrefix = `FAC-${currentYear}-`;

  const digits = form.idNumber.replace(idPrefix, "");

  if (digits.length !== 3) {
    e.idNumber = "Enter exactly 3 digits.";
  }

  if (!form.email.trim()) e.email = "Email is required.";
  if (!form.phone.trim()) e.phone = "Phone number is required.";
  if (!form.gender) e.gender = "Gender is required.";
  if (!form.department) e.department = "Department is required.";

  if (form.idNumber && !/^[A-Za-z0-9-]+$/.test(form.idNumber)) {
    e.idNumber = "ID can only contain letters, numbers, and dashes.";
  }

  if (form.email && !isValidEmail(form.email)) e.email = "Enter a valid email.";

  if (form.phone && !isValidPHPhone(form.phone))
    e.phone = "Format: +639XXXXXXXXX";

  return e;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: FacultyForm & { status: "inactive"; role: "Faculty" },
  ) => void;
  isLoading: boolean;
};

export default function AddFacultyModal({
  open,
  onClose,
  onSubmit,
  isLoading,
}: Props) {
  const currentYear = new Date().getFullYear();
  const idPrefix = `FAC-${currentYear}-`;
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
  const [showReview, setShowReview] = useState(false); // 🔥 ADDED
  const errors = useMemo(() => validate(form), [form]);
  const invalid = (k: keyof FacultyForm) => submitted && !!errors[k];

  const errorText = (k: keyof FacultyForm) =>
    invalid(k) ? errors[k] : "\u00A0";

  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose, isLoading]);

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
    setShowReview(false);
  }, [open]);

  if (!open) return null;

  const update = (key: keyof FacultyForm, value: string) => {
    const cleanValue = sanitizeInput(value);
    setForm((prev) => ({ ...prev, [key]: cleanValue }));
  };

  const handleSubmit = () => {
    const validationErrors = validate(form);

    setSubmitted(true);

    if (Object.keys(validationErrors).length > 0) return;

    setShowReview(true);
  };

  // 🔥 CONFIRM FROM REVIEW MODAL
  const handleConfirm = () => {
    onSubmit({
      ...form,
      status: "inactive",
      role: "Faculty",
    });
  };

  return (
    <>
      {/* MAIN FORM MODAL */}
      {!showReview && (
        <div className="users-modal-backdrop" onMouseDown={onClose}>
          <div
            className="users-modal users-modal-compact"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
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
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="users-modal-body">
              <div className="users-form-grid">
                {/* NAME ROW */}
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
                        value={form.middleName}
                        onChange={(e) =>
                          update("middleName", capitalizeWords(e.target.value))
                        }
                        placeholder="Optional"
                      />
                    </div>

                    <div className="users-invalid-feedback">&nbsp;</div>
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
                        placeholder="Enter last name"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("lastName")}
                    </div>
                  </div>
                </div>

                {/* ID / EMAIL / PHONE */}
                <div className="users-row-3 users-col-span-2">
                  <div className="users-field users-input-with-icon">
                    <label
                      className={`users-label ${invalid("idNumber") ? "is-invalid-label" : ""}`}
                    >
                      ID Number <span className="req">*</span>
                    </label>

                    <div className="users-input-wrapper">
                      <Hash className="users-input-icon" size={16} />

                      <input
                        className={`users-input ${invalid("idNumber") ? "is-invalid" : ""}`}
                        value={form.idNumber}
                        onChange={(e) => {
                          let value = e.target.value;

                          // Remove prefix if manually typed
                          if (value.startsWith(idPrefix)) {
                            value = value.replace(idPrefix, "");
                          }

                          // Allow only digits, max 3
                          const digits = value.replace(/\D/g, "").slice(0, 3);

                          // If user typed something, auto prepend prefix
                          const finalValue =
                            digits.length > 0 ? idPrefix + digits : "";

                          setForm((prev) => ({
                            ...prev,
                            idNumber: finalValue,
                          }));
                        }}
                        placeholder="Enter Id Number"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("idNumber")}
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
                        placeholder="Enter email address"
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

                          // Remove prefix if manually typed
                          if (value.startsWith(phonePrefix)) {
                            value = value.replace(phonePrefix, "");
                          }

                          // Remove non-digits
                          let digits = value.replace(/\D/g, "");

                          // Force first digit to be 9
                          if (digits.length > 0 && digits[0] !== "9") {
                            digits = "9" + digits.slice(1);
                          }

                          // Limit to 10 digits after +63
                          digits = digits.slice(0, 10);

                          const finalValue =
                            digits.length > 0 ? phonePrefix + digits : "";

                          setForm((prev) => ({
                            ...prev,
                            phone: finalValue,
                          }));
                        }}
                        placeholder="Enter Phone Number"
                      />
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("phone")}
                    </div>
                  </div>
                </div>

                {/* GENDER / DEPARTMENT */}
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
                      >
                        <option value="">Select gender</option>
                        {GENDERS.map((g) => (
                          <option key={g}>{g}</option>
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
                      >
                        <option value="">Select department</option>
                        <option>Computer Science</option>
                        <option>Engineering</option>
                        <option>Business</option>
                      </select>
                    </div>

                    <div className="users-invalid-feedback">
                      {errorText("department")}
                    </div>
                  </div>
                </div>

                {/* STATUS / ROLE */}
                <div className="users-row-2 users-col-span-2">
                  <div className="users-field users-input-with-icon">
  <label className="users-label">
    Status
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

                {/* NOTES */}
                <div className="users-field users-col-span-2">
                  <label className="users-label">
                    Notes <span className="optional">(Optional)</span>
                  </label>

                  <textarea
                    className="users-textarea"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Add additional remarks if necessary"
                    rows={3}
                  />

                  <div className="users-invalid-feedback">&nbsp;</div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="users-modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Review
              </button>
            </div>
          </div>
        </div>
      )}
      {/* REVIEW MODAL */}
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
