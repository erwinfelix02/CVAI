export type DocStatus = "Pending" | "Processing" | "Ready";

export type DocRequest = {
  id: string;
  studentName: string;
  studentNo: string;

  documentName: string;
  purpose: string;

  copies: number;
  fee: number;

  status: DocStatus;
};
