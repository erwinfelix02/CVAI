// src/components/Faculty/Student/StudentProfileModal.tsx

import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { formatYearLevel, type Student } from "./types";

type Props = {
  student: Student | null;
  onClose: () => void;
};

export default function StudentProfileModal({ student, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "academics" | "contact">("overview");
  const [imageError, setImageError] = useState(false);

  if (!student) return null;

  const yearDisplay = formatYearLevel(student.year);
  const attendanceRate = typeof student.attendance === "number" ? student.attendance : 100;
  const isAtRisk = attendanceRate < 80;

  // Extract phone directly from DB student object
  const contactPhone = (student.phone || "").trim();
  const displayPhone =
    contactPhone && contactPhone !== "—" && contactPhone !== "null"
      ? contactPhone
      : "Not Provided";

  // Helper to format proper image source URL
  const getFullAvatarUrl = (url?: string): string => {
    if (!url) return "";
    if (
      url.startsWith("data:") ||
      url.startsWith("blob:") ||
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }
    // Prepend http://localhost:5000 for relative server paths
    return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const resolvedAvatarUrl = getFullAvatarUrl(student.avatarUrl);
  const showAvatar = Boolean(resolvedAvatarUrl) && !imageError;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down px-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-center">
            <h5 className="modal-title fw-bold text-dark m-0">Student Profile</h5>
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {/* Pill Navigation */}
            <div className="bg-light p-1 rounded-3 mb-4 d-flex gap-1">
              <button
                type="button"
                className={`btn flex-fill py-2 rounded-3 fw-medium transition-all ${
                  activeTab === "overview"
                    ? "bg-white text-dark shadow-sm"
                    : "text-muted border-0 hover-bg-transparent"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                type="button"
                className={`btn flex-fill py-2 rounded-3 fw-medium transition-all ${
                  activeTab === "academics"
                    ? "bg-white text-dark shadow-sm"
                    : "text-muted border-0 hover-bg-transparent"
                }`}
                onClick={() => setActiveTab("academics")}
              >
                Academics
              </button>
              <button
                type="button"
                className={`btn flex-fill py-2 rounded-3 fw-medium transition-all ${
                  activeTab === "contact"
                    ? "bg-white text-dark shadow-sm"
                    : "text-muted border-0 hover-bg-transparent"
                }`}
                onClick={() => setActiveTab("contact")}
              >
                Contact
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "overview" && (
              <div className="tab-pane-content">
                <div className="d-flex align-items-center gap-3 mb-4">
                  {/* Avatar Container */}
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-3 flex-shrink-0 overflow-hidden border"
                    style={{
                      width: "80px",
                      height: "80px",
                      backgroundColor: "#3b7a9e",
                    }}
                  >
                    {showAvatar ? (
                      <img
                        src={resolvedAvatarUrl}
                        alt={student.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          borderRadius: "50%",
                        }}
                        onError={(_e) => {
                          console.warn(`Failed to load avatar image for modal: ${resolvedAvatarUrl}`);
                          setImageError(true);
                        }}
                      />
                    ) : (
                      student.initials || student.name?.charAt(0) || "ST"
                    )}
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1 text-dark">{student.name}</h4>
                    <p className="text-secondary mb-2">{student.id}</p>
                    <span
                      className={`badge rounded-pill px-3 py-1 ${
                        isAtRisk ? "bg-danger" : "bg-success"
                      }`}
                    >
                      {isAtRisk ? "At Risk" : "Active"}
                    </span>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="bg-light p-3 rounded-4 h-100">
                      <span className="text-secondary small d-block mb-1">Course</span>
                      <strong className="text-dark fs-5">
                        {student.course || "BS Computer Science"}
                      </strong>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="bg-light p-3 rounded-4 h-100">
                      <span className="text-secondary small d-block mb-1">Year & Section</span>
                      <strong className="text-dark fs-5">
                        {yearDisplay} - {student.section || "—"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "academics" && (
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="border border-light-subtle rounded-4 p-4 h-100">
                    <span className="text-secondary small d-block mb-2">Current GPA</span>
                    <span className="display-6 fw-bold text-success d-block">
                      {typeof student.gpa === "number" ? student.gpa.toFixed(2) : "0.00"}
                    </span>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="border border-light-subtle rounded-4 p-4 h-100">
                    <span className="text-secondary small d-block mb-1">Attendance Rate</span>
                    <span
                      className={`display-6 fw-bold d-block mb-3 ${
                        isAtRisk ? "text-danger" : "text-dark"
                      }`}
                    >
                      {attendanceRate}%
                    </span>
                    <div className="progress" style={{ height: "8px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${attendanceRate}%`,
                          backgroundColor: isAtRisk ? "#dc3545" : "#0d5c75",
                        }}
                        aria-valuenow={attendanceRate}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="d-flex flex-column gap-3">
                <div className="bg-light p-3 rounded-4 d-flex align-items-center gap-3">
                  <div className="text-secondary flex-shrink-0">
                    <Mail size={22} />
                  </div>
                  <div>
                    <span className="text-secondary small d-block">Email</span>
                    <strong className="text-dark">
                      {student.email || `${student.name.toLowerCase().replace(/\s+/g, ".")}@university.edu`}
                    </strong>
                  </div>
                </div>

                <div className="bg-light p-3 rounded-4 d-flex align-items-center gap-3">
                  <div className="text-secondary flex-shrink-0">
                    <Phone size={22} />
                  </div>
                  <div>
                    <span className="text-secondary small d-block">Phone</span>
                    <strong className="text-dark">{displayPhone}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}