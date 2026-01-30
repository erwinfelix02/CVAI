import type { UserStatus } from "../../../../pages/SuperAdmin/UsersPage";

export default function StatusPill({ status }: { status: UserStatus }) {
  const isActive = status === "active";
  return (
    <span
      className={`badge rounded-pill fw-semibold ${
        isActive ? "text-bg-success" : "text-bg-danger"
      }`}
      style={{ opacity: 0.9 }}
    >
      {status}
    </span>
  );
}
