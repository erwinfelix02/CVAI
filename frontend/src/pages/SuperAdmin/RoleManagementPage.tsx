import { useMemo, useState } from "react";
import {
  Shield,
  ClipboardList,
  Building2,
  Wallet,
  BookOpen,
  GraduationCap,
} from "lucide-react";

import RoleHeader from "../../components/SuperAdmin/Roles/RoleHeader";
import RoleGrid from "../../components/SuperAdmin/Roles/RoleGrid";
import RoleDetailsView from "../../components/SuperAdmin/Roles/RoleDetailsView";

import type {
  RoleCardItem,
  UserItem,
  Gender,
} from "../../components/SuperAdmin/Roles/types";

import "../../styles/superadmin-roles.css";

export default function RoleManagementPage() {
  const seedRoles = useMemo<RoleCardItem[]>(
    () => [
      {
        id: "superadmin",
        name: "Super Admin",
        users: 0,
        tone: "purple",
        icon: Shield,
        permissions: ["Full system access", "Manage all portals", "Manage roles"],
      },
      {
        id: "registrar",
        name: "Registrar",
        users: 0,
        tone: "blue",
        icon: ClipboardList,
        permissions: ["Manage students", "Process applications", "Enrollment"],
      },
      {
        id: "depthead",
        name: "Department Head",
        users: 0,
        tone: "orange",
        icon: Building2,
        permissions: ["Manage schedules", "Assign rooms", "Faculty loads"],
      },
      {
        id: "finance",
        name: "Finance",
        users: 0,
        tone: "green",
        icon: Wallet,
        permissions: ["Fee management", "Scholarships", "Financial reports"],
      },
      {
        id: "faculty",
        name: "Faculty",
        users: 0,
        tone: "teal",
        icon: BookOpen,
        permissions: ["Grade management", "Class materials", "Attendance"],
      },
      {
        id: "student",
        name: "Student",
        users: 0,
        tone: "indigo",
        icon: GraduationCap,
        permissions: ["View grades", "View schedule", "AI assistant"],
      },
    ],
    []
  );

  const [roles] = useState<RoleCardItem[]>(seedRoles);

  // ✅ helper to build fullName consistently
  const makeFullName = (firstName: string, middleName: string, lastName: string) =>
    [firstName, middleName, lastName].filter((x) => x.trim()).join(" ").trim();

  const [users, setUsers] = useState<UserItem[]>([
    {
      id: "u1",
      userId: "FAC-2025-001",
      firstName: "Maria",
      middleName: "",
      lastName: "Santos",
      gender: "Female" as Gender,
      houseNo: "21",
      fullName: makeFullName("Maria", "", "Santos"),
      email: "maria@uni.edu",
      phone: "09123456789",
      status: "Active",
      roleId: "faculty",
      createdAt: "2025-11-12",
    },
    {
      id: "u2",
      userId: "STU-2025-014",
      firstName: "Juan",
      middleName: "",
      lastName: "Dela Cruz",
      gender: "Male" as Gender,
      houseNo: "113",
      fullName: makeFullName("Juan", "", "Dela Cruz"),
      email: "juan@uni.edu",
      phone: "09987654321",
      status: "Active",
      roleId: "student",
      createdAt: "2025-10-05",
    },
    {
      id: "u3",
      userId: "STU-2025-022",
      firstName: "Ana",
      middleName: "",
      lastName: "Reyes",
      gender: "Female" as Gender,
      houseNo: "7B",
      fullName: makeFullName("Ana", "", "Reyes"),
      email: "ana@uni.edu",
      phone: "09112223333",
      status: "Inactive",
      roleId: "student",
      createdAt: "2025-09-22",
    },
    {
      id: "u4",
      userId: "REG-2025-003",
      firstName: "Kevin",
      middleName: "",
      lastName: "Lim",
      gender: "Male" as Gender,
      houseNo: "55",
      fullName: makeFullName("Kevin", "", "Lim"),
      email: "kevin@uni.edu",
      phone: "09223334444",
      status: "Active",
      roleId: "registrar",
      createdAt: "2025-09-01",
    },
  ]);

  const [view, setView] = useState<"list" | "details">("list");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const selectedRole = selectedRoleId
    ? roles.find((r) => r.id === selectedRoleId) ?? null
    : null;

  // live user counts
  const rolesWithCounts = useMemo(() => {
    const counts = users.reduce<Record<string, number>>((acc, u) => {
      acc[u.roleId] = (acc[u.roleId] ?? 0) + 1;
      return acc;
    }, {});
    return roles.map((r) => ({ ...r, users: counts[r.id] ?? 0 }));
  }, [roles, users]);

  const openRoleDetails = (id: string) => {
    setSelectedRoleId(id);
    setView("details");
  };

  // user actions
  const addUserToRole = (roleId: string, user: Omit<UserItem, "id">) => {
    setUsers((prev) => [
      ...prev,
      { ...user, id: `u${prev.length + 1}`, roleId },
    ]);
  };

  const updateUser = (userId: string, patch: Partial<UserItem>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...patch } : u))
    );
  };

  const removeUserFromRole = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <div className="superadmin-roles container-fluid py-3 py-md-4">
      {view === "list" && (
        <>
          {/* Header WITHOUT Add Role */}
          <RoleHeader
            title="Role Management"
            subtitle="Configure portal access and permissions"
            onAction={() => {}}
            actionLabel=""
          />

          <RoleGrid
            items={rolesWithCounts}
            onOpen={openRoleDetails}
            onSettings={(id) => alert(`Settings: ${id}`)}
          />
        </>
      )}

      {view === "details" && selectedRole && (
        <RoleDetailsView
          role={selectedRole}
          users={users}
          onBack={() => setView("list")}
          onAddUserToRole={addUserToRole}
          onUpdateUser={updateUser}
          onRemoveUserFromRole={removeUserFromRole}
        />
      )}
    </div>
  );
}
