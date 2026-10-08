import { X, Check } from "lucide-react";
import { useState } from "react";
import type { RoleCardItem } from "./types";

const ALL_PERMISSIONS = [
  "Manage Users",
  "Manage Roles",
  "Manage Portals",
  "View System Logs",
  "Manage AI Knowledge",
  "Manage students",
  "Process applications",
  "Enrollment",
  "Manage schedules",
  "Assign rooms",
  "Faculty loads",
  "Fee management",
  "Scholarships",
  "Financial reports",
  "Grade management",
  "Class materials",
  "Attendance",
  "View grades",
  "View schedule",
  "AI assistant",
];

type Props = {
  role: RoleCardItem;
  onClose: () => void;
  onSave: (permissions: string[]) => void;
};

export default function RolePermissionsModal({
  role,
  onClose,
  onSave,
}: Props) {
  const [selected, setSelected] = useState<string[]>(role.permissions);

  const toggle = (perm: string) => {
    setSelected((prev) =>
      prev.includes(perm)
        ? prev.filter((p) => p !== perm)
        : [...prev, perm]
    );
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h5 className="fw-bold mb-1">Role Details</h5>
            <div className="text-muted">
              {role.name} · System Role
            </div>
          </div>

          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-section-title">ALL PERMISSIONS</div>

          <div className="permissions-list">
            {ALL_PERMISSIONS.map((p) => {
              const active = selected.includes(p);
              return (
                <button
                  key={p}
                  className={`perm-row ${active ? "active" : ""}`}
                  onClick={() => toggle(p)}
                >
                  <span className="perm-check">
                    {active && <Check size={16} />}
                  </span>
                  <span>{p}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-light" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onSave(selected)}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
