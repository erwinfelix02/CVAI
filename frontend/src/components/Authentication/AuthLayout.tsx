import "../../styles/auth.css";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <div className="auth-center-wrapper">
        <div className="auth-form-max">{children}</div>
      </div>
    </div>
  );
}
