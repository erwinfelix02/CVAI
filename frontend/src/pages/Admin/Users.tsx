import {
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import UserRow from "../../components/Admin/UserRow";
import type { User } from "../../types/User";

const USERS_PER_PAGE = 4;

const users: User[] = [
  {
    id: "STU-2024-001",
    name: "John Doe",
    email: "john.doe@university.edu",
    role: "Student",
    status: "active",
  },
  {
    id: "FAC-001",
    name: "Dr. Jane Smith",
    email: "jane.smith@university.edu",
    role: "Faculty",
    status: "active",
  },
  {
    id: "STU-2024-002",
    name: "Bob Wilson",
    email: "bob.wilson@university.edu",
    role: "Student",
    status: "active",
  },
  {
    id: "FAC-002",
    name: "Dr. Alice Brown",
    email: "alice.brown@university.edu",
    role: "Faculty",
    status: "active",
  },
  {
    id: "STU-2024-003",
    name: "Charlie Davis",
    email: "charlie.davis@university.edu",
    role: "Student",
    status: "inactive",
  },
];

type RoleFilter = "all" | "Student" | "Faculty";

export default function AdminUsers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  /* ---------------- FILTER + SEARCH ---------------- */

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) =>
        roleFilter === "all" ? true : user.role === roleFilter
      )
      .filter((user) => {
        const keyword = searchTerm.toLowerCase();
        return (
          user.id.toLowerCase().includes(keyword) ||
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword)
        );
      });
  }, [roleFilter, searchTerm]);

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

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="users-page">
      {/* HEADER */}
      <div className="users-header">
        <div>
          <h1>Users</h1>
          <p>View all students and faculty members</p>
        </div>

        <button className="add-user-btn">
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
            <button
              className={`add-user-btn ${
                roleFilter === "all" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("all")}
            >
              All
            </button>

            <button
              className={`add-user-btn ${
                roleFilter === "Student" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("Student")}
            >
              Students
            </button>

            <button
              className={`add-user-btn ${
                roleFilter === "Faculty" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("Faculty")}
            >
              Faculty
            </button>
          </div>
        </div>

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
                <UserRow key={user.id} user={user} />
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

        {/* PAGINATION */}
        <div className="pagination d-flex justify-content-between align-items-center mt-3">
          <span className="text-muted">
            Page {currentPage} of {totalPages}
          </span>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            <button
              className="btn btn-outline-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
