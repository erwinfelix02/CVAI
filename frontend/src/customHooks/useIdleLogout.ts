import { useEffect } from "react";

const IDLE_TIME = 30 * 60 * 1000; // 15 minutes

export default function useIdleLogout(): void {
  useEffect(() => {
    const update = (): void => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };

    const logout = (): void => {
      localStorage.removeItem("token");
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
    ];

    events.forEach((e) => window.addEventListener(e, update));
    const interval = window.setInterval(check, 5000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, update));
      window.clearInterval(interval);
    };
  }, []);
}
