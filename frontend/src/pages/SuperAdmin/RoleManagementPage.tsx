import { useEffect, useMemo, useState } from "react";
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

import { getUsers } from "../../api/userService";
import "../../styles/superadmin-roles.css";

/* ================= HELPERS ================= */

function roleToRoleId(role: string): string {
  switch (role) {
    case "Super Admin":
      return "superadmin";
    case "Registrar":
      return "registrar";
    case "Dept Head":
      return "depthead";
    case "Finance":
      return "finance";
    case "Faculty":
      return "faculty";
    case "Student":
      return "student";
    default:
      return "";
  }
}

const makeFullName = (
  firstName: string,
  middleName: string,
  lastName: string,
) =>
  [firstName, middleName, lastName]
    .filter((x) => x && x.trim())
    .join(" ")
    .trim();

/* ================= PAGE ================= */

export default function RoleManagementPage() {
  /* ---------- ROLES (STATIC) ---------- */
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

  /* ---------- USERS (FROM DB) ---------- */
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await getUsers();

        const mapped: UserItem[] = data.map((u: any) => ({
          id: u._id,
          userId: u.idNumber,
          firstName: u.firstName,
          middleName: u.middleName || "",
          lastName: u.lastName,
          fullName: makeFullName(
            u.firstName,
            u.middleName || "",
            u.lastName,
          ),
          email: u.email,
          phone: u.phone,
          gender: u.gender as Gender,
          status: u.status === "active" ? "Active" : "Inactive",
          roleId: roleToRoleId(u.role),
          createdAt: u.createdAt,
        }));

        setUsers(mapped);
      } catch (err) {
        console.error("❌ Failed to fetch users", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  /* ---------- VIEW STATE ---------- */
  const [view, setView] = useState<"list" | "details">("list");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const [detailsRoleId, setDetailsRoleId] = useState<string | null>(null);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);

  const selectedRole = selectedRoleId
    ? roles.find((r) => r.id === selectedRoleId) ?? null
    : null;

  /* ---------- ROLE COUNTS ---------- */
  const rolesWithCounts = useMemo(() => {
    const counts = users.reduce<Record<string, number>>((acc, u) => {
      acc[u.roleId] = (acc[u.roleId] ?? 0) + 1;
      return acc;
    }, {});

    return roles.map((r) => ({
      ...r,
      users: counts[r.id] ?? 0,
    }));
  }, [roles, users]);

  /* ---------- MODAL ROLES ---------- */
  const detailsRole = detailsRoleId
    ? rolesWithCounts.find((r) => r.id === detailsRoleId) ?? null
    : null;

  const editRole = editRoleId
    ? rolesWithCounts.find((r) => r.id === editRoleId) ?? null
    : null;

  const saveRolePermissions = (roleId: string, perms: any[]) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions: perms } : r)),
    );
    setEditRoleId(null);
    setDetailsRoleId(null);
  };

  const openRoleDetailsPage = (id: string) => {
    setSelectedRoleId(id);
    setView("details");
  };

  /* ================= RENDER ================= */

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

          {loadingUsers ? (
            <div className="text-muted small">Loading users…</div>
          ) : (
            <RoleGrid
              items={rolesWithCounts}
              onOpen={openRoleDetailsPage}
              onSettings={(id) => setDetailsRoleId(id)}
            />
          )}
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

      {detailsRole && (
        <RoleDetailsModal
          role={detailsRole}
          onClose={() => setDetailsRoleId(null)}
          onEdit={() => setEditRoleId(detailsRole.id)}
        />
      )}

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
