import { useEffect, useMemo, useRef, useState } from "react";
import { X, User, FileText, MapPin, CheckCircle2 } from "lucide-react";
import type { SectionItem } from "../../Registrar/Sections/types";
import type { EnrollmentItem } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  student: EnrollmentItem | null;
  sections: SectionItem[];
  loading?: boolean;

  onEnroll: (args: {
    enrollmentId: string;
    updatedInfo: {
      fullName: string;
      studentId: string;
      email: string;
      phone: string;
      address: string;
      birthDate: string;
      birthdate?: string;
      guardian: string;
      guardianPhone: string;
      program: string;
      yearLevel: string;
      department: string;
    };
    notes: string;
    verifiedDocs: string[];
  }) => Promise<void> | void;
};

const requiredDocs = [
  "Form 137 / Report Card",
  "PSA Birth Certificate",
  "Certificate of Good Moral Character",
  "2x2 ID Photos (4 copies)",
  "Medical Certificate",
  "Entrance Exam Results",
];

const yearOptions = ["1", "2", "3", "4", "5"];
const currentYear = new Date().getFullYear();
const studentIdPrefix = `GIP-${currentYear}-`;

function toISODate(value?: string) {
  if (!value) return "";

  const raw = String(value).trim();

  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.slice(0, 10);

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return /^\+639\d{9}$/.test(value.trim());
}

function isValidName(value: string) {
  return /^[A-Za-z .,'-]+$/.test(value);
}

function isValidAddress(value: string) {
  return value.trim().length >= 5;
}

function isValidBirthdate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizePHPhone(value: string) {
  const cleaned = value.replace(/\s+/g, "").trim();

  if (/^09\d{9}$/.test(cleaned)) return `+63${cleaned.slice(1)}`;
  if (/^639\d{9}$/.test(cleaned)) return `+${cleaned}`;
  if (/^\+639\d{9}$/.test(cleaned)) return cleaned;

  return cleaned;
}

type InitialSnapshot = {
  fullName: string;
  studentId: string;
  program: string;
  yearLevel: string;
  email: string;
  phone: string;
  address: string;
  birthdate: string;
  guardian: string;
  guardianPhone: string;
  notes: string;
  finalConfirm: boolean;
  docsChecked: Record<string, boolean>;
};

function makeEmptyDocsState() {
  const next: Record<string, boolean> = {};
  requiredDocs.forEach((d) => {
    next[d] = false;
  });
  return next;
}

export default function EnrollmentEvaluationModal({
  open,
  onClose,
  student,
  sections,
  loading = false,
  onEnroll,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [program, setProgram] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [guardian, setGuardian] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  const [docsChecked, setDocsChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [finalConfirm, setFinalConfirm] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const submittingRef = useRef(false);

  const [showStep1Errors, setShowStep1Errors] = useState(false);
  const [showStep2Errors, setShowStep2Errors] = useState(false);
  const [showStep3Errors, setShowStep3Errors] = useState(false);

  const [idLoading, setIdLoading] = useState(false);
  const [idError, setIdError] = useState("");

  const [initialSnapshot, setInitialSnapshot] = useState<InitialSnapshot>({
    fullName: "",
    studentId: "",
    program: "",
    yearLevel: "",
    email: "",
    phone: "",
    address: "",
    birthdate: "",
    guardian: "",
    guardianPhone: "",
    notes: "",
    finalConfirm: false,
    docsChecked: makeEmptyDocsState(),
  });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const programOptions = useMemo(() => {
    const set = new Set<string>();

    sections.forEach((s) => {
      const value = (s as any).program || (s as any).course;
      if (value) set.add(String(value));
    });

    const currentProgram =
      student?.academic?.program || student?.academic?.course || "";

    if (currentProgram) {
      set.add(String(currentProgram));
    }

    const arr = Array.from(set);

    return arr.length === 0
      ? ["BS Computer Science", "BS Information Technology"]
      : arr;
  }, [sections, student]);

  useEffect(() => {
    if (!open || !student) return;

    setStep(1);
    setConfirmOpen(false);
    setDiscardOpen(false);
    submittingRef.current = false;

    setShowStep1Errors(false);
    setShowStep2Errors(false);
    setShowStep3Errors(false);

    const computedName =
      student.studentName ||
      `${student.personal?.firstName ?? ""} ${student.personal?.lastName ?? ""}`.trim();

    const nextFullName = computedName;
    const nextEmail = student.email || student.personal?.email || "";
    const nextPhone = normalizePHPhone(student.personal?.phone || "");
    const nextAddress = student.personal?.address || "";
    const nextBirthdate = toISODate(
      student.personal?.birthDate || student.personal?.birthdate || "",
    );
    const nextGuardian = student.personal?.guardian || "";
    const nextGuardianPhone = normalizePHPhone(student.personal?.guardianPhone || "");
    const nextProgram = student.academic?.program || student.academic?.course || "";
    const nextYearLevel = student.academic?.yearLevel?.toString() || "";

    setFullName(nextFullName);
    setEmail(nextEmail);
    setPhone(nextPhone);
    setAddress(nextAddress);
    setBirthdate(nextBirthdate);
    setGuardian(nextGuardian);
    setGuardianPhone(nextGuardianPhone);
    setProgram(nextProgram);
    setYearLevel(nextYearLevel);

    setStudentId("");
    setIdError("");
    setNotes("");
    setFinalConfirm(false);

    const initialDocs = makeEmptyDocsState();
    setDocsChecked(initialDocs);

    setInitialSnapshot({
      fullName: nextFullName,
      studentId: "",
      program: nextProgram,
      yearLevel: nextYearLevel,
      email: nextEmail,
      phone: nextPhone,
      address: nextAddress,
      birthdate: nextBirthdate,
      guardian: nextGuardian,
      guardianPhone: nextGuardianPhone,
      notes: "",
      finalConfirm: false,
      docsChecked: initialDocs,
    });
  }, [open, student]);

  useEffect(() => {
    if (!open || !student?._id) return;

    let cancelled = false;

    const loadPreviewStudentId = async () => {
      try {
        setIdLoading(true);
        setIdError("");

        const res = await fetch(
          `/api/enrollment/${student._id}/reserve-student-id`,
          { method: "GET" },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to preview student ID.");
        }

        if (!cancelled) {
          const previewId = data?.studentIdNumber || "";
          setStudentId(previewId);

          if (!previewId) {
            setIdError("Failed to load automatic student ID.");
          }

          setInitialSnapshot((prev) => ({
            ...prev,
            studentId: previewId,
          }));
        }
      } catch (err: any) {
        if (!cancelled) {
          setStudentId("");
          setIdError(err?.message || "Failed to load automatic student ID.");
          setInitialSnapshot((prev) => ({
            ...prev,
            studentId: "",
          }));
        }
      } finally {
        if (!cancelled) {
          setIdLoading(false);
        }
      }
    };

    loadPreviewStudentId();

    return () => {
      cancelled = true;
    };
  }, [open, student]);

  const verifiedCount = useMemo(
    () => Object.values(docsChecked).filter(Boolean).length,
    [docsChecked],
  );

  const hasUnsavedChanges = useMemo(() => {
    const docsChanged = requiredDocs.some(
      (doc) => !!docsChecked[doc] !== !!initialSnapshot.docsChecked[doc],
    );

    return (
      fullName !== initialSnapshot.fullName ||
      studentId !== initialSnapshot.studentId ||
      program !== initialSnapshot.program ||
      yearLevel !== initialSnapshot.yearLevel ||
      email !== initialSnapshot.email ||
      phone !== initialSnapshot.phone ||
      address !== initialSnapshot.address ||
      birthdate !== initialSnapshot.birthdate ||
      guardian !== initialSnapshot.guardian ||
      guardianPhone !== initialSnapshot.guardianPhone ||
      notes !== initialSnapshot.notes ||
      finalConfirm !== initialSnapshot.finalConfirm ||
      docsChanged
    );
  }, [
    fullName,
    studentId,
    program,
    yearLevel,
    email,
    phone,
    address,
    birthdate,
    guardian,
    guardianPhone,
    notes,
    finalConfirm,
    docsChecked,
    initialSnapshot,
  ]);

  const shouldWarnBeforeUnload =
    open && hasUnsavedChanges && !confirmOpen && !loading && !idLoading;

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
    if (loading || idLoading) return;

    if (confirmOpen) {
      setConfirmOpen(false);
      return;
    }

    if (hasUnsavedChanges) {
      setDiscardOpen(true);
      return;
    }

    onClose();
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (loading || idLoading) return;

        if (confirmOpen) {
          setConfirmOpen(false);
          return;
        }

        if (discardOpen) {
          setDiscardOpen(false);
          return;
        }

        requestClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, confirmOpen, discardOpen, loading, idLoading, hasUnsavedChanges]);

  const studentIdValid = new RegExp(`^GIP-${currentYear}-\\d{3}$`).test(
    studentId.trim(),
  );

  const step1Errors = {
    fullName: !fullName.trim()
      ? "Full Name is required."
      : !isValidName(fullName.trim())
        ? "Full Name contains invalid characters. Use letters, spaces, apostrophes, commas, periods, or hyphens only."
        : "",
    studentId: idLoading
      ? ""
      : idError
        ? idError
        : !studentId.trim()
          ? "Student ID could not be generated."
          : !studentIdValid
            ? `Student ID Number must follow the format ${studentIdPrefix}###.`
            : "",
    program: !program.trim() ? "Course / Program is required." : "",
    yearLevel: !yearLevel.trim() ? "Year Level is required." : "",
    email: !email.trim()
      ? "Email is required."
      : !isValidEmail(email.trim())
        ? "Email is invalid. Enter a valid email address like name@example.com."
        : "",
    phone: !phone.trim()
      ? "Phone is required."
      : !isValidPhone(phone.trim())
        ? "Phone is invalid. Use +639XXXXXXXXX."
        : "",
    address: !address.trim()
      ? "Address is required."
      : !isValidAddress(address.trim())
        ? "Address is too short. Please enter a more complete address."
        : "",
    birthdate: !birthdate.trim()
      ? "Birthdate is required."
      : !isValidBirthdate(birthdate.trim())
        ? "Birthdate is invalid. Select a valid date."
        : "",
    guardian: !guardian.trim()
      ? "Guardian is required."
      : !isValidName(guardian.trim())
        ? "Guardian name contains invalid characters. Use letters, spaces, apostrophes, commas, periods, or hyphens only."
        : "",
    guardianPhone: !guardianPhone.trim()
      ? "Guardian Phone is required."
      : !isValidPhone(guardianPhone.trim())
        ? "Guardian Phone is invalid. Use +639XXXXXXXXX."
        : "",
  };

  const step1Valid = Object.values(step1Errors).every((v) => !v);
  const step2Valid = verifiedCount > 0;
  const step3Valid = finalConfirm;

  const fullNameError =
    showStep1Errors || fullName.trim() ? step1Errors.fullName : "";
  const studentIdError = showStep1Errors ? step1Errors.studentId : "";
  const programError =
    showStep1Errors || program.trim() ? step1Errors.program : "";
  const yearLevelError =
    showStep1Errors || yearLevel.trim() ? step1Errors.yearLevel : "";
  const emailError = showStep1Errors || email.trim() ? step1Errors.email : "";
  const phoneError = showStep1Errors || phone.trim() ? step1Errors.phone : "";
  const addressError =
    showStep1Errors || address.trim() ? step1Errors.address : "";
  const birthdateError =
    showStep1Errors || birthdate.trim() ? step1Errors.birthdate : "";
  const guardianError =
    showStep1Errors || guardian.trim() ? step1Errors.guardian : "";
  const guardianPhoneError =
    showStep1Errors || guardianPhone.trim()
      ? step1Errors.guardianPhone
      : "";

  if (!open || !student) return null;

  const goNext = () => {
    if (step === 1) {
      setShowStep1Errors(true);
      if (!step1Valid || idLoading) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      setShowStep2Errors(true);
      if (!step2Valid) return;
      setStep(3);
    }
  };

  const goBack = () => setStep((s) => (s === 3 ? 2 : 1));

  const onEnrollClick = () => {
    if (loading || idLoading) return;

    setShowStep1Errors(true);
    setShowStep2Errors(true);
    setShowStep3Errors(true);

    if (!step1Valid || !step2Valid || !step3Valid) return;

    setConfirmOpen(true);
  };

  const confirmEnroll = async () => {
    if (submittingRef.current || loading || idLoading) return;
    submittingRef.current = true;

    const verifiedDocs = Object.entries(docsChecked)
      .filter(([, v]) => v)
      .map(([k]) => k);

    try {
      await onEnroll({
        enrollmentId: student._id,
        updatedInfo: {
          fullName: fullName.trim(),
          studentId: studentId.trim(),
          email: email.trim(),
          phone: normalizePHPhone(phone.trim()),
          address: address.trim(),
          birthDate: birthdate.trim(),
          birthdate: birthdate.trim(),
          guardian: guardian.trim(),
          guardianPhone: normalizePHPhone(guardianPhone.trim()),
          program: program.trim(),
          yearLevel: yearLevel.trim(),
          department: (student.academic?.department || program).trim(),
        },
        notes: notes.trim(),
        verifiedDocs,
      });

      setConfirmOpen(false);
      setDiscardOpen(false);
      onClose();
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div
      className="enroll-eval-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Enrollment Evaluation"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !confirmOpen &&
          !discardOpen &&
          !loading &&
          !idLoading
        ) {
          requestClose();
        }
      }}
    >
      <div
        className="enroll-eval-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="enroll-eval-header">
          <div className="fw-bold fs-4">Enrollment Evaluation</div>
          <button
            type="button"
            className="enroll-icon-btn enroll-icon-btn-sm"
            onClick={requestClose}
            aria-label="Close"
            title="Close"
            disabled={confirmOpen || loading || idLoading}
          >
            <X size={16} />
          </button>
        </div>

        <div className="enroll-stepper">
          <StepItem
            icon={<User size={18} />}
            label="Student Info"
            active={step === 1}
            done={step > 1}
          />
          <StepLine active={step >= 2} />
          <StepItem
            icon={<FileText size={18} />}
            label="Documents"
            active={step === 2}
            done={step > 2}
          />
          <StepLine active={step >= 3} />
          <StepItem
            icon={<MapPin size={18} />}
            label="Finalize"
            active={step === 3}
            done={false}
          />
        </div>

        <div className="enroll-eval-body">
          {step === 1 && (
            <>
              <div className="text-muted mb-3">
                Fill in missing info (required) and verify everything is
                correct.
              </div>

              <div className="text-muted small mb-3">
                Application ID:{" "}
                <span className="fw-semibold">{student.registrationId}</span>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="row g-3">
                    <FieldInput
                      label="Full Name"
                      value={fullName}
                      onChange={setFullName}
                      required
                      error={fullNameError}
                    />

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Student ID Number <span className="text-danger">*</span>
                      </label>
                      <input
                        className={`form-control ${studentIdError ? "is-invalid" : ""}`}
                        value={idLoading ? "Loading..." : studentId}
                        disabled
                        readOnly
                        style={{
                          opacity: 1,
                          backgroundColor: "#e9ecef",
                          cursor: "not-allowed",
                        }}
                        placeholder={`${studentIdPrefix}001`}
                      />
                      <div className="text-muted small mt-1">
                        Auto-generated preview only. Final ID is assigned on save.
                      </div>
                      {studentIdError ? (
                        <div className="text-danger small mt-1">
                          {studentIdError}
                        </div>
                      ) : null}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Course / Program <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${programError ? "is-invalid" : ""}`}
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
                      >
                        <option value="">Select course/program...</option>
                        {programOptions.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      {programError ? (
                        <div className="text-danger small mt-1">
                          {programError}
                        </div>
                      ) : null}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Year Level <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${yearLevelError ? "is-invalid" : ""}`}
                        value={yearLevel}
                        onChange={(e) => setYearLevel(e.target.value)}
                      >
                        <option value="">Select year level...</option>
                        {yearOptions.map((y) => (
                          <option key={y} value={y}>
                            Year {y}
                          </option>
                        ))}
                      </select>
                      {yearLevelError ? (
                        <div className="text-danger small mt-1">
                          {yearLevelError}
                        </div>
                      ) : null}
                    </div>

                    <FieldInput
                      label="Email"
                      value={email}
                      onChange={setEmail}
                      required
                      error={emailError}
                    />

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <input
                        className={`form-control ${phoneError ? "is-invalid" : ""}`}
                        value={phone || "+639"}
                        onChange={(e) => {
                          let value = e.target.value;
                          let digits = value.replace(/\D/g, "");

                          if (!digits.startsWith("639")) {
                            if (digits.startsWith("9")) digits = "63" + digits;
                            else digits = "639";
                          }

                          digits = digits.slice(0, 12);
                          setPhone("+" + digits);
                        }}
                        onFocus={() => {
                          if (!phone) setPhone("+639");
                        }}
                        placeholder="+639XXXXXXXXX"
                      />
                      {phoneError && (
                        <div className="text-danger small mt-1">
                          {phoneError}
                        </div>
                      )}
                    </div>

                    <FieldInput
                      label="Address"
                      value={address}
                      onChange={setAddress}
                      required
                      error={addressError}
                    />

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Birthdate <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${birthdateError ? "is-invalid" : ""}`}
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                      />
                      {birthdateError ? (
                        <div className="text-danger small mt-1">
                          {birthdateError}
                        </div>
                      ) : null}
                    </div>

                    <FieldInput
                      label="Guardian"
                      value={guardian}
                      onChange={setGuardian}
                      required
                      error={guardianError}
                    />

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Guardian Phone <span className="text-danger">*</span>
                      </label>

                      <input
                        className={`form-control ${guardianPhoneError ? "is-invalid" : ""}`}
                        value={guardianPhone}
                        onChange={(e) => {
                          let digits = e.target.value.replace(/\D/g, "");

                          if (digits.startsWith("9")) {
                            digits = "63" + digits;
                          }

                          if (!digits.startsWith("639")) {
                            digits = "639";
                          }

                          digits = digits.slice(0, 12);

                          setGuardianPhone("+" + digits);
                        }}
                        onFocus={() => {
                          if (!guardianPhone) setGuardianPhone("+639");
                        }}
                        placeholder="Enter mobile number"
                      />

                      {guardianPhoneError && (
                        <div className="text-danger small mt-1">
                          {guardianPhoneError}
                        </div>
                      )}
                    </div>
                  </div>

                  {showStep1Errors && !step1Valid ? (
                    <div className="text-danger small mt-3">
                      Please fix the highlighted fields before continuing.
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-muted mb-3">
                Check that all required documents have been submitted and are
                valid.
              </div>

              <div className="d-flex flex-column gap-2">
                {requiredDocs.map((d) => {
                  const checked = !!docsChecked[d];
                  return (
                    <div key={d} className="enroll-doc-row">
                      <div className="d-flex align-items-center gap-3">
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          checked={checked}
                          onChange={(e) =>
                            setDocsChecked((p) => ({
                              ...p,
                              [d]: e.target.checked,
                            }))
                          }
                        />
                        <div className="fw-semibold">{d}</div>
                      </div>

                      {checked ? (
                        <CheckCircle2 className="text-success" size={18} />
                      ) : (
                        <span />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="enroll-doc-progress mt-3">
                <div className="text-muted small">
                  {verifiedCount} / {requiredDocs.length} documents verified
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${Math.round(
                        (verifiedCount / requiredDocs.length) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {showStep2Errors && !step2Valid ? (
                <div className="text-danger small mt-3">
                  Please verify at least one document before continuing.
                </div>
              ) : null}
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-muted mb-3">
                Finalize this evaluation and submit.
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Evaluation Notes{" "}
                  <span className="text-muted">(Optional)</span>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Add any notes about this enrollment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <label className="d-flex align-items-center gap-2 mb-0">
                    <input
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={finalConfirm}
                      onChange={(e) => setFinalConfirm(e.target.checked)}
                    />
                    <span>
                      I confirm the information and documents are correct.
                    </span>
                  </label>

                  {showStep3Errors && !step3Valid ? (
                    <div className="text-danger small mt-2">
                      Please check the confirmation box before enrolling.
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="enroll-eval-footer">
          <div>
            {step > 1 ? (
              <button
                className="btn btn-light"
                onClick={goBack}
                disabled={loading || confirmOpen || discardOpen || idLoading}
              >
                Back
              </button>
            ) : null}
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-light"
              onClick={requestClose}
              disabled={loading || confirmOpen || idLoading}
            >
              Cancel
            </button>

            {step < 3 ? (
              <button
                className="btn btn-primary"
                onClick={goNext}
                disabled={loading || confirmOpen || discardOpen || idLoading}
              >
                Next
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={onEnrollClick}
                disabled={loading || confirmOpen || discardOpen || idLoading}
              >
                Enroll
              </button>
            )}
          </div>
        </div>

        {confirmOpen ? (
          <div
            className="enroll-confirm-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Enrollment"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setConfirmOpen(false);
            }}
          >
            <div
              className="enroll-confirm-popup"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="enroll-confirm-header d-flex align-items-center justify-content-between">
                <div className="enroll-confirm-title mb-0">Confirm Enrollment</div>
                <button
                  type="button"
                  className="enroll-icon-btn enroll-icon-btn-sm"
                  onClick={() => setConfirmOpen(false)}
                  aria-label="Close"
                  title="Close"
                  disabled={loading || idLoading}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="enroll-confirm-body">
                <div className="fw-semibold mb-1">
                  Are you sure you want to enroll this student?
                </div>
                <div className="text-muted small">
                  This will submit the evaluation, save the verified details,
                  and mark the student as enrolled.
                </div>
              </div>

              <div className="enroll-confirm-actions">
                <button
                  className="btn btn-light"
                  onClick={() => setConfirmOpen(false)}
                  disabled={loading || idLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={confirmEnroll}
                  disabled={loading || idLoading}
                >
                  Yes, Enroll
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {discardOpen ? (
          <div
            className="enroll-confirm-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Discard Enrollment Changes"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setDiscardOpen(false);
            }}
          >
            <div
              className="enroll-confirm-popup"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="enroll-confirm-header d-flex align-items-center justify-content-between">
                <div className="enroll-confirm-title mb-0">Discard changes?</div>
                <button
                  type="button"
                  className="enroll-icon-btn enroll-icon-btn-sm"
                  onClick={() => setDiscardOpen(false)}
                  aria-label="Close"
                  title="Close"
                  disabled={loading || idLoading}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="enroll-confirm-body">
                <div className="fw-semibold mb-1">
                  You have unsaved input in this evaluation.
                </div>
                <div className="text-muted small">
                  Closing this modal will discard your changes.
                </div>
              </div>

              <div className="enroll-confirm-actions">
                <button
                  className="btn btn-light"
                  onClick={() => setDiscardOpen(false)}
                  disabled={loading || idLoading}
                >
                  Keep Editing
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setDiscardOpen(false);
                    setConfirmOpen(false);
                    onClose();
                  }}
                  disabled={loading || idLoading}
                >
                  Discard & Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StepItem({
  icon,
  label,
  active,
  done,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`enroll-step ${active ? "active" : ""} ${done ? "done" : ""}`}
    >
      <div className="enroll-step-icon">{icon}</div>
      <div className="enroll-step-label">{label}</div>
    </div>
  );
}

function StepLine({ active }: { active: boolean }) {
  return <div className={`enroll-step-line ${active ? "active" : ""}`} />;
}

function FieldInput({
  label,
  value,
  onChange,
  required,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="col-12 col-md-6">
      <label className="form-label fw-semibold">
        {label} {required ? <span className="text-danger">*</span> : null}
      </label>
      <input
        className={`form-control ${error ? "is-invalid" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
      />
      {error ? <div className="text-danger small mt-1">{error}</div> : null}
    </div>
  );
}