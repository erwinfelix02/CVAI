import { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  Check,
  ChevronDown,
} from "lucide-react";

type FormatOption = "csv" | "pdf" | "";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  subjects?: { value: string; label: string }[];
  currentSubject?: string;
  currentDate?: string;
};

export default function ExportAttendanceModal({
  isOpen,
  onClose,
  subjects = [
    { value: "CS201", label: "CS 201 - Data Structures" },
    { value: "CS101", label: "CS 101 - Intro to Programming" },
  ],
}: Props) {
  // Empty Initial Form States
  const [format, setFormat] = useState<FormatOption>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [exportDate, setExportDate] = useState<string>("");
  const [recordsToInclude, setRecordsToInclude] = useState<string>("");
  const [isRecordsDropdownOpen, setIsRecordsDropdownOpen] = useState(false);

  // Column Selections
  const [columns, setColumns] = useState({
    student: true,
    studentId: true,
    present: true,
    absent: true,
    late: true,
    attendancePct: true,
  });

  // Dialog Overlay States
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Detect if user has selected or changed anything
  const isDirty =
    format !== "" ||
    selectedSubject !== "" ||
    exportDate !== "" ||
    recordsToInclude !== "";

  // Reset form whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setFormat("");
      setSelectedSubject("");
      setExportDate("");
      setRecordsToInclude("");
      setIsRecordsDropdownOpen(false);
      setShowExitConfirm(false);
      setShowConfirm(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleColumn = (key: keyof typeof columns) => {
    setColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Safe Close Attempt (Intercepts if fields are changed)
  const handleAttemptClose = () => {
    if (isDirty && !showSuccess && !showConfirm) {
      setShowExitConfirm(true);
    } else {
      handleForceClose();
    }
  };

  const handleForceClose = () => {
    setFormat("");
    setSelectedSubject("");
    setExportDate("");
    setRecordsToInclude("");
    setShowExitConfirm(false);
    setShowConfirm(false);
    setShowSuccess(false);
    setIsRecordsDropdownOpen(false);
    onClose();
  };

  const handleTriggerExport = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleExecuteExport = () => {
    setShowConfirm(false);

    console.log("Exporting Attendance Data:", {
      format,
      selectedSubject,
      exportDate,
      recordsToInclude,
      columns,
    });

    setShowSuccess(true);
    setTimeout(() => {
      handleForceClose();
    }, 1800);
  };

  const dropdownOptions = [
    { value: "filtered", label: "Current filtered view" },
    { value: "all", label: "All my records" },
    { value: "flagged", label: "Only flagged / at-risk" },
  ];

  const selectedOptionLabel =
    dropdownOptions.find((opt) => opt.value === recordsToInclude)?.label ||
    "Select records to include...";

  const selectedClassLabel =
    subjects.find((s) => s.value === selectedSubject)?.label || "Selected Course";

  return (
    <>
      {/* MAIN EXPORT MODAL */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 1050,
        }}
        onClick={handleAttemptClose}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-md modal-fullscreen-sm-down px-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            {/* Header */}
            <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-start">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <Download className="text-dark" size={22} />
                  <h5 className="modal-title fw-bold text-dark m-0">
                    Export Attendance
                  </h5>
                </div>
                <p className="text-secondary small mt-1 mb-0">
                  Download attendance sheets for your class records.
                </p>
              </div>
              <button
                type="button"
                className="btn-close shadow-none mt-1"
                onClick={handleAttemptClose}
                aria-label="Close"
              />
            </div>

            {/* Form Body */}
            <form onSubmit={handleTriggerExport} className="modal-body p-4">
              {/* File Format Selection */}
              <div className="mb-4">
                <label className="form-label text-dark small fw-medium mb-2">
                  File format *
                </label>
                <div className="row g-2">
                  <div className="col-6">
                    <button
                      type="button"
                      className={`btn w-100 py-3 rounded-3 border d-flex flex-column align-items-center justify-content-center gap-1 transition-all ${
                        format === "csv"
                          ? "format-card-selected shadow-sm"
                          : "border-light-subtle bg-white text-secondary hover-bg-light"
                      }`}
                      onClick={() => setFormat("csv")}
                    >
                      <FileSpreadsheet
                        size={20}
                        style={{
                          color: format === "csv" ? "#0d5c75" : "#6c757d",
                        }}
                      />
                      <span className="small fw-semibold mt-1">CSV (Excel)</span>
                    </button>
                  </div>

                  <div className="col-6">
                    <button
                      type="button"
                      className={`btn w-100 py-3 rounded-3 border d-flex flex-column align-items-center justify-content-center gap-1 transition-all ${
                        format === "pdf"
                          ? "format-card-selected shadow-sm"
                          : "border-light-subtle bg-white text-secondary hover-bg-light"
                      }`}
                      onClick={() => setFormat("pdf")}
                    >
                      <FileText
                        size={20}
                        style={{
                          color: format === "pdf" ? "#0d5c75" : "#6c757d",
                        }}
                      />
                      <span className="small fw-semibold mt-1">PDF Report</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CLASS / COURSE & CALENDAR DATE SIDE-BY-SIDE */}
              <div className="row g-3 mb-4">
                {/* Class / Course */}
                <div className="col-12 col-md-6">
                  <label className="form-label text-dark small fw-medium mb-1">
                    Class / Course *
                  </label>
                  <select
                    required
                    className="form-select border-2 shadow-none py-2 px-3 rounded-3"
                    style={{ borderColor: "#0d5c75" }}
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="" disabled hidden>
                      Select Class...
                    </option>
                    {subjects.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Direct Calendar Date Input */}
                <div className="col-12 col-md-6">
                  <label className="form-label text-dark small fw-medium mb-1">
                    Attendance Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="form-control border-2 shadow-none py-2 px-3 rounded-3"
                    style={{ borderColor: "#0d5c75" }}
                    value={exportDate}
                    onChange={(e) => setExportDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Records To Include Select Dropdown */}
              <div className="mb-4 position-relative">
                <label className="form-label text-dark small fw-medium mb-1">
                  Records to include *
                </label>
                <div
                  className="custom-export-select form-control d-flex justify-content-between align-items-center py-2 px-3 rounded-3 border-2 cursor-pointer bg-white"
                  style={{ borderColor: "#0d5c75" }}
                  onClick={() => setIsRecordsDropdownOpen(!isRecordsDropdownOpen)}
                >
                  <span
                    className={`small fw-medium ${
                      recordsToInclude ? "text-dark" : "text-muted"
                    }`}
                  >
                    {selectedOptionLabel}
                  </span>
                  <ChevronDown size={18} className="text-secondary" />
                </div>

                {/* Dropdown Options List */}
                {isRecordsDropdownOpen && (
                  <div className="custom-export-dropdown border-0 shadow-lg rounded-4 p-2 bg-white position-absolute w-100 mt-1">
                    {dropdownOptions.map((opt) => {
                      const isSelected = recordsToInclude === opt.value;
                      return (
                        <div
                          key={opt.value}
                          className={`custom-export-option d-flex align-items-center gap-2 p-2.5 rounded-3 cursor-pointer small transition-all ${
                            isSelected
                              ? "selected-highlight"
                              : "hover-option text-dark"
                          }`}
                          onClick={() => {
                            setRecordsToInclude(opt.value);
                            setIsRecordsDropdownOpen(false);
                          }}
                        >
                          {isSelected && (
                            <Check
                              size={16}
                              className="text-white flex-shrink-0"
                            />
                          )}
                          <span
                            className={
                              isSelected ? "text-white fw-semibold ms-0" : "ms-4"
                            }
                          >
                            {opt.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Columns Selection Grid */}
              <div className="mb-4">
                <label className="form-label text-dark small fw-medium mb-2">
                  Columns
                </label>
                <div className="bg-light p-3 rounded-4 border border-light-subtle">
                  <div className="row g-2">
                    <div className="col-6">
                      <div
                        className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                        onClick={() => toggleColumn("student")}
                      >
                        <CheckCircle2
                          size={20}
                          style={{
                            fill: columns.student ? "#0d5c75" : "transparent",
                            color: columns.student ? "#fff" : "#a0aec0",
                          }}
                        />
                        <span className="small text-dark fw-medium">Student</span>
                      </div>
                    </div>

                    <div className="col-6">
                      <div
                        className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                        onClick={() => toggleColumn("studentId")}
                      >
                        <CheckCircle2
                          size={20}
                          style={{
                            fill: columns.studentId ? "#0d5c75" : "transparent",
                            color: columns.studentId ? "#fff" : "#a0aec0",
                          }}
                        />
                        <span className="small text-dark fw-medium">Student ID</span>
                      </div>
                    </div>

                    <div className="col-6">
                      <div
                        className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                        onClick={() => toggleColumn("present")}
                      >
                        <CheckCircle2
                          size={20}
                          style={{
                            fill: columns.present ? "#0d5c75" : "transparent",
                            color: columns.present ? "#fff" : "#a0aec0",
                          }}
                        />
                        <span className="small text-dark fw-medium">Present</span>
                      </div>
                    </div>

                    <div className="col-6">
                      <div
                        className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                        onClick={() => toggleColumn("absent")}
                      >
                        <CheckCircle2
                          size={20}
                          style={{
                            fill: columns.absent ? "#0d5c75" : "transparent",
                            color: columns.absent ? "#fff" : "#a0aec0",
                          }}
                        />
                        <span className="small text-dark fw-medium">Absent</span>
                      </div>
                    </div>

                    <div className="col-6">
                      <div
                        className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                        onClick={() => toggleColumn("late")}
                      >
                        <CheckCircle2
                          size={20}
                          style={{
                            fill: columns.late ? "#0d5c75" : "transparent",
                            color: columns.late ? "#fff" : "#a0aec0",
                          }}
                        />
                        <span className="small text-dark fw-medium">Late</span>
                      </div>
                    </div>

                    <div className="col-6">
                      <div
                        className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                        onClick={() => toggleColumn("attendancePct")}
                      >
                        <CheckCircle2
                          size={20}
                          style={{
                            fill: columns.attendancePct ? "#0d5c75" : "transparent",
                            color: columns.attendancePct ? "#fff" : "#a0aec0",
                          }}
                        />
                        <span className="small text-dark fw-medium">
                          Attendance %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="d-flex justify-content-end align-items-center gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-light px-4 py-2 rounded-3 border-0 fw-medium text-dark"
                  onClick={handleAttemptClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn text-white px-4 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium shadow-sm"
                  style={{ backgroundColor: "#0d5c75" }}
                  disabled={!format || !selectedSubject || !exportDate || !recordsToInclude}
                >
                  <Download size={16} />
                  Export
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* DISCARD UNSAVED CHANGES OVERLAY DIALOG */}
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
              <h5 className="fw-bold text-dark mb-1">Discard Selections?</h5>
              <p className="text-secondary small mb-4">
                You have active selections. Leaving now will reset your export options.
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
                  onClick={handleForceClose}
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM EXPORT OVERLAY DIALOG */}
      {showConfirm && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1060,
          }}
          onClick={() => setShowConfirm(false)}
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
              <h5 className="fw-bold text-dark mb-1">Confirm Export?</h5>
              <p className="text-secondary small mb-4">
                You are about to export attendance for <br />
                <strong className="text-dark">{selectedClassLabel}</strong> on{" "}
                <strong className="text-dark">{exportDate}</strong> as a{" "}
                <strong className="text-dark">{format.toUpperCase()}</strong> file.
              </p>

              <div className="d-flex gap-3 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light flex-fill py-2.5 px-3 rounded-3 text-dark fw-medium border-0 text-nowrap"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn text-white flex-fill py-2.5 px-3 rounded-3 fw-medium text-nowrap shadow-sm"
                  style={{ backgroundColor: "#0d5c75" }}
                  onClick={handleExecuteExport}
                >
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS OVERLAY DIALOG */}
      {showSuccess && (
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
          <div className="modal-dialog modal-dialog-centered px-3" style={{ maxWidth: "400px" }}>
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4">
              <div
                className="mx-auto mb-3 text-success bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h5 className="fw-bold text-dark mb-1">File Generated!</h5>
              <p className="text-secondary small mb-0">
                Attendance report for <strong>{selectedClassLabel}</strong> ({exportDate}) generated successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}