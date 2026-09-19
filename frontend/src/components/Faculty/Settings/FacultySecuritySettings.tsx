// src/components/Faculty/Settings/FacultySecuritySettings.tsx

import { useState } from "react";
import {
  Edit2,
  Save,
  X,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

export default function FacultySecuritySettings() {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Password validation criteria
  const password = formData.newPassword;
  const confirmPassword = formData.confirmPassword;

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const isPasswordValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecial &&
    password === confirmPassword &&
    formData.currentPassword.trim() !== "";

  const isDirty =
    formData.currentPassword !== "" ||
    password !== "" ||
    confirmPassword !== "";

  const handleCancelClick = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      handleDiscard();
    }
  };

  const handleDiscard = () => {
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowCurrent(false);
    setShowPassword(false);
    setShowConfirm(false);
    setErrorMessage(null);
    setIsEditing(false);
    setShowExitConfirm(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }

    if (!isPasswordValid) {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match!");
      } else {
        setErrorMessage(
          "Password must be 8+ characters with uppercase, lowercase, number, and special character.",
        );
      }
      return;
    }

    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowSaveConfirm(false);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      const email = user?.email;

      if (!email) {
        throw new Error("User session email not found. Please log in again.");
      }

      await axios.post(`${API_BASE_URL}/auth/update-password`, {
        email,
        currentPassword: formData.currentPassword,
        password: formData.newPassword,
      });

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        handleDiscard();
      }, 1800);
    } catch (err: any) {
      console.error("Error updating password:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to update password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="card faculty-settings-card shadow-sm">
        <div className="card-body p-3 p-md-4">
          <h3 className="fw-bold mb-1">Security</h3>
          <p className="text-muted mb-4">Change your account password</p>

          {errorMessage && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2 mb-4"
              role="alert"
            >
              <AlertTriangle size={18} />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="row g-3">
              {/* CURRENT PASSWORD */}
              <div className="col-12">
                <label className="form-label">Current Password</label>
                <div className="position-relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    className="form-control pe-5"
                    placeholder="••••••••"
                    value={formData.currentPassword}
                    disabled={!isEditing || isLoading}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary border-0 p-0 me-3"
                      style={{ textDecoration: "none" }}
                      onClick={() => setShowCurrent((v) => !v)}
                      tabIndex={-1}
                    >
                      {showCurrent ? (
                        <FaEyeSlash size={16} />
                      ) : (
                        <FaEye size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* NEW PASSWORD */}
              <div className="col-12 col-md-6">
                <label className="form-label">New Password</label>
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control pe-5"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    disabled={!isEditing || isLoading}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    required
                  />
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary border-0 p-0 me-3"
                      style={{ textDecoration: "none" }}
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={16} />
                      ) : (
                        <FaEye size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="col-12 col-md-6">
                <label className="form-label">Confirm New Password</label>
                <div className="position-relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="form-control pe-5"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    disabled={!isEditing || isLoading}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary border-0 p-0 me-3"
                      style={{ textDecoration: "none" }}
                      onClick={() => setShowConfirm((v) => !v)}
                      tabIndex={-1}
                    >
                      {showConfirm ? (
                        <FaEyeSlash size={16} />
                      ) : (
                        <FaEye size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* PASSWORD REQUIREMENTS HINT */}
            {isEditing && (
              <p className="text-muted small mt-2 mb-0">
                Password must be 8+ characters with uppercase, lowercase,
                number, and special character.
              </p>
            )}

            {/* BUTTONS */}
            <div className="mt-4">
              {!isEditing ? (
                <button
                  type="button"
                  className="btn btn-primary faculty-settings-savebtn"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={18} className="me-2" />
                  Edit
                </button>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light border px-3"
                    onClick={handleCancelClick}
                    disabled={isLoading}
                  >
                    <X size={18} className="me-1" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary faculty-settings-savebtn"
                    disabled={!isPasswordValid || isLoading}
                  >
                    <Save size={18} className="me-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* DISCARD CONFIRMATION OVERLAY */}
      {showExitConfirm && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1060,
          }}
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered px-3"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4">
              <div
                className="mx-auto mb-3 text-warning bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <AlertTriangle size={28} />
              </div>
              <h5 className="fw-bold text-dark mb-1">
                Discard Password Changes?
              </h5>
              <p className="text-secondary small mb-4">
                You have entered password text. Leaving now will clear your
                inputs.
              </p>

              <div className="d-flex gap-3 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light flex-fill py-2.5 px-3 rounded-3 text-dark fw-medium border-0 text-nowrap"
                  onClick={() => setShowExitConfirm(false)}
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  className="btn btn-danger flex-fill py-2.5 px-3 rounded-3 fw-medium text-nowrap"
                  onClick={handleDiscard}
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVE CONFIRMATION OVERLAY */}
      {showSaveConfirm && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1060,
          }}
          onClick={() => setShowSaveConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered px-3"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4">
              <div
                className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "rgba(13, 92, 117, 0.1)",
                  color: "#0d5c75",
                }}
              >
                <HelpCircle size={30} />
              </div>
              <h5 className="fw-bold text-dark mb-1">
                Confirm Password Change?
              </h5>
              <p className="text-secondary small mb-4">
                Are you sure you want to update your password?
              </p>

              <div className="d-flex gap-3 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light flex-fill py-2.5 px-3 rounded-3 text-dark fw-medium border-0 text-nowrap"
                  onClick={() => setShowSaveConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn text-white flex-fill py-2.5 px-3 rounded-3 fw-medium text-nowrap shadow-sm"
                  style={{ backgroundColor: "#0d5c75" }}
                  onClick={handleConfirmSave}
                >
                  Confirm & Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1060,
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered px-3"
            style={{ maxWidth: "400px" }}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4">
              <div
                className="mx-auto mb-3 text-success bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Password Updated!</h5>
              <p className="text-secondary small mb-0">
                Your security password has been changed successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
