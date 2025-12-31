import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import "../styles/auth.css";
import ArrowIcon from "../assets/arrow-right.png";
import Button from "../components/Button";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [question, setQuestion] = useState({ a: 0, b: 0 });

  // Generate a random math question when the page loads
  useEffect(() => {
    const a = Math.floor(Math.random() * 100) + 1; // 1 to 100
    const b = Math.floor(Math.random() * 10) + 1;  // 1 to 10
    setQuestion({ a, b });
  }, []); // empty dependency array = runs only once on mount

  const correctAnswer = question.a + question.b;
  const isVerified = parseInt(userAnswer) === correctAnswer;

  return (
    <AuthCard
      title="Sign In"
      subtitle="Enter your credentials to continue"
      footer={
        <p className="text-center mt-3">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      }
    >
      {/* USERNAME */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Username</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter Username"
        />
      </div>

      {/* PASSWORD */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Password</label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Enter Password"
          />
          <button
            type="button"
            className="input-group-text bg-transparent"
            onClick={() => setShowPassword((p) => !p)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

{/* MATH VERIFICATION */}
<div className="math-verification">
  <div className="number-box">{question.a}</div>
  <span className="operator">+</span>
  <div className="number-box">{question.b}</div>
  <span className="operator">=</span>
  <input
    type="text"
    value={userAnswer}
    onChange={(e) => setUserAnswer(e.target.value.replace(/\D/, ""))}
    placeholder="?"
  />
</div>


      {/* SIGN IN BUTTON */}
      <Button
        className="w-100 d-flex align-items-center justify-content-center gap-2"
        disabled={!isVerified}
      >
        Sign In
        <img src={ArrowIcon} alt="" className="btn-arrow" />
      </Button>

      {/* FORGOT PASSWORD */}
      <div className="text-center mt-2">
        <Link to="/forgot-password" className="small">
          Forgot Password
        </Link>
      </div>
    </AuthCard>
  );
}
