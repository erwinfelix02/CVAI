export type ApplicationStatus = "Pending" | "Approved" | "Rejected";

export type ApplicationRow = {
  id: string;
  initials: string;
  name: string;
  program: string;
  yearLevel: string;
  submitted: string;
  status: ApplicationStatus;

  // ✅ new
  accountSent?: boolean; // if true -> show "Account Sent"
};
