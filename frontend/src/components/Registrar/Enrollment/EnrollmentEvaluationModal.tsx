import { useEffect, useMemo, useRef, useState } from "react";
import { X, User, FileText, MapPin, CheckCircle2 } from "lucide-react";
import type { SectionItem } from "../../Registrar/Sections/types";

/* ================= TYPES ================= */

type EnrollmentItem = {
  _id: string;
  registrationId: string;
  studentName?: string;
  email?: string;
  status: "Scheduled" | "Enrolled" | "Cancelled";
  personal?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    birthdate?: string; // ✅ from DB
    guardian?: string;
    guardianPhone?: string;
  };
  academic?: {
    program?: string;
    yearLevel?: string | number;
    department?: string;
  };
};

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
      birthdate: string;
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

function toISODate(value?: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
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

  // STEP 1 fields
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

  // STEP 2 docs
  const [docsChecked, setDocsChecked] = useState<Record<string, boolean>>({});

  // STEP 3 final
  const [notes, setNotes] = useState("");
  const [finalConfirm, setFinalConfirm] = useState(false);

  // ✅ CONFIRM POPUP
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submittingRef = useRef(false);

  // lock scroll (main modal)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // esc close (close confirm first)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmOpen) setConfirmOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, confirmOpen]);

  const programOptions = useMemo(() => {
    const set = new Set<string>();
    sections.forEach((s) => {
      if (s.program) set.add(String(s.program));
    });
    const arr = Array.from(set);
    if (arr.length === 0) return ["BS Computer Science", "BS Information Technology"];
    return arr;
  }, [sections]);

  // reset on open
  useEffect(() => {
    if (!open || !student) return;

    setStep(1);
    setConfirmOpen(false);
    submittingRef.current = false;

    const computedName =
      student.studentName ||
      `${student.personal?.firstName ?? ""} ${student.personal?.lastName ?? ""}`.trim();

    setFullName(computedName);
    setStudentId(student.registrationId || "");
    setEmail(student.email || "");
    setPhone(student.personal?.phone || "");
    setAddress(student.personal?.address || "");
    setBirthdate(toISODate(student.personal?.birthdate));
    setGuardian(student.personal?.guardian || "");
    setGuardianPhone(student.personal?.guardianPhone || "");
    setProgram(student.academic?.program || "");
    setYearLevel(student.academic?.yearLevel?.toString() || "");

    setNotes("");
    setFinalConfirm(false);

    const initialDocs: Record<string, boolean> = {};
    requiredDocs.forEach((d) => (initialDocs[d] = false));
    setDocsChecked(initialDocs);
  }, [open, student]);

  const verifiedCount = useMemo(
    () => Object.values(docsChecked).filter(Boolean).length,
    [docsChecked]
  );

  const step1Valid =
    fullName.trim() &&
    studentId.trim() &&
    program.trim() &&
    yearLevel.trim() &&
    email.trim() &&
    phone.trim() &&
    address.trim() &&
    birthdate.trim() &&
    guardian.trim() &&
    guardianPhone.trim();

  const step2Valid = verifiedCount > 0;
  const step3Valid = finalConfirm;

  if (!open || !student) return null;

  const goNext = () => setStep((s) => (s === 1 ? 2 : s === 2 ? 3 : 3));
  const goBack = () => setStep((s) => (s === 3 ? 2 : 1));

  // ✅ open confirmation instead of direct submit
  const onEnrollClick = () => {
    if (loading) return;
    if (!step1Valid || !step2Valid || !step3Valid) return;
    setConfirmOpen(true);
  };

  // ✅ real submit only after confirm
  const confirmEnroll = async () => {
    if (submittingRef.current) return;
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
          phone: phone.trim(),
          address: address.trim(),
          birthdate: birthdate.trim(),
          guardian: guardian.trim(),
          guardianPhone: guardianPhone.trim(),
          program: program.trim(),
          yearLevel: yearLevel.trim(),
          department: program.trim(),
        },
        notes: notes.trim(),
        verifiedDocs,
      });

      setConfirmOpen(false);
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
        // click outside closes only if confirm isn't open
        if (e.target === e.currentTarget && !confirmOpen) onClose();
      }}
    >
      <div className="enroll-eval-modal" onMouseDown={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="enroll-eval-header">
          <div className="fw-bold fs-4">Enrollment Evaluation</div>
          <button
            className="btn p-0 enroll-eval-close"
            onClick={onClose}
            aria-label="Close"
            disabled={confirmOpen}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        <div className="enroll-stepper">
          <StepItem icon={<User size={18} />} label="Student Info" active={step === 1} done={step > 1} />
          <StepLine active={step >= 2} />
          <StepItem icon={<FileText size={18} />} label="Documents" active={step === 2} done={step > 2} />
          <StepLine active={step >= 3} />
          <StepItem icon={<MapPin size={18} />} label="Finalize" active={step === 3} done={false} />
        </div>

        {/* Body */}
        <div className="enroll-eval-body">
          {step === 1 && (
            <>
              <div className="text-muted mb-3">
                Fill in missing info (required) and verify everything is correct.
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="row g-3">
                    <FieldInput label="Full Name" value={fullName} onChange={setFullName} required />
                    <FieldInput label="Student ID" value={studentId} onChange={setStudentId} required />

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Course / Program <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
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
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Year Level <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
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
                    </div>

                    <FieldInput label="Email" value={email} onChange={setEmail} required />
                    <FieldInput label="Phone" value={phone} onChange={setPhone} required />
                    <FieldInput label="Address" value={address} onChange={setAddress} required />

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Birthdate <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                      />
                    </div>

                    <FieldInput label="Guardian" value={guardian} onChange={setGuardian} required />
                    <FieldInput
                      label="Guardian Phone"
                      value={guardianPhone}
                      onChange={setGuardianPhone}
                      required
                    />
                  </div>

                  {!step1Valid ? (
                    <div className="text-danger small mt-3">
                      Please complete all required fields (*).
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-muted mb-3">
                Check that all required documents have been submitted and are valid.
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
                            setDocsChecked((p) => ({ ...p, [d]: e.target.checked }))
                          }
                        />
                        <div className="fw-semibold">{d}</div>
                      </div>

                      {checked ? <CheckCircle2 className="text-success" size={18} /> : <span />}
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
                      width: `${Math.round((verifiedCount / requiredDocs.length) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {!step2Valid ? (
                <div className="text-danger small mt-3">
                  Verify at least 1 document to continue.
                </div>
              ) : null}
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-muted mb-3">Finalize this evaluation and submit.</div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Evaluation Notes <span className="text-muted">(Optional)</span>
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
                    <span>I confirm the information and documents are correct.</span>
                  </label>

                  {!step3Valid ? (
                    <div className="text-danger small mt-2">
                      Please confirm to enable submission.
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="enroll-eval-footer">
          <div>
            {step > 1 ? (
              <button className="btn btn-light" onClick={goBack} disabled={loading || confirmOpen}>
                Back
              </button>
            ) : null}
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-light" onClick={onClose} disabled={loading || confirmOpen}>
              Cancel
            </button>

            {step < 3 ? (
              <button
                className="btn btn-primary"
                onClick={goNext}
                disabled={
                  loading ||
                  confirmOpen ||
                  (step === 1 ? !step1Valid : step === 2 ? !step2Valid : false)
                }
              >
                Next
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={onEnrollClick}
                disabled={loading || confirmOpen || !step1Valid || !step2Valid || !step3Valid}
              >
                Enroll
              </button>
            )}
          </div>
        </div>

        {/* ✅ CONFIRM POPUP */}
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
            <div className="enroll-confirm-popup" onMouseDown={(e) => e.stopPropagation()}>
              <div className="enroll-confirm-title">Confirm Enrollment</div>

              <div className="enroll-confirm-body">
                <div className="fw-semibold mb-1">Enroll this student now?</div>
                <div className="text-muted small">
                  This will submit the evaluation and mark the student as processed.
                </div>
              </div>

              <div className="enroll-confirm-actions">
                <button className="btn btn-light" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={confirmEnroll}
                  disabled={loading}
                >
                  Yes, Enroll
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ===== helpers ===== */

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
    <div className={`enroll-step ${active ? "active" : ""} ${done ? "done" : ""}`}>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="col-12 col-md-6">
      <label className="form-label fw-semibold">
        {label} {required ? <span className="text-danger">*</span> : null}
      </label>
      <input
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
      />
    </div>
  );
}