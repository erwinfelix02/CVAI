import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import UsersToolbar from "../../components/SuperAdmin/Users/UsersToolbar";
import UsersTable from "../../components/SuperAdmin/Users/UsersTable";
import AddUserModal from "../../components/SuperAdmin/Users/AddUserModal";
import type { AddUserPayload } from "../../components/SuperAdmin/Users/AddUserModal";
import SendCredentialsModal from "../../components/SuperAdmin/Users/SendCredentialsModal";
import UserDetailsModal from "../../components/SuperAdmin/Users/UserDetailsModal";
import AuthAlert from "../../components/Authentication/AuthAlert";
import {
  createUser,
  getUsers,
  sendCredentials,
  getUserById,
} from "../../api/userService";
import "../../styles/superadmin-user.css";

/* ================= TYPES ================= */

export type UserRole =
  | "Student"
  | "Faculty"
  | "Registrar"
  | "Dept Head"
  | "Finance"
  | "Super Admin";

export type UserStatus = "active" | "inactive";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  status: UserStatus;
  phone?: string;
  userCode?: string;
  notes?: string;
  credentialsSent?: boolean;
  createdBy?: string;
};

export type UserDetailsRow = UserRow & {
  gender?: string;
  createdAt?: string;
};

export type RoleFilter =
  | "All"
  | "Super Admin"
  | "Registrar"
  | "Dept Head"
  | "Finance"
  | "Faculty"
  | "Student";

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);

  const [addOpen, setAddOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [viewUser, setViewUser] = useState<UserDetailsRow | null>(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const reloadUsers = async () => {
    try {
      const data = await getUsers();

      const mapped: UserRow[] = data.map((u: any) => ({
        id: u._id,
        name: `${u.firstName} ${
          u.middleName ? u.middleName + " " : ""
        }${u.lastName}`.trim(),
        email: u.email,
        role: u.role,
        department: u.department,
        status: u.status,
        phone: u.phone,
        userCode: u.idNumber,
        notes: u.notes,
        credentialsSent: u.credentialsSent,
        createdBy: u.createdBy,
      }));

      setUsers(mapped);
    } catch (err) {
      console.error(err);
      showAlert("Failed to load users from database", "error");
    }
  };

  useEffect(() => {
    reloadUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((u) => {
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      return matchesRole && matchesStatus && matchesQuery;
    });
  }, [users, query, roleFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, roleFilter, statusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const showAlert = (message: string, type: "success" | "error") => {
    setAnimateAlert(false);

    setTimeout(() => {
      setAlertMessage(message);
      setAlertType(type);
      setAnimateAlert(true);
    }, 50);
  };

  useEffect(() => {
    if (!animateAlert) return;

    const t = setTimeout(() => {
      setAnimateAlert(false);
    }, 3000);

    return () => clearTimeout(t);
  }, [animateAlert]);

  const handleAddUser = async (payload: AddUserPayload) => {
    try {
      setIsLoading(true);

      await createUser({
        ...payload,
        createdBy: "SuperAdmin",
      });

      await reloadUsers();

      setAddOpen(false);
      showAlert("User created successfully (inactive).", "success");
    } catch (err: any) {
      showAlert(err.message || "Failed to save user", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendClick = (user: UserRow) => {
    setSelectedUser(user);
    setSendOpen(true);
  };

  const handleViewClick = async (user: UserRow) => {
    try {
      setIsLoading(true);

      const data = await getUserById(user.id);

      const fullName = `${data.firstName} ${
        data.middleName ? data.middleName + " " : ""
      }${data.lastName}`.trim();

      setViewUser({
        id: data._id,
        name: fullName,
        email: data.email,
        role: data.role,
        department: data.department,
        status: data.status,
        phone: data.phone,
        userCode: data.idNumber,
        notes: data.notes,
        createdBy: data.createdBy,
        gender: data.gender,
        createdAt: data.createdAt,
        credentialsSent: data.credentialsSent,
      });

      setDetailsOpen(true);
    } catch (err: any) {
      showAlert(err.message || "Failed to load user details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSendCredentials = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);

      await sendCredentials(selectedUser.id);

      await reloadUsers();

      setSendOpen(false);
      setSelectedUser(null);

      showAlert("Credentials sent and user activated!", "success");
    } catch (err: any) {
      showAlert(err.message || "Failed to send credentials", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={isLoading}
      />

      <div className="container-fluid py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h1 className="h3 fw-bold mb-1">Portal Users</h1>
            <p className="text-muted mb-0">
              Manage all portal users and their roles
            </p>
          </div>

          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setAddOpen(true)}
          >
            <UserPlus size={18} />
            Add User
          </button>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <UsersToolbar
              query={query}
              onQueryChange={setQuery}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />

            {pageRows.length > 0 ? (
              <>
                <UsersTable
                  rows={pageRows}
                  onView={handleViewClick}
                  onSendCredentials={handleSendClick}
                />

                <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted">Show</span>
                    <select
                      className="form-select form-select-sm"
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      style={{ width: "90px" }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>
                    <span className="text-muted">entries</span>
                  </div>

                  <div className="text-muted small">
                    Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to{" "}
                    {Math.min(safePage * pageSize, filtered.length)} of {filtered.length} users
                  </div>

                  {totalPages > 1 && (
                    <nav>
                      <ul className="pagination pagination-sm users-pagination mb-0">
                        <li
                          className={`page-item ${
                            safePage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setPage((p) => Math.max(1, p - 1))
                            }
                          >
                            <ChevronLeft size={16} />
                          </button>
                        </li>

                        <li className="page-item active">
                          <span className="page-link">{safePage}</span>
                        </li>

                        <li
                          className={`page-item ${
                            safePage === totalPages ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setPage((p) => Math.min(totalPages, p + 1))
                            }
                          >
                            <ChevronRight size={16} />
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              </>
            ) : (
              <div className="users-empty-state">
                <div className="users-empty-icon">📭</div>
                <h5 className="fw-semibold mb-1">No users found</h5>
                <p className="text-muted mb-0">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>
        </div>

        <AddUserModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSubmit={handleAddUser}
          isLoading={isLoading}
          existingUsers={users}
        />

        <SendCredentialsModal
          open={sendOpen}
          user={selectedUser}
          onClose={() => setSendOpen(false)}
          onConfirm={confirmSendCredentials}
          isLoading={isLoading}
        />

        <UserDetailsModal
          open={detailsOpen}
          user={viewUser}
          onClose={() => {
            setDetailsOpen(false);
            setViewUser(null);
          }}
        />
      </div>
    </>
  );
}