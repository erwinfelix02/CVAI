import { UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { PersonalInfo } from "../../pages/PreReg/StudentPreRegistrationPage";

type Errors = Partial<Record<keyof PersonalInfo, string>>;

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

  /* ---------------- VALIDATION LOGIC ---------------- */

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim());

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

  const validateField = (key: keyof PersonalInfo, val: string) => {
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
        if (!isValidEmail(val)) return "Enter valid email.";
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
      const msg = validateField(k, value[k] ?? "");
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
    const capitalizeWords = (value: string) => {
      return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    };

    // Auto capitalize name fields
    if (k === "firstName" || k === "middleName" || k === "lastName") {
      newValue = capitalizeWords(v);
    }

    onChange({ ...value, [k]: newValue });

    const msg = validateField(k, newValue);
    setLocalErrors((prev) => ({
      ...prev,
      [k]: msg,
    }));
  };

  const invalid = (k: keyof PersonalInfo) =>
    (submitted || value[k]) && !!(localErrors[k] || externalErrors[k]);

  const getError = (k: keyof PersonalInfo) =>
    localErrors[k] || externalErrors[k] || "";

  const inputClass = (k: keyof PersonalInfo) =>
    `form-control ${invalid(k) ? "is-invalid" : ""}`;

  const selectClass = (k: keyof PersonalInfo) =>
    `form-select ${invalid(k) ? "is-invalid" : ""}`;

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
          <label className="form-label">
            First Name <span className="text-danger">*</span>
          </label>
          <input
            className={inputClass("firstName")}
            value={value.firstName}
            placeholder="Enter first name"
            onChange={(e) => set("firstName", e.target.value)}
          />
          <div className="invalid-feedback d-block">
            {invalid("firstName") ? getError("firstName") : "\u00A0"}
          </div>
        </div>

        {/* Middle Name */}
        <div className="col-12 col-md-4">
          <label className="form-label">Middle Name</label>
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
          <label className="form-label">
            Last Name <span className="text-danger">*</span>
          </label>
          <input
            className={inputClass("lastName")}
            value={value.lastName}
            placeholder="Enter last name"
            onChange={(e) => set("lastName", e.target.value)}
          />
          <div className="invalid-feedback d-block">
            {invalid("lastName") ? getError("lastName") : "\u00A0"}
          </div>
        </div>

        {/* Email */}
        <div className="col-12 col-md-6">
          <label className="form-label">
            Email <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            className={inputClass("email")}
            value={value.email}
            placeholder="Enter email"
            onChange={(e) => set("email", e.target.value)}
          />
          <div className="invalid-feedback d-block">
            {invalid("email") ? getError("email") : "\u00A0"}
          </div>
        </div>

        {/* Phone */}
        <div className="col-12 col-md-6">
          <label className="form-label">
            Phone <span className="text-danger">*</span>
          </label>
          <input
            className={inputClass("phone")}
            value={value.phone}
            placeholder="09XXXXXXXXX"
            inputMode="numeric"
            onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, ""))}
          />
          <div className="invalid-feedback d-block">
            {invalid("phone") ? getError("phone") : "\u00A0"}
          </div>
        </div>

        {/* Birth Date */}
        <div className="col-12 col-md-6">
          <label className="form-label">
            Birth Date <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className={inputClass("birthDate")}
            value={value.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
          />
          <div className="invalid-feedback d-block">
            {invalid("birthDate") ? getError("birthDate") : "\u00A0"}
          </div>
        </div>

        {/* Gender */}
        <div className="col-12 col-md-6">
          <label className="form-label">
            Gender <span className="text-danger">*</span>
          </label>
          <select
            className={selectClass("gender")}
            value={value.gender}
            onChange={(e) => set("gender", e.target.value)}
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
          <label className="form-label">
            Complete Address <span className="text-danger">*</span>
          </label>
          <textarea
            className={inputClass("address")}
            rows={3}
            value={value.address}
            placeholder="House/Unit No., Street, Barangay, City, Province"
            onChange={(e) => set("address", e.target.value)}
          />
          <div className="invalid-feedback d-block">
            {invalid("address") ? getError("address") : "\u00A0"}
          </div>
        </div>
      </div>
    </div>
  );
}
