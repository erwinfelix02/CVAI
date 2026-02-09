export type PermissionKey =
  | "manage_users"
  | "manage_roles"
  | "manage_portals"
  | "view_system_logs"
  | "manage_ai_knowledge"
  | "manage_students"
  | "process_applications"
  | "manage_enrollment"
  | "manage_documents"
  | "manage_schedules"
  | "assign_rooms"
  | "manage_faculty_loads"
  | "fee_management"
  | "scholarships"
  | "financial_reports"
  | "grade_management"
  | "class_materials"
  | "attendance"
  | "view_grades"
  | "view_schedule"
  | "ai_assistant";

export type PermissionDef = {
  key: PermissionKey;
  label: string;
  desc: string;
};

export const PERMISSIONS: Record<PermissionKey, PermissionDef> = {
  manage_users: {
    key: "manage_users",
    label: "Manage Users",
    desc: "Create, edit, and delete user accounts",
  },
  manage_roles: {
    key: "manage_roles",
    label: "Manage Roles",
    desc: "Create and modify role permissions",
  },
  manage_portals: {
    key: "manage_portals",
    label: "Manage Portals",
    desc: "Configure portal settings and access",
  },
  view_system_logs: {
    key: "view_system_logs",
    label: "View System Logs",
    desc: "Access system activity logs",
  },
  manage_ai_knowledge: {
    key: "manage_ai_knowledge",
    label: "Manage AI Knowledge",
    desc: "Configure AI assistant responses",
  },

  manage_students: {
    key: "manage_students",
    label: "Manage Students",
    desc: "Create and modify student records",
  },
  process_applications: {
    key: "process_applications",
    label: "Process Applications",
    desc: "Review and approve applications",
  },
  manage_enrollment: {
    key: "manage_enrollment",
    label: "Manage Enrollment",
    desc: "Assign students to sections",
  },
  manage_documents: {
    key: "manage_documents",
    label: "Manage Documents",
    desc: "Process document requests",
  },

  manage_schedules: {
    key: "manage_schedules",
    label: "Manage Schedules",
    desc: "Create and modify class schedules",
  },
  assign_rooms: {
    key: "assign_rooms",
    label: "Assign Rooms",
    desc: "Allocate rooms to classes",
  },
  manage_faculty_loads: {
    key: "manage_faculty_loads",
    label: "Manage Faculty Loads",
    desc: "Assign teaching loads",
  },

  fee_management: {
    key: "fee_management",
    label: "Fee Management",
    desc: "Manage fees and payments",
  },
  scholarships: {
    key: "scholarships",
    label: "Scholarships",
    desc: "Manage scholarship records",
  },
  financial_reports: {
    key: "financial_reports",
    label: "Financial Reports",
    desc: "View and generate finance reports",
  },

  grade_management: {
    key: "grade_management",
    label: "Grade Management",
    desc: "Manage student grades",
  },
  class_materials: {
    key: "class_materials",
    label: "Class Materials",
    desc: "Manage learning materials",
  },
  attendance: {
    key: "attendance",
    label: "Attendance",
    desc: "Track and manage attendance",
  },

  view_grades: {
    key: "view_grades",
    label: "View Grades",
    desc: "View academic grades",
  },
  view_schedule: {
    key: "view_schedule",
    label: "View Schedule",
    desc: "View class schedule",
  },
  ai_assistant: {
    key: "ai_assistant",
    label: "AI Assistant",
    desc: "Access the AI assistant",
  },
};

/**
 * ✅ IMPORTANT:
 * These are the ONLY permissions each role is allowed to have.
 * So "Edit" will show ONLY these, not the full system list.
 */
export const ROLE_ALLOWED: Record<
  "superadmin" | "registrar" | "depthead" | "finance" | "faculty" | "student",
  PermissionKey[]
> = {
  superadmin: [
    "manage_users",
    "manage_roles",
    "manage_portals",
    "view_system_logs",
    "manage_ai_knowledge",
  ],
  registrar: [
    "manage_students",
    "process_applications",
    "manage_enrollment",
    "manage_documents",
  ],
  depthead: ["manage_schedules", "assign_rooms", "manage_faculty_loads"],
  finance: ["fee_management", "scholarships", "financial_reports"],
  faculty: ["grade_management", "class_materials", "attendance"],
  student: ["view_grades", "view_schedule", "ai_assistant"],
};
