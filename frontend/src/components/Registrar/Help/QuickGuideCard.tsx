import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
};

export default function QuickGuideCard({
  icon,
  title,
  subtitle,
  onClick,
}: Props) {
  return (
    <button type="button" className="rh-guide-card" onClick={onClick}>
      <div className="rh-guide-icon">{icon}</div>
      <div className="rh-guide-title">{title}</div>
      <div className="rh-guide-subtitle">{subtitle}</div>
    </button>
  );
}