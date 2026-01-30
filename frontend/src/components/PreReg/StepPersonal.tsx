import { UserCircle } from "lucide-react";
import type { PersonalInfo } from "../../pages/PreReg/StudentPreRegistrationPage";

type Errors = Partial<Record<keyof PersonalInfo, string>>;

export default function StepPersonal({
  value,
  onChange,
  submitted,
  errors,
}: {
  value: PersonalInfo;
  onChange: (v: PersonalInfo) => void;
  submitted: boolean;
  errors: Errors;
}) {
  const set = (k: keyof PersonalInfo, v: string) =>
    onChange({ ...value, [k]: v });

  const invalid = (k: keyof PersonalInfo) => submitted && !!errors[k];

  const labelClass = (k: keyof PersonalInfo) =>
    `form-label ${invalid(k) ? "is-invalid-label" : ""}`;

  // ✅ adds a class to control placeholder color too
  const inputClass = (k: keyof PersonalInfo) =>
    `form-control ${invalid(k) ? "is-invalid is-invalid-placeholder" : ""}`;

  const selectClass = (k: keyof PersonalInfo) =>
    `form-select ${invalid(k) ? "is-invalid" : ""}`;

  return (
    <div className="prereg-step">
      <div className="prereg-step-header">
        <div className="d-flex align-items-center gap-2">
          <span className="prereg-step-header-icon" aria-hidden="true">
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
            First Name <span className="text-danger">*</span>
          </label>
          <input
            className={inputClass("firstName")}
            value={value.firstName}
            placeholder="Enter first name"
            onChange={(e) => set("firstName", e.target.value)}
          />
          <div className="invalid-feedback d-block">
            {invalid("firstName") ? errors.firstName : "\u00A0"}
          </div>
        </div>

        {/* Middle Name (optional) */}
        <div className="col-12 col-md-4">
          <label className="form-label">Middle Name</label>
          <input
            className="form-control"
            value={value.middleName || ""}
            placeholder="Enter middle name (optional)"
            onChange={(e) => set("middleName", e.target.value)}
          />
          <div className="invalid-feedback d-block">&nbsp;</div>
        </div>

        {/* Last Name */}
        <div className="col-12 col-md-4">
          <label className={labelClass("lastName")}>
            Last Name <span className="text-danger">*</span>
          </label>
          <input
            className={inputClass("lastName")}
            value={value.lastName}
            placeholder="Enter last name"
            onChange={(e) => set("lastName", e.target.value)}
          />
          <div className="invalid-feedback d-block">
            {invalid("lastName") ? errors.lastName : "\u00A0"}
          </div>
        </div>

        {/* Email */}
        <div className="col-12 col-md-6">
          <label className={labelClass("email")}>
            Email <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            className={inputClass("email")}
            value={value.email}
            placeholder="Enter email address"
            onChange={(e) => set("email", e.target.value)}
          />
          <div className="invalid-feedback d-block">
            {invalid("email") ? errors.email : "\u00A0"}
          </div>
        </div>

        {/* Phone */}
        <div className="col-12 col-md-6">
          <label className={labelClass("phone")}>
            Phone Number <span className="text-danger">*</span>
          </label>
          <input
            className={inputClass("phone")}
            value={value.phone}
            placeholder="09xxxxxxxxx"
            inputMode="numeric"
            onChange={(e) => set("phone", e.target.value)}
          />
          <div className="invalid-feedback d-block">
            {invalid("phone") ? errors.phone : "\u00A0"}
          </div>
        </div>

        {/* Birth Date */}
        <div className="col-12 col-md-6">
          <label className={labelClass("birthDate")}>
            Birth Date <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className={inputClass("birthDate")}
            value={value.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
          />
          <div className="invalid-feedback d-block">
            {invalid("birthDate") ? errors.birthDate : "\u00A0"}
          </div>
        </div>

        {/* Gender */}
        <div className="col-12 col-md-6">
          <label className={labelClass("gender")}>
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
            {invalid("gender") ? errors.gender : "\u00A0"}
          </div>
        </div>

        {/* Address */}
        <div className="col-12">
          <label className={labelClass("address")}>
            Complete Address <span className="text-danger">*</span>
          </label>
          <textarea
            className={inputClass("address")}
            rows={3}
            value={value.address}
            placeholder="House/Unit No., Street, Barangay, City/Municipality, Province"
            onChange={(e) => set("address", e.target.value)}
          />
          <div className="invalid-feedback d-block">
            {invalid("address") ? errors.address : "\u00A0"}
          </div>
        </div>
      </div>
    </div>
  );
}
