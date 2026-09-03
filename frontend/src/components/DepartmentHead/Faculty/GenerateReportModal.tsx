// ✅ src/components/DepartmentHead/Faculty/GenerateReportModal.tsx

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  ChevronDown,
  Check,
  Printer,
  Download,
  AlertCircle,
} from "lucide-react";
import type { FacultyRow } from "./FacultyCard";

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultyList: FacultyRow[];
  departmentName?: string;
}

export default function GenerateReportModal({
  isOpen,
  onClose,
  facultyList,
  departmentName = "Department",
}: GenerateReportModalProps) {
  const [term, setTerm] = useState("1st Sem, A.Y. 2026-2027");
  const [includeFilter, setIncludeFilter] = useState("All faculty");
  const [includeSubjects, setIncludeSubjects] = useState(true);

  // Confirmation Overlays State
  const [confirmPrintOpen, setConfirmPrintOpen] = useState(false);
  const [confirmExportOpen, setConfirmExportOpen] = useState(false);

  // Filter faculty based on dropdown selection
  const filteredFaculty = useMemo(() => {
    if (includeFilter === "Available only") {
      return facultyList.filter((f) => f.status === "Available");
    }
    if (includeFilter === "Overloaded only") {
      return facultyList.filter((f) => f.status === "Overloaded");
    }
    if (includeFilter === "Full load only") {
      return facultyList.filter((f) => f.status === "Full Load");
    }
    return facultyList;
  }, [facultyList, includeFilter]);

  // Dynamic Metrics
  const totalFacultyCount = filteredFaculty.length;
  const totalAssignedUnits = filteredFaculty.reduce((acc, f) => acc + f.currentLoad, 0);
  const totalCapacity = filteredFaculty.reduce((acc, f) => acc + f.maxLoad, 0);
  const utilizationPercentage = totalCapacity > 0 ? Math.round((totalAssignedUnits / totalCapacity) * 100) : 0;

  if (!isOpen) return null;

  /* =========================================================
     PRINT HANDLERS
     ========================================================= */
  const handleRequestPrint = () => {
    setConfirmPrintOpen(true);
  };

  const handleExecutePrint = () => {
    setConfirmPrintOpen(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  /* =========================================================
     EXPORT CSV HANDLERS
     ========================================================= */
  const handleRequestExport = () => {
    setConfirmExportOpen(true);
  };

  const handleExecuteExportCSV = () => {
    setConfirmExportOpen(false);

    const headers = ["Faculty", "Rank", "Assigned Units", "Max Capacity", "Subjects", "Status"];
    const rows = filteredFaculty.map((f) => [
      `"${f.name}"`,
      `"${f.position}"`,
      f.currentLoad,
      f.maxLoad,
      `"${f.subjects.join(", ")}"`,
      `"${f.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${departmentName.replace(/\s+/g, "_")}_Faculty_Load_Report_${term.replace(/[^a-zA-Z0-9]/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return createPortal(
    <>
      <div className="faculty-report-modal-backdrop" onClick={onClose}>
        <div
          className="faculty-report-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="faculty-report-header">
            <div className="d-flex align-items-start gap-2 gap-sm-3">
              <div className="report-icon-wrapper">
                <FileText size={20} className="text-primary d-none d-sm-block" />
                <FileText size={18} className="text-primary d-block d-sm-none" />
              </div>
              <div>
                <h5 className="fw-bold mb-1 text-dark modal-title-text">Generate Faculty Load Report</h5>
                <p className="text-muted small mb-0 d-none d-sm-block">
                  Review the teaching load summary before exporting for {departmentName}.
                </p>
                <p className="text-muted small mb-0 d-block d-sm-none fs-xs">
                  Review teaching load for {departmentName}.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close-modal"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="faculty-report-body">
            {/* Controls Row */}
            <div className="row g-2 g-sm-3 mb-3">
              <div className="col-12 col-sm-6">
                <label className="form-label small fw-medium text-secondary mb-1">Term</label>
                <div className="select-wrapper">
                  <select
                    className="form-select custom-report-select"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                  >
                    <option value="1st Sem, A.Y. 2026-2027">1st Sem, A.Y. 2026-2027</option>
                    <option value="2nd Sem, A.Y. 2026-2027">2nd Sem, A.Y. 2026-2027</option>
                    <option value="Summer, A.Y. 2026-2027">Summer, A.Y. 2026-2027</option>
                  </select>
                  <ChevronDown size={18} className="select-arrow" />
                </div>
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label small fw-medium text-secondary mb-1">Include</label>
                <div className="select-wrapper">
                  <select
                    className="form-select custom-report-select"
                    value={includeFilter}
                    onChange={(e) => setIncludeFilter(e.target.value)}
                  >
                    <option value="All faculty">All faculty</option>
                    <option value="Available only">Available only</option>
                    <option value="Full load only">Full load only</option>
                    <option value="Overloaded only">Overloaded only</option>
                  </select>
                  <ChevronDown size={18} className="select-arrow" />
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <div className="form-check custom-checkbox-wrapper mb-3 mb-sm-4">
              <input
                type="checkbox"
                className="form-check-input visually-hidden"
                id="includeSubjectsCheck"
                checked={includeSubjects}
                onChange={(e) => setIncludeSubjects(e.target.checked)}
              />
              <label
                className="form-check-label d-flex align-items-center gap-2 text-dark small fw-medium cursor-pointer"
                htmlFor="includeSubjectsCheck"
              >
                <span className={`custom-checkbox ${includeSubjects ? "checked" : ""}`}>
                  {includeSubjects && <Check size={14} className="text-white" />}
                </span>
                <span>Include assigned subjects per faculty</span>
              </label>
            </div>

            {/* Metric Summary Cards */}
            <div className="row g-2 g-sm-3 mb-3 mb-sm-4">
              <div className="col-4">
                <div className="metric-card">
                  <span className="metric-label">Faculty Included</span>
                  <span className="metric-value">{totalFacultyCount}</span>
                </div>
              </div>
              <div className="col-4">
                <div className="metric-card">
                  <span className="metric-label">Total Units</span>
                  <span className="metric-value">{totalAssignedUnits}</span>
                </div>
              </div>
              <div className="col-4">
                <div className="metric-card">
                  <span className="metric-label">Capacity</span>
                  <span className="metric-value">{totalCapacity}</span>
                </div>
              </div>
            </div>

            {/* Load Utilization Progress */}
            <div className="mb-3 mb-sm-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small text-secondary fw-medium">Department load utilization</span>
                <span className="small fw-bold text-dark">{utilizationPercentage}%</span>
              </div>
              <div className="progress custom-progress-bar" style={{ height: "12px" }}>
                <div
                  className="progress-bar custom-progress-fill"
                  role="progressbar"
                  style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                  aria-valuenow={utilizationPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>

            {/* Faculty Table Container (Horizontal Scroll for Mobile) */}
            <div className="report-table-wrapper border rounded-4">
              <div className="table-responsive">
                <table className="table report-table mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Faculty</th>
                      <th>Rank</th>
                      <th>Units</th>
                      {includeSubjects && <th>Subjects</th>}
                      <th className="text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFaculty.length > 0 ? (
                      filteredFaculty.map((f) => (
                        <tr key={f.id}>
                          <td className="fw-semibold text-dark text-nowrap">{f.name}</td>
                          <td className="text-secondary small text-nowrap">{f.position}</td>
                          <td className="fw-medium text-dark text-nowrap">{f.currentLoad}/{f.maxLoad}</td>
                          {includeSubjects && (
                            <td>
                              <div className="d-flex flex-wrap gap-1 subjects-pill-container">
                                {f.subjects.length > 0 ? (
                                  f.subjects.map((sub) => (
                                    <span key={sub} className="badge subject-pill">
                                      {sub}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-muted small">None</span>
                                )}
                              </div>
                            </td>
                          )}
                          <td className="text-end text-nowrap">
                            <span
                              className={`badge status-pill ${
                                f.status === "Overloaded"
                                  ? "status-overloaded"
                                  : f.status === "Full Load"
                                  ? "status-full"
                                  : "status-available"
                              }`}
                            >
                              {f.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={includeSubjects ? 5 : 4} className="text-center text-muted py-4 small">
                          No faculty found matching the selected criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="faculty-report-footer">
            <button type="button" className="btn btn-light report-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-light report-btn-print" onClick={handleRequestPrint}>
              <Printer size={17} />
              <span className="d-none d-sm-inline">Print</span>
            </button>
            <button type="button" className="btn btn-primary report-btn-generate" onClick={handleRequestExport}>
              <Download size={17} />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION OVERLAY FOR PRINTING */}
      {confirmPrintOpen && (
        <div className="report-confirm-overlay">
          <div className="report-confirm-box">
            <div className="d-flex align-items-center gap-2 mb-2 text-primary">
              <Printer size={22} />
              <h5 className="fw-bold mb-0 text-dark">Confirm Print</h5>
            </div>
            <p className="text-muted small mb-4">
              Are you sure you want to print the faculty load report for{" "}
              <strong>{term}</strong>?
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light btn-sm px-3 fw-medium border"
                onClick={() => setConfirmPrintOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm px-3 fw-medium d-inline-flex align-items-center gap-1"
                onClick={handleExecutePrint}
              >
                <Printer size={15} />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION OVERLAY FOR GENERATING CSV REPORT */}
      {confirmExportOpen && (
        <div className="report-confirm-overlay">
          <div className="report-confirm-box">
            <div className="d-flex align-items-center gap-2 mb-2 text-primary">
              <AlertCircle size={22} />
              <h5 className="fw-bold mb-0 text-dark">Confirm Report Export</h5>
            </div>
            <p className="text-muted small mb-4">
              Are you sure you want to generate and download the CSV report containing{" "}
              <strong>{totalFacultyCount} faculty record(s)</strong> for {departmentName}?
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light btn-sm px-3 fw-medium border"
                onClick={() => setConfirmExportOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm px-3 fw-medium d-inline-flex align-items-center gap-1"
                onClick={handleExecuteExportCSV}
              >
                <Download size={15} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}