export type ApplicationStatus = "Pending" | "Approved" | "Rejected";

export type ApplicationRow = {
  id: string;           // ENR-24001
  initials: string;     // MS
  name: string;
  program: string;
  yearLevel: string;    // Year 1
  submitted: string;    // YYYY-MM-DD
  status: ApplicationStatus;
};
