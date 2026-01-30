import type { UserRole } from "../../../../pages/SuperAdmin/UsersPage";

export default function RolePill({ role }: { role: UserRole }) {
  // simple neutral pill like your screenshot
  return (
    <span className="badge rounded-pill text-bg-light border text-dark fw-semibold">
      {role}
    </span>
  );
}
