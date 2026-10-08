export type StudentItem = {
  _id: string;
  enrollmentId: string;

  studentIdNumber: string;
  fullName: string;

  email: string;
  phone: string;
  address: string;

  program: string;
  yearLevel: number;
  department: string;

  createdAt?: string;
};