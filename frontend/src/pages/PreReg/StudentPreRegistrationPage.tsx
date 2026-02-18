import { useMemo, useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
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
    const digits = v.phone.replace(/\D/g, "");
    if (!/^09\d{9}$/.test(digits)) {
      e.phone = "Use PH format: 09xxxxxxxxx (11 digits).";
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

  // ✅ show validation only after user tries to go next
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

  // ✅ update error live AFTER first submit click
  useEffect(() => {
    if (submitted.personal) setPersonalErrors(validatePersonal(personal));
  }, [personal, submitted.personal]);

  useEffect(() => {
    if (submitted.academic) setAcademicErrors(validateAcademic(academic));
  }, [academic, submitted.academic]);

  useEffect(() => {
    if (submitted.documents) setDocsErrors(validateDocs(docs));
  }, [docs, submitted.documents]);
// 🔥 Auto-hide alert after 3 seconds
useEffect(() => {
  if (showAlert) {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 3000);

    return () => clearTimeout(timer);
  }
}, [showAlert]);

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
    if (isSubmitting) return; // 🔒 prevent double click
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

      // attach JSON data
      formData.append(
        "data",
        JSON.stringify({
          personal,
          academic,
        }),
      );

      // attach files
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

      if (!response.ok) throw new Error("Submission failed");

      setAlertMessage("Application submitted successfully!");
      setAlertType("success");
      setShowAlert(true);

      // Redirect after 2.5 seconds
      setTimeout(() => {
        navigate("/"); // landing page
      }, 2500);
    } catch (err) {
       setAlertMessage("Something went wrong. Please try again.");
    setAlertType("error");
    setShowAlert(true);
    setIsSubmitting(false);
    }
  }

  function handleStepChange(nextKey: StepKey) {
    const nextIndex = steps.findIndex((s) => s.key === nextKey);

    // ✅ allow going back freely
    if (nextIndex <= stepIndex) {
      setActiveStep(nextKey);
      return;
    }

    // ✅ going forward: validate current step and show red
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

        {/* BACK BUTTON */}
        <div className="container prereg-back-wrap">
          <button
            type="button"
            className="prereg-back-btn d-inline-flex align-items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>

        <div className="container prereg-page">
          {/* Hero */}
          <div className="text-center prereg-hero">
            <h1 className="fw-bold prereg-title">Student Pre-Registration</h1>
            <p className="text-muted mb-0">
              Complete the form below to submit your enrollment application
            </p>
          </div>

          {/* Stepper */}
          <div className="d-flex justify-content-center prereg-stepper-wrap">
            <Stepper
              steps={steps}
              active={activeStep}
              onChange={handleStepChange}
            />
          </div>

          {/* Card */}
          <div className="card prereg-card">
            <div className="card-body prereg-card-body">
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

              {/* FOOTER */}
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
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
