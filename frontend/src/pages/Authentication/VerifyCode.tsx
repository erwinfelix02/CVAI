import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope } from "react-icons/fa";
import AuthCard from "../../components/Authentication/AuthCard";
import Button from "../../components/Authentication/Button";
import "../../styles/auth.css";

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

  // --- Input handlers ---
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(
        `code-${index + 1}`
      ) as HTMLInputElement;
      nextInput?.focus();
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
      setCode(newCode);
    } else if (index > 0) {
      const prevInput = document.getElementById(
        `code-${index - 1}`
      ) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  // --- Verify code ---
  const handleSubmit = async () => {
    if (!isComplete || !email) {
      setAlertMessage("Missing email or verification code.");
      setAlertType("error");
      setAnimateAlert(true);
      return;
    }

    // 1️⃣ ALWAYS show verifying first
    setLoading(true);
    setAlertMessage("Verifying");
    setAlertType("success");
    setAnimateAlert(true);

    try {
      await axios.post("http://localhost:5000/api/auth/verify-email", {
        email,
        code: code.join(""),
      });

      // 2️⃣ Small delay so verifying is visible
      setTimeout(() => {
        setLoading(false);
        setAlertMessage("Email successfully verified!");
        setAlertType("success");
        setAnimateAlert(true);

        // 3️⃣ Navigate after user sees success
        setTimeout(() => {
          setAnimateAlert(false);
          navigate("/signin");
        }, 1500);
      }, 1200);
    } catch (err: any) {
      // 2️⃣ STILL let verifying show briefly before error
      setTimeout(() => {
        setLoading(false);
        setAlertMessage(
          err.response?.data?.message || "Invalid verification code."
        );
        setAlertType("error");
        setAnimateAlert(true);
      }, 1200);
    }
  };
  // 🔔 Auto-hide alert (same behavior as SignUp)
  useEffect(() => {
    if (!alertMessage) return;

    // ❌ Do NOT auto-hide while verifying
    if (loading) return;

    const timer = setTimeout(() => {
      setAnimateAlert(false);
    }, 3000); // hide after 3 seconds

    return () => clearTimeout(timer);
  }, [alertMessage, loading]);

  // --- Resend code ---
  const handleResend = async () => {
    if (!email) {
      setAlertMessage("Missing email.");
      setAlertType("error");
      setAnimateAlert(true);
      return;
    }

    setResendDisabled(true);
    setResendTimer(30);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/resend-code",
        { email }
      );
      setAlertMessage(response.data.message || "Code resent!");
      setAlertType("success");
      setAnimateAlert(true);
    } catch (err: any) {
      setAlertMessage(
        err.response?.data?.message || "Server error. Try again later."
      );
      setAlertType("error");
      setAnimateAlert(true);
      setResendDisabled(false);
      setResendTimer(0);
    }
  };

  // --- Countdown effect ---
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setResendDisabled(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  return (
    <AuthCard
      header={
        <div className="d-flex justify-content-center mb-3">
          <div className="verify-icon">
            <FaEnvelope />
          </div>
        </div>
      }
      title="Check your email"
      subtitle={
        <>
          We sent a 6-digit code to <br />
          <strong>{email}</strong>
        </>
      }
      footer={
        <p className="text-center mt-3 mb-0">
          <Link to="/signin" className="small">
            ← Back
          </Link>
        </p>
      }
    >
      {/* --- Alert --- */}
      {alertMessage && (
        <div
          className={`loading-alert-wrapper ${
            alertType === "error" ? "alert-error" : "alert-success"
          } ${animateAlert ? "loading" : ""}`}
        >
          <div className="loading-alert d-flex align-items-center justify-content-center">
            {loading && alertType === "success" && (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            )}
            <span className="loading-text">{alertMessage}</span>
          </div>
        </div>
      )}

      {/* --- Code Inputs --- */}
      <div className="d-flex justify-content-center gap-2 mb-2">
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
        className="w-100 d-inline-flex align-items-center justify-content-center gap-2"
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
  );
}
