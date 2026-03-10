import { Eye, Send } from "lucide-react";
import type { UserRow } from "../../../pages/SuperAdmin/UsersPage";

type Props = {
  rows: UserRow[];
  onView: (u: UserRow) => void;
  onSendCredentials: (u: UserRow) => void;
};

export default function UsersTable({ rows, onView, onSendCredentials }: Props) {
  return (
    <div className="table-responsive">
      <table className="table users-table align-middle">
        <thead className="users-thead">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Status</th>
            <th className="text-end">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="users-row">
              <td className="fw-semibold align-middle">{u.name}</td>
              <td className="text-muted align-middle">{u.email}</td>
              <td className="align-middle">{u.role}</td>
              <td className="text-muted align-middle">{u.department}</td>

              <td className="align-middle">
                <span
                  className={`users-status ${
                    u.status === "active" ? "active" : "inactive"
                  }`}
                >
                  {u.status}
                </span>
              </td>

              <td className="text-end align-middle">
                <div className="d-flex justify-content-end align-items-center gap-2">
                  <button
                    type="button"
                    className="users-action-btn"
                    onClick={() => onView(u)}
                    title="View User"
                  >
                    <Eye size={18} />
                  </button>

                  {u.createdBy === "SuperAdmin" &&
                    u.status === "inactive" &&
                    !u.credentialsSent && (
                      <button
                        type="button"
                        className="users-action-btn"
                        onClick={() => onSendCredentials(u)}
                        title="Send Credentials"
                      >
                        <Send size={18} />
                      </button>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}