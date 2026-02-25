export type EnrollmentItem = {
  _id: string;

  registrationId: string; // application tracking id
credentialsSent?: boolean;
  studentIdNumber?: string; // ✅ MOVE HERE (top-level)

  studentName?: string;
  email?: string;

  status: "Scheduled" | "Enrolled" | "Cancelled";

  personal?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    birthdate?: string;
    guardian?: string;
    guardianPhone?: string;
  };

  academic?: {
    program?: string;
    yearLevel?: string | number;
    department?: string;
  };

  createdAt?: string;
};