type TermDetail = {
  quizzes?: string | number;
  activities?: string | number;
  examination?: string | number;
  grade?: string | number;
};

type SubjectGradeDetails = {
  prelim?: TermDetail;
  midterm?: TermDetail;
  finals?: TermDetail;
  finalGrade?: string | number;
  status?: string;
  academicYear?: string;
  semester?: string;
};

type Props = {
  show: boolean;
  onClose: () => void;
  subjectCode: string;
  term: "prelim" | "midterm" | "finals";
  gradeData: SubjectGradeDetails | null;
};

export default function GradeBreakdownModal({
  show,
  onClose,
  subjectCode,
  term,
  gradeData,
}: Props) {
  if (!show || !gradeData) return null;

  const termData = gradeData[term] || {
    quizzes: "—",
    activities: "—",
    examination: "—",
    grade: "—",
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              {subjectCode} — {term.toUpperCase()} Grade Computation
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <p className="text-muted small mb-3">
              Detailed breakdown of scores recorded by your instructor.
            </p>
            <ul className="list-group list-group-flush mb-3">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Quizzes
                <span className="fw-semibold">{termData.quizzes ?? "—"}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Activities / Assignments
                <span className="fw-semibold">{termData.activities ?? "—"}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Major Examination
                <span className="fw-semibold">{termData.examination ?? "—"}</span>
              </li>
            </ul>
            <div className="alert alert-light border d-flex justify-content-between align-items-center mb-0">
              <span className="fw-bold">Computed Term Grade:</span>
              <span className="badge bg-primary fs-6">{termData.grade ?? "—"}</span>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}