import { X, Check } from "lucide-react";
import type { RoleCardItem } from "./types";
import { PERMISSIONS } from "./permissions";

export default function RoleDetailsModal({
  role,
  onClose,
  onEdit,
}: {
  role: RoleCardItem;
  onClose: () => void;
  onEdit: () => void;
}) {
  const Icon = role.icon;

  return (
    <div className="rbac-backdrop">
      <div className="rbac-modal">
        <button className="rbac-x" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="rbac-title">Role Details</div>

        <div className="rbac-head">
          <div className={`rbac-icon tone-${role.tone}`}>
            <Icon size={22} />
          </div>

          <div className="min-w-0">
            <div className="rbac-role-row">
              <div className="rbac-role">{role.name}</div>
              <span className="rbac-badge">System Role</span>
            </div>
            <div className="rbac-sub">{role.users} users assigned</div>
          </div>
        </div>

        <div className="rbac-section">ALL PERMISSIONS</div>

        <div className="rbac-list">
          {role.permissions.map((k) => (
            <div key={k} className="rbac-item">
              <span className="rbac-check">
                <Check size={16} />
              </span>
              <span>{PERMISSIONS[k].label}</span>
            </div>
          ))}
        </div>

        <div className="rbac-actions">
          <button className="btn btn-light rbac-btn" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary rbac-btn" onClick={onEdit}>
            Edit Permissions
          </button>
        </div>
      </div>
    </div>
  );
}
