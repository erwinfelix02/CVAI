export type EnrollmentStatus =
  | "Scheduled"
  | "Enrolled"
  | "Cancelled"
  | "Archived";

export type EnrollmentItem = {
  _id: string;

  registrationId: string;
  credentialsSent?: boolean;
  studentIdNumber?: string;

  studentName?: string;
  email?: string;

  status: EnrollmentStatus;

  archivedFromStatus?: "Scheduled" | "Enrolled" | "Cancelled" | "";
  archivedAt?: string | null;

  personal?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    birthdate?: string;
    guardian?: string;
    guardianPhone?: string;
    email?: string;
    gender?: string;
  };

  academic?: {
    program?: string;
    yearLevel?: string | number;
    department?: string;
    applicantType?: string;
    previousSchool?: string;
  };

  schedule?: {
    date?: string;
    time?: string;
    location?: string;
    notes?: string;
  };

  createdAt?: string;
  updatedAt?: string;
};