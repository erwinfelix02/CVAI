export type EnrollmentStatus = 'Enrolled' | 'Unassigned' | 'Drop Requested' | 'Dropped' | 'Transfer Pending';

export interface DepartmentStudent {
  id: string;
  name: string;
  studentNo: string;
  year: number;
  status: string;
  course: string;
  section: string;
  email?: string;
  phone?: string;
  workflowState?: string;
  address?: string;
  birthdate?: string;
  gender?: string;
  guardian?: string;
}