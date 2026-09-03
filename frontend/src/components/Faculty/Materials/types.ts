export type MaterialType = "pdf" | "doc" | "video";

export type MaterialItem = {
  id: string;
  title: string;
  sizeLabel: string;
  date: string;
  course: string;
  downloads: number;
  type: MaterialType;
  description?: string;
  filePath?: string;
  facultyId?: string;
  uploadedBy?: string;
  department?: string;
};