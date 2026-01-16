import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope } from "react-icons/fa";
import AuthCard from "../../components/Authentication/AuthCard";
import AuthLayout from "../../components/Authentication/AuthLayout";
import Button from "../../components/Authentication/Button";
import Logo from "../../assets/graduation.png";
import "../../styles/auth.css";
import { API_BASE_URL } from "../../config";

export default function VerifyCode() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email");
  const isComplete = code.every((digit) => digit !== "");

  /* ---------------- ALERT AUTO-HIDE (FIX) ---------------- */
  useEffect(() => {
    if (!alertMessage || loading) return;

    const timer = setTimeout(() => {
      setAnimateAlert(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [alertMessage, loading]);

  /* ---------------- INPUT HANDLERS ---------------- */
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key !== "Backspace") return;

    const newCode = [...code];

    if (newCode[index]) {
      newCode[index] = "";
    } else if (index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }

    setCode(newCode);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!isComplete || !email) {
      setAlertMessage("Missing email or verification code.");
      setAlertType("error");
      setAnimateAlert(true);
      return;
    }

    setLoading(true);
    setAlertMessage("Verifying...");
    setAlertType("success");
    setAnimateAlert(true);

    try {
      await axios.post(`${API_BASE_URL}/auth/verify-email`, {
        email,
        code: code.join(""),
      });

      setTimeout(() => {
        setLoading(false);
        setAlertMessage("Email successfully verified!");
        setAlertType("success");
        setAnimateAlert(true);

        setTimeout(() => navigate("/signin"), 1500);
      }, 1000);
    } catch (err: any) {
      setTimeout(() => {
        setLoading(false);
        setAlertMessage(
          err.response?.data?.message || "Invalid verification code."
        );
        setAlertType("error");
        setAnimateAlert(true);
      }, 1000);
    }
  };

  /* ---------------- RESEND CODE ---------------- */
  const handleResend = async () => {
    if (!email) return;

    setResendDisabled(true);
    setResendTimer(30);

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/resend-code`, {
        email,
      });

      setAlertMessage(res.data.message || "Code resent!");
      setAlertType("success");
      setAnimateAlert(true);
    } catch {
      setAlertMessage("Server error. Try again later.");
      setAlertType("error");
      setAnimateAlert(true);
      setResendDisabled(false);
      setResendTimer(0);
    }
  };

  /* ---------------- RESEND TIMER ---------------- */
  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  /* ---------------- UI ---------------- */
  return (
    <AuthLayout>
      {alertMessage && (
        <div
          className={`loading-alert-wrapper ${
            alertType === "error" ? "alert-error" : "alert-success"
          } ${animateAlert ? "loading" : ""}`}
        >
          <div className="loading-alert d-flex align-items-center">
            {loading && alertType === "success" && (
              <span className="spinner-border spinner-border-sm me-2" />
            )}
            <span className="loading-text">{alertMessage}</span>
          </div>
        </div>
      )}

      <AuthCard
        title="Check your email"
        subtitle={
          <>
            We sent a 6-digit code to <br />
            <strong>{email}</strong>
          </>
        }
        header={
          <>
            <h1 className="campus-ai-header-mobile text-center mb-3">
              <span className="campus-ai-logo-wrapper">
                <img src={Logo} alt="CampusAI logo" className="navbar-logo" />
              </span>
              Campus AI
            </h1>

            <div className="d-flex justify-content-center mb-3">
              <div className="verify-icon">
                <FaEnvelope />
              </div>
            </div>
          </>
        }
        footer={
          <p className="text-center mt-3 mb-0">
            <Link to="/signin" className="small">
              ← Back to Sign In
            </Link>
          </p>
        }
      >
        <div className="d-flex justify-content-center gap-2 mb-3">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="code-input text-center"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>

        <Button
          className="w-100"
          disabled={!isComplete || loading}
          onClick={handleSubmit}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </Button>

        <p className="text-center mt-3 small">
          Didn’t receive the code?{" "}
          <button
            className="resend-btn"
            onClick={handleResend}
            disabled={resendDisabled}
          >
            {resendDisabled ? `Wait ${resendTimer}s` : "Resend"}
          </button>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
