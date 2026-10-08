// src/services/userService.ts
import { API_BASE_URL } from "../config";

export interface UserProfile {
  id: string;
  _id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  role: string;
  department: string;
  status?: string;
}

function getStoredUser(): any {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }
  return null;
}

function getStoredToken(): string | null {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  if (token) return token;

  const user = getStoredUser();
  return user?.token || user?.accessToken || null;
}

export async function fetchUserProfile(email?: string): Promise<UserProfile> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 1. If user object is cached in localStorage with a department, use it to avoid 404s
  const cachedUser = getStoredUser();
  if (cachedUser && cachedUser.department && (cachedUser.id || cachedUser._id)) {
    return {
      id: cachedUser.id || cachedUser._id,
      firstName: cachedUser.firstName || "",
      lastName: cachedUser.lastName || "",
      email: cachedUser.email || "",
      role: cachedUser.role || "",
      department: cachedUser.department || "",
    };
  }

  const userId = cachedUser?.id || cachedUser?._id;

  // 2. Fallback across multiple standard user endpoints
  const endpoints = [
    email ? `${API_BASE_URL}/users/me?email=${encodeURIComponent(email)}` : null,
    userId ? `${API_BASE_URL}/users/${userId}` : null,
    `${API_BASE_URL}/users/me`,
  ].filter(Boolean) as string[];

  let lastError = new Error("Failed to fetch user profile.");

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers,
      });

      if (response.ok) {
        return await response.json();
      }

      const errorData = await response.json().catch(() => ({}));
      lastError = new Error(errorData.message || `Failed to fetch from ${endpoint}`);
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError;
}