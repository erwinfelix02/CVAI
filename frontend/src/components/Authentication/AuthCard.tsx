import type { ReactNode } from "react";

interface AuthCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  header,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="card auth-card border-0 shadow-lg rounded-4 overflow-hidden">
      <div className="auth-accent" />

      <div className="card-body p-3 p-sm-4">
        {header && <div className="mb-3">{header}</div>}

        <div className="text-center mb-3">
          <h2 className="fw-bold mb-1">{title}</h2>
          {subtitle && <div className="text-muted small">{subtitle}</div>}
        </div>

        <div className="d-grid gap-2">{children}</div>

        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </div>
  );
}
