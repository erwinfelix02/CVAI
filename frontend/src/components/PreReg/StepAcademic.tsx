import {
  GraduationCap,
  School,
  BookOpen,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { AcademicInfo } from "../../pages/PreReg/StudentPreRegistrationPage";

type Errors = Partial<Record<keyof AcademicInfo, string>>;
type Touched = Partial<Record<keyof AcademicInfo, boolean>>;

export default function StepAcademic({
  value,
  onChange,
  submitted,
  errors: externalErrors,
  courseOptions = [],
  coursesLoading = false,
}: {
  value: AcademicInfo;
  onChange: (v: AcademicInfo) => void;
  submitted: boolean;
  errors: Errors;
  courseOptions?: string[];
  coursesLoading?: boolean;
}) {
  const [localErrors, setLocalErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});

  const normalizeText = (v: string) =>
    v.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();

  const hasDangerChars = (v: string) => /[<>$`{};]/.test(v);

  const sanitizeSelect = (v: string) => normalizeText(v).slice(0, 40);

  const sanitizeSchool = (v: string) => {
    let s = normalizeText(v);
    s = s.replace(/[$`{}<>]/g, "");
    s = s.replace(/["\\;]/g, "");
    return s.slice(0, 120);
  };

  const allowedSchool = (v: string) => /^[a-zA-Z0-9\s.,'&()-]+$/.test(v);

  const validateField = (key: keyof AcademicInfo, rawVal: any) => {
    const val = typeof rawVal === "string" ? rawVal : "";

    if (hasDangerChars(val)) return "Invalid characters detected.";

    switch (key) {
      case "applicantType":
        if (!val.trim()) return "Applicant type is required.";
        if (!["Freshman", "Transferee", "Returning"].includes(val))
          return "Invalid applicant type.";
        break;

      case "course":
        if (!val.trim()) return "Course/Program is required.";

        // ✅ validate against active courses if we have them
        if (courseOptions.length > 0 && !courseOptions.includes(val)) {
          return "Invalid course selected.";
        }
        break;

      case "previousSchool":
        if (value.applicantType === "Transferee") {
          if (!val.trim()) return "Previous school is required.";
          if (val.trim().length < 3) return "Minimum 3 characters.";
          if (!allowedSchool(val)) return "Invalid characters in school name.";
        }
        break;
    }

    return "";
  };

  const validateAll = () => {
    const newErrors: Errors = {};

    (["applicantType", "course", "previousSchool"] as (keyof AcademicInfo)[]).forEach(
      (k) => {
        const msg = validateField(k, (value as any)[k] ?? "");
        if (msg) newErrors[k] = msg;
      },
    );

    setLocalErrors(newErrors);
  };

  useEffect(() => {
    if (submitted) validateAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, courseOptions]);

  const set = (k: keyof AcademicInfo, v: string) => {
    let newValue = v;

    if (k === "previousSchool") newValue = sanitizeSchool(v);
    else newValue = sanitizeSelect(v);

    if (k === "applicantType" && newValue !== "Transferee") {
      onChange({
        ...value,
        applicantType: newValue as any,
        previousSchool: "",
      });

      setLocalErrors((prev) => ({ ...prev, previousSchool: "" }));
      return;
    }

    onChange({ ...value, [k]: newValue });

    if (submitted || touched[k]) {
      const msg = validateField(k, newValue);
      setLocalErrors((prev) => ({ ...prev, [k]: msg }));
    }
  };

  const onBlurField = (k: keyof AcademicInfo) => {
    setTouched((prev) => ({ ...prev, [k]: true }));
    const msg = validateField(k, (value as any)[k] ?? "");
    setLocalErrors((prev) => ({ ...prev, [k]: msg }));
  };

  const invalid = (k: keyof AcademicInfo) =>
    (submitted || touched[k]) && !!(localErrors[k] || externalErrors[k]);

  const getError = (k: keyof AcademicInfo) =>
    localErrors[k] || externalErrors[k] || "";

  const inputClass = (k: keyof AcademicInfo) =>
    `form-control ${invalid(k) ? "is-invalid" : ""}`;

  const selectClass = (k: keyof AcademicInfo) =>
    `form-select ${invalid(k) ? "is-invalid" : ""}`;

  const labelClass = (k: keyof AcademicInfo) =>
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
        background: "rgba(148, 163, 184, 0.15)",
      }}
    >
      {children}
    </span>
  );

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
            <LabelIcon>
              <UserCheck size={14} />
            </LabelIcon>
            Applicant Type <span className="text-danger">*</span>
          </label>

          <select
            className={selectClass("applicantType")}
            value={value.applicantType}
            onChange={(e) => set("applicantType", e.target.value)}
            onBlur={() => onBlurField("applicantType")}
          >
            <option value="">Select applicant type</option>
            <option value="Freshman">New Student (Freshman)</option>
            <option value="Transferee">Transferee</option>
            <option value="Returning">Returning Student</option>
          </select>

          <div className="invalid-feedback d-block">
            {invalid("applicantType") ? getError("applicantType") : "\u00A0"}
          </div>
        </div>

        {/* Course */}
        <div className="col-12 col-md-6">
          <label className={labelClass("course")}>
            <LabelIcon>
              <BookOpen size={14} />
            </LabelIcon>
            Course/Program <span className="text-danger">*</span>
          </label>

          <select
            className={selectClass("course")}
            value={value.course}
            onChange={(e) => set("course", e.target.value)}
            onBlur={() => onBlurField("course")}
          >
            <option value="">
              {coursesLoading
                ? "Loading active courses..."
                : courseOptions.length
                  ? "Select course"
                  : "No active courses available"}
            </option>

            {courseOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="invalid-feedback d-block">
            {invalid("course") ? getError("course") : "\u00A0"}
          </div>
        </div>

        {/* Previous School */}
        {value.applicantType === "Transferee" && (
          <div className="col-12">
            <label className={labelClass("previousSchool")}>
              <LabelIcon>
                <School size={14} />
              </LabelIcon>
              Previous School <span className="text-danger">*</span>
            </label>

            <input
              type="text"
              className={inputClass("previousSchool")}
              value={value.previousSchool || ""}
              onChange={(e) => set("previousSchool", e.target.value)}
              onBlur={() => onBlurField("previousSchool")}
              placeholder="Enter previous school name"
            />

            <div className="invalid-feedback d-block">
              {invalid("previousSchool") ? getError("previousSchool") : "\u00A0"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}