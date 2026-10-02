import Role from "../models/Role.js";

const ROLES = [
  {
    roleId: "superadmin",
    name: "Super Admin",
    permissions: [
      "manage_users",
      "manage_roles",
      "manage_portals",
      "view_system_logs",
      "manage_ai_knowledge",
    ],
  },
  {
    roleId: "registrar",
    name: "Registrar",
    permissions: [
      "manage_students",
      "process_applications",
      "manage_enrollment",
      "manage_documents",
    ],
  },
  {
    roleId: "depthead",
    name: "Department Head",
    permissions: ["manage_schedules", "assign_rooms", "manage_faculty_loads"],
  },
  {
    roleId: "finance",
    name: "Finance",
    permissions: ["fee_management", "scholarships", "financial_reports"],
  },
  {
    roleId: "faculty",
    name: "Faculty",
    permissions: ["grade_management", "class_materials", "attendance"],
  },
  {
    roleId: "student",
    name: "Student",
    permissions: ["view_grades", "view_schedule", "ai_assistant"],
  },
];

export async function seedRolesIfMissing() {
  for (const role of ROLES) {
    const exists = await Role.findOne({ roleId: role.roleId });
    if (!exists) {
      await Role.create(role);
      console.log(`✅ Seeded role: ${role.roleId}`);
    }
  }
}