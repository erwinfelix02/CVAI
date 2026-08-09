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
import type {
  UserRole,
  UserStatus,
  UserRow,
} from "../../../pages/SuperAdmin/UsersPage";
import AddUserReviewModal from "../../shared/AddUserReviewModal";
import { getActiveDepartments } from "../../../api/departmentService";

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

const ALL_ROLES: UserRole[] = ["Registrar", "Dept Head", "Finance"];

const REGISTRAR_DEPT = "Registrar Office";
const FINANCE_DEPT = "Finance Office";

type DepartmentDB = {
  _id: string;
  code: string;
  name: string;
  status: "Active" | "Inactive";
};

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
const currentYear = new Date().getFullYear();
const phonePrefix = "+639";
const ID_PREFIX = `GIP-${currentYear}-`;

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
  return /^\+639\d{9}$/.test(v.trim());
}

function hasErrors(obj: Record<string, unknown>) {
  return Object.keys(obj).length > 0;
}

function getIdPrefixByRole(_role: UserRole | "") {
  return ID_PREFIX;
}

type AddUserModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddUserPayload) => void;
  isLoading: boolean;
  existingUsers: UserRow[];
};

const EMPTY_FORM: AddUserFormState = {
  firstName: "",
  middleName: "",
  lastName: "",
  idNumber: "",
  email: "",
  phone: "",
  gender: "",
  role: "",
  status: "inactive",
  department: "",
  notes: "",
};

export default function AddUserModal({
  open,
  onClose,
  onSubmit,
  isLoading,
  existingUsers,
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
  const [localErrors, setLocalErrors] = useState<AddUserErrors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [showReview, setShowReview] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const [reviewData, setReviewData] = useState<Omit<
    AddUserPayload,
    "tempPassword"
  > | null>(null);

  const [departments, setDepartments] = useState<DepartmentDB[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState("");

  const [idLoading, setIdLoading] = useState(false);
  const [idError, setIdError] = useState("");

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

  const [initialForm, setInitialForm] = useState<AddUserFormState>({
    ...EMPTY_FORM,
  });

  const hasRegistrarAlready = useMemo(() => {
    return existingUsers.some((u) => String(u.role).trim() === "Registrar");
  }, [existingUsers]);

  const roles = useMemo(() => {
    return hasRegistrarAlready
      ? ALL_ROLES.filter((r) => r !== "Registrar")
      : ALL_ROLES;
  }, [hasRegistrarAlready]);

  const departmentLocked = role === "Registrar" || role === "Finance";

  const usedDeptHeadDepartments = useMemo(() => {
    return existingUsers
      .filter((u) => u.role === "Dept Head" && u.department)
      .map((u) => String(u.department).trim());
  }, [existingUsers]);

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

  const departmentOptions = useMemo(() => {
    if (role === "Dept Head") {
      return departments
        .map((d) => d.name)
        .filter((n) => n !== REGISTRAR_DEPT && n !== FINANCE_DEPT)
        .filter((n) => !usedDeptHeadDepartments.includes(n));
    }

    if (role === "Finance") {
      return [FINANCE_DEPT];
    }

    if (role === "Registrar") {
      return hasRegistrarAlready ? [] : [REGISTRAR_DEPT];
    }

    return [];
  }, [role, departments, usedDeptHeadDepartments, hasRegistrarAlready]);

  useEffect(() => {
    if (!open) return;

    if (hasRegistrarAlready && role === "Registrar") {
      setRole("");
      setDepartment("");
      setIdNumber("");
      setIdError("");
      setLocalErrors((p) => ({
        ...p,
        role: "Registrar account already exists.",
      }));
      return;
    }

    if (role === "Registrar") {
      setDepartment(REGISTRAR_DEPT);
      setLocalErrors((p) => ({ ...p, department: "" }));
      return;
    }

    if (role === "Finance") {
      setDepartment(FINANCE_DEPT);
      setLocalErrors((p) => ({ ...p, department: "" }));
      return;
    }

    if (role === "Dept Head") {
      if (
        department === REGISTRAR_DEPT ||
        department === FINANCE_DEPT ||
        (department && !departmentOptions.includes(department))
      ) {
        setDepartment("");
      }
      return;
    }

    setDepartment("");
  }, [role, open, department, departmentOptions, hasRegistrarAlready]);

  useEffect(() => {
    if (!open) return;
    if (!departmentLocked) return;
    setTouched((t) => ({ ...t, department: false }));
  }, [departmentLocked, open]);

  useEffect(() => {
    if (!open) return;

    if (!role) {
      setIdNumber("");
      setIdError("");
      setIdLoading(false);
      return;
    }

    if (role === "Registrar" && hasRegistrarAlready) {
      setIdNumber("");
      setIdError("Registrar account already exists.");
      setIdLoading(false);
      return;
    }

    let cancelled = false;

    const loadPreviewUserId = async () => {
      try {
        setIdLoading(true);
        setIdError("");
        setIdNumber("");

        const res = await fetch(
          `/api/users/reserve-user-id?role=${encodeURIComponent(role)}`,
          {
            method: "GET",
          },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to preview user ID.");
        }

        if (!cancelled) {
          const previewId = data?.idNumber || "";
          setIdNumber(previewId);

          setInitialForm((prev) => ({
            ...prev,
            idNumber: previewId,
          }));

          if (!previewId) {
            setIdError("Failed to load automatic user ID.");
          } else if (submitted || touched.idNumber) {
            setLocalErrors((p) => ({
              ...p,
              idNumber: "",
            }));
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setIdNumber("");
          setIdError(err?.message || "Failed to load automatic user ID.");
          setInitialForm((prev) => ({
            ...prev,
            idNumber: "",
          }));
        }
      } finally {
        if (!cancelled) {
          setIdLoading(false);
        }
      }
    };

    loadPreviewUserId();

    return () => {
      cancelled = true;
    };
  }, [open, role, hasRegistrarAlready, submitted, touched.idNumber]);

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

      case "idNumber": {
        if (!role) return "Select a role first.";
        if (idLoading) return "";
        if (idError) return idError;
        if (!id) return "ID number could not be generated.";

        const prefix = getIdPrefixByRole(role);
        const pattern = new RegExp(`^${prefix}\\d{3}$`);

        if (!pattern.test(id)) return `Format: ${prefix}### (3 digits).`;
        if (!/^[A-Za-z0-9-]+$/.test(id))
          return "ID can only contain letters, numbers, and dashes.";

        return "";
      }

      case "email":
        if (!em) return "Email is required.";
        if (!isValidEmail(em)) return "Enter a valid email.";
        return "";

      case "phone":
        if (!ph) return "Phone number is required.";
        if (!isValidPHPhone(ph)) return "Format: +639XXXXXXXXX.";
        return "";

      case "gender":
        if (!gender) return "Gender is required.";
        return "";

      case "role":
        if (!role) return "Role is required.";
        if (role === "Registrar" && hasRegistrarAlready) {
          return "Registrar account already exists.";
        }
        return "";

      case "department":
        if (!department) return "Department is required.";
        if (role === "Registrar" && department !== REGISTRAR_DEPT) {
          return "Registrar role must be assigned to Registrar Office.";
        }
        if (role === "Finance" && department !== FINANCE_DEPT) {
          return "Finance role must be assigned to Finance Office.";
        }
        if (
          role === "Dept Head" &&
          (department === REGISTRAR_DEPT || department === FINANCE_DEPT)
        ) {
          return "Department Head cannot be assigned to Registrar or Finance Office.";
        }
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

  const hasUnsavedChanges = useMemo(() => {
    return (
      form.firstName !== initialForm.firstName ||
      form.middleName !== initialForm.middleName ||
      form.lastName !== initialForm.lastName ||
      form.idNumber !== initialForm.idNumber ||
      form.email !== initialForm.email ||
      form.phone !== initialForm.phone ||
      form.gender !== initialForm.gender ||
      form.role !== initialForm.role ||
      form.status !== initialForm.status ||
      form.department !== initialForm.department ||
      form.notes !== initialForm.notes
    );
  }, [form, initialForm]);

  const shouldWarnBeforeUnload =
    open && hasUnsavedChanges && !isLoading && !idLoading;

  useEffect(() => {
    if (!shouldWarnBeforeUnload) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldWarnBeforeUnload]);

  const requestClose = () => {
    if (isLoading || idLoading) return;

    if (showReview) {
      setShowReview(false);
      return;
    }

    if (hasUnsavedChanges) {
      setDiscardOpen(true);
      return;
    }

    onClose();
  };

  const forceClose = () => {
    setDiscardOpen(false);
    setShowReview(false);
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape") return;
      if (isLoading || idLoading) return;

      if (discardOpen) {
        setDiscardOpen(false);
        return;
      }

      if (showReview) {
        setShowReview(false);
        return;
      }

      requestClose();
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, showReview, isLoading, idLoading, discardOpen, hasUnsavedChanges]);

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
    setDiscardOpen(false);
    setDeptError("");
    setIdLoading(false);
    setIdError("");

    setInitialForm({
      ...EMPTY_FORM,
    });
  }, [open]);

  if (!open) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (value.startsWith(phonePrefix)) {
      value = value.slice(phonePrefix.length);
    }

    const digits = value.replace(/\D/g, "").slice(0, 9);
    const finalValue = phonePrefix + digits;

    setPhone(finalValue);

    if (submitted || touched.phone) {
      setLocalErrors((p) => ({
        ...p,
        phone: finalValue.length === 13 ? "" : "Format: +639XXXXXXXXX",
      }));
    }
  };

  const openReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const all = validateAll();
    if (hasErrors(all as Record<string, unknown>) || idLoading) return;

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

  const idFieldError = submitted ? validateField("idNumber") : "";

  return (
    <>
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

      {!showReview && (
        <div
          className="users-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
              requestClose();
            }
          }}
        >
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
                className="users-modal-close app-icon-btn app-icon-btn-sm"
                onClick={requestClose}
                aria-label="Close"
                title="Close"
                disabled={isLoading}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={openReview} className="users-modal-form">
              <div className="users-modal-body">
                <div className="users-form-grid">
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
                          onBlur={() => onBlurField("firstName")}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="users-invalid-feedback">
                        {invalid("firstName") ? getError("firstName") : "\u00A0"}
                      </div>
                    </div>

                    <div className="users-field users-input-with-icon">
                      <label className={labelClass("middleName")}>
                        Middle Name
                      </label>
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
                        {invalid("middleName")
                          ? getError("middleName")
                          : "\u00A0"}
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
                            setLastName(
                              sanitizeInput(toTitleCase(e.target.value)),
                            )
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
                          value={!role ? "" : idLoading ? "Loading..." : idNumber}
                          disabled
                          readOnly
                          placeholder={
                            role
                              ? `e.g., ${getIdPrefixByRole(role)}001`
                              : "Select role first"
                          }
                          style={{
                            opacity: 1,
                            backgroundColor: "#e9ecef",
                            cursor: "not-allowed",
                          }}
                        />
                      </div>
                      <div className="text-muted small mt-1">
                        Auto-generated preview only. Final ID is assigned on save.
                      </div>
                      <div className="users-invalid-feedback">
                        {submitted ? idFieldError || "\u00A0" : "\u00A0"}
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
                          placeholder="+639XXXXXXXXX"
                          inputMode="numeric"
                          maxLength={13}
                        />
                      </div>
                      <div className="users-invalid-feedback">
                        {invalid("phone") ? getError("phone") : "\u00A0"}
                      </div>
                    </div>
                  </div>

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
                            const nextGender = e.target.value as Gender | "";
                            setGender(nextGender);

                            if (submitted || touched.gender) {
                              setLocalErrors((p) => ({
                                ...p,
                                gender: nextGender ? "" : "Gender is required.",
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
                            const nextRole = e.target.value as UserRole | "";
                            setRole(nextRole);
                            setIdNumber("");
                            setIdError("");

                            if (submitted || touched.role) {
                              setLocalErrors((p) => ({
                                ...p,
                                role: nextRole ? "" : "Role is required.",
                              }));
                            }

                            setTimeout(() => {
                              if (submitted || touched.department) {
                                setLocalErrors((p) => ({
                                  ...p,
                                  department: validateField("department"),
                                }));
                              }
                            }, 0);
                          }}
                          onBlur={() => onBlurField("role")}
                        >
                          <option value="" disabled>
                            Select role
                          </option>
                          {roles.map((r) => (
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

                        {departmentLocked ? (
                          <input
                            className={inputClass("department")}
                            value={department}
                            readOnly
                            onBlur={() => onBlurField("department")}
                          />
                        ) : (
                          <>
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
                              disabled={role === "Dept Head" && deptLoading}
                            >
                              <option value="">
                                {role === "Dept Head" && deptLoading
                                  ? "Loading departments..."
                                  : "Select department"}
                              </option>

                              {departmentOptions.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>

                            {role === "Dept Head" && deptError && (
                              <div className="text-danger small mt-1">
                                {deptError}
                              </div>
                            )}

                            {role === "Dept Head" &&
                              !deptLoading &&
                              !deptError &&
                              departmentOptions.length === 0 && (
                                <div className="text-muted small mt-1">
                                  All active departments already have a Department
                                  Head.
                                </div>
                              )}
                          </>
                        )}
                      </div>
                      <div className="users-invalid-feedback">
                        {invalid("department")
                          ? getError("department")
                          : "\u00A0"}
                      </div>
                    </div>
                  </div>

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
              </div>

              <div className="users-modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={requestClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={idLoading || isLoading}
                >
                  Create
                </button>
              </div>
            </form>

            {discardOpen ? (
              <div
                className="users-modal-backdrop"
                role="dialog"
                aria-modal="true"
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget && !isLoading) {
                    setDiscardOpen(false);
                  }
                }}
              >
                <div
                  className="users-modal users-modal-compact"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="users-modal-header">
                    <div>
                      <h3 className="users-modal-title">Discard changes?</h3>
                      <p className="users-modal-subtitle">
                        You have unsaved input in this form.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="users-modal-close app-icon-btn app-icon-btn-sm"
                      onClick={() => setDiscardOpen(false)}
                      aria-label="Close"
                      title="Close"
                      disabled={isLoading}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="users-modal-body">
                    <p className="mb-0 text-muted">
                      Closing this modal will discard your changes.
                    </p>
                  </div>

                  <div className="users-modal-footer">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setDiscardOpen(false)}
                      disabled={isLoading}
                    >
                      Keep Editing
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={forceClose}
                      disabled={isLoading}
                    >
                      Discard & Close
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}