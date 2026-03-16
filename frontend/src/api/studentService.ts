import type { StudentItem } from "../components/Registrar/Enrollment/studentTypes";
import type {
  StudentRow,
  StudentStatus,
} from "../components/Registrar/Records/types";

const API_BASE_URL = "http://localhost:5000/api/students";

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
  const res = await fetch(`${API_BASE_URL}/by-enrollment`, {
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
  const url = query ? `${API_BASE_URL}?${query}` : API_BASE_URL;

  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to load student records.");
  }

  const data = await res.json();
  return (Array.isArray(data) ? data : []) as StudentRow[];
}

export async function getStudentById(id: string) {
  const res = await fetch(`${API_BASE_URL}/${id}`);

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
  const res = await fetch(`${API_BASE_URL}/${id}`, {
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