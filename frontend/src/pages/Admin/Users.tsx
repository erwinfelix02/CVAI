import { Search, Filter, MoreHorizontal, UserPlus } from "lucide-react";

const users = [
  {
    name: "John Doe",
    email: "john.doe@university.edu",
    role: "student",
    status: "active",
    joined: "2024-01-15",
  },
  {
    name: "Jane Smith",
    email: "jane.smith@university.edu",
    role: "teacher",
    status: "active",
    joined: "2024-01-10",
  },
  {
    name: "Bob Wilson",
    email: "bob.wilson@university.edu",
    role: "student",
    status: "inactive",
    joined: "2024-02-20",
  },
  {
    name: "Alice Brown",
    email: "alice.brown@university.edu",
    role: "teacher",
    status: "active",
    joined: "2024-01-05",
  },
  {
    name: "Charlie Davis",
    email: "charlie.davis@university.edu",
    role: "student",
    status: "active",
    joined: "2024-03-01",
  },
];

export default function AdminUsers() {
  return (
    <div className="users-page">
      {/* HEADER */}
      <div className="users-header">
        <div>
          <h1>Users</h1>
          <p>Manage all registered users</p>
        </div>

        <button className="add-user-btn">
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      {/* CARD */}
      <div className="users-card">
        {/* TOOLBAR */}
        <div className="users-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input placeholder="Search users..." />
          </div>

          <button className="filter-btn">
            <Filter size={18} />
          </button>
        </div>

        {/* TABLE */}
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.email}>
                <td className="name" data-label="Name">
                  {u.name}
                </td>

                <td className="email" data-label="Email">
                  {u.email}
                </td>

                <td data-label="Role">
                  <span className={`pill role ${u.role}`}>{u.role}</span>
                </td>

                <td data-label="Status">
                  <span className={`pill status ${u.status}`}>{u.status}</span>
                </td>

                <td className="date" data-label="Joined">
                  {u.joined}
                </td>

                <td className="actions" data-label="Actions">
                  <MoreHorizontal size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
