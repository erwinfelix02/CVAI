import { Bell, AlertTriangle, Users } from "lucide-react";
import type { Announcement } from "./types";

export default function AnnouncementStats({
  items,
}: {
  items: Announcement[];
}) {
  const total = items.length;
  const highPriority = items.filter((a) => a.priority === "high").length;
  const totalRecipients = items.reduce((sum, a) => sum + (a.recipients || 0), 0);

  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-4">
        <div className="card shadow-sm h-100 border-0 rounded-4">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="stat-icon soft-blue">
              <Bell size={18} />
            </div>
            <div>
              <div className="fw-bold fs-4">{total}</div>
              <div className="text-muted small">Total Department Notices</div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className="card shadow-sm h-100 border-0 rounded-4">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="stat-icon soft-red">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="fw-bold fs-4">{highPriority}</div>
              <div className="text-muted small">High Priority Alerts</div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className="card shadow-sm h-100 border-0 rounded-4">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="stat-icon soft-green">
              <Users size={18} />
            </div>
            <div>
              <div className="fw-bold fs-4">{totalRecipients.toLocaleString()}</div>
              <div className="text-muted small">Target Student Reach</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}