import { Search, UserPlus } from "lucide-react";
import UserRow from "../../components/Admin/UserRow";
import type { User } from "../../types/User";

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

export default function AdminUsers() {
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
          <div className="search-box d-flex align-items-center gap-2">
            <Search size={18} />
            <input placeholder="Search by name, email, or ID..." />
          </div>

          <div className="tabs d-flex gap-2">
            <button className="add-user-btn" data-name="all">
              All
            </button>
            <button className="add-user-btn" data-name="students">
              Students
            </button>
            <button className="add-user-btn" data-name="faculty">
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
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
