export type AttendanceStatus = "present" | "absent" | "pending" | "late";

export type StudentItem = {
  id: string;
  name: string;
  studentNo: string;
  status: AttendanceStatus;
  avatarUrl?: string;
};

export type AttendanceRecord = {
  subject: string;
  date: string;
  isRecorded?: boolean;
  students: StudentItem[];
};