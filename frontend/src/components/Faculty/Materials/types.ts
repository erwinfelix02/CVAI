export type MaterialType = "pdf" | "doc" | "video";

export type MaterialItem = {
  id: string;
  title: string;
  sizeLabel: string;
  date: string;
  course: string;      // e.g. "CS 101"
  downloads: number;
  type: MaterialType;
};
