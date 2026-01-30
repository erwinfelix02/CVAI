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

        {/* Year Level */}
        <div className="col-12 col-md-6">
          <label className={labelClass("yearLevel")}>
            Year Level <span className="text-danger">*</span>
          </label>
          <select
            className={selectClass("yearLevel")}
            value={value.yearLevel}
            onChange={(e) => set("yearLevel", e.target.value)}
          >
            <option value="">Select year level</option>
            <option value="Year 1">Year 1</option>
            <option value="Year 2">Year 2</option>
            <option value="Year 3">Year 3</option>
            <option value="Year 4">Year 4</option>
          </select>
          <div className="invalid-feedback d-block">
            {invalid("yearLevel") ? errors.yearLevel : "\u00A0"}
          </div>
        </div>

        {/* Transferee */}
        <div className="col-12">
          <label className={labelClass("transferee")}>
            Are you a transferee? <span className="text-danger">*</span>
          </label>
          <select
            className={selectClass("transferee")}
            value={value.transferee}
            onChange={(e) => set("transferee", e.target.value)}
          >
            <option value="">Select option</option>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
          <div className="invalid-feedback d-block">
            {invalid("transferee") ? errors.transferee : "\u00A0"}
          </div>
        </div>
      </div>
    </div>
  );
}
