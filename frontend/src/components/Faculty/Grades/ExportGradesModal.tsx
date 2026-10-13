// ✅ src/components/Faculty/Grades/ExportGradesModal.tsx

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
  Loader2,
} from "lucide-react";
import type { GradeRow, GradingSystemData } from "./types";

type FormatOption = "csv" | "pdf" | "";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  rows: GradeRow[];
  selectedCourseLabel: string;
  activeTerm: string;
  gradingSystem: GradingSystemData;
};

export default function ExportGradesModal({
  isOpen,
  onClose,
  rows,
  selectedCourseLabel,
  activeTerm,
}: Props) {
  // Form States
  const [format, setFormat] = useState<FormatOption>("csv");
  const [recordsToInclude, setRecordsToInclude] = useState<string>("filtered");
  const [isRecordsDropdownOpen, setIsRecordsDropdownOpen] = useState(false);

  // Column Selections
  const [columns, setColumns] = useState({
    student: true,
    studentId: true,
    prelim: true,
    midterm: true,
    finals: true,
    finalGrade: true,
  });

  // Dialog & Progress Overlay States
  const [isExporting, setIsExporting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormat("csv");
      setRecordsToInclude("filtered");
      setIsRecordsDropdownOpen(false);
      setShowExitConfirm(false);
      setShowConfirm(false);
      setShowSuccess(false);
      setIsExporting(false);
    }
  }, [isOpen]);

  const isDirty = format !== "csv" || recordsToInclude !== "filtered";

  if (!isOpen) return null;

  const toggleColumn = (key: keyof typeof columns) => {
    setColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAttemptClose = () => {
    if (isDirty && !showSuccess && !showConfirm && !isExporting) {
      setShowExitConfirm(true);
    } else {
      handleForceClose();
    }
  };

  const handleForceClose = () => {
    setShowExitConfirm(false);
    setShowConfirm(false);
    setShowSuccess(false);
    setIsRecordsDropdownOpen(false);
    setIsExporting(false);
    onClose();
  };

  const handleTriggerExport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!format || !recordsToInclude) return;
    setShowConfirm(true);
  };

  /* EXECUTE EXPORT: GENERATE CSV / PDF */
  const handleExecuteExport = () => {
    setShowConfirm(false);
    setIsExporting(true);

    try {
      const dataToExport = rows;

      if (format === "csv") {
        // --- CSV EXPORT GENERATOR ---
        const headers: string[] = [];
        if (columns.student) headers.push("Student Name");
        if (columns.studentId) headers.push("Student ID");
        if (columns.prelim) headers.push("Prelim Grade");
        if (columns.midterm) headers.push("Midterm Grade");
        if (columns.finals) headers.push("Finals Grade");
        if (columns.finalGrade) headers.push("Final Grade");

        const csvRows = [headers.join(",")];

        dataToExport.forEach((r) => {
          const rowData: string[] = [];
          if (columns.student) rowData.push(`"${r.name || ""}"`);
          if (columns.studentId) rowData.push(`"${r.studentNo || ""}"`);
          if (columns.prelim) rowData.push(`"${r.prelim?.grade ?? "—"}"`);
          if (columns.midterm) rowData.push(`"${r.midterm?.grade ?? "—"}"`);
          if (columns.finals) rowData.push(`"${r.finals?.grade ?? "—"}"`);
          if (columns.finalGrade) rowData.push(`"${r.finalGrade ?? "—"}"`);
          csvRows.push(rowData.join(","));
        });

        const csvString = [
          `"Grade Report - ${selectedCourseLabel}"`,
          `"Term: ${activeTerm.toUpperCase()}"`,
          "",
          csvRows.join("\n"),
        ].join("\n");

        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `${selectedCourseLabel.replace(/[^a-zA-Z0-9]/g, "_")}_Grades_${activeTerm}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === "pdf") {
        // --- PDF / PRINT REPORT GENERATOR ---
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          let htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Grade Report - ${selectedCourseLabel}</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                  h2 { color: #0d5c75; margin-bottom: 5px; }
                  .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
                  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
                  th { background-color: #0d5c75; color: white; }
                  .text-center { text-align: center; }
                </style>
              </head>
              <body>
                <h2>Grade Report</h2>
                <div class="meta"><strong>Course:</strong> ${selectedCourseLabel} | <strong>Term:</strong> ${activeTerm.toUpperCase()}</div>
                <table>
                  <thead>
                    <tr>
                      ${columns.student ? "<th>Student Name</th>" : ""}
                      ${columns.studentId ? "<th>Student ID</th>" : ""}
                      ${columns.prelim ? "<th class='text-center'>Prelim</th>" : ""}
                      ${columns.midterm ? "<th class='text-center'>Midterm</th>" : ""}
                      ${columns.finals ? "<th class='text-center'>Finals</th>" : ""}
                      ${columns.finalGrade ? "<th class='text-center'>Final Grade</th>" : ""}
                    </tr>
                  </thead>
                  <tbody>
          `;

          dataToExport.forEach((r, idx) => {
            htmlContent += `
              <tr style="background-color: ${idx % 2 === 0 ? "#f9f9f9" : "#ffffff"};">
                ${columns.student ? `<td>${r.name || ""}</td>` : ""}
                ${columns.studentId ? `<td>${r.studentNo || ""}</td>` : ""}
                ${columns.prelim ? `<td class='text-center'>${r.prelim?.grade ?? "—"}</td>` : ""}
                ${columns.midterm ? `<td class='text-center'>${r.midterm?.grade ?? "—"}</td>` : ""}
                ${columns.finals ? `<td class='text-center'>${r.finals?.grade ?? "—"}</td>` : ""}
                ${columns.finalGrade ? `<td class='text-center'>${r.finalGrade ?? "—"}</td>` : ""}
              </tr>
            `;
          });

          htmlContent += `
                  </tbody>
                </table>
                <script>
                  window.onload = function() { window.print(); }
                </script>
              </body>
            </html>
          `;

          printWindow.document.write(htmlContent);
          printWindow.document.close();
        }
      }

      setShowSuccess(true);
      setTimeout(() => {
        handleForceClose();
      }, 1800);
    } catch (err) {
      console.error("Failed to generate export file:", err);
      alert("Error generating grades export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const dropdownOptions = [
    { value: "filtered", label: `Current filtered view (${rows.length} students)` },
    { value: "all", label: `All students in ${selectedCourseLabel}` },
  ];

  const selectedOptionLabel =
    dropdownOptions.find((opt) => opt.value === recordsToInclude)?.label ||
    "Select records to include...";

  return (
    <>
      {/* MAIN EXPORT MODAL */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 9999,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
        }}
        onClick={handleAttemptClose}
      >
        <div
          className="modal-dialog modal-dialog-scrollable my-2 my-sm-auto mx-auto px-2"
          style={{
            maxWidth: "500px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            minHeight: "calc(100% - 1rem)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white w-100 d-flex flex-column"
            style={{ maxHeight: "calc(100vh - 1.5rem)" }}
          >
            {/* Modal Header */}
            <div className="modal-header border-bottom-0 pb-2 pt-3 pt-sm-4 px-3 px-sm-4 align-items-start justify-content-between flex-shrink-0">
              <div className="pe-2">
                <div className="d-flex align-items-center gap-2">
                  <Download className="text-dark flex-shrink-0" size={20} />
                  <h5 className="modal-title fw-bold text-dark m-0 fs-6 fs-sm-5">
                    Export Grades
                  </h5>
                </div>
                <p className="text-secondary small mt-1 mb-0">
                  Download grade sheets for your class records.
                </p>
              </div>
              <button
                type="button"
                className="btn-close shadow-none mt-1"
                onClick={handleAttemptClose}
                aria-label="Close"
                disabled={isExporting}
              />
            </div>

            {/* Scrollable Form Body */}
            <form
              onSubmit={handleTriggerExport}
              className="d-flex flex-column flex-grow-1 overflow-hidden m-0"
            >
              <div className="modal-body p-3 p-sm-4 overflow-y-auto">
                {/* File Format Selection */}
                <div className="mb-3">
                  <label className="form-label text-dark small fw-medium mb-1.5">
                    File format *
                  </label>
                  <div className="row g-2">
                    <div className="col-6">
                      <button
                        type="button"
                        className={`btn w-100 py-2 py-sm-2.5 rounded-3 border d-flex flex-column align-items-center justify-content-center gap-1 transition-all ${
                          format === "csv"
                            ? "border-primary bg-primary-subtle bg-opacity-10 shadow-sm"
                            : "border-light-subtle bg-white text-secondary"
                        }`}
                        style={{
                          borderColor: format === "csv" ? "#0d5c75 !important" : undefined,
                        }}
                        onClick={() => setFormat("csv")}
                        disabled={isExporting}
                      >
                        <FileSpreadsheet
                          size={18}
                          style={{
                            color: format === "csv" ? "#0d5c75" : "#6c757d",
                          }}
                        />
                        <span className={`small fw-semibold mt-0.5 fs-7 ${format === "csv" ? "text-dark" : "text-secondary"}`}>
                          CSV (Excel)
                        </span>
                      </button>
                    </div>

                    <div className="col-6">
                      <button
                        type="button"
                        className={`btn w-100 py-2 py-sm-2.5 rounded-3 border d-flex flex-column align-items-center justify-content-center gap-1 transition-all ${
                          format === "pdf"
                            ? "border-primary bg-primary-subtle bg-opacity-10 shadow-sm"
                            : "border-light-subtle bg-white text-secondary"
                        }`}
                        style={{
                          borderColor: format === "pdf" ? "#0d5c75 !important" : undefined,
                        }}
                        onClick={() => setFormat("pdf")}
                        disabled={isExporting}
                      >
                        <FileText
                          size={18}
                          style={{
                            color: format === "pdf" ? "#0d5c75" : "#6c757d",
                          }}
                        />
                        <span className={`small fw-semibold mt-0.5 fs-7 ${format === "pdf" ? "text-dark" : "text-secondary"}`}>
                          PDF Report
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Records To Include Dropdown */}
                <div className="mb-3 position-relative">
                  <label className="form-label text-dark small fw-medium mb-1">
                    Records to include *
                  </label>
                  <div
                    className="form-control d-flex justify-content-between align-items-center py-1.5 px-3 rounded-3 border-2 cursor-pointer bg-white"
                    style={{ borderColor: "#0d5c75" }}
                    onClick={() =>
                      !isExporting && setIsRecordsDropdownOpen(!isRecordsDropdownOpen)
                    }
                  >
                    <span className="small fw-medium text-truncate text-dark">
                      {selectedOptionLabel}
                    </span>
                    <ChevronDown size={16} className="text-secondary flex-shrink-0 ms-1" />
                  </div>

                  {isRecordsDropdownOpen && (
                    <div
                      className="border-0 shadow-lg rounded-4 p-1.5 bg-white position-absolute w-100 mt-1"
                      style={{ zIndex: 10 }}
                    >
                      {dropdownOptions.map((opt) => {
                        const isSelected = recordsToInclude === opt.value;
                        return (
                          <div
                            key={opt.value}
                            className={`d-flex align-items-center gap-2 p-2 rounded-3 cursor-pointer small transition-all ${
                              isSelected
                                ? "text-white"
                                : "hover-option text-dark"
                            }`}
                            style={{
                              backgroundColor: isSelected ? "#0d5c75" : "transparent",
                            }}
                            onClick={() => {
                              setRecordsToInclude(opt.value);
                              setIsRecordsDropdownOpen(false);
                            }}
                          >
                            {isSelected && (
                              <Check size={16} className="text-white flex-shrink-0" />
                            )}
                            <span className={isSelected ? "text-white fw-semibold ms-0" : "ms-4"}>
                              {opt.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Columns Selection */}
                <div className="mb-1">
                  <label className="form-label text-dark small fw-medium mb-1.5">
                    Columns
                  </label>
                  <div className="bg-light p-2.5 rounded-3 border border-light-subtle">
                    <div className="row g-2">
                      <div className="col-6">
                        <div
                          className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                          onClick={() => toggleColumn("student")}
                        >
                          <CheckCircle2
                            size={16}
                            className="flex-shrink-0"
                            style={{
                              fill: columns.student ? "#0d5c75" : "transparent",
                              color: columns.student ? "#fff" : "#a0aec0",
                            }}
                          />
                          <span className="small text-dark fw-medium fs-7">Student Name</span>
                        </div>
                      </div>

                      <div className="col-6">
                        <div
                          className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                          onClick={() => toggleColumn("studentId")}
                        >
                          <CheckCircle2
                            size={16}
                            className="flex-shrink-0"
                            style={{
                              fill: columns.studentId ? "#0d5c75" : "transparent",
                              color: columns.studentId ? "#fff" : "#a0aec0",
                            }}
                          />
                          <span className="small text-dark fw-medium fs-7">Student ID</span>
                        </div>
                      </div>

                      <div className="col-6">
                        <div
                          className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                          onClick={() => toggleColumn("prelim")}
                        >
                          <CheckCircle2
                            size={16}
                            className="flex-shrink-0"
                            style={{
                              fill: columns.prelim ? "#0d5c75" : "transparent",
                              color: columns.prelim ? "#fff" : "#a0aec0",
                            }}
                          />
                          <span className="small text-dark fw-medium fs-7">Prelim</span>
                        </div>
                      </div>

                      <div className="col-6">
                        <div
                          className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                          onClick={() => toggleColumn("midterm")}
                        >
                          <CheckCircle2
                            size={16}
                            className="flex-shrink-0"
                            style={{
                              fill: columns.midterm ? "#0d5c75" : "transparent",
                              color: columns.midterm ? "#fff" : "#a0aec0",
                            }}
                          />
                          <span className="small text-dark fw-medium fs-7">Midterm</span>
                        </div>
                      </div>

                      <div className="col-6">
                        <div
                          className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                          onClick={() => toggleColumn("finals")}
                        >
                          <CheckCircle2
                            size={16}
                            className="flex-shrink-0"
                            style={{
                              fill: columns.finals ? "#0d5c75" : "transparent",
                              color: columns.finals ? "#fff" : "#a0aec0",
                            }}
                          />
                          <span className="small text-dark fw-medium fs-7">Finals</span>
                        </div>
                      </div>

                      <div className="col-6">
                        <div
                          className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                          onClick={() => toggleColumn("finalGrade")}
                        >
                          <CheckCircle2
                            size={16}
                            className="flex-shrink-0"
                            style={{
                              fill: columns.finalGrade ? "#0d5c75" : "transparent",
                              color: columns.finalGrade ? "#fff" : "#a0aec0",
                            }}
                          />
                          <span className="small text-dark fw-medium fs-7">Final Grade</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Bottom Modal Actions */}
              <div className="modal-footer border-top-0 px-3 px-sm-4 py-2.5 bg-white flex-shrink-0 d-flex justify-content-end align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-light px-3 py-1.5 rounded-3 border-0 fw-medium text-dark small"
                  onClick={handleAttemptClose}
                  disabled={isExporting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn text-white px-3.5 py-1.5 rounded-3 d-flex align-items-center gap-2 fw-medium shadow-sm small"
                  style={{ backgroundColor: "#0d5c75" }}
                  disabled={!format || !recordsToInclude || isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={16} className="spinner-border spinner-border-sm" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Export
                    </>
                  )}
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
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 10000,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered px-3"
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4 bg-white">
              <div
                className="mx-auto mb-3 text-warning bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "52px", height: "52px" }}
              >
                <AlertTriangle size={26} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Discard Selections?</h5>
              <p className="text-secondary small mb-4">
                You have active selections. Leaving now will reset your export options.
              </p>

              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light flex-fill py-2 px-3 rounded-3 text-dark fw-medium border-0 text-nowrap small"
                  onClick={() => setShowExitConfirm(false)}
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  className="btn btn-danger flex-fill py-2 px-3 rounded-3 fw-medium text-nowrap small"
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
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 10000,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onClick={() => !isExporting && setShowConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered px-3"
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4 bg-white">
              <div
                className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "52px",
                  height: "52px",
                  backgroundColor: "rgba(13, 92, 117, 0.1)",
                  color: "#0d5c75",
                }}
              >
                <HelpCircle size={28} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Confirm Export?</h5>
              <p className="text-secondary small mb-4">
                You are about to export grades for <br />
                <strong className="text-dark">{selectedCourseLabel}</strong> ({activeTerm.toUpperCase()}) as a{" "}
                <strong className="text-dark">{format.toUpperCase()}</strong> file.
              </p>

              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light flex-fill py-2 px-3 rounded-3 text-dark fw-medium border-0 text-nowrap small"
                  onClick={() => setShowConfirm(false)}
                  disabled={isExporting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn text-white flex-fill py-2 px-3 rounded-3 fw-medium text-nowrap shadow-sm small"
                  style={{ backgroundColor: "#0d5c75" }}
                  onClick={handleExecuteExport}
                  disabled={isExporting}
                >
                  {isExporting ? "Generating..." : "Download File"}
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
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 10000,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <div className="modal-dialog modal-dialog-centered px-3" style={{ maxWidth: "380px" }}>
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4 bg-white">
              <div
                className="mx-auto mb-3 text-success bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "52px", height: "52px" }}
              >
                <CheckCircle2 size={30} />
              </div>
              <h5 className="fw-bold text-dark mb-1">File Generated!</h5>
              <p className="text-secondary small mb-0">
                Grades report for <strong>{selectedCourseLabel}</strong> ({activeTerm.toUpperCase()}) generated successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}