import type { ReactNode } from "react";

interface AuthCardProps {
  title: ReactNode;          // ✅ FIX
  subtitle?: ReactNode;      // ✅ FIX
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

        {subtitle && (
          <p className="text-center text-muted mb-4">{subtitle}</p>
        )}

        {children}
        {footer}
      </div>
    </div>
  );
}
