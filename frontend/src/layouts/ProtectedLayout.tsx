import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import useIdleLogout from "../customHooks/useIdleLogout";
import IdleLogoutOverlay from "../customHooks/IdleLogoutOverlay";

interface Props {
  children: ReactNode;
}

type SecuritySettingsDTO = {
  sessionTimeoutMinutes: number;
};

const API_URL = "http://localhost:5000/api/security-settings";

export default function ProtectedLayout({ children }: Props) {
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("sessionToken");
        if (!token) return;

        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const s: SecuritySettingsDTO = await res.json().catch(() => ({
          sessionTimeoutMinutes: 30,
        }));

        setSessionTimeoutMinutes(Number(s.sessionTimeoutMinutes ?? 30));
      } catch (e) {
        console.error("Failed to load security settings:", e);
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