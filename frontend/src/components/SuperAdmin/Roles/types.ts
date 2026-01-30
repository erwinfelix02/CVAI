import type { LucideIcon } from "lucide-react";

export type RoleTone =
  | "purple"
  | "blue"
  | "orange"
  | "green"
  | "teal"
  | "indigo";

export type RoleCardItem = {
  id: string;
  name: string;
  users: number;
  tone: RoleTone;
  icon: LucideIcon;
  permissions: string[];
};

export type UserStatus = "Active" | "Inactive";

/** ✅ Added gender + houseNo */
export type Gender = "Male" | "Female" | "Prefer not to say";

export type UserItem = {
  id: string;
  userId: string;

  firstName: string;
  middleName?: string;
  lastName: string;

  gender: Gender;
  houseNo: string;

  fullName: string;
  email: string;
  phone: string;

  status: UserStatus;
  roleId: RoleCardItem["id"];
  createdAt: string; // yyyy-mm-dd
};
