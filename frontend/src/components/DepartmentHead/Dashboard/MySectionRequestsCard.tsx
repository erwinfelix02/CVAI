// ✅ src/components/DepartmentHead/Dashboard/MySectionRequestsCard.tsx

import { Layers } from "lucide-react";

export type SectionRequestRow = {
  id: string;
  student: string; // Acts as the Section Name/Code
  requestedSection: string; // Acts as the Program & Year details
  status: string;
};

interface MySectionRequestsCardProps {
  title: string;
  actionLabel?: string;
  onViewAllClick?: () => void;
  rows: SectionRequestRow[];
}

export default function MySectionRequestsCard({
  title,
  actionLabel = "View All",
  onViewAllClick,
  rows,
}: MySectionRequestsCardProps) {
  // Filter rows to only show pending requests
  const pendingRows = rows.filter((r) => r.status.toLowerCase() === "pending");

  const getBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          backgroundColor: "#d1e7dd",
          color: "#0f5132",
          borderColor: "#badbcc",
        };
      case "rejected":
        return {
          backgroundColor: "#f8d7da",
          color: "#842029",
          borderColor: "#f5c2c7",
        };
      default:
        return {
          backgroundColor: "#fff3cd",
          color: "#664d03",
          borderColor: "#ffecb5",
        };
    }
  };

  return (
    <div className="card shadow-sm rounded-4 h-100 border-0">
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <Layers size={18} className="text-primary" />
            <h5 className="fw-bold mb-0 text-dark">{title}</h5>
          </div>
          {onViewAllClick && (
            <button
              type="button"
              className="btn btn-link text-decoration-none p-0 fw-medium small"
              onClick={onViewAllClick}
            >
              {actionLabel}
            </button>
          )}
        </div>

        {pendingRows.length > 0 ? (
          <div
            className="d-flex flex-column gap-2"
            style={{ maxHeight: "280px", overflowY: "auto", scrollbarWidth: "thin" }}
          >
            {pendingRows.map((r) => {
              const badgeStyle = getBadgeStyle(r.status);
              return (
                <div
                  key={r.id}
                  className="p-3 rounded-3 border bg-white d-flex align-items-center justify-content-between gap-3 shadow-sm"
                  style={{ transition: "all 0.2s ease" }}
                >
                  <div className="min-w-0">
                    <div className="fw-semibold text-dark mb-1">{r.student}</div>
                    <div className="text-muted small text-truncate" style={{ fontSize: "13px" }}>
                      {r.requestedSection}
                    </div>
                  </div>
                  <span
                    className="badge border text-nowrap px-2.5 py-1.5 fw-medium"
                    style={{
                      fontSize: "12px",
                      borderRadius: "6px",
                      ...badgeStyle,
                    }}
                  >
                    {r.status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <div className="bg-light d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-2">
              <Layers size={26} className="text-secondary" />
            </div>
            <h6 className="fw-semibold mb-1 text-dark">My Section Requests</h6>
            <p className="small text-muted mb-0">No pending section requests</p>
          </div>
        )}
      </div>
    </div>
  );
}