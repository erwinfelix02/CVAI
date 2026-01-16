import {
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import UserRow from "../../components/Admin/UserRow";
import AddUserModal from "../../components/Admin/AddUserModal";
import type { User } from "../../types/User";
import "../../styles/admin-users.css";
import { API_BASE_URL } from "../../config";
import SchoolInfoModal from "../../components/Admin/InfoModal";

const USERS_PER_PAGE = 4;

type RoleFilter = "all" | "Student" | "Faculty";
type StatusFilter = "all" | "active" | "inactive";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showViewUser, setShowViewUser] = useState(false);

  /* ---------------- FETCH USERS ---------------- */
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`);
      // Map backend data to frontend User type and normalize role strings
      const mappedUsers: User[] = res.data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email ? u.email : "No account created",

        role: u.role.trim(), // remove spaces
        status: u.status,
        courseOrDept: u.courseOrDept,
        yearOrPosition: u.yearOrPosition,
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewUser(true);
  };

  /* ---------------- FILTER + SEARCH ---------------- */
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        if (roleFilter === "all") return true;
        return user.role.toLowerCase() === roleFilter.toLowerCase();
      })
      .filter((user) => {
        if (statusFilter === "all") return true;
        return user.status === statusFilter;
      })
      .filter((user) => {
        const keyword = searchTerm.toLowerCase();
        return (
          user.id.toLowerCase().includes(keyword) ||
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword)
        );
      });
  }, [roleFilter, statusFilter, searchTerm, users]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  );
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + USERS_PER_PAGE
  );

  /* ---------------- HANDLERS ---------------- */
  const handleFilterChange = (filter: RoleFilter) => {
    setRoleFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleUserAdded = () => {
    setShowAddUser(false);
    fetchUsers(); // refresh table after adding a new user
  };

  return (
    <>
      <div className="users-page">
        {/* HEADER */}
        <div className="users-header">
          <div>
            <h1>Users</h1>
            <p>View all students and faculty members</p>
          </div>

          <button className="add-user-btn" onClick={() => setShowAddUser(true)}>
            <UserPlus size={18} />
            Add User
          </button>
        </div>

        {/* CARD */}

        <div className="users-card">
          {/* TOOLBAR */}
          <div className="users-toolbar d-flex justify-content-between align-items-center mb-3">
            {/* SEARCH */}
            <div className="search-box d-flex align-items-center gap-2">
              <Search size={18} />
              <input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            {/* FILTER TABS */}
            <div className="tabs d-flex gap-2">
              <div className="filter-wrapper">
                <button
                  className={`filter-btn ${statusFilter !== "all" ? "filter-active" : ""}`}
                  onClick={() => setShowFilterMenu((v) => !v)}
                >
                  <Filter size={18} />
                  {statusFilter !== "all" && <span className="filter-dot" />}
                </button>

                {showFilterMenu && (
                  <div className="filter-menu">
                    {statusFilter !== "all" && (
                      <button
                        className="filter-option"
                        onClick={() => {
                          setStatusFilter("all");
                          setShowFilterMenu(false);
                          setCurrentPage(1);
                        }}
                      >
                        All Users
                      </button>
                    )}
                    {statusFilter !== "active" && (
                      <button
                        className="filter-option"
                        onClick={() => {
                          setStatusFilter("active");
                          setShowFilterMenu(false);
                          setCurrentPage(1);
                        }}
                      >
                        Active
                      </button>
                    )}
                    {statusFilter !== "inactive" && (
                      <button
                        className="filter-option"
                        onClick={() => {
                          setStatusFilter("inactive");
                          setShowFilterMenu(false);
                          setCurrentPage(1);
                        }}
                      >
                        Inactive
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                className="add-user-btn"
                onClick={() => handleFilterChange("all")}
              >
                All
                {roleFilter === "all" && <span className="filter-dot" />}
              </button>

              <button
                className="add-user-btn"
                onClick={() => handleFilterChange("Student")}
              >
                Student
                {roleFilter === "Student" && <span className="filter-dot" />}
              </button>

              <button
                className="add-user-btn"
                onClick={() => handleFilterChange("Faculty")}
              >
                Faculty
                {roleFilter === "Faculty" && <span className="filter-dot" />}
              </button>
            </div>
          </div>
          <div className="table-wrapper">
            {/* TABLE */}
            <table className="users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onView={handleViewUser}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-3">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* PAGINATION */}
          <div className="pagination d-flex justify-content-between align-items-center mt-3">
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>

            <div className="d-flex gap-2">
              <button
                className="add-user-btn add-user-btn--sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft size={14} />
                Prev
              </button>

              <button
                className="add-user-btn add-user-btn--sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ADD USER MODAL */}
      <AddUserModal
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        onUserAdded={handleUserAdded}
      />
      {selectedUser && (
        <SchoolInfoModal
          open={showViewUser}
          onClose={() => setShowViewUser(false)}
          user={selectedUser}
        />
      )}
    </>
  );
}
