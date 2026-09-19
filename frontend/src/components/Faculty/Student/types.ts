export interface Student {
  _id?: string;
  initials?: string;
  name: string;
  id: string;
  section: string;
  year?: number | string;
  gpa?: number;
  attendance?: number;
  status: "good" | "warning" | string;
  course?: string;
  email?: string;
  phone?: string;
  facultyId?: string;
  facultyName?: string;
}

export const formatYearLevel = (year?: number | string): string => {
  if (!year) return "1st Year";
  const y = typeof year === "string" ? parseInt(year, 10) : year;
  if (isNaN(y)) return String(year);

  const suffixes = ["th", "st", "nd", "rd"];
  const v = y % 100;
  const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  return `${y}${suffix} Year`;
};