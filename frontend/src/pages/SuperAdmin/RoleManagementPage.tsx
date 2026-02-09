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

import RoleDetailsModal from "../../components/SuperAdmin/Roles/RoleDetailsModal";
import EditRoleModal from "../../components/SuperAdmin/Roles/EditRoleModal";

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
        permissions: [
          "manage_users",
          "manage_roles",
          "manage_portals",
          "view_system_logs",
          "manage_ai_knowledge",
        ],
      },
      {
        id: "registrar",
        name: "Registrar",
        users: 0,
        tone: "blue",
        icon: ClipboardList,
        permissions: [
          "manage_students",
          "process_applications",
          "manage_enrollment",
        ],
      },
      {
        id: "depthead",
        name: "Department Head",
        users: 0,
        tone: "orange",
        icon: Building2,
        permissions: [
          "manage_schedules",
          "assign_rooms",
          "manage_faculty_loads",
        ],
      },
      {
        id: "finance",
        name: "Finance",
        users: 0,
        tone: "green",
        icon: Wallet,
        permissions: ["fee_management", "scholarships", "financial_reports"],
      },
      {
        id: "faculty",
        name: "Faculty",
        users: 0,
        tone: "teal",
        icon: BookOpen,
        permissions: ["grade_management", "class_materials", "attendance"],
      },
      {
        id: "student",
        name: "Student",
        users: 0,
        tone: "indigo",
        icon: GraduationCap,
        permissions: ["view_grades", "view_schedule", "ai_assistant"],
      },
    ],
    [],
  );

  const [roles, setRoles] = useState<RoleCardItem[]>(seedRoles);

  // users (same as yours, kept)
  const makeFullName = (
    firstName: string,
    middleName: string,
    lastName: string,
  ) =>
    [firstName, middleName, lastName]
      .filter((x) => x.trim())
      .join(" ")
      .trim();

  const [users] = useState<UserItem[]>([
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
  ]);

  const [view, setView] = useState<"list" | "details">("list");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // ✅ modals
  const [detailsRoleId, setDetailsRoleId] = useState<string | null>(null);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);

  const selectedRole = selectedRoleId
    ? (roles.find((r) => r.id === selectedRoleId) ?? null)
    : null;

  // live user counts
  const rolesWithCounts = useMemo(() => {
    const counts = users.reduce<Record<string, number>>((acc, u) => {
      acc[u.roleId] = (acc[u.roleId] ?? 0) + 1;
      return acc;
    }, {});
    return roles.map((r) => ({ ...r, users: counts[r.id] ?? 0 }));
  }, [roles, users]);

  const openRoleDetailsPage = (id: string) => {
    setSelectedRoleId(id);
    setView("details");
  };

  const detailsRole = detailsRoleId
    ? (rolesWithCounts.find((r) => r.id === detailsRoleId) ?? null)
    : null;
  const editRole = editRoleId
    ? (rolesWithCounts.find((r) => r.id === editRoleId) ?? null)
    : null;

  const saveRolePermissions = (roleId: string, perms: any[]) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions: perms } : r)),
    );
    setEditRoleId(null);
    setDetailsRoleId(null);
  };

  return (
    <div className="superadmin-roles container-fluid py-3 py-md-4">
      {view === "list" && (
        <>
          <RoleHeader
            title="Role Management"
            subtitle="Configure portal access and permissions"
            onAction={() => {}}
            actionLabel=""
          />

          <RoleGrid
            items={rolesWithCounts}
            onOpen={openRoleDetailsPage}
            onSettings={(id) => setDetailsRoleId(id)} // ✅ open role details modal
          />
        </>
      )}

      {view === "details" && selectedRole && (
        <RoleDetailsView
          role={selectedRole}
          users={users}
          onBack={() => setView("list")}
          onUpdateUser={() => {}}
          onRemoveUserFromRole={() => {}}
        />
      )}

      {/* ✅ Role Details modal (matches screenshot) */}
      {detailsRole && (
        <RoleDetailsModal
          role={detailsRole}
          onClose={() => setDetailsRoleId(null)}
          onEdit={() => {
            setEditRoleId(detailsRole.id);
          }}
        />
      )}

      {/* ✅ Edit modal (grid cards, only allowed for that role) */}
      {editRole && (
        <EditRoleModal
          role={editRole}
          onClose={() => setEditRoleId(null)}
          onSave={(perms) => saveRolePermissions(editRole.id, perms)}
        />
      )}
    </div>
  );
}
