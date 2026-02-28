import { useEffect } from "react";

export default function useIdleLogout(sessionTimeoutMinutes?: number): void {
  useEffect(() => {
    // fallback to 30 while loading
    const minutes = sessionTimeoutMinutes ?? 30;
    const IDLE_TIME = minutes * 60 * 1000;

    const update = (): void => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };

    const logout = (): void => {
      localStorage.removeItem("token");
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("lastActivity");
      window.location.href = "/signin";
    };

    const check = (): void => {
      const last = localStorage.getItem("lastActivity");
      if (last && Date.now() - Number(last) > IDLE_TIME) {
        logout();
      }
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    // initialize activity if missing
    if (!localStorage.getItem("lastActivity")) update();

    events.forEach((e) => window.addEventListener(e, update));
    const interval = window.setInterval(check, 5000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, update));
      window.clearInterval(interval);
    };
  }, [sessionTimeoutMinutes]);
}