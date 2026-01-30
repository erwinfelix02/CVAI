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
      <table className="table align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th className="text-nowrap">User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th className="text-nowrap">Role</th>
            <th className="text-nowrap">Status</th>
            <th className="text-nowrap text-end">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted py-4">
                No users found.
              </td>
            </tr>
          ) : (
            rows.map((u) => (
              <tr key={u.id}>
                <td className="font-monospace text-nowrap">{u.id}</td>
                <td className="fw-semibold">{u.name}</td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <RolePill role={u.role} />
                </td>
                <td>
                  <StatusPill status={u.status} />
                </td>
                <td className="text-end">
                  <button
                    type="button"
                    className="users-eye-btn"
                    onClick={() => onView(u)}
                    aria-label={`View ${u.name}`}
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
