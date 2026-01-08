// src/components/Admin/UserRow.tsx
import { Eye, Edit } from "lucide-react";
import type { User } from "../../types/User";

interface UserRowProps {
  user: User;
}

export default function UserRow({ user }: UserRowProps) {
  return (
    <tr>
      <td data-label="User ID">{user.id}</td>
      <td data-label="Name">{user.name}</td>
      <td data-label="Email">{user.email}</td>
      <td data-label="Role">
        <span
          className={`badge ${user.role === "Student" ? "bg-primary" : "bg-success"}`}
        >
          {user.role}
        </span>
      </td>
      <td data-label="Status">
        <span
          className={`badge ${user.status === "active" ? "bg-success" : "bg-danger"}`}
        >
          {user.status}
        </span>
      </td>
      <td data-label="Action">
        <button type="button" className="btn btn-link p-0 me-2">
          <Eye size={18} />
        </button>
        <button type="button" className="btn btn-link p-0">
          <Edit size={18} />
        </button>
      </td>
    </tr>
  );
}
