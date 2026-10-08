import { useMemo, useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import type { RoleCardItem, UserItem } from "./types";

import RoleDetailsHeader from "./RoleDetailsHeader";
import RoleUsersToolbar from "./RoleUsersToolbar";
import RoleUsersTable from "./RoleUsersTable";
import UserInfoCard from "./UserInfoCard";
import EditRoleUserModal from "./EditRoleUserModal";

type Props = {
  role: RoleCardItem;
  users: UserItem[];
  onBack: () => void;
  onUpdateUser: (userId: string, patch: Partial<UserItem>) => Promise<void> | void;
  onRemoveUserFromRole: (userId: string) => void;
};

type StatusFilter = "All" | "Active" | "Inactive";

export default function RoleDetailsView({
  role,
  users,
  onBack,
  onUpdateUser,
  onRemoveUserFromRole,
}: Props) {
  const roleUsers = useMemo(
    () => users.filter((u) => u.roleId === role.id),
    [users, role.id]
  );

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [confirmAction, setConfirmAction] = useState<
    null | { type: "toggle" | "delete"; user: UserItem }
  >(null);

  const selectedUser = useMemo(
    () => roleUsers.find((u) => u.id === selectedUserId) ?? null,
    [roleUsers, selectedUserId]
  );

  const filteredUsers = useMemo(() => {
    const query = q.trim().toLowerCase();

    return roleUsers.filter((u) => {
      const matchesQuery =
        !query ||
        (u.userId ?? "").toLowerCase().includes(query) ||
        (u.fullName ?? "").toLowerCase().includes(query) ||
        (u.email ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ? true : u.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [roleUsers, q, statusFilter]);

  const openEdit = (u: UserItem) => {
    setSelectedUserId(u.id);
    setEditOpen(true);
  };

  const toggleDisable = (u: UserItem) => {
    setConfirmAction({ type: "toggle", user: u });
  };

  const deleteSelected = () => {
    if (!selectedUser) return;
    setConfirmAction({ type: "delete", user: selectedUser });
  };

  const confirmProceed = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "toggle") {
      const u = confirmAction.user;

      await onUpdateUser(u.id, {
        status: u.status === "Active" ? "Inactive" : "Active",
      });
    }

    if (confirmAction.type === "delete") {
      onRemoveUserFromRole(confirmAction.user.id);

      if (selectedUserId === confirmAction.user.id) {
        setSelectedUserId(null);
      }
    }

    setConfirmAction(null);
  };

  // Keyboard shortcut listener for active confirmation modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && confirmAction) {
        setConfirmAction(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmAction]);

  return (
    <div className="container-fluid py-3 py-md-4">
      <RoleDetailsHeader
        roleName={role.name}
        count={roleUsers.length}
        onBack={onBack}
      />

      <RoleUsersToolbar
        q={q}
        onQChange={setQ}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <div className="row g-3 mt-2">
        <div className="col-12 col-lg-8">
          <RoleUsersTable
            users={filteredUsers}
            total={roleUsers.length}
            selectedUserId={selectedUserId}
            onSelect={setSelectedUserId}
          />
        </div>

        <div className="col-12 col-lg-4">
          <UserInfoCard
            roleName={role.name}
            user={selectedUser}
            onClear={() => setSelectedUserId(null)}
            onEdit={() => selectedUser && openEdit(selectedUser)}
            onToggle={() => selectedUser && toggleDisable(selectedUser)}
            onDelete={deleteSelected}
          />
        </div>
      </div>

      <EditRoleUserModal
        open={editOpen}
        user={selectedUser}
        onClose={() => setEditOpen(false)}
        onSave={async (patch) => {
          if (!selectedUser) return;
          await onUpdateUser(selectedUser.id, patch);
          setEditOpen(false);
        }}
      />

      {/* Confirmation Popup for Enable / Disable / Delete */}
      {confirmAction && (
        <div
          className="rbac-backdrop"
          style={{ zIndex: 1060 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirmAction(null);
          }}
        >
          <div
            className="rbac-modal rbac-modal-dialog"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="rbac-modal-header d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <AlertTriangle
                  className={
                    confirmAction.type === "delete"
                      ? "text-danger"
                      : confirmAction.user.status === "Active"
                      ? "text-warning"
                      : "text-success"
                  }
                  size={20}
                />
                <h3 className="rbac-modal-title mb-0">
                  {confirmAction.type === "delete"
                    ? "Delete User"
                    : confirmAction.user.status === "Active"
                    ? "Disable User Account"
                    : "Enable User Account"}
                </h3>
              </div>
              <button
                type="button"
                className="rbac-x-sm"
                onClick={() => setConfirmAction(null)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="rbac-modal-body py-2">
              <p className="text-muted mb-0">
                {confirmAction.type === "delete"
                  ? `Are you sure you want to remove ${confirmAction.user.fullName} from ${role.name}? This action cannot be undone.`
                  : confirmAction.user.status === "Active"
                  ? `Are you sure you want to disable ${confirmAction.user.fullName}? They will lose access until re-enabled.`
                  : `Are you sure you want to enable ${confirmAction.user.fullName}? They will regain active access to the portal.`}
              </p>
            </div>

            <div className="rbac-actions mt-3 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light rbac-btn"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={`btn rbac-btn ${
                  confirmAction.type === "delete"
                    ? "btn-danger"
                    : confirmAction.user.status === "Active"
                    ? "btn-warning text-white"
                    : "btn-success"
                }`}
                onClick={confirmProceed}
              >
                {confirmAction.type === "delete"
                  ? "Delete User"
                  : confirmAction.user.status === "Active"
                  ? "Disable User"
                  : "Enable User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}