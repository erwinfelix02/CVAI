import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import "../styles/auth.css";
import ArrowIcon from "../assets/arrow-right.png";
import Button from "../components/Button";
import Logo from "../assets/graduation.png";
import { FaUser, FaEye, FaEyeSlash, FaSyncAlt } from "react-icons/fa";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [question, setQuestion] = useState({ a: 0, b: 0 });
  const [isRotating, setIsRotating] = useState(false);

  // Function to generate new math question
  const generateQuestion = () => {
    const a = Math.floor(Math.random() * 100) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setQuestion({ a, b });
    setUserAnswer(""); // reset user answer
  };

  // Handle click + rotate animation
  const handleRefresh = () => {
    setIsRotating(true);
    generateQuestion();
    setTimeout(() => setIsRotating(false), 600); // match animation duration
  };

  // Generate initial question on load
  useEffect(() => {
    generateQuestion();
  }, []);

  const correctAnswer = question.a + question.b;
  const isVerified = parseInt(userAnswer) === correctAnswer;

  return (
    <div className="auth-layout">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <h3 className="school-name text-center mb-3">
          ABC National High School
        </h3>
        <h1 className="campus-name">Campus AI</h1>
        <p>Smart Learning Assistant</p>
        <p className="auth-description">
          Your AI-powered companion for academic success and campus life
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <AuthCard
          title="Sign In"
          subtitle="Enter your credentials to continue"
          header={
            <h1 className="campus-ai-header-mobile text-center mb-3">
              <span className="campus-ai-logo-wrapper">
                <img src={Logo} alt="CampusAI logo" className="navbar-logo" />
              </span>
              Campus AI
            </h1>
          }
          footer={
            <p className="text-center mt-3">
              Don&apos;t have an account? <Link to="/signup">Sign up</Link>
            </p>
          }
        >
          {/* EMAIL */}
          <div className="outlined-field">
            <input
              type="email"
              className="outlined-input"
              placeholder=" "
              required
            />
            <label>Email</label>
            <FaUser className="outlined-icon" />
          </div>

          {/* PASSWORD */}
          <div className="outlined-field">
            <input
              type={showPassword ? "text" : "password"}
              className="outlined-input"
              placeholder=" "
              required
            />
            <label>Password</label>

            <button
              type="button"
              className="outlined-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* MATH VERIFICATION */}
          <div className="math-verification">
            <div className="number-box">{question.a}</div>
            <span className="operator">+</span>
            <div className="number-box">{question.b}</div>
            <span className="operator">=</span>
            <input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value.replace(/\D/, ""))}
              placeholder="?"
              className={
                userAnswer === "" ? "" : isVerified ? "correct" : "wrong"
              } // <-- dynamic class
            />

            <button
              type="button"
              className={`refresh-btn ${isRotating ? "rotate active" : ""}`}
              onClick={handleRefresh}
              title="Refresh numbers"
            >
              <FaSyncAlt />
            </button>
          </div>

          <Button className="btn-brand w-100" disabled={!isVerified}>
            Sign In <img src={ArrowIcon} className="btn-arrow" />
          </Button>

          <div className="text-center mt-2">
            <Link to="/forgot-password" className="small">
              Forgot password?
            </Link>
          </div>
        </AuthCard>
      </div>
    </div>
  );
}
