import { Bell, AlertTriangle, Users } from "lucide-react";
import type { Announcement } from "./types";

export default function AnnouncementStats({
  items,
}: {
  items: Announcement[];
}) {
  const total = items.length;
  const highPriority = items.filter((a) => a.priority === "high").length;
  const totalRecipients = items.reduce((sum, a) => sum + a.recipients, 0);

  return (
    <div className="row g-3 mb-4">
      {/* Total */}
      <div className="col-12 col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="stat-icon soft-blue">
              <Bell size={18} />
            </div>
            <div>
              <div className="fw-bold fs-4">{total}</div>
              <div className="text-muted">Total Announcements</div>
            </div>
          </div>
        </div>
      </div>

      {/* High Priority */}
      <div className="col-12 col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="stat-icon soft-red">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="fw-bold fs-4">{highPriority}</div>
              <div className="text-muted">High Priority</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipients */}
      <div className="col-12 col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="stat-icon soft-green">
              <Users size={18} />
            </div>
            <div>
              <div className="fw-bold fs-4">{totalRecipients}</div>
              <div className="text-muted">Total Recipients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
