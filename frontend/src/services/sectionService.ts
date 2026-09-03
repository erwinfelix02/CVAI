export interface SectionData {
  _id: string;
  code: string;
  yearLevel: string;
  program: string;
  capacity: number;
  room: string;
  schedule: string;
  adviser: string;
  enrolled: number;
}

function getStoredToken(): string | null {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  if (token) return token;

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      return parsed.token || parsed.accessToken || null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function fetchSectionsByProgram(program: string): Promise<SectionData[]> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(
    `/api/sections?program=${encodeURIComponent(program)}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch sections for this program.");
  }

  return response.json();
}