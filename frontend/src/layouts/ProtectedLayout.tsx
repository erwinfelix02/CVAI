import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import useIdleLogout from "../customHooks/useIdleLogout";
import IdleLogoutOverlay from "../customHooks/IdleLogoutOverlay";
import { API_BASE_URL } from "../config";

interface Props {
  children: ReactNode;
}

type SecuritySettingsDTO = {
  sessionTimeoutMinutes: number;
};

const API_URL = `${API_BASE_URL}/security-settings`;

// Helper to reliably grab the token from localStorage regardless of key name
function getToken(): string | null {
  const token = localStorage.getItem("token") || localStorage.getItem("sessionToken");
  if (token && token !== "null" && token !== "undefined") return token;

  const authRaw = localStorage.getItem("auth") || localStorage.getItem("user");
  if (authRaw) {
    try {
      const parsed = JSON.parse(authRaw);
      return parsed?.token || parsed?.accessToken || parsed?.data?.token || null;
    } catch {
      return null;
    }
  }
  return null;
}

export default function ProtectedLayout({ children }: Props) {
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getToken();

        // Fetch security settings from database
        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          // Fallback to default 30 minutes if database fetch fails
          setSessionTimeoutMinutes(30);
          return;
        }

        const s: SecuritySettingsDTO = await res.json().catch(() => ({
          sessionTimeoutMinutes: 30,
        }));

        // Set timeout based on what is stored in the database
        setSessionTimeoutMinutes(Number(s.sessionTimeoutMinutes ?? 30));
      } catch (e) {
        console.error("Failed to load security settings from database:", e);
        setSessionTimeoutMinutes(30); // Fallback default
      }
    };

    load();
  }, []);

  useIdleLogout(sessionTimeoutMinutes, 10);

  return (
    <>
      <IdleLogoutOverlay />
      {children}
    </>
  );
}