import { Eye } from "lucide-react";
import type { UserRow } from "../../../pages/SuperAdmin/UsersPage";
import RolePill from "./pills/RolePill";
import StatusPill from "./pills/StatusPill";

export default function UsersTable({
  rows,
  onView,
}: {
  rows: UserRow[];
  onView: (u: UserRow) => void;
}) {
  return (
    <div className="table-responsive">
      <table className="table users-table">
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
              <td className="fw-semibold">{u.name}</td>
              <td className="text-muted">{u.email}</td>
              <td><RolePill role={u.role} /></td>
              <td className="text-muted">{u.department}</td>
              <td><StatusPill status={u.status} /></td>
              <td className="text-end">
                <button className="users-action-btn" onClick={() => onView(u)}>
                  <Eye size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
