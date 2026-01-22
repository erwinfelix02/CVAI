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
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="value">{value}</div>
          <div className="label">{label}</div>
          {sub && <div className="sub">{sub}</div>}
        </div>

        <div className="icon-bubble">{icon}</div>
      </div>
    </div>
  );
}
