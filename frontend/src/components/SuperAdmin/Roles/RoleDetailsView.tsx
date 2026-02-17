import { useMemo, useState } from "react";
import type { RoleCardItem, UserItem } from "./types";

import RoleDetailsHeader from "./RoleDetailsHeader";
import RoleUsersToolbar from "./RoleUsersToolbar";
import RoleUsersTable from "./RoleUsersTable";
import UserInfoCard from "./UserInfoCard";

type Props = {
  role: RoleCardItem;
  users: UserItem[];
  onBack: () => void;

  onUpdateUser: (userId: string, patch: Partial<UserItem>) => void;
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

  // toolbar
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  // selection
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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
  };

  const toggleDisable = (u: UserItem) => {
    onUpdateUser(u.id, {
      status: u.status === "Active" ? "Inactive" : "Active",
    });
  };

  const deleteSelected = () => {
    if (!selectedUser) return;
    onRemoveUserFromRole(selectedUser.id);
    setSelectedUserId(null);
  };

  return (
    <div className="container-fluid py-3 py-md-4">
      <RoleDetailsHeader
        roleName={role.name}
        count={roleUsers.length}
        onBack={onBack}
        // ✅ removed onAdd
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
    </div>
  );
}
