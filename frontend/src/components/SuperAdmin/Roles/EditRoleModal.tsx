import { X } from "lucide-react";
import { useMemo, useState } from "react";
import type { RoleCardItem } from "./types";
import { PERMISSIONS, ROLE_ALLOWED } from "./permissions";
import type { PermissionKey } from "./permissions";


export default function EditRoleModal({
  role,
  onClose,
  onSave,
}: {
  role: RoleCardItem;
  onClose: () => void;
  onSave: (perms: PermissionKey[]) => void;
}) {
  const allowed = useMemo(() => ROLE_ALLOWED[role.id as keyof typeof ROLE_ALLOWED], [role.id]);
  const [selected, setSelected] = useState<PermissionKey[]>(role.permissions);

  const toggle = (k: PermissionKey) => {
    setSelected((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  };

  return (
    <div className="rbac-backdrop">
      <div className="rbac-modal rbac-modal-wide">
        <button className="rbac-x" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="rbac-edit-title">
          <div className="fw-bold">Edit Role: {role.name}</div>
          <div className="text-muted">Modify role permissions and settings.</div>
        </div>

        <div className="rbac-section mt-3">Permissions</div>

        <div className="rbac-grid">
          {allowed.map((k) => {
            const def = PERMISSIONS[k];
            const active = selected.includes(k);

            return (
              <button
                key={k}
                type="button"
                className={`rbac-card ${active ? "active" : ""}`}
                onClick={() => toggle(k)}
              >
                <span className={`rbac-dot ${active ? "on" : ""}`}>
                  {active ? "✓" : ""}
                </span>

                <div className="rbac-card-text">
                  <div className="rbac-card-title">{def.label}</div>
                  <div className="rbac-card-desc">{def.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rbac-actions">
          <button className="btn btn-light rbac-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary rbac-btn" onClick={() => onSave(selected)}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
