import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Info } from "lucide-react";
import AuthAlert from "../../components/Authentication/AuthAlert";

import Stepper from "../../components/PreReg/Stepper";
import type { StepKey } from "../../components/PreReg/Stepper";
import PreRegNavbar from "../../components/PreReg/PreRegNavbar";

import StepPersonal from "../../components/PreReg/StepPersonal";
import StepAcademic from "../../components/PreReg/StepAcademic";
import StepDocuments from "../../components/PreReg/StepDocuments";
import StepReview from "../../components/PreReg/StepReview";

import "../../styles/prereg.css";

/* ================= TYPES ================= */

export type PersonalInfo = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  address: string;
};

export type AcademicInfo = {
  applicantType: "Freshman" | "Transferee" | "Returning" | "";
  course: string;
  previousSchool?: string;
};

export type DocumentsState = {
  birthCert?: File | null;
  form137?: File | null;
  goodMoral?: File | null;
  idPhoto?: File | null;
};

type PersonalErrors = Partial<Record<keyof PersonalInfo, string>>;
type AcademicErrors = Partial<Record<keyof AcademicInfo, string>>;
type DocsErrors = Partial<Record<keyof DocumentsState, string>>;

type RegistrarSettings = {
  academicYear: string;
  semester: string;
  enrollmentOpen: boolean;
  maxStudentsPerSection: number;
  processingDays: number;
  autoApproveSimpleDocs: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  updatedBy?: string;
};
type CourseOption = {
  code: string;
  name: string;
  yearLevels?: number;
  department?: string;
  status?: "Active" | "Inactive";
};
const steps: { key: StepKey; label: string }[] = [
  { key: "personal", label: "Personal Info" },
  { key: "academic", label: "Academic Info" },
  { key: "documents", label: "Documents" },
  { key: "review", label: "Review" },
];

/* ================= VALIDATORS ================= */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePersonal(v: PersonalInfo): PersonalErrors {
  const e: PersonalErrors = {};

  const req = (k: keyof PersonalInfo, msg: string) => {
    const val = String(v[k] ?? "").trim();
    if (!val) e[k] = msg;
  };

  req("firstName", "First name is required.");
  req("lastName", "Last name is required.");
  req("email", "Email is required.");
  req("phone", "Phone number is required.");
  req("birthDate", "Birth date is required.");
  req("gender", "Gender is required.");
  req("address", "Complete address is required.");

  if (v.email.trim() && !emailRegex.test(v.email.trim())) {
    e.email = "Enter a valid email (example@gmail.com).";
  }

 if (v.phone.trim()) {
  if (!/^\+639\d{9}$/.test(v.phone.trim())) {
    e.phone = "Use PH format: +639XXXXXXXXX.";
  }
}

  if (v.birthDate) {
    const chosen = new Date(v.birthDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (chosen > today) e.birthDate = "Birth date cannot be in the future.";
  }

  return e;
}

function validateAcademic(v: AcademicInfo): AcademicErrors {
  const e: AcademicErrors = {};

  if (!v.applicantType) e.applicantType = "Applicant type is required.";
  if (!v.course.trim()) e.course = "Course is required.";

  if (v.applicantType === "Transferee" && !v.previousSchool?.trim()) {
    e.previousSchool = "Previous school is required for transferees.";
  }

  return e;
}

function validateDocs(v: DocumentsState): DocsErrors {
  const e: DocsErrors = {};
  if (!v.birthCert) e.birthCert = "Birth Certificate is required.";
  if (!v.form137) e.form137 = "Form 137 / TOR is required.";
  if (!v.goodMoral) e.goodMoral = "Good Moral Certificate is required.";
  if (!v.idPhoto) e.idPhoto = "2x2 ID Photo is required.";
  return e;
}

function hasErrors(obj: Record<string, unknown>) {
  return Object.keys(obj).length > 0;
}

/* ================= PAGE ================= */

export default function StudentPreRegistrationPage() {
  const [activeStep, setActiveStep] = useState<StepKey>("personal");
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [showAlert, setShowAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [personal, setPersonal] = useState<PersonalInfo>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    address: "",
  });

  const [academic, setAcademic] = useState<AcademicInfo>({
    applicantType: "",
    course: "",
    previousSchool: "",
  });

  const [docs, setDocs] = useState<DocumentsState>({
    birthCert: null,
    form137: null,
    goodMoral: null,
    idPhoto: null,
  });

  const [registrarSettings, setRegistrarSettings] =
    useState<RegistrarSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setSettingsLoading(true);
        const res = await fetch("http://localhost:5000/api/registrar/settings");
        if (!res.ok) throw new Error("Failed to load registrar settings.");

        const data = await res.json();
        setRegistrarSettings(data);
      } catch (e) {
        console.error("Failed to load registrar settings:", e);
        setRegistrarSettings({
          academicYear: "",
          semester: "",
          enrollmentOpen: true,
          maxStudentsPerSection: 45,
          processingDays: 5,
          autoApproveSimpleDocs: false,
          emailNotifications: true,
          smsNotifications: false,
        });
      } finally {
        setSettingsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
  (async () => {
    try {
      setCoursesLoading(true);

      const res = await fetch("http://localhost:5000/api/courses?status=Active");
      if (!res.ok) throw new Error("Failed to load courses");

      const data = await res.json();

      const list: CourseOption[] = (Array.isArray(data) ? data : [])
  .filter((c: any) => (c.status ?? "Active") === "Active")
  .map((c: any): CourseOption => {
    const status: "Active" | "Inactive" =
      c.status === "Inactive" ? "Inactive" : "Active";

    return {
      code: String(c.code || "").trim().toUpperCase(),
      name: String(c.name || "").trim(),
      yearLevels: Number(c.yearLevels || 0),
      department: String(c.department || "").trim(),
      status,
    };
  })
  .filter((c) => c.code && c.name);

      const unique = Array.from(
        new Map(list.map((c) => [c.code, c])).values(),
      ).sort((a, b) => a.name.localeCompare(b.name));

      setCourseOptions(unique);
    } catch (e) {
      console.error("Failed to load courses:", e);
      setCourseOptions([]);
    } finally {
      setCoursesLoading(false);
    }
  })();
}, []);

  const [submitted, setSubmitted] = useState({
    personal: false,
    academic: false,
    documents: false,
  });

  const [personalErrors, setPersonalErrors] = useState<PersonalErrors>({});
  const [academicErrors, setAcademicErrors] = useState<AcademicErrors>({});
  const [docsErrors, setDocsErrors] = useState<DocsErrors>({});

  const stepIndex = useMemo(
    () => steps.findIndex((s) => s.key === activeStep),
    [activeStep],
  );

  useEffect(() => {
    if (submitted.personal) setPersonalErrors(validatePersonal(personal));
  }, [personal, submitted.personal]);

  useEffect(() => {
    if (submitted.academic) setAcademicErrors(validateAcademic(academic));
  }, [academic, submitted.academic]);

  useEffect(() => {
    if (submitted.documents) setDocsErrors(validateDocs(docs));
  }, [docs, submitted.documents]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const enrollmentOpen = registrarSettings?.enrollmentOpen ?? true;

  function validateCurrentStep(): boolean {
    if (activeStep === "personal") {
      setSubmitted((s) => ({ ...s, personal: true }));
      const e = validatePersonal(personal);
      setPersonalErrors(e);
      return !hasErrors(e as Record<string, unknown>);
    }

    if (activeStep === "academic") {
      setSubmitted((s) => ({ ...s, academic: true }));
      const e = validateAcademic(academic);
      setAcademicErrors(e);
      return !hasErrors(e as Record<string, unknown>);
    }

    if (activeStep === "documents") {
      setSubmitted((s) => ({ ...s, documents: true }));
      const e = validateDocs(docs);
      setDocsErrors(e);
      return !hasErrors(e as Record<string, unknown>);
    }

    return true;
  }

  function goNext() {
    const ok = validateCurrentStep();
    if (!ok) return;

    const next = steps[stepIndex + 1]?.key;
    if (next) setActiveStep(next);
  }

  function goPrev() {
    const prev = steps[stepIndex - 1]?.key;
    if (prev) setActiveStep(prev);
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    setSubmitted({ personal: true, academic: true, documents: true });
    setShowAlert(false);

    const pe = validatePersonal(personal);
    const ae = validateAcademic(academic);
    const de = validateDocs(docs);

    setPersonalErrors(pe);
    setAcademicErrors(ae);
    setDocsErrors(de);

    if (
      hasErrors(pe as Record<string, unknown>) ||
      hasErrors(ae as Record<string, unknown>) ||
      hasErrors(de as Record<string, unknown>)
    ) {
      if (hasErrors(pe as Record<string, unknown>)) setActiveStep("personal");
      else if (hasErrors(ae as Record<string, unknown>))
        setActiveStep("academic");
      else setActiveStep("documents");

      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ personal, academic }));

      if (docs.birthCert) formData.append("birthCert", docs.birthCert);
      if (docs.form137) formData.append("form137", docs.form137);
      if (docs.goodMoral) formData.append("goodMoral", docs.goodMoral);
      if (docs.idPhoto) formData.append("idPhoto", docs.idPhoto);

      const response = await fetch(
        "http://localhost:5000/api/preregistrations",
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.status === 403) {
        const body = await response.json().catch(() => null);
        setAlertMessage(body?.message || "Registration is not open.");
        setAlertType("error");
        setShowAlert(true);
        return;
      }

      if (response.status === 409) {
        const body = await response.json().catch(() => null);
        setAlertMessage(body?.message || "Duplicate application found.");
        setAlertType("error");
        setShowAlert(true);
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Submission failed");
      }

      setAlertMessage("Application submitted successfully!");
      setAlertType("success");
      setShowAlert(true);

      setTimeout(() => navigate("/"), 2500);
    } catch (err: any) {
      setAlertMessage(
        err?.message || "Something went wrong. Please try again.",
      );
      setAlertType("error");
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleStepChange(nextKey: StepKey) {
    const nextIndex = steps.findIndex((s) => s.key === nextKey);

    if (nextIndex <= stepIndex) {
      setActiveStep(nextKey);
      return;
    }

    const ok = validateCurrentStep();
    if (!ok) return;

    setActiveStep(nextKey);
  }

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={showAlert}
        loading={false}
      />

      <div className="prereg-shell">
        <PreRegNavbar />

        <div className="container prereg-back-wrap">
          <button
            type="button"
            className="prereg-back-btn d-inline-flex align-items-center gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>

        <div className="container prereg-page">
          <div className="text-center prereg-hero">
            <h1 className="fw-bold prereg-title">Student Pre-Registration</h1>

            {settingsLoading ? null : enrollmentOpen ? (
              <p className="text-muted mb-0">
                Complete the form below to submit your enrollment application
              </p>
            ) : null}
          </div>

          <div className="card prereg-card">
            <div className="card-body prereg-card-body">
              {settingsLoading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                  />
                  <p className="mb-0 text-muted">
                    Loading registration settings...
                  </p>
                </div>
              ) : !enrollmentOpen ? (
                <div className="prereg-closed-state">
                  <Info size={52} className="mb-3 text-info" />
                  <h3 className="fw-bold mb-2">Registration is not open</h3>
                  <p className="text-muted mb-1">
                    Pre-registration is currently closed by the registrar.
                  </p>
                  {(registrarSettings?.academicYear ||
                    registrarSettings?.semester) && (
                    <p className="text-muted mb-0">
                      Current term:{" "}
                      <strong>
                        {registrarSettings?.academicYear} -{" "}
                        {registrarSettings?.semester}
                      </strong>
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-center prereg-stepper-wrap">
                    <Stepper
                      steps={steps}
                      active={activeStep}
                      onChange={handleStepChange}
                    />
                  </div>

                  {activeStep === "personal" && (
                    <StepPersonal
                      value={personal}
                      onChange={setPersonal}
                      submitted={submitted.personal}
                      errors={personalErrors}
                    />
                  )}

                  {activeStep === "academic" && (
                    <StepAcademic
                      value={academic}
                      onChange={setAcademic}
                      submitted={submitted.academic}
                      errors={academicErrors}
                      courseOptions={courseOptions}
                      coursesLoading={coursesLoading}
                    />
                  )}

                  {activeStep === "documents" && (
                    <StepDocuments
                      value={docs}
                      onChange={setDocs}
                      submitted={submitted.documents}
                      errors={docsErrors}
                    />
                  )}

                  {activeStep === "review" && (
                    <StepReview
                      personal={personal}
                      academic={academic}
                      docs={docs}
                    />
                  )}

                  <div className="prereg-footer">
                    <div className="prereg-footer-left">
                      {stepIndex > 0 && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary prereg-btn d-inline-flex align-items-center gap-2"
                          onClick={goPrev}
                        >
                          <ArrowLeft size={16} />
                          <span>Previous</span>
                        </button>
                      )}
                    </div>

                    <div className="prereg-footer-right">
                      {activeStep !== "review" ? (
                        <button
                          type="button"
                          className="btn btn-primary prereg-btn d-inline-flex align-items-center gap-2"
                          onClick={goNext}
                        >
                          <span>Next</span>
                          <ArrowRight size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          className="btn btn-primary prereg-btn d-inline-flex align-items-center gap-2"
                          onClick={handleSubmit}
                        >
                          <CheckCircle2 size={16} />
                          <span>
                            {isSubmitting
                              ? "Submitting..."
                              : "Submit Application"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
