import { Eye, Edit } from "lucide-react";
import type { User } from "../../types/User";
import "../../styles/admin-users.css";

interface UserRowProps {
  user: User;
  onView: (user: User) => void;
}

export default function UserRow({ user, onView }: UserRowProps) {
  return (
    <tr>
      <td data-label="User ID">{user.id}</td>
      <td data-label="Name">{user.name}</td>

      <td data-label="Email">
        <span
          className={
            user.email === "No account created"
              ? "email-missing"
              : "email-normal"
          }
        >
          {user.email}
        </span>
      </td>

      <td data-label="Role">
        <span className="role-pill">{user.role}</span>
      </td>

      <td data-label="Status">
        <span
          className={`badge ${
            user.status === "active" ? "bg-success" : "bg-danger"
          }`}
        >
          {user.status}
        </span>
      </td>

      <td data-label="Action">
        <button
          type="button"
          className="btn btn-link p-0 me-2"
          onClick={() => onView(user)}
        >
          <Eye size={18} />
        </button>

        <button type="button" className="btn btn-link p-0">
          <Edit size={18} />
        </button>
      </td>
    </tr>
  );
}
