import { Pencil } from "lucide-react";
import type { GradeRow } from "./types";

type Props = {
  title: string;
  rows: GradeRow[];
  onChangeScore: (id: string, key: keyof GradeRow, v: string) => void;
};

function ScoreInput({
  value,
  onChange,
}: {
  value: number | "";
  onChange: (v: string) => void;
}) {
  return (
    <input
      className="form-control grade-pill-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode="numeric"
    />
  );
}

export default function GradesTable({ title, rows, onChangeScore }: Props) {
  return (
    <div className="card shadow-sm faculty-grades-table">
      <div className="card-body p-3 p-md-4">
        <h5 className="fw-bold mb-3">{title}</h5>

        <div className="table-responsive grade-table-wrap">
          <table className="table align-middle mb-0 grade-table">
            <thead>
              <tr className="text-muted">
                <th style={{ minWidth: 220 }}>Student</th>
                <th>Quiz 1 (10%)</th>
                <th>Quiz 2 (10%)</th>
                <th>Midterm (25%)</th>
                <th>Finals (25%)</th>
                <th>Project (30%)</th>
                <th style={{ minWidth: 120 }}>Final Grade</th>
                <th style={{ minWidth: 110 }}>Status</th>
                <th style={{ width: 72 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="fw-semibold">{r.name}</div>
                    <div className="text-muted small">{r.studentNo}</div>
                  </td>

                  <td>
                    <ScoreInput
                      value={r.quiz1 ?? ""}
                      onChange={(v) => onChangeScore(r.id, "quiz1", v)}
                    />
                  </td>

                  <td>
                    <ScoreInput
                      value={r.quiz2 ?? ""}
                      onChange={(v) => onChangeScore(r.id, "quiz2", v)}
                    />
                  </td>

                  <td>
                    <ScoreInput
                      value={r.midterm ?? ""}
                      onChange={(v) => onChangeScore(r.id, "midterm", v)}
                    />
                  </td>

                  <td>
                    <ScoreInput
                      value={r.finals ?? ""}
                      onChange={(v) => onChangeScore(r.id, "finals", v)}
                    />
                  </td>

                  <td>
                    <ScoreInput
                      value={r.project ?? ""}
                      onChange={(v) => onChangeScore(r.id, "project", v)}
                    />
                  </td>

                  <td className="text-center fw-semibold text-muted">
                    {r.finalGrade ?? "—"}
                  </td>

                  <td>
                    <span
                      className={`badge rounded-pill grade-status ${
                        r.status === "pending" ? "pending" : "complete"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="text-center">
                    <button
                      className="btn btn-link p-0 grade-edit"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
