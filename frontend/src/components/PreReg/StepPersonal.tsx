import {
  UserCircle,
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  MapPin,
  VenusAndMars,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { PersonalInfo } from "../../pages/PreReg/StudentPreRegistrationPage";

type Errors = Partial<Record<keyof PersonalInfo, string>>;
type Touched = Partial<Record<keyof PersonalInfo, boolean>>;

export default function StepPersonal({
  value,
  onChange,
  submitted,
  errors: externalErrors,
}: {
  value: PersonalInfo;
  onChange: (v: PersonalInfo) => void;
  submitted: boolean;
  errors: Errors;
}) {
  const [localErrors, setLocalErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});

  /* ---------------- SANITIZE HELPERS ---------------- */

  const normalizeText = (v: string) =>
    v
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const hasDangerChars = (v: string) => /[<>$`{};]/.test(v);

  const sanitizeName = (v: string) => {
    let s = normalizeText(v);
    s = s.replace(/["\\]/g, "");
    return s.slice(0, 50);
  };

  const sanitizeEmail = (v: string) => normalizeText(v).slice(0, 120);

  const sanitizePhone = (v: string) => v.replace(/[^\d]/g, "").slice(0, 11);

  const sanitizeAddress = (v: string) => {
    let s = normalizeText(v);
    s = s.replace(/[$`{}<>]/g, "");
    return s.slice(0, 200);
  };

  const capitalizeWords = (val: string) =>
    val.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  /* ---------------- VALIDATION LOGIC ---------------- */

  const isValidEmail = (raw: string) => {
    const v = raw.trim();

    // quick rejects
    if (!v || v.length > 120) return false;
    if (/\s/.test(v)) return false; // no spaces
    if (v.includes("..")) return false; // no double dots

    // must contain exactly 1 "@"
    const parts = v.split("@");
    if (parts.length !== 2) return false;

    const [local, domain] = parts;

    // local part rules (simple + safe)
    if (!local || local.length > 64) return false;
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return false;
    if (local.startsWith(".") || local.endsWith(".")) return false;

    // domain rules
    if (!domain || domain.length > 255) return false;
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) return false;
    if (!domain.includes(".")) return false; // must have TLD
    if (domain.startsWith("-") || domain.endsWith("-")) return false;

    // each label check (e.g. "gmail", "com")
    const labels = domain.split(".");
    if (labels.some((x) => !x || x.length > 63)) return false;
    if (labels.some((x) => x.startsWith("-") || x.endsWith("-"))) return false;

    // TLD at least 2 letters
    const tld = labels[labels.length - 1];
    if (!/^[a-zA-Z]{2,}$/.test(tld)) return false;

    return true;
  };

  const isValidPHPhone = (v: string) => /^09\d{9}$/.test(v.trim());

  const isValidName = (v: string) => /^[a-zA-Z\s'.-]+$/.test(v.trim());

  const calculateAge = (dateStr: string) => {
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const validateField = (key: keyof PersonalInfo, rawVal: any) => {
    const val = typeof rawVal === "string" ? rawVal : "";

    if (hasDangerChars(val)) return "Invalid characters detected.";

    switch (key) {
      case "firstName":
        if (!val.trim()) return "First name is required.";
        if (val.length < 2) return "Minimum 2 characters.";
        if (!isValidName(val)) return "Invalid characters.";
        break;

      case "lastName":
        if (!val.trim()) return "Last name is required.";
        if (val.length < 2) return "Minimum 2 characters.";
        if (!isValidName(val)) return "Invalid characters.";
        break;

      case "email":
        if (!val.trim()) return "Email is required.";
        if (!isValidEmail(val))
          return "Enter a valid email (e.g. name@gmail.com).";
        break;

      case "phone":
        if (!val.trim()) return "Phone number is required.";
        if (!isValidPHPhone(val)) return "Format: 09XXXXXXXXX.";
        break;

      case "birthDate":
        if (!val.trim()) return "Birth date is required.";
        if (calculateAge(val) < 15) return "Minimum age is 15.";
        break;

      case "gender":
        if (!val.trim()) return "Please select gender.";
        break;

      case "address":
        if (!val.trim()) return "Address is required.";
        if (val.trim().length < 10) return "Enter complete address.";
        break;
    }

    return "";
  };

  const validateAll = () => {
    const newErrors: Errors = {};
    (Object.keys(value) as (keyof PersonalInfo)[]).forEach((k) => {
      const msg = validateField(k, (value as any)[k] ?? "");
      if (msg) newErrors[k] = msg;
    });
    setLocalErrors(newErrors);
  };

  useEffect(() => {
    if (submitted) validateAll();
  }, [submitted]);

  /* ---------------- HANDLERS ---------------- */

  const set = (k: keyof PersonalInfo, v: string) => {
    let newValue = v;

    if (k === "firstName" || k === "middleName" || k === "lastName") {
      newValue = capitalizeWords(sanitizeName(v));
    } else if (k === "email") {
      newValue = sanitizeEmail(v);
    } else if (k === "phone") {
      newValue = sanitizePhone(v);
    } else if (k === "address") {
      newValue = sanitizeAddress(v);
    } else {
      newValue = normalizeText(v);
    }

    onChange({ ...value, [k]: newValue });

    if (submitted || touched[k]) {
      const msg = validateField(k, newValue);
      setLocalErrors((prev) => ({ ...prev, [k]: msg }));
    }
  };

  const onBlurField = (k: keyof PersonalInfo) => {
    setTouched((prev) => ({ ...prev, [k]: true }));
    const msg = validateField(k, (value as any)[k] ?? "");
    setLocalErrors((prev) => ({ ...prev, [k]: msg }));
  };

  const invalid = (k: keyof PersonalInfo) =>
    (submitted || touched[k]) && !!(localErrors[k] || externalErrors[k]);

  const getError = (k: keyof PersonalInfo) =>
    localErrors[k] || externalErrors[k] || "";

  const inputClass = (k: keyof PersonalInfo) =>
    `form-control ${invalid(k) ? "is-invalid" : ""}`;

  const selectClass = (k: keyof PersonalInfo) =>
    `form-select ${invalid(k) ? "is-invalid" : ""}`;

  const labelClass = (k: keyof PersonalInfo) =>
    `form-label d-flex align-items-center gap-2 ${
      invalid(k) ? "text-danger fw-semibold" : ""
    }`;

  const LabelIcon = ({ children }: { children: React.ReactNode }) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        borderRadius: 6,
        background: "rgba(148, 163, 184, 0.15)", // subtle slate
      }}
    >
      {children}
    </span>
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="prereg-step">
      <div className="prereg-step-header">
        <div className="d-flex align-items-center gap-2">
          <span className="prereg-step-header-icon">
            <UserCircle size={18} />
          </span>
          <h4 className="fw-bold mb-0">Personal Information</h4>
        </div>
        <span className="chip chip-muted">Fields marked * are required</span>
      </div>

      <div className="row g-3">
        {/* First Name */}
        <div className="col-12 col-md-4">
          <label className={labelClass("firstName")}>
            <LabelIcon>
              <User size={14} />
            </LabelIcon>
            First Name <span className="text-danger">*</span>
          </label>
          <input
            className={inputClass("firstName")}
            value={value.firstName}
            placeholder="Enter first name"
            onChange={(e) => set("firstName", e.target.value)}
            onBlur={() => onBlurField("firstName")}
          />
          <div className="invalid-feedback d-block">
            {invalid("firstName") ? getError("firstName") : "\u00A0"}
          </div>
        </div>

        {/* Middle Name */}
        <div className="col-12 col-md-4">
          <label className="form-label d-flex align-items-center gap-2">
            <LabelIcon>
              <User size={14} />
            </LabelIcon>
            Middle Name
          </label>
          <input
            className="form-control"
            value={value.middleName || ""}
            placeholder="Optional"
            onChange={(e) => set("middleName", e.target.value)}
          />
          <div className="invalid-feedback d-block">&nbsp;</div>
        </div>

        {/* Last Name */}
        <div className="col-12 col-md-4">
          <label className={labelClass("lastName")}>
            <LabelIcon>
              <User size={14} />
            </LabelIcon>
            Last Name <span className="text-danger">*</span>
          </label>
          <input
            className={inputClass("lastName")}
            value={value.lastName}
            placeholder="Enter last name"
            onChange={(e) => set("lastName", e.target.value)}
            onBlur={() => onBlurField("lastName")}
          />
          <div className="invalid-feedback d-block">
            {invalid("lastName") ? getError("lastName") : "\u00A0"}
          </div>
        </div>

        {/* Email */}
        <div className="col-12 col-md-6">
          <label className={labelClass("email")}>
            <LabelIcon>
              <Mail size={14} />
            </LabelIcon>
            Email <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            className={inputClass("email")}
            value={value.email}
            placeholder="Enter email"
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => onBlurField("email")}
          />
          <div className="invalid-feedback d-block">
            {invalid("email") ? getError("email") : "\u00A0"}
          </div>
        </div>

        {/* Phone */}
        <div className="col-12 col-md-6">
          <label className={labelClass("phone")}>
            <LabelIcon>
              <Phone size={14} />
            </LabelIcon>
            Phone <span className="text-danger">*</span>
          </label>
          <input
            className={inputClass("phone")}
            value={value.phone}
            placeholder="09XXXXXXXXX"
            inputMode="numeric"
            onChange={(e) => set("phone", e.target.value)}
            onBlur={() => onBlurField("phone")}
          />
          <div className="invalid-feedback d-block">
            {invalid("phone") ? getError("phone") : "\u00A0"}
          </div>
        </div>

        {/* Birth Date */}
        <div className="col-12 col-md-6">
          <label className={labelClass("birthDate")}>
            <LabelIcon>
              <CalendarIcon size={14} />
            </LabelIcon>
            Birth Date <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className={inputClass("birthDate")}
            value={value.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
            onBlur={() => onBlurField("birthDate")}
          />
          <div className="invalid-feedback d-block">
            {invalid("birthDate") ? getError("birthDate") : "\u00A0"}
          </div>
        </div>

        {/* Gender */}
        <div className="col-12 col-md-6">
          <label className={labelClass("gender")}>
            <LabelIcon>
              <VenusAndMars size={14} />
            </LabelIcon>
            Gender <span className="text-danger">*</span>
          </label>
          <select
            className={selectClass("gender")}
            value={value.gender}
            onChange={(e) => set("gender", e.target.value)}
            onBlur={() => onBlurField("gender")}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="prefer_not_say">Prefer not to say</option>
          </select>
          <div className="invalid-feedback d-block">
            {invalid("gender") ? getError("gender") : "\u00A0"}
          </div>
        </div>

        {/* Address */}
        <div className="col-12">
          <label className={labelClass("address")}>
            <LabelIcon>
              <MapPin size={14} />
            </LabelIcon>
            Complete Address <span className="text-danger">*</span>
          </label>
          <textarea
            className={inputClass("address")}
            rows={3}
            value={value.address}
            placeholder="House/Unit No., Street, Barangay, City, Province"
            onChange={(e) => set("address", e.target.value)}
            onBlur={() => onBlurField("address")}
          />
          <div className="invalid-feedback d-block">
            {invalid("address") ? getError("address") : "\u00A0"}
          </div>
        </div>
      </div>
    </div>
  );
}
