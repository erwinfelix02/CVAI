import { useMemo, useState } from "react";
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

      {/* Confirmation Popup */}
      {confirmAction && (
        <div className="rbac-backdrop">
          <div className="rbac-modal" style={{ maxWidth: 420 }}>
            <div className="fw-bold mb-2">
              {confirmAction.type === "delete"
                ? "Delete User"
                : confirmAction.user.status === "Active"
                ? "Disable User"
                : "Enable User"}
            </div>

            <div className="text-muted mb-3">
              {confirmAction.type === "delete"
                ? `Are you sure you want to delete ${confirmAction.user.fullName}?`
                : confirmAction.user.status === "Active"
                ? `Are you sure you want to disable ${confirmAction.user.fullName}?`
                : `Are you sure you want to enable ${confirmAction.user.fullName}?`}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-light"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>

              <button
                className={`btn ${
                  confirmAction.type === "delete"
                    ? "btn-danger"
                    : confirmAction.user.status === "Active"
                    ? "btn-secondary"
                    : "btn-success"
                }`}
                onClick={confirmProceed}
              >
                {confirmAction.type === "delete"
                  ? "Delete"
                  : confirmAction.user.status === "Active"
                  ? "Disable"
                  : "Enable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}