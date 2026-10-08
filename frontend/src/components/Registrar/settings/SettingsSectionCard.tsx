import React from "react";

type Props = {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export default function SettingsSectionCard({
  icon,
  title,
  subtitle,
  children,
  className,
}: Props) {
  return (
    <div className={`rs-card p-4 h-100 ${className ?? ""}`}>
      <div className="d-flex align-items-start gap-3 mb-3">
        {icon ? <div className="rs-icon" aria-hidden="true">{icon}</div> : null}

        <div className="min-w-0">
          <h2 className="rs-card-title h5">{title}</h2>
          {subtitle ? <p className="rs-card-subtitle">{subtitle}</p> : null}
        </div>
      </div>

      {children}
    </div>
  );
}