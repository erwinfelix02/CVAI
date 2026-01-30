import {
  BadgeCheck,
  BadgeX,
  User,
  GraduationCap,
  Paperclip,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";
import type{
  AcademicInfo,
  DocumentsState,
  PersonalInfo,
} from "../../pages/PreReg/StudentPreRegistrationPage";

function DocChip({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span className={`chip ${ok ? "chip-success" : "chip-muted"}`}>
      {ok ? <BadgeCheck size={16} /> : <BadgeX size={16} />}
      {label}: {ok ? "Uploaded" : "Missing"}
    </span>
  );
}

export default function StepReview({
  personal,
  academic,
  docs,
}: {
  personal: PersonalInfo;
  academic: AcademicInfo;
  docs: DocumentsState;
}) {
  const fullName = `${personal.firstName} ${personal.middleName || ""} ${
    personal.lastName
  }`
    .replace(/\s+/g, " ")
    .trim();

  const docList = [
    { label: "Birth Certificate", ok: !!docs.birthCert },
    { label: "Form 137 / Transcript of Records", ok: !!docs.form137 },
    { label: "Good Moral Certificate", ok: !!docs.goodMoral },
    { label: "2x2 ID Photo", ok: !!docs.idPhoto },
  ];

  return (
    <div className="prereg-step">
      <div className="prereg-step-header">
        <div className="d-flex align-items-center gap-2">
          <span className="prereg-step-header-icon" aria-hidden="true">
            <Paperclip size={18} />
          </span>
          <h4 className="fw-bold mb-0">Review Your Application</h4>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="prereg-review-card">
            <div className="fw-semibold mb-2 d-flex align-items-center gap-2">
              <User size={16} className="text-muted" />
              Personal Information
            </div>

            <div className="small prereg-review-list">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">
                  <User size={14} />
                </span>
                <span>{fullName}</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">
                  <Mail size={14} />
                </span>
                <span>{personal.email}</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">
                  <Phone size={14} />
                </span>
                <span>{personal.phone}</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">
                  <Calendar size={14} />
                </span>
                <span>{personal.birthDate}</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">
                  <User size={14} />
                </span>
                <span>{personal.gender}</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">
                  <MapPin size={14} />
                </span>
                <span>{personal.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="prereg-review-card">
            <div className="fw-semibold mb-2 d-flex align-items-center gap-2">
              <GraduationCap size={16} className="text-muted" />
              Academic Information
            </div>

            <div className="small prereg-review-list">
              <div>Course: {academic.course}</div>
              <div>Year Level: {academic.yearLevel}</div>
              <div>Transferee: {academic.transferee}</div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="prereg-review-card">
            <div className="fw-semibold mb-2 d-flex align-items-center gap-2">
              <Paperclip size={16} className="text-muted" />
              Documents
            </div>

            <div className="d-flex flex-wrap gap-2">
              {docList.map((d) => (
                <DocChip key={d.label} label={d.label} ok={d.ok} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="alert alert-secondary mb-0">
            By submitting this application, you confirm that all information
            provided is accurate and complete. The Registrar&apos;s Office will
            review your application and notify you via email.
          </div>
        </div>
      </div>
    </div>
  );
}
