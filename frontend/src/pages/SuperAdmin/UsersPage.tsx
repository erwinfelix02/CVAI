import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import UsersToolbar from "../../components/SuperAdmin/Users/UsersToolbar";
import UsersTable from "../../components/SuperAdmin/Users/UsersTable";
import AddUserModal from "../../components/SuperAdmin/Users/AddUserModal";
import type { AddUserPayload } from "../../components/SuperAdmin/Users/AddUserModal";
import { createUser, getUsers } from "../../api/userService";
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
  id: string;          // MongoDB _id
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  status: UserStatus;
  phone?: string;
  userCode?: string;
  notes?: string;
};

export type RoleTab =
  | "All"
  | "Admins"
  | "Registrar"
  | "Dept Heads"
  | "Finance"
  | "Faculty"
  | "Students";

/* ================= HELPERS ================= */

function tabToRoleFilter(tab: RoleTab): UserRole | "All" {
  switch (tab) {
    case "Admins":
      return "Super Admin";
    case "Registrar":
      return "Registrar";
    case "Dept Heads":
      return "Dept Head";
    case "Finance":
      return "Finance";
    case "Faculty":
      return "Faculty";
    case "Students":
      return "Student";
    default:
      return "All";
  }
}

/* ================= PAGE ================= */

export default function UsersPage() {
  /* 🔥 USERS NOW COME FROM DATABASE */
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<RoleTab>("All");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");

  const [page, setPage] = useState(1);
  const pageSize = 7;

  const [addOpen, setAddOpen] = useState(false);

  /* ================= LOAD USERS FROM DB ================= */

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers();

        const mapped: UserRow[] = data.map((u: any) => ({
          id: u._id,
          name: `${u.firstName} ${u.middleName ? u.middleName + " " : ""}${u.lastName}`.trim(),
          email: u.email,
          role: u.role,
          department: u.department,
          status: u.status,
          phone: u.phone,
          userCode: u.idNumber,
          notes: u.notes,
        }));

        setUsers(mapped);
      } catch (err) {
        console.error(err);
        alert("Failed to load users from database");
      }
    };

    loadUsers();
  }, []);

  /* ================= FILTERING ================= */

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const roleFilter = tabToRoleFilter(activeTab);

    return users.filter((u) => {
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || u.status === statusFilter;
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      return matchesRole && matchesStatus && matchesQuery;
    });
  }, [users, query, activeTab, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, activeTab, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ================= ADD USER ================= */

  const handleAddUser = async (payload: AddUserPayload) => {
    try {
      setIsLoading(true);

      // Save to backend
      await createUser(payload);

      // Reload users from DB (single source of truth)
      const data = await getUsers();

      const mapped: UserRow[] = data.map((u: any) => ({
        id: u._id,
        name: `${u.firstName} ${u.middleName ? u.middleName + " " : ""}${u.lastName}`.trim(),
        email: u.email,
        role: u.role,
        department: u.department,
        status: u.status,
        phone: u.phone,
        userCode: u.idNumber,
        notes: u.notes,
      }));

      setUsers(mapped);
      setAddOpen(false);
      alert("✅ User saved successfully");
    } catch (err: any) {
      alert(err.message || "Failed to save user");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
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
            activeTab={activeTab}
            onTabChange={setActiveTab}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          <UsersTable rows={pageRows} onView={(u) => console.log("view", u)} />

          {totalPages > 1 && (
            <div className="d-flex justify-content-end mt-3">
              <nav>
                <ul className="pagination pagination-sm users-pagination">
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={16} />
                    </button>
                  </li>

                  <li className="page-item active">
                    <span className="page-link">{page}</span>
                  </li>

                  <li
                    className={`page-item ${
                      page === totalPages ? "disabled" : ""
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
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <AddUserModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddUser}
        isLoading={isLoading}
      />
    </div>
  );
}
