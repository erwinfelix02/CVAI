// src/services/userService.ts

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

export async function fetchUserProfile(email?: string): Promise<UserProfile> {
  const url = email 
    ? `/api/users/me?email=${encodeURIComponent(email)}` 
    : "/api/users/me";

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch user profile.");
  }

  return response.json();
}