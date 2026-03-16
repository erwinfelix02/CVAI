type PortalState = "online" | "offline";

export type PortalStatusRow = {
  name: string;
  users: number;
  onlineUsers: number;
  status: PortalState;
};

type Props = {
  title: string;
  rightPill: string;
  rows: PortalStatusRow[];
};

export default function PortalStatusCard({ title, rightPill, rows }: Props) {
  const pillClass = rightPill.toLowerCase().includes("offline")
    ? "superadmin-pill warning"
    : "superadmin-pill success";

  return (
    <div className="card shadow-sm superadmin-card h-100">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
          <h5 className="fw-bold mb-0">{title}</h5>
          <span className={pillClass}>{rightPill}</span>
        </div>

        <div className="d-flex flex-column gap-2">
          {rows.map((r) => (
            <div key={r.name} className="superadmin-portal-row">
              <div className="d-flex align-items-center gap-2 min-w-0">
                <span className={`superadmin-dot ${r.status}`} />
                <span className="fw-semibold text-truncate">{r.name}</span>
              </div>

              <div className="d-flex align-items-center gap-3">
                <span className="text-muted">
                  {r.onlineUsers} online / {r.users} users
                </span>
                <span className={`superadmin-chip ${r.status}`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}