import { Settings } from "lucide-react";
import type { RoleCardItem } from "./types";

type Props = {
  item: RoleCardItem;
  onSettings: (id: string) => void;
  onOpen: (id: string) => void;
};

const MAX_VISIBLE_PERMS = 3;

const formatPermission = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function RoleCard({ item, onSettings, onOpen }: Props) {
  const Icon = item.icon;

  const visiblePerms = item.permissions.slice(0, MAX_VISIBLE_PERMS);
  const hiddenCount = item.permissions.length - visiblePerms.length;

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
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className={`role-ic tone-${item.tone}`}>
              <Icon size={20} />
            </div>

            <div className="min-w-0">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div className="fw-bold role-title text-truncate">
                  {item.name}
                </div>

                {/* System badge */}
                {item.id === "superadmin" && (
                  <span className="role-badge">System</span>
                )}
              </div>

              <div className="text-muted role-users">
                {item.users} users
              </div>
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

        {/* Permissions label */}
        <div className="role-perms-label">
          PERMISSIONS ({item.permissions.length})
        </div>

        {/* Permission chips */}
        <div className="d-flex flex-wrap gap-2">
          {visiblePerms.map((p) => (
            <span key={p} className="role-chip">
              {formatPermission(p)}
            </span>
          ))}

          {hiddenCount > 0 && (
            <span className="role-chip role-chip-muted">
              +{hiddenCount} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
