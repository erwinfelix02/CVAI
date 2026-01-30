import type { StudentRow, StudentStatus } from "./types";

function StatusPill({ status }: { status: StudentStatus }) {
  const cls =
    status === "Active" ? "active" : status === "Graduated" ? "graduated" : "dropped";
  return <span className={`registrar-status ${cls}`}>{status}</span>;
}

type Props = {
  title: string;
  rows: StudentRow[];
  onRowAction: (id: string) => void;
};

export default function StudentsTable({ title, rows, onRowAction }: Props) {
  return (
    <div className="card shadow-sm registrar-card">
      <div className="card-body p-0">
        <div className="p-3 p-md-4">
          <h5 className="fw-bold mb-0">{title}</h5>
        </div>

        <div className="table-responsive registrar-table-wrap">
          <table className="table align-middle mb-0 registrar-table">
            <thead>
              <tr className="text-muted">
                <th style={{ minWidth: 260 }}>Student</th>
                <th style={{ minWidth: 140 }}>Student ID</th>
                <th style={{ minWidth: 220 }}>Course</th>
                <th style={{ minWidth: 120 }}>Section</th>
                <th style={{ minWidth: 80 }}>Year</th>
                <th style={{ minWidth: 120 }}>Status</th>
                <th style={{ width: 70 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="registrar-avatar">{s.initials}</div>
                      <div className="min-w-0">
                        <div className="fw-semibold text-truncate">{s.name}</div>
                        <div className="text-muted small text-truncate">{s.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="fw-semibold">{s.id}</td>
                  <td>{s.course}</td>
                  <td>{s.section}</td>
                  <td>{s.year}</td>
                  <td>
                    <StatusPill status={s.status} />
                  </td>

                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-link p-0 registrar-dots"
                      onClick={() => onRowAction(s.id)}
                      aria-label="Row actions"
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
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
