// src/services/userService.ts
import { API_BASE_URL } from "../config"; // Adjust the relative path to config.ts if needed

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

export async function fetchUserProfile(email?: string): Promise<UserProfile> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Updated to use API_BASE_URL
  const endpoint = email 
    ? `${API_BASE_URL}/users/me?email=${encodeURIComponent(email)}` 
    : `${API_BASE_URL}/users/me`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch user profile.");
  }

  return response.json();
}