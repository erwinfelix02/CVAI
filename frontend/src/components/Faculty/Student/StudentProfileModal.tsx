import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import type { Student } from "./types";

type Props = {
  student: Student | null;
  onClose: () => void;
};

export default function StudentProfileModal({ student, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "academics" | "contact">("overview");

  if (!student) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.4)", // Dark translucent background
        backdropFilter: "blur(8px)", // Native CSS backdrop blur
        WebkitBackdropFilter: "blur(8px)", // Safari support
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
                {/* Profile Header Card */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-3 flex-shrink-0"
                    style={{
                      width: "80px",
                      height: "80px",
                      backgroundColor: "#3b7a9e",
                    }}
                  >
                    {student.initials}
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1 text-dark">{student.name}</h4>
                    <p className="text-secondary mb-2">{student.id}</p>
                    <span
                      className={`badge rounded-pill px-3 py-1 ${
                        student.status === "good" ? "bg-success" : "bg-warning text-dark"
                      }`}
                    >
                      {student.status === "good" ? "active" : "probation"}
                    </span>
                  </div>
                </div>

                {/* Info Cards */}
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
                        3rd Year - {student.section}
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
                      {student.gpa.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="border border-light-subtle rounded-4 p-4 h-100">
                    <span className="text-secondary small d-block mb-1">Attendance Rate</span>
                    <span className="display-6 fw-bold text-dark d-block mb-3">
                      {student.attendance}%
                    </span>
                    <div className="progress" style={{ height: "8px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${student.attendance}%`,
                          backgroundColor: "#0d5c75",
                        }}
                        aria-valuenow={student.attendance}
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
                    <strong className="text-dark">
                      {student.phone || "+63 917 123 4567"}
                    </strong>
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