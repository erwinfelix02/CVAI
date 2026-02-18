import { GraduationCap } from "lucide-react";
import type { AcademicInfo } from "../../pages/PreReg/StudentPreRegistrationPage";

type Errors = Partial<Record<keyof AcademicInfo, string>>;

export default function StepAcademic({
  value,
  onChange,
  submitted,
  errors,
}: {
  value: AcademicInfo;
  onChange: (v: AcademicInfo) => void;
  submitted: boolean;
  errors: Errors;
}) {
  const set = (k: keyof AcademicInfo, v: any) =>
    onChange({ ...value, [k]: v });

  const invalid = (k: keyof AcademicInfo) => submitted && !!errors[k];

  const labelClass = (k: keyof AcademicInfo) =>
    `form-label ${invalid(k) ? "is-invalid-label" : ""}`;

  const selectClass = (k: keyof AcademicInfo) =>
    `form-select ${invalid(k) ? "is-invalid is-invalid-placeholder" : ""}`;

  const inputClass = (k: keyof AcademicInfo) =>
    `form-control ${invalid(k) ? "is-invalid" : ""}`;

  return (
    <div className="prereg-step">
      <div className="prereg-step-header">
        <div className="d-flex align-items-center gap-2">
          <span className="prereg-step-header-icon" aria-hidden="true">
            <GraduationCap size={18} />
          </span>
          <h4 className="fw-bold mb-0">Academic Information</h4>
        </div>
      </div>

      <div className="row g-3">
        {/* Applicant Type */}
        <div className="col-12 col-md-6">
          <label className={labelClass("applicantType")}>
            Applicant Type <span className="text-danger">*</span>
          </label>
          <select
            className={selectClass("applicantType")}
            value={value.applicantType}
            onChange={(e) => set("applicantType", e.target.value)}
          >
            <option value="">Select applicant type</option>
            <option value="Freshman">New Student (Freshman)</option>
            <option value="Transferee">Transferee</option>
            <option value="Returning">Returning Student</option>
          </select>
          <div className="invalid-feedback d-block">
            {invalid("applicantType") ? errors.applicantType : "\u00A0"}
          </div>
        </div>

        {/* Course */}
        <div className="col-12 col-md-6">
          <label className={labelClass("course")}>
            Course/Program <span className="text-danger">*</span>
          </label>
          <select
            className={selectClass("course")}
            value={value.course}
            onChange={(e) => set("course", e.target.value)}
          >
            <option value="">Select course</option>
            <option value="BSIT">BSIT</option>
            <option value="BSCS">BSCS</option>
            <option value="BSA">BSA</option>
            <option value="BSBA">BSBA</option>
          </select>
          <div className="invalid-feedback d-block">
            {invalid("course") ? errors.course : "\u00A0"}
          </div>
        </div>


        {/* Conditional Field: Previous School (Only if Transferee) */}
        {value.applicantType === "Transferee" && (
          <div className="col-12">
            <label className={labelClass("previousSchool")}>
              Previous School <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={inputClass("previousSchool")}
              value={value.previousSchool || ""}
              onChange={(e) => set("previousSchool", e.target.value)}
              placeholder="Enter previous school name"
            />
            <div className="invalid-feedback d-block">
              {invalid("previousSchool")
                ? errors.previousSchool
                : "\u00A0"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
