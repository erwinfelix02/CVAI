import type { StudentItem } from "../components/Registrar/Enrollment/studentTypes";

export async function getStudentsByEnrollmentIds(enrollmentIds: string[]) {
  const res = await fetch("http://localhost:5000/api/students/by-enrollment", {
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