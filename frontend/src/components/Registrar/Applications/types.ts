export type ApplicationStatus = "Pending" | "Approved" | "Rejected";

export type ApplicationRow = {
  id: string;
  initials: string;
  name: string;
  program: string;
  yearLevel: string;
  submitted: string;
  status: ApplicationStatus;

  accountSent?: boolean;

  scheduleSent?: boolean; // ✅ ADD THIS
};
