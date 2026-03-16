const API_URL = "http://localhost:5000/api/users";

const getAuthHeaders = (includeContentType = false): HeadersInit => {
  const token = localStorage.getItem("sessionToken");

  return {
    ...(includeContentType ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const createUser = async (payload: any) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Failed to create user");
  return data;
};

export const getUsers = async () => {
  const res = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Failed to load users");
  return data;
};

export const sendCredentials = async (id: string) => {
  const res = await fetch(`${API_URL}/${id}/send-credentials`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Failed to send credentials");

  return data;
};

export const getRegistrarByRole = async () => {
  const res = await fetch(`${API_URL}/role/registrar`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to load registrar account");
  }

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

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to load student users.");
  }

  return Array.isArray(data) ? data : [];
}

export const getUserById = async (id: string) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to load user details");
  }

  return data;
};

export const updateUser = async (id: string, payload: any) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to update user");
  }

  return data;
};

export const updateUserContactInfo = async (id: string, payload: any) => {
  const res = await fetch(`${API_URL}/${id}/contact`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to update user contact info");
  }

  return data;
};

