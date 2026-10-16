// src/components/Registrar/Applications/types.ts

export type ApplicationStatus =
  | "Pending"
  | "Approved"
  | "Returned"
  | "Archived";

export type ApplicationRow = {
  id: string;
  initials: string;
  name: string;
  program: string;
  yearLevel: string;
  submitted: string;
  status: ApplicationStatus;
  accountSent?: boolean;
  scheduleSent?: boolean;
};