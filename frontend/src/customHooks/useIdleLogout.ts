import { useEffect, useRef } from "react";

type IdleWarningDetail = {
  visible: boolean;
  secondsLeft?: number;
};

export default function useIdleLogout(
  sessionTimeoutMinutes?: number,
  warningSeconds: number = 10,
): void {
  const warningIntervalRef = useRef<number | null>(null);
  const checkIntervalRef = useRef<number | null>(null);
  const isWarningActiveRef = useRef(false);

  useEffect(() => {
    const minutes = sessionTimeoutMinutes ?? 30;
    const IDLE_TIME = minutes * 60 * 1000;
    const WARNING_TIME = warningSeconds * 1000;

    const emitWarning = (detail: IdleWarningDetail): void => {
      window.dispatchEvent(
        new CustomEvent<IdleWarningDetail>("idle-logout-warning", { detail }),
      );
    };

    const clearWarningCountdown = (): void => {
      if (warningIntervalRef.current) {
        window.clearInterval(warningIntervalRef.current);
        warningIntervalRef.current = null;
      }

      if (isWarningActiveRef.current) {
        isWarningActiveRef.current = false;
        emitWarning({ visible: false });
      }
    };

    const logout = (): void => {
      clearWarningCountdown();
      localStorage.removeItem("token");
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("lastActivity");
      localStorage.removeItem("user");
      window.location.href = "/signin";
    };

    const update = (): void => {
      localStorage.setItem("lastActivity", Date.now().toString());

      if (isWarningActiveRef.current) {
        clearWarningCountdown();
      }
    };

    const startWarningCountdown = (): void => {
      if (isWarningActiveRef.current) return;

      isWarningActiveRef.current = true;
      let secondsLeft = warningSeconds;

      emitWarning({ visible: true, secondsLeft });

      warningIntervalRef.current = window.setInterval(() => {
        secondsLeft -= 1;

        if (secondsLeft <= 0) {
          logout();
          return;
        }

        emitWarning({ visible: true, secondsLeft });
      }, 1000);
    };

    const check = (): void => {
      const last = localStorage.getItem("lastActivity");
      if (!last) return;

      const elapsed = Date.now() - Number(last);

      if (elapsed >= IDLE_TIME) {
        logout();
        return;
      }

      if (elapsed >= IDLE_TIME - WARNING_TIME) {
        startWarningCountdown();
      }
    };

    // --- NEW: Check immediately on mount or when browser tab regains focus ---
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        check();
      }
    };

    const last = localStorage.getItem("lastActivity");
    if (!last) {
      update();
    } else {
      // Instantly evaluate if time expired while browser/tab was left alone or closed
      check();
    }

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    events.forEach((e) => window.addEventListener(e, update));
    checkIntervalRef.current = window.setInterval(check, 1000);
    
    // Listen for when user clicks back to the tab or reopens the browser window
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      events.forEach((e) => window.removeEventListener(e, update));

      if (checkIntervalRef.current) {
        window.clearInterval(checkIntervalRef.current);
      }

      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);

      clearWarningCountdown();
    };
  }, [sessionTimeoutMinutes, warningSeconds]);
}