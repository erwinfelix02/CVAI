import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";

import AuthCard from "../components/AuthCard";
import Button from "../components/Button";
import "../styles/auth.css";

export default function VerifyCode() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));

  const isComplete = code.every((digit) => digit !== "");

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // auto-focus next
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key !== "Backspace") return;

    const newCode = [...code];

    // If current input has value → clear it
    if (newCode[index]) {
      newCode[index] = "";
      setCode(newCode);
    }
    // If empty → move focus back
    else if (index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = () => {
    if (!isComplete) return;
    console.log("Verify code:", code.join(""));
  };

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
          <strong>z@gmail.com</strong>
        </>
      }
      footer={
        <p className="text-center mt-3 mb-0">
          <Link to="/forgot-password" className="small">
            ← Back
          </Link>
        </p>
      }
    >
      {/* Code Inputs */}
      <div className="d-flex justify-content-center gap-2 mb-4">
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

      {/* Verify Button */}
      <Button
        className="w-100 d-inline-flex align-items-center justify-content-center gap-2"
        disabled={!isComplete}
        onClick={handleSubmit}
      >
        Verify Code
      </Button>

      {/* Resend */}
      <p className="text-center mt-3 small">
        Didn’t receive the code?{" "}
        <button className="resend-btn">Resend</button>
      </p>
    </AuthCard>
  );
}
