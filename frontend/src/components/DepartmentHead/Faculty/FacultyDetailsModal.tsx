// ✅ src/components/DepartmentHead/Faculty/FacultyDetailsModal.tsx

import { Mail } from "lucide-react";
import type { FacultyRow } from "./FacultyCard";

interface FacultyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: FacultyRow | null;
}

export default function FacultyDetailsModal({
  isOpen,
  onClose,
  faculty,
}: FacultyDetailsModalProps) {
  if (!isOpen || !faculty) return null;

  const loadPercentage = Math.min(
    (faculty.currentLoad / faculty.maxLoad) * 100,
    100
  );

  return (
    <div
      className="modal-backdrop fade show d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 1050,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={onClose}
    >
      <div
        className="card border-0 shadow-lg rounded-4 w-100 p-4 p-sm-5"
        style={{
          maxWidth: "520px",
          backgroundColor: "#f8fafc",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-4 shadow-none"
          onClick={onClose}
          aria-label="Close"
          style={{ fontSize: "0.9rem" }}
        />

        {/* HEADER / NAME */}
        <h3 className="fw-bold text-dark mb-2 pe-4 fs-4 fs-sm-3">
          {faculty.name}
        </h3>

        {/* POSITION & SPECIALIZATION */}
        <p className="text-secondary fw-medium mb-2 small fs-6">
          {faculty.position} <span className="mx-1">·</span> {faculty.specialization}
        </p>

        {/* EMAIL */}
        <div className="d-flex align-items-center gap-2 text-secondary mb-4 small">
          <Mail size={16} />
          <span>{faculty.email}</span>
        </div>

        {/* TEACHING LOAD SECTION */}
        <div className="mb-4">
          <label className="fw-semibold text-dark mb-2 small d-block fs-6">
            Teaching Load
          </label>
          <div
            className="progress rounded-pill mb-2"
            style={{ height: "12px", backgroundColor: "#e2e8f0" }}
          >
            <div
              className={`progress-bar rounded-pill ${
                faculty.status === "Overloaded" ? "bg-danger" : ""
              }`}
              style={{
                width: `${loadPercentage}%`,
                backgroundColor:
                  faculty.status === "Overloaded" ? undefined : "#0e4d6c",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <span className="text-secondary small fw-medium">
            {faculty.currentLoad} of {faculty.maxLoad} units
          </span>
        </div>

        {/* ASSIGNED SUBJECTS SECTION */}
        <div className="mb-5">
          <label className="fw-semibold text-dark mb-2 small d-block fs-6">
            Assigned Subjects
          </label>
          {faculty.subjects && faculty.subjects.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {faculty.subjects.map((subject) => (
                <span
                  key={subject}
                  className="badge bg-white text-dark border px-3 py-2 rounded-pill fw-bold shadow-sm small"
                  style={{ borderColor: "#e2e8f0" }}
                >
                  {subject}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted small fst-italic">
              No subjects currently assigned
            </span>
          )}
        </div>

        {/* FOOTER ACTION */}
        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-light bg-white border px-4 py-2 rounded-3 fw-medium shadow-sm text-dark"
            style={{ borderColor: "#e2e8f0" }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}