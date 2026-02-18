import { UserPlus } from "lucide-react";

type EnrollmentItem = {
  _id: string;
  registrationId: string;
  studentName?: string; // ✅ optional to prevent crash on old records
  status: "Scheduled" | "Enrolled" | "Cancelled";
  schedule: { date: string; time: string; location: string; notes?: string };

  // optional if you included snapshot
  personal?: { firstName?: string; lastName?: string };
};

export default function PendingEnrollmentList({
  items,
  loading,
}: {
  items: EnrollmentItem[];
  loading: boolean;
}) {
  return (
    <div className="card shadow-sm enroll-card">
      <div className="card-body">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <UserPlus size={18} />
          Pending Enrollment ({items.length})
        </h5>

        {loading ? (
          <div className="text-muted text-center py-4">Loading...</div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {items.map((s) => {
              const fullName =
                s.studentName ||
                `${s.personal?.firstName ?? ""} ${s.personal?.lastName ?? ""}`.trim() ||
                "Unknown Student";

              const initials = fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((x) => x[0]?.toUpperCase())
                .join("");

              return (
                <div key={s._id} className="enroll-student-row">
                  <div className="d-flex align-items-center gap-3">
                    <div className="enroll-avatar">{initials}</div>
                    <div>
                      <div className="fw-semibold">{fullName}</div>
                      <div className="text-muted small">{s.registrationId}</div>
                      <div className="text-muted small">
                        {s.schedule?.date ?? "-"} • {s.schedule?.time ?? "-"} •{" "}
                        {s.schedule?.location ?? "-"}
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-primary enroll-btn">
                    <UserPlus size={16} />
                    Assign Section
                  </button>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="text-muted text-center py-4">
                No pending students.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
