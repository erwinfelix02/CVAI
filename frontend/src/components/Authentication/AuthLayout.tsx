import "../../styles/auth.css";
import SchoolLogo from "../../assets/graystone1.jpg";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <div className="container py-4 py-md-5">
        <div className="row g-4 gx-0 gx-lg-4 align-items-center justify-content-center">
          {/* Left: School panel */}
          <div className="col-12 col-lg-6">
            <div className="auth-school h-100">
              <div className="text-center">
                <div className="auth-school-logo mx-auto mb-3">
                  <img src={SchoolLogo} alt="Graystone Institute Logo" />
                </div>

                <div className="text-uppercase fw-semibold auth-school-name">
                  Graystone Institute of the Philippines
                </div>

                <div className="auth-school-title mt-2">Campus AI</div>
                <div className="auth-school-sub">Smart Learning Assistant</div>

                <p className="auth-school-desc mt-3 mb-0">
                  Your AI-powered companion for academic success and campus life
                </p>
              </div>
            </div>
          </div>

          {/* Right: Card */}
          <div className="col-12 col-lg-6">
            <div className="auth-form-wrap">
              <div className="auth-form-max">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
