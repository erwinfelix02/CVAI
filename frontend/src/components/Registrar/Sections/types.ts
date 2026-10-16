export type SectionItem = {
  id: string;
  code: string;
  yearLevel?: string;
  program: string;
  department?: string; // Added department property
  room: string;
  enrolled?: number;
  capacity: number;
};

export type SectionRequest = {
  id: string;
  code?: string;
  program: string;
  department: string;
  yearLevel: number;
  sectionName?: string;
  capacity?: number;
  requestedCapacity?: number;
  room?: string;
  preferredRoom?: string;
  reason?: string;
  schedule?: string;
  requestedBy?: string;
  status?: "Pending" | "Approved" | "Rejected";
  createdAt?: string;
};