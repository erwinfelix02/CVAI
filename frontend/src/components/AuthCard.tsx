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
    <div className="auth-page">
      <div className="auth-card shadow-sm">
        {header}

        <h2 className="text-center fw-bold">{title}</h2>

        {subtitle && <p className="text-center text-muted">{subtitle}</p>}

        {/* Wrap content and footer in flex-column with gap for automatic spacing */}
        <div className="d-flex flex-column gap-3">
          {children}
          {footer}
        </div>
      </div>
    </div>
  );
}
