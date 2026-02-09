import { UserPlus } from "lucide-react";

const students = [
  {
    initials: "RM",
    name: "Ricardo Mendoza",
    id: "2024-00010",
    program: "BS Computer Science • Year 1",
  },
  {
    initials: "PL",
    name: "Patricia Lim",
    id: "2024-00011",
    program: "BS Computer Science • Year 1",
  },
  {
    initials: "MT",
    name: "Miguel Torres",
    id: "2024-00012",
    program: "BS Information Technology • Year 1",
  },
];

export default function PendingEnrollmentList() {
  return (
    <div className="card shadow-sm enroll-card">
      <div className="card-body">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <UserPlus size={18} />
          Pending Enrollment ({students.length})
        </h5>

        <div className="d-flex flex-column gap-3">
          {students.map((s) => (
            <div key={s.id} className="enroll-student-row">
              <div className="d-flex align-items-center gap-3">
                <div className="enroll-avatar">{s.initials}</div>
                <div>
                  <div className="fw-semibold">{s.name}</div>
                  <div className="text-muted small">{s.id}</div>
                  <div className="text-muted small">{s.program}</div>
                </div>
              </div>

              <button className="btn btn-primary enroll-btn">
                <UserPlus size={16} />
                Assign Section
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
