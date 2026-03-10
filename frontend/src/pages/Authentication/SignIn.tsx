import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PreRegNavbar from "../../components/PreReg/PreRegNavbar";
import AuthLayout from "../../components/Authentication/AuthLayout";
import AuthCard from "../../components/Authentication/AuthCard";
import Button from "../../components/Authentication/Button";
import AuthAlert from "../../components/Authentication/AuthAlert";
import "../../styles/auth.css";
import ArrowIcon from "../../assets/arrow-right.png";

import { FaUser, FaEye, FaEyeSlash, FaSyncAlt } from "react-icons/fa";
import { API_BASE_URL } from "../../config";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const [mathError, setMathError] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [question, setQuestion] = useState({ a: 0, b: 0 });
  const [isRotating, setIsRotating] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------------- Math verification ---------------- */
  const generateQuestion = () => {
    setQuestion({
      a: Math.floor(Math.random() * 100) + 1,
      b: Math.floor(Math.random() * 10) + 1,
    });
    setUserAnswer("");
    setMathError(null);
    setSubmitted(false);
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
  const isMathEmpty = userAnswer === "";

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    setSubmitted(true);

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
    if (hasError) return;

    // show signing in
    setLoading(true);
    setAnimateAlert(false);

    setTimeout(() => {
      setAlertMessage("Signing in");
      setAlertType("success");
      setAnimateAlert(true);
    }, 50);

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      if (res.data.requirePasswordChange) {
        setLoading(false);
        window.location.href = `/forgot-password?email=${res.data.email}&force=true`;
        return;
      }

      const { token, redirect } = res.data;

      localStorage.setItem("sessionToken", token);
      localStorage.setItem("lastActivity", Date.now().toString());
      window.location.href = redirect;
    } catch (error: any) {
      setLoading(false);
      setAnimateAlert(false);

      const data = error.response?.data;

      if (!data) {
        setAlertMessage("Login failed");
        setAlertType("error");
        setAnimateAlert(true);
        return;
      }

      // FIRST SHOW: Invalid email or password
      setAlertMessage(data.message);
      setAlertType("error");
      setAnimateAlert(true);

      // IF FAILED ATTEMPT → SHOW SECOND MESSAGE AFTER DELAY
      if (data.failedAttempt) {
        setTimeout(() => {
          setAnimateAlert(false);

          setTimeout(() => {
            setAlertMessage(
              `Failed attempt. ${data.triesLeft} attempt(s) left before lock.`
            );
            setAlertType("error");
            setAnimateAlert(true);
          }, 200);
        }, 1500);
      }
    }
  };

  /* ---------------- Auto-hide alert ---------------- */
  useEffect(() => {
    if (!alertMessage) return;
    const t = setTimeout(() => setAnimateAlert(false), 3000);
    return () => clearTimeout(t);
  }, [alertMessage]);

  /* ================= RENDER ================= */
  return (
    <>
      <PreRegNavbar />
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={loading}
      />

      <AuthLayout>
        <AuthCard title="Sign In" subtitle="Enter your credentials to continue">
          {/* Email */}
          <div className="outlined-field">
            <input
              type="email"
              className={`outlined-input ${errors.email ? "input-error" : ""}`}
              placeholder=" "
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined }));
              }}
            />
            <label>Email</label>
            <FaUser className="outlined-icon" />
            <div className="error-space">
              <span className={errors.email ? "error-text show" : "error-text"}>
                {errors.email || "placeholder"}
              </span>
            </div>
          </div>

          {/* Password */}
          <div className="outlined-field">
            <input
              type={showPassword ? "text" : "password"}
              className={`outlined-input ${errors.password ? "input-error" : ""}`}
              placeholder=" "
              value={password}
              onChange={(e) => {
                setPassword(e.target.value.replace(/\s/g, ""));
                setErrors((p) => ({ ...p, password: undefined }));
              }}
            />
            <label>Password</label>
            <button
              type="button"
              className="outlined-icon"
              onClick={() => setShowPassword((p) => !p)}
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

          {/* Math */}
          <div className="outlined-field math-field">
            <div className="math-verification">
              <div className="number-box">{question.a}</div>+
              <div className="number-box">{question.b}</div>=
              <input
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value.replace(/\D/g, ""));
                  setMathError(null);
                  setSubmitted(false);
                }}
                placeholder="?"
                className={
                  !submitted
                    ? ""
                    : isMathEmpty
                      ? "input-error"
                      : isVerified
                        ? "correct"
                        : "wrong"
                }
              />
              <button
                type="button"
                className={`refresh-btn ${isRotating ? "rotate active" : ""}`}
                onClick={handleRefresh}
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

          <Button
            className="btn-brand w-100"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
            {!loading && <img src={ArrowIcon} className="btn-arrow" />}
          </Button>

          <div className="text-center mt-2">
            <Link to="/forgot-password" className="small">
              Forgot password?
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    </>
  );
}