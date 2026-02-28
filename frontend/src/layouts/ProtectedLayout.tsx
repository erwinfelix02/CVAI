import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import useIdleLogout from "../customHooks/useIdleLogout";

interface Props {
  children: ReactNode;
}

type SecuritySettingsDTO = {
  sessionTimeoutMinutes: number;
};

export default function ProtectedLayout({ children }: Props) {
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    const load = async () => {
      try {
        const token =
          localStorage.getItem("sessionToken") || localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("/api/security-settings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If not allowed (e.g., superadmin-only), fallback to default
        if (!res.ok) return;

        const s: SecuritySettingsDTO = await res.json();
        setSessionTimeoutMinutes(Number(s.sessionTimeoutMinutes ?? 30));
      } catch (e) {
        console.error("Failed to load security settings:", e);
      }
    };

    load();
  }, []);

  // ✅ dynamic idle logout
  useIdleLogout(sessionTimeoutMinutes);

  return <>{children}</>;
}
