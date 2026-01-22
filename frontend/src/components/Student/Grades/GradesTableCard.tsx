import type { LucideIcon } from "lucide-react";
import StatusPill from "./StatusPill";

type CurrentRow = {
  code: string;
  subject: string;
  units: number;
  midterm: string;
  finals: string;
  finalGrade: string;
  status: "In Progress" | "Completed";
  midtermTone?: "blue" | "green" | "orange";
};

type PrevRow = {
  code: string;
  subject: string;
  units: number;
  finalGrade: string;
  status: "Passed" | "Failed";
  gradeTone?: "blue" | "green";
};

export default function GradesTableCard({
  title,
  titleIcon: TitleIcon,
  variant,
  rows,
}: {
  title: string;
  titleIcon: LucideIcon;
  variant: "current" | "previous";
  rows: CurrentRow[] | PrevRow[];
}) {
  return (
    <div className="card shadow-sm grades-card">
      <div className="card-body p-3 p-md-4">
        {/* Title */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="grades-title-icon">
            <TitleIcon size={18} />
          </span>
          <h4 className="fw-bold mb-0">{title}</h4>
        </div>

        {/* Table wrapper => responsive on any size */}
        <div className="table-responsive">
          {variant === "current" ? (
            <table className="table align-middle mb-0 grades-table">
              <thead>
                <tr className="text-muted">
                  <th>Course Code</th>
                  <th>Subject</th>
                  <th className="text-center">Units</th>
                  <th className="text-center">Midterm</th>
                  <th className="text-center">Finals</th>
                  <th className="text-center">Final Grade</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {(rows as CurrentRow[]).map((r) => (
                  <tr key={r.code}>
                    <td className="fw-semibold">{r.code}</td>
                    <td className="fw-semibold">{r.subject}</td>
                    <td className="text-center">{r.units}</td>

                    <td className={`text-center ${r.midtermTone ? `grade-${r.midtermTone}` : ""}`}>
                      {r.midterm}
                    </td>

                    <td className="text-center text-muted">{r.finals}</td>
                    <td className="text-center text-muted">{r.finalGrade}</td>
                    <td className="text-center">
                      <StatusPill value={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table align-middle mb-0 grades-table">
              <thead>
                <tr className="text-muted">
                  <th>Course Code</th>
                  <th>Subject</th>
                  <th className="text-center">Units</th>
                  <th className="text-center">Final Grade</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {(rows as PrevRow[]).map((r) => (
                  <tr key={r.code}>
                    <td className="fw-semibold">{r.code}</td>
                    <td className="fw-semibold">{r.subject}</td>
                    <td className="text-center">{r.units}</td>

                    <td className={`text-center ${r.gradeTone ? `grade-${r.gradeTone}` : ""}`}>
                      {r.finalGrade}
                    </td>

                    <td className="text-center">
                      <StatusPill value={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
