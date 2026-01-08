import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../../components/Authentication/AuthCard";
import "../../styles/auth.css";
import ArrowIcon from "../../assets/arrow-right.png";
import Button from "../../components/Authentication/Button";
import Logo from "../../assets/graduation.png";
import { FaUser, FaEye, FaEyeSlash, FaSyncAlt } from "react-icons/fa";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);

  // Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [mathError, setMathError] = useState<string | null>(null);

  // Math verification
  const [userAnswer, setUserAnswer] = useState("");
  const [question, setQuestion] = useState({ a: 0, b: 0 });
  const [isRotating, setIsRotating] = useState(false);

  // Generate math question
  const generateQuestion = () => {
    const a = Math.floor(Math.random() * 100) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setQuestion({ a, b });
    setUserAnswer("");
    setMathError(null);
  };
  const handlePasswordChange = (value: string) => {
    const sanitizedValue = value.replace(/\s/g, ""); // remove spaces
    setPassword(sanitizedValue);
    setErrors((prev) => ({ ...prev, password: undefined }));
    if (/\s/.test(value)) {
      setErrors((prev) => ({ ...prev, password: "Spaces are not allowed" }));
    }
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleRefresh = () => {
    setIsRotating(true);
    generateQuestion();
    setTimeout(() => setIsRotating(false), 600);
  };

  const correctAnswer = question.a + question.b;
  const isVerified = parseInt(userAnswer) === correctAnswer;

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Submit handler
  const handleSubmit = () => {
    const newErrors: typeof errors = {};
    let hasError = false;

    if (!email) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!isValidEmail(email)) {
      newErrors.email = "Invalid email format";
      hasError = true;
    }

    if (!password) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    if (!userAnswer) {
      setMathError("Please answer the math verification");
      hasError = true;
    } else if (!isVerified) {
      setMathError("Incorrect answer. Please try again");
      hasError = true;
    } else {
      setMathError(null);
    }

    setErrors(newErrors);

    if (!hasError) {
      console.log("Form is valid:", { email, password });
      // send to backend
    }
  };

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
              className={`outlined-input ${errors.email ? "input-error" : ""}`}
              placeholder=" "
              value={email}
              minLength={6} // minimum 6 chars
              maxLength={254} // maximum 254 chars
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: undefined });
              }}
            />

            <label className={errors.email ? "label-error" : ""}>Email</label>
            <FaUser
              className={`outlined-icon ${errors.email ? "icon-error" : ""}`}
            />
            <div className="error-space">
              <span className={errors.email ? "error-text show" : "error-text"}>
                {errors.email || "placeholder"}
              </span>
            </div>
          </div>

          {/* PASSWORD */}
          <div className="outlined-field">
            <input
              type={showPassword ? "text" : "password"}
              className={`outlined-input ${errors.password ? "input-error" : ""}`}
              placeholder=" "
              value={password}
              minLength={8} // minimum 8 chars
              maxLength={64} // maximum 128 chars
              onChange={(e) => handlePasswordChange(e.target.value)}
            />

            <label className={errors.password ? "label-error" : ""}>
              Password
            </label>
            <button
              type="button"
              className={`outlined-icon ${errors.password ? "icon-error" : ""}`}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            <div className="error-space">
              <span
                className={errors.password ? "error-text show" : "error-text"}
              >
                {errors.password || "placeholder"}
              </span>
            </div>
          </div>

          {/* MATH VERIFICATION */}
          <div className="outlined-field math-field">
            <div className="math-verification">
              <div className="number-box">{question.a}</div>
              <span className="operator">+</span>
              <div className="number-box">{question.b}</div>
              <span className="operator">=</span>
              <input
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value.replace(/\D/, ""));
                  setMathError(null);
                }}
                placeholder="?"
                className={
                  userAnswer === "" ? "" : isVerified ? "correct" : "wrong"
                }
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

            <div className="error-space">
              <span className={mathError ? "error-text show" : "error-text"}>
                {mathError || "placeholder"}
              </span>
            </div>
          </div>

          <Button className="btn-brand w-100" onClick={handleSubmit}>
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
