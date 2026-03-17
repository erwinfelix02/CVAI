import { useEffect, useState } from "react";
import "../styles/idle-logout.css";

type IdleWarningDetail = {
  visible: boolean;
  secondsLeft?: number;
};

export default function IdleLogoutOverlay() {
  const [visible, setVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<IdleWarningDetail>;
      const detail = customEvent.detail;

      setVisible(detail.visible);
      setSecondsLeft(detail.secondsLeft ?? 0);
    };

    window.addEventListener("idle-logout-warning", handler);

    return () => {
      window.removeEventListener("idle-logout-warning", handler);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="idle-logout-overlay">
      <div className="idle-logout-box">
        <div className="idle-logout-spinner" />
        <h4>Session expiring</h4>
        <p>
          You will be logged out in <strong>{secondsLeft}</strong> second
          {secondsLeft !== 1 ? "s" : ""} due to inactivity.
        </p>
        <small>Move your mouse, scroll, or press any key to stay signed in.</small>
      </div>
    </div>
  );
}