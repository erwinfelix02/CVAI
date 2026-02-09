import { useEffect, useMemo, useState } from "react";
import {
  X,
  Save,
  Trash2,
  Pencil,
  Ban,
  CheckCircle2,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { RoleCardItem, UserItem } from "./types";

type Props = {
  open: boolean;
  role: RoleCardItem | null;
  users: UserItem[];
  onClose: () => void;

  // user actions
  onUpdateUser: (userId: string, patch: Partial<UserItem>) => void;
  onRemoveUserFromRole: (userId: string) => void;
};

type UserStatus = "Active" | "Inactive";
type StatusFilter = "All" | UserStatus;

type EditUserForm = {
  userId: string;
  fullName: string;
  email: string;
  status: UserStatus;
};

const INITIAL_FORM: EditUserForm = {
  userId: "",
  fullName: "",
  email: "",
  status: "Active",
};

export default function RoleDetailsOffcanvas({
  open,
  role,
  users,
  onClose,
  onUpdateUser,
  onRemoveUserFromRole,
}: Props) {
  // search + filter
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  // selection
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<EditUserForm>(INITIAL_FORM);

  // reset local state when role changes / closed
  useEffect(() => {
    setQ("");
    setStatusFilter("All");
    setSelectedUserId(null);
    setModalOpen(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
  }, [role?.id, open]);

  const roleUsers = useMemo(() => {
    if (!role) return [];
    return users.filter((u) => u.roleId === role.id);
  }, [role, users]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return roleUsers.find((u) => u.id === selectedUserId) ?? null;
  }, [roleUsers, selectedUserId]);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

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

  if (!role) return null;

  const openEdit = (u: UserItem) => {
    setEditingId(u.id);
    setForm({
      userId: u.userId ?? "",
      fullName: u.fullName ?? "",
      email: u.email ?? "",
      status: u.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const canSubmit =
    form.userId.trim() && form.fullName.trim() && isValidEmail(form.email);

  const submitModal = () => {
    if (!canSubmit) return;
    if (!editingId) return;

    onUpdateUser(editingId, {
      userId: form.userId.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      status: form.status,
    });

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
    <>
      {/* Backdrop */}
      {open && <div className="offcanvas-backdrop fade show" onClick={onClose} />}

      <div className={`offcanvas offcanvas-end ${open ? "show" : ""} role-offcanvas`}>
        {/* Header */}
        <div className="offcanvas-header border-bottom">
          <div className="min-w-0">
            <div className="fw-bold text-truncate">{role.name}</div>
            <div className="text-muted small">
              {roleUsers.length} users • View / Edit / Disable
            </div>
          </div>

          <button className="btn btn-light border" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="offcanvas-body">
          {/* Top bar: search + filter (NO ADD BUTTON) */}
          <div className="card shadow-sm mb-3">
            <div className="card-body d-flex flex-column gap-2">
              <div className="d-flex gap-2 flex-wrap">
                <div className="role-search w-100">
                  <Search size={16} className="role-search-ic" />
                  <input
                    className="form-control role-search-input"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search user id, name or email…"
                  />
                </div>

                <div className="role-filter">
                  <div className="role-filter-label">
                    <SlidersHorizontal size={16} />
                    <span>Status</span>
                  </div>
                  <select
                    className="form-select role-filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  >
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="text-muted small">
                Showing {filteredUsers.length} of {roleUsers.length}
              </div>
            </div>
          </div>

          {/* Main layout (table + info card) */}
          <div className="row g-3">
            {/* table */}
            <div className="col-12 col-lg-7">
              <div className="card shadow-sm">
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle role-table">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: 150 }}>User ID</th>
                        <th style={{ width: 220 }}>Name</th>
                        <th>Email</th>
                        <th style={{ width: 120 }}>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-muted p-3">
                            No matching users.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr
                            key={u.id}
                            onClick={() => setSelectedUserId(u.id)}
                            className={selectedUserId === u.id ? "table-active" : ""}
                            style={{ cursor: "pointer" }}
                          >
                            <td className="fw-semibold">{u.userId}</td>
                            <td className="fw-semibold">{u.fullName}</td>
                            <td className="text-muted">{u.email}</td>
                            <td>
                              <span
                                className={`badge rounded-pill ${
                                  u.status === "Active"
                                    ? "bg-success-subtle text-success-emphasis"
                                    : "bg-secondary-subtle text-secondary-emphasis"
                                }`}
                              >
                                {u.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* info card */}
            <div className="col-12 col-lg-5">
              <div className="card shadow-sm role-info-card">
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div>
                      <div className="fw-bold">User Information</div>
                      <div className="text-muted small">Select a row to preview details</div>
                    </div>

                    {selectedUser && (
                      <button
                        className="btn btn-light border btn-sm"
                        onClick={() => setSelectedUserId(null)}
                        title="Clear"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="role-info-divider" />

                  {!selectedUser ? (
                    <div className="text-center">
                      <div className="text-muted">No user selected.</div>
                      <div className="text-muted small">
                        Click a row in the table to view details.
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex flex-column align-items-center text-center gap-2 mb-3">
                        <div className="role-info-avatar">
                          {selectedUser.fullName.trim().slice(0, 1).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="fw-bold text-truncate">{selectedUser.fullName}</div>
                          <div className="text-muted small text-truncate">{selectedUser.email}</div>
                        </div>
                      </div>

                      <div className="role-info-meta">
                        <div className="role-info-meta-item">
                          <div className="text-muted small">User ID</div>
                          <div className="fw-semibold">{selectedUser.userId}</div>
                        </div>

                        <div className="role-info-meta-item">
                          <div className="text-muted small">Role</div>
                          <div className="fw-semibold">{role.name}</div>
                        </div>

                        <div className="role-info-meta-item">
                          <div className="text-muted small">Status</div>
                          <span
                            className={`badge rounded-pill ${
                              selectedUser.status === "Active"
                                ? "bg-success-subtle text-success-emphasis"
                                : "bg-secondary-subtle text-secondary-emphasis"
                            }`}
                          >
                            {selectedUser.status}
                          </span>
                        </div>

                        <div className="role-info-meta-item">
                          <div className="text-muted small">Created</div>
                          <div className="fw-semibold">{selectedUser.createdAt}</div>
                        </div>
                      </div>

                      <div className="d-grid gap-2 mt-3">
                        <button
                          className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                          onClick={() => openEdit(selectedUser)}
                        >
                          <Pencil size={16} />
                          Edit User
                        </button>

                        <button
                          className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                          onClick={() => toggleDisable(selectedUser)}
                        >
                          {selectedUser.status === "Active" ? (
                            <Ban size={16} />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                          {selectedUser.status === "Active" ? "Disable" : "Enable"}
                        </button>

                        <button
                          className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2"
                          onClick={deleteSelected}
                        >
                          <Trash2 size={16} />
                          Delete User
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MODAL (EDIT ONLY) */}
          {modalOpen && (
            <>
              <div className="modal-backdrop fade show" onClick={closeModal} />

              <div className="modal d-block role-modal" tabIndex={-1} role="dialog" aria-modal="true">
                <div className="modal-dialog modal-dialog-centered role-modal-dialog" role="document">
                  <div className="modal-content role-modal-content">
                    <div className="modal-header role-modal-header">
                      <div className="fw-bold">Edit User</div>

                      <button className="btn btn-light border" onClick={closeModal} aria-label="Close">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="modal-body">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label small mb-1">
                            User ID <span className="text-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${!form.userId.trim() ? "is-invalid" : ""}`}
                            value={form.userId}
                            onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
                            placeholder="e.g. STU-2024-001"
                          />
                          <div className="invalid-feedback">User ID is required.</div>
                        </div>

                        <div className="col-12">
                          <label className="form-label small mb-1">
                            Full Name <span className="text-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${!form.fullName.trim() ? "is-invalid" : ""}`}
                            value={form.fullName}
                            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                            placeholder="e.g. Juan Dela Cruz"
                          />
                          <div className="invalid-feedback">Full name is required.</div>
                        </div>

                        <div className="col-12">
                          <label className="form-label small mb-1">
                            Email <span className="text-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${!isValidEmail(form.email) ? "is-invalid" : ""}`}
                            value={form.email}
                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                            placeholder="e.g. juan@university.edu"
                            inputMode="email"
                          />
                          <div className="invalid-feedback">Enter a valid email address.</div>
                        </div>

                        <div className="col-12">
                          <label className="form-label small mb-1">Status</label>
                          <select
                            className="form-select"
                            value={form.status}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, status: e.target.value as UserStatus }))
                            }
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button className="btn btn-outline-secondary" onClick={closeModal}>
                        Cancel
                      </button>

                      <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={submitModal}
                        disabled={!canSubmit}
                      >
                        <Save size={16} />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
