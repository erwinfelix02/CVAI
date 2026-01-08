import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaShieldAlt,
} from "react-icons/fa";
import type { Dispatch, SetStateAction, ReactNode } from "react";

export type Role = "student" | "employee" | "admin";

interface RoleSelectorProps {
  role: Role;
  setRole: Dispatch<SetStateAction<Role>>;
  allowedRoles?: Role[]; // ✅ NEW
}

export default function RoleSelector({
  role,
  setRole,
  allowedRoles = ["student", "employee", "admin"], // default = all
}: RoleSelectorProps) {
  const roles: { id: Role; label: string; icon: ReactNode }[] = [
    { id: "student", label: "Student", icon: <FaUserGraduate /> },
    { id: "employee", label: "Employee", icon: <FaChalkboardTeacher /> },
    { id: "admin", label: "Admin", icon: <FaShieldAlt /> },
  ];

  return (
    <div className="role-selector">
      {roles
        .filter((r) => allowedRoles.includes(r.id)) // ✅ filter here
        .map((r) => (
          <button
            key={r.id}
            type="button"
            className={`role-btn ${role === r.id ? "active" : ""}`}
            onClick={() => setRole(r.id)}
          >
            {r.icon}
            <span>{r.label}</span>
          </button>
        ))}
    </div>
  );
}
