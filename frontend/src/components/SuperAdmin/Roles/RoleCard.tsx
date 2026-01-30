import { Settings } from "lucide-react";
import type { RoleCardItem } from "./types";

type Props = {
  item: RoleCardItem;
  onSettings: (id: string) => void;
  onOpen: (id: string) => void;
};

export default function RoleCard({ item, onSettings, onOpen }: Props) {
  const Icon = item.icon;

  return (
    <div
      className="card shadow-sm superadmin-role-card h-100 role-clickable"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen(item.id);
      }}
    >
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className={`role-ic tone-${item.tone}`}>
              <Icon size={20} />
            </div>

            <div className="min-w-0">
              <div className="fw-bold role-title text-truncate">{item.name}</div>
              <div className="text-muted role-users">{item.users} users</div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-light border role-settings-btn"
            aria-label="Role settings"
            onClick={(e) => {
              e.stopPropagation();
              onSettings(item.id);
            }}
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="role-perms-label">PERMISSIONS</div>

        <div className="d-flex flex-wrap gap-2">
          {item.permissions.map((p) => (
            <span key={p} className="role-chip">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
