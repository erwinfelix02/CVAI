import {
  Shield,
  ClipboardList,
  Building2,
  Wallet,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import type { UserRole } from "../../../../pages/SuperAdmin/UsersPage";

export default function RolePill({ role }: { role: UserRole }) {
  const meta: Record<
    UserRole,
    { cls: string; Icon: any }
  > = {
    "Super Admin": { cls: "pill-superadmin", Icon: Shield },
    Registrar: { cls: "pill-registrar", Icon: ClipboardList },
    "Dept Head": { cls: "pill-depthead", Icon: Building2 },
    Finance: { cls: "pill-finance", Icon: Wallet },
    Faculty: { cls: "pill-faculty", Icon: BookOpen },
    Student: { cls: "pill-student", Icon: GraduationCap },
  };

  const { cls, Icon } = meta[role];

  return (
    <span className={`users-pill ${cls}`}>
      <Icon size={14} />
      <span>{role}</span>
    </span>
  );
}
