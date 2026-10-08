import "../../styles/auth.css";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <div className="auth-center-wrapper">{children}</div>
    </div>
  );
}