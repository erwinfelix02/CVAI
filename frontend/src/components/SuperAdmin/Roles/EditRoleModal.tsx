import { useState, useMemo, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
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
  const allowed = useMemo(
    () => ROLE_ALLOWED[role.id as keyof typeof ROLE_ALLOWED] || [],
    [role.id]
  );

  const [selected, setSelected] = useState<PermissionKey[]>(role.permissions);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);

  // Check if current selection differs from initial role permissions
  const hasUnsavedChanges = useMemo(() => {
    if (selected.length !== role.permissions.length) return true;
    const sortedInitial = [...role.permissions].sort();
    const sortedCurrent = [...selected].sort();
    return sortedInitial.some((val, idx) => val !== sortedCurrent[idx]);
  }, [selected, role.permissions]);

  const toggle = (k: PermissionKey) => {
    setSelected((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  };

  const requestClose = () => {
    if (hasUnsavedChanges) {
      setDiscardOpen(true);
    } else {
      onClose();
    }
  };

  const handleSaveClick = () => {
    if (hasUnsavedChanges) {
      setSaveOpen(true);
    } else {
      onSave(selected);
    }
  };

  const confirmSave = () => {
    setSaveOpen(false);
    onSave(selected);
  };

  // Keyboard navigation for ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (saveOpen) {
          setSaveOpen(false);
        } else if (discardOpen) {
          setDiscardOpen(false);
        } else {
          requestClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveOpen, discardOpen, hasUnsavedChanges]);

  return (
    <>
      <div
        className="rbac-backdrop"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) requestClose();
        }}
      >
        <div
          className="rbac-modal rbac-modal-wide"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            className="rbac-x"
            onClick={requestClose}
            aria-label="Close"
            type="button"
          >
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
                    <div className="rbac-card-title">{def?.label ?? k}</div>
                    <div className="rbac-card-desc">{def?.desc ?? ""}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rbac-actions">
            <button
              type="button"
              className="btn btn-light rbac-btn"
              onClick={requestClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary rbac-btn"
              onClick={handleSaveClick}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Discard Changes Modal */}
      {discardOpen && (
        <div
          className="rbac-backdrop"
          style={{ zIndex: 1060 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDiscardOpen(false);
          }}
        >
          <div
            className="rbac-modal rbac-modal-dialog"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="rbac-modal-header">
              <div className="d-flex align-items-center gap-2">
                <AlertTriangle className="text-warning" size={20} />
                <h3 className="rbac-modal-title mb-0">Discard changes?</h3>
              </div>
              <button
                type="button"
                className="rbac-x-sm"
                onClick={() => setDiscardOpen(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="rbac-modal-body py-3">
              <p className="mb-0 text-muted">
                You have unsaved changes to role permissions. Are you sure you want to discard them?
              </p>
            </div>

            <div className="rbac-actions mt-2">
              <button
                type="button"
                className="btn btn-light rbac-btn"
                onClick={() => setDiscardOpen(false)}
              >
                Keep Editing
              </button>
              <button
                type="button"
                className="btn btn-danger rbac-btn"
                onClick={onClose}
              >
                Discard & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {saveOpen && (
        <div
          className="rbac-backdrop"
          style={{ zIndex: 1060 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSaveOpen(false);
          }}
        >
          <div
            className="rbac-modal rbac-modal-dialog"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="rbac-modal-header">
              <h3 className="rbac-modal-title mb-0">Confirm Changes</h3>
              <button
                type="button"
                className="rbac-x-sm"
                onClick={() => setSaveOpen(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="rbac-modal-body py-3">
              <p className="mb-0 text-muted">
                Are you sure you want to update the permissions for <strong>{role.name}</strong>?
              </p>
            </div>

            <div className="rbac-actions mt-2">
              <button
                type="button"
                className="btn btn-light rbac-btn"
                onClick={() => setSaveOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary rbac-btn"
                onClick={confirmSave}
              >
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}