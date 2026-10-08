// src/services/studentService.ts (or similar path)
import { API_BASE_URL } from "../config"; // Adjust relative path to config.ts if needed
import type { StudentItem } from "../components/Registrar/Enrollment/studentTypes";
import type {
  StudentRow,
  StudentStatus,
} from "../components/Registrar/Records/types";

// Combine shared API_BASE_URL with the /students endpoint
const STUDENT_API_URL = `${API_BASE_URL}/students`;

export type StudentDetails = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;

  course: string;
  year: number;
  section?: string;
  department?: string;

  guardian?: string;
  guardianPhone?: string;

  birthdate?: string;
  enrolledDate?: string;

  status: "Active" | "Inactive" | "Dropped" | "Graduated";
  initials?: string;

  gpa?: string;
};

export type UpdateStudentInfoPayload = {
  email: string;
  phone: string;
  guardian: string;
  guardianPhone: string;
  birthdate: string;
  program: string;
  yearLevel: number;
  department: string;
  updatedBy?: string;
};

export async function getStudentsByEnrollmentIds(enrollmentIds: string[]) {
  const res = await fetch(`${STUDENT_API_URL}/by-enrollment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enrollmentIds }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to load students.");
  }

  const data = await res.json();
  return (Array.isArray(data) ? data : []) as StudentItem[];
}

export async function getStudentRecords(params?: {
  q?: string;
  status?: StudentStatus | "All";
  course?: string | "All";
  year?: number | "All";
  section?: string | "All";
}) {
  const qs = new URLSearchParams();

  if (params?.q) qs.set("q", params.q);

  if (params?.status && params.status !== "All") {
    qs.set("status", params.status);
  }

  if (params?.course && params.course !== "All") {
    qs.set("course", params.course);
  }

  if (params?.year && params.year !== "All") {
    qs.set("year", String(params.year));
  }

  if (params?.section && params.section !== "All") {
    qs.set("section", params.section);
  }

  const query = qs.toString();
  const url = query ? `${STUDENT_API_URL}?${query}` : STUDENT_API_URL;

  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to load student records.");
  }

  const data = await res.json();
  return (Array.isArray(data) ? data : []) as StudentRow[];
}

// Helper function to fetch students specifically by section name
export async function getStudentsBySection(sectionName: string) {
  return getStudentRecords({ section: sectionName });
}

export async function getStudentById(id: string) {
  const res = await fetch(`${STUDENT_API_URL}/${id}`);

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to fetch student.");
  }

  return (await res.json()) as StudentDetails;
}

export async function updateStudentInfo(
  id: string,
  payload: UpdateStudentInfoPayload,
) {
  const res = await fetch(`${STUDENT_API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to update student information.");
  }

  return res.json();
}