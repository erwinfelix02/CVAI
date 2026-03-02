const API_URL = "http://localhost:5000/api/users";

export const createUser = async (payload: any) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const getUsers = async () => {
  const res = await fetch(API_URL);
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to load users");
  return data;
};

export const sendCredentials = async (id: string) => {
  const res = await fetch(`${API_URL}/${id}/send-credentials`, {
    method: "POST",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);

  return data;
};

export async function getStudentUsers(params?: {
  q?: string;
  status?: string;
  course?: string;
}) {
  const url = new URL("http://localhost:5000/api/users/students");

  if (params?.q) url.searchParams.set("q", params.q);
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.course) url.searchParams.set("course", params.course);

  const res = await fetch(url.toString());
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to load student users.");
  }

  return Array.isArray(data) ? data : [];
}

export const getUserById = async (id: string) => {
  const res = await fetch(`${API_URL}/${id}`);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to load user details");
  }

  return data;
};

// ✅ NEW: Update user fields (status/phone/department)
export const updateUser = async (id: string, payload: any) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH", // change to PUT if your backend uses PUT
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to update user");
  }

  return data;
};