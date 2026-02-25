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

import AuthAlert from "../../components/Authentication/AuthAlert";
import { getUsers } from "../../api/userService";
import { getRoles, updateRolePermissions } from "../../api/roleService";
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

const makeFullName = (firstName: string, middleName: string, lastName: string) =>
  [firstName, middleName, lastName].filter((x) => x && x.trim()).join(" ").trim();

const ROLE_UI: Record<
  string,
  { tone: RoleCardItem["tone"]; icon: RoleCardItem["icon"]; nameFallback: string }
> = {
  superadmin: { tone: "purple", icon: Shield, nameFallback: "Super Admin" },
  registrar: { tone: "blue", icon: ClipboardList, nameFallback: "Registrar" },
  depthead: { tone: "orange", icon: Building2, nameFallback: "Department Head" },
  finance: { tone: "green", icon: Wallet, nameFallback: "Finance" },
  faculty: { tone: "teal", icon: BookOpen, nameFallback: "Faculty" },
  student: { tone: "indigo", icon: GraduationCap, nameFallback: "Student" },
};

/* ================= PAGE ================= */

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<RoleCardItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ AuthAlert state (same pattern as UsersPage)
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const showAlert = (message: string, type: "success" | "error") => {
    setAnimateAlert(false);
    setTimeout(() => {
      setAlertMessage(message);
      setAlertType(type);
      setAnimateAlert(true);
    }, 50);
  };

  useEffect(() => {
    if (!animateAlert) return;
    const t = setTimeout(() => setAnimateAlert(false), 3000);
    return () => clearTimeout(t);
  }, [animateAlert]);

  const reloadRolesAndUsers = async () => {
    try {
      setLoading(true);

      // ✅ load roles
      const rolesData = await getRoles();
      const mappedRoles: RoleCardItem[] = (Array.isArray(rolesData) ? rolesData : []).map(
        (r: any) => ({
          id: r.roleId,
          name: r.name ?? ROLE_UI[r.roleId]?.nameFallback ?? r.roleId,
          users: 0,
          tone: ROLE_UI[r.roleId]?.tone ?? "indigo",
          icon: ROLE_UI[r.roleId]?.icon ?? Shield,
          permissions: Array.isArray(r.permissions) ? r.permissions : [],
        }),
      );
      setRoles(mappedRoles);

      // ✅ load users
      const usersData = await getUsers();
      const mappedUsers: UserItem[] = usersData.map((u: any) => ({
        id: u._id,
        userId: u.idNumber,
        firstName: u.firstName,
        middleName: u.middleName || "",
        lastName: u.lastName,
        fullName: makeFullName(u.firstName, u.middleName || "", u.lastName),
        email: u.email,
        phone: u.phone,
        gender: u.gender as Gender,
        status: u.status === "active" ? "Active" : "Inactive",
        roleId: roleToRoleId(u.role),
        createdAt: u.createdAt,
      }));
      setUsers(mappedUsers);
    } catch (err) {
      console.error("❌ Failed to load roles/users", err);
      setRoles([]);
      setUsers([]);
      showAlert("Failed to load roles/users.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadRolesAndUsers();
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
      if (!u.roleId) return acc;
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

  // ✅ Save permissions + alert
  const saveRolePermissions = async (roleId: string, perms: string[]) => {
    try {
      setLoading(true);

      const updated = await updateRolePermissions(roleId, perms);

      setRoles((prev) =>
        prev.map((r) =>
          r.id === roleId ? { ...r, permissions: updated?.permissions ?? perms } : r,
        ),
      );

      setEditRoleId(null);
      setDetailsRoleId(null);

      showAlert("Role permissions updated successfully!", "success");
    } catch (err: any) {
      console.error("❌ Failed to save permissions", err);
      showAlert(err?.response?.data?.message || "Failed to update permissions.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openRoleDetailsPage = (id: string) => {
    setSelectedRoleId(id);
    setView("details");
  };

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={loading}
      />

      <div className="superadmin-roles container-fluid py-3 py-md-4">
        {view === "list" && (
          <>
            <RoleHeader
              title="Role Management"
              subtitle="Configure portal access and permissions"
              onAction={() => {}}
              actionLabel=""
            />

            {loading ? (
              <div className="text-muted small">Loading…</div>
            ) : rolesWithCounts.length > 0 ? (
              <RoleGrid
                items={rolesWithCounts}
                onOpen={openRoleDetailsPage}
                onSettings={(id) => setDetailsRoleId(id)}
              />
            ) : (
              <div className="users-empty-state">
                <div className="users-empty-icon">📭</div>
                <h5 className="fw-semibold mb-1">No roles found</h5>
                <p className="text-muted mb-0">
                  Make sure <b>/api/roles</b> returns data.
                </p>
              </div>
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
    </>
  );
}