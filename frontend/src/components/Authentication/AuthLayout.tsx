import "../../styles/auth.css";
import Logo from "../../assets/graystone1.jpg"; // <-- Import your image

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      {/* LEFT PANEL */}
      <div className="auth-left">
        {/* SCHOOL LOGO */}
        <div className="school-logo text-center mb-3">
          <img src={Logo} alt="Graystone Institute Logo" />
        </div>

        <h3 className="school-name text-center mb-3">
          Graystone Institute of the Philippines
        </h3>
        <h1 className="campus-name">Campus AI</h1>
        <p>Smart Learning Assistant</p>
        <p className="auth-description">
          Your AI-powered companion for academic success and campus life
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">{children}</div>
    </div>
  );
}
