import { useEffect, useMemo, useState } from "react";
import type { RoleCardItem, UserItem, UserStatus, Gender } from "./types";

import RoleDetailsHeader from "./RoleDetailsHeader";
import RoleUsersToolbar from "./RoleUsersToolbar";
import RoleUsersTable from "./RoleUsersTable";
import UserInfoCard from "./UserInfoCard";
import UserFormModal from "./UserFormModal";

type Props = {
  role: RoleCardItem;
  users: UserItem[];
  onBack: () => void;

  onAddUserToRole: (roleId: string, user: Omit<UserItem, "id">) => void;
  onUpdateUser: (userId: string, patch: Partial<UserItem>) => void;
  onRemoveUserFromRole: (userId: string) => void;
};

type ModalMode = "add" | "edit";
type StatusFilter = "All" | "Active" | "Inactive";

/** ✅ Updated form to include gender + houseNo */
export type UserForm = {
  userId: string;

  firstName: string;
  middleName: string;
  lastName: string;

  gender: Gender;
  houseNo: string;

  email: string;
  phone: string;

  status: UserStatus;
};

const emptyForm: UserForm = {
  userId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "Prefer not to say",
  houseNo: "",
  email: "",
  phone: "",
  status: "Active",
};

export default function RoleDetailsView({
  role,
  users,
  onBack,
  onAddUserToRole,
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

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<UserForm>(emptyForm);

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

  // keep selection valid if deleted
  useEffect(() => {
    if (selectedUserId && !roleUsers.some((u) => u.id === selectedUserId)) {
      setSelectedUserId(null);
    }
  }, [roleUsers, selectedUserId]);

  // validators
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const digitsOnly = (v: string) => v.replace(/[^\d]/g, "");
  const isValidPhone = (phone: string) => {
    const p = digitsOnly(phone);
    return p.length >= 10 && p.length <= 13;
  };

  const canSubmit =
    form.userId.trim().length > 0 &&
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.houseNo.trim().length > 0 &&
    isValidEmail(form.email) &&
    isValidPhone(form.phone);

  // open add
  const openAdd = () => {
    setModalMode("add");
    setEditingId(null);

    const nextId = `STU-2025-${String(users.length + 1).padStart(3, "0")}`;

    setForm({
      ...emptyForm,
      userId: nextId,
      status: "Active",
      gender: "Prefer not to say",
    });

    setModalOpen(true);
  };

  // open edit
  const openEdit = (u: UserItem) => {
    setModalMode("edit");
    setEditingId(u.id);

    setForm({
      userId: u.userId ?? "",
      firstName: u.firstName ?? "",
      middleName: u.middleName ?? "",
      lastName: u.lastName ?? "",
      gender: u.gender ?? "Prefer not to say",
      houseNo: u.houseNo ?? "",
      email: u.email ?? "",
      phone: u.phone ?? "",
      status: u.status,
    });

    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const submitModal = () => {
    if (!canSubmit) return;

    const fullName = [form.firstName, form.middleName, form.lastName]
      .filter((x) => x.trim())
      .join(" ")
      .trim();

    if (modalMode === "add") {
      onAddUserToRole(role.id, {
        roleId: role.id,
        createdAt: new Date().toISOString().slice(0, 10),

        userId: form.userId.trim(),
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim() || undefined,
        lastName: form.lastName.trim(),
        fullName,

        gender: form.gender,
        houseNo: form.houseNo.trim(),

        email: form.email.trim(),
        phone: form.phone.trim(),
        status: form.status,
      });
    } else {
      if (!editingId) return;

      onUpdateUser(editingId, {
        userId: form.userId.trim(),
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim() || undefined,
        lastName: form.lastName.trim(),
        fullName,

        gender: form.gender,
        houseNo: form.houseNo.trim(),

        email: form.email.trim(),
        phone: form.phone.trim(),
        status: form.status,
      });
    }

    setModalOpen(false);
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
        onAdd={openAdd}
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

      <UserFormModal
        open={modalOpen}
        mode={modalMode}
        roleName={role.name}
        form={form}
        onFormChange={setForm}
        canSubmit={canSubmit}
        onClose={closeModal}
        onSubmit={submitModal}
      />
    </div>
  );
}
