import type { UserStatus } from "../../../../pages/SuperAdmin/UsersPage";

export default function StatusPill({ status }: { status: UserStatus }) {
  const isActive = status === "active";
  return (
    <span className={`users-status ${isActive ? "active" : "inactive"}`}>
      {status}
    </span>
  );
}
