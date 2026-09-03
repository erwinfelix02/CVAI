import React from "react";

export default function StatCard({
  tone,
  value,
  label,
  sub,
  icon,
}: {
  tone: "blue" | "purple" | "orange" | "green";
  value: string;
  label: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`faculty-stat-card tone-${tone}`}>
      <div className="d-flex justify-content-between align-items-start position-relative z-1">
        <div className="pe-2">
          <div className="faculty-stat-value">{value}</div>
          <div className="faculty-stat-label">{label}</div>
          {sub && <div className="faculty-stat-sub">{sub}</div>}
        </div>

        <div className="faculty-stat-icon-bubble">{icon}</div>
      </div>
    </div>
  );
}