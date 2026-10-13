// src/pages/Student/GradesPage.tsx

import { useState, useEffect } from "react";
import "../../styles/grades.css";
import StatCard from "../../components/Student/Grades/StatCard";
import GradesTableCard, {
  type CurrentRow,
} from "../../components/Student/Grades/GradesTableCard";
import GradeBreakdownModal from "../../components/Student/Grades/GradeBreakdownModal";
import AuthAlert from "../../components/Authentication/AuthAlert";
import { API_BASE_URL } from "../../config";

import {
  TrendingUp,
  BookOpen,
  Award,
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

type FormatOption = "excel" | "pdf" | "";

export default function GradesPage() {
  const [gradesData, setGradesData] = useState<Record<string, any>>({});
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  const [studentYearLevel, setStudentYearLevel] = useState<number>(1);
  const [gpa, setGpa] = useState<string>("1.00");
  const [unitsEnrolled, setUnitsEnrolled] = useState<number>(0);
  const [academicStanding, setAcademicStanding] = useState<string>("Regular");
  const [loading, setLoading] = useState<boolean>(true);

  // Alert State
  const [alertState, setAlertState] = useState<{
    message: string;
    type: "error" | "success";
    visible: boolean;
    loading?: boolean;
  }>({
    message: "",
    type: "success",
    visible: false,
    loading: false,
  });

  // Grade breakdown modal state
  const [modalState, setModalState] = useState<{
    show: boolean;
    subjectCode: string;
    term: "prelim" | "midterm" | "finals";
    gradeData: any;
  }>({
    show: false,
    subjectCode: "",
    term: "midterm",
    gradeData: null,
  });

  // Export Modal States
  const [exportModalShow, setExportModalShow] = useState<boolean>(false);
  const [format, setFormat] = useState<FormatOption>("");
  const [recordsToInclude, setRecordsToInclude] = useState<string>("");
  const [isRecordsDropdownOpen, setIsRecordsDropdownOpen] = useState(false);

  // Column Selections for Export
  const [columns, setColumns] = useState({
    code: true,
    subject: true,
    units: true,
    prelim: true,
    midterm: true,
    finals: true,
    finalGrade: true,
    status: true,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isDirty = format !== "" || recordsToInclude !== "";

  // Helper function to compute academic standing dynamically
  const computeAcademicStanding = (
    gpaValue: string,
    rows: CurrentRow[],
  ): string => {
    const gpaNum = parseFloat(gpaValue);

    const hasFailedSubject = rows.some((r) => {
      const final = parseFloat(r.finalGrade);
      return final === 5.0 || r.status === ("Failed" as any);
    });

    if (hasFailedSubject) {
      return "Irregular";
    }

    if (!isNaN(gpaNum) && gpaNum <= 1.75 && gpaNum >= 1.0) {
      return "Dean's Lister";
    }

    return "Regular";
  };

  useEffect(() => {
    async function fetchGrades() {
      try {
        setLoading(true);
        setAlertState({
          message: "Loading your academic performance",
          type: "success",
          visible: true,
          loading: true,
        });

        const queryParams = new URLSearchParams({
          ...(selectedSemester ? { semester: selectedSemester } : {}),
          yearLevel: studentYearLevel.toString(),
        });

        const token =
          localStorage.getItem("token") ||
          JSON.parse(localStorage.getItem("user") || "{}")?.token;
        const endpoint = `${API_BASE_URL}/students/my-grades?${queryParams.toString()}`;

        const response = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setGradesData(data.grades || {});
          setGpa(data.gpa || "1.00");
          setUnitsEnrolled(data.unitsEnrolled || 0);

          const tempRows: CurrentRow[] = Object.entries(data.grades || {}).map(
            ([code, details]: [string, any]) => ({
              code,
              subject: details.subjectName || code,
              units: details.units || 3,
              prelim: details.prelim?.grade ?? "—",
              midterm: details.midterm?.grade ?? "—",
              finals: details.finals?.grade ?? "—",
              finalGrade: details.finalGrade ?? "—",
              status: (details.status === "complete" ||
              details.status === "Completed"
                ? "Completed"
                : "In Progress") as "In Progress" | "Completed",
              rawDetails: details,
            }),
          );

          const calculatedStanding = computeAcademicStanding(
            data.gpa || "1.00",
            tempRows,
          );
          setAcademicStanding(data.academicStanding || calculatedStanding);

          if (data.availableSemesters && data.availableSemesters.length > 0) {
            setAvailableSemesters(data.availableSemesters);
            if (
              !selectedSemester ||
              !data.availableSemesters.includes(selectedSemester)
            ) {
              setSelectedSemester(data.availableSemesters[0]);
            }
          }

          if (data.yearLevel) {
            setStudentYearLevel(data.yearLevel);
          }
          setAlertState({
            message: "",
            type: "success",
            visible: false,
            loading: false,
          });
        } else {
          throw new Error(data.message || "Failed to load grades.");
        }
      } catch (err: any) {
        console.error("Failed to fetch live grades exception:", err);
        setAlertState({
          message: err.message || "Failed to fetch live grades",
          type: "error",
          visible: true,
          loading: false,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchGrades();
  }, [selectedSemester, studentYearLevel]);

  const currentSemesterRows: CurrentRow[] = Object.entries(gradesData).map(
    ([code, details]: [string, any]) => {
      return {
        code,
        subject: details.subjectName || code,
        units: details.units || 3,
        prelim: details.prelim?.grade ?? "—",
        midterm: details.midterm?.grade ?? "—",
        finals: details.finals?.grade ?? "—",
        finalGrade: details.finalGrade ?? "—",
        status: (details.status === "complete" || details.status === "Completed"
          ? "Completed"
          : "In Progress") as "In Progress" | "Completed",
        rawDetails: details,
      };
    },
  );

  const handleCellClick = (
    code: string,
    term: "prelim" | "midterm" | "finals",
    rawDetails: any,
  ) => {
    if (!rawDetails || !rawDetails[term]) return;
    setModalState({
      show: true,
      subjectCode: code,
      term,
      gradeData: rawDetails,
    });
  };

  const handleOpenExportModal = () => {
    setFormat("");
    setRecordsToInclude("");
    setIsRecordsDropdownOpen(false);
    setShowExitConfirm(false);
    setShowConfirm(false);
    setShowSuccess(false);
    setIsExporting(false);
    setExportModalShow(true);
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
    setExportModalShow(false);
  };

  const toggleColumn = (key: keyof typeof columns) => {
    setColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTriggerExport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!format || !recordsToInclude) return;
    setShowConfirm(true);
  };

  const handleExecuteExport = () => {
    setShowConfirm(false);
    setIsExporting(true);

    try {
      if (format === "pdf") {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          throw new Error("Please allow popups to export your PDF.");
        }

        let tableRowsHtml = "";
        Object.entries(gradesData).forEach(([code, details]: [string, any]) => {
          tableRowsHtml += `
            <tr>
              ${columns.code ? `<td>${code}</td>` : ""}
              ${columns.subject ? `<td>${details.subjectName || code}</td>` : ""}
              ${columns.units ? `<td style="text-align: center;">${details.units || 3}</td>` : ""}
              ${columns.prelim ? `<td style="text-align: center;">${details.prelim?.grade ?? "—"}</td>` : ""}
              ${columns.midterm ? `<td style="text-align: center;">${details.midterm?.grade ?? "—"}</td>` : ""}
              ${columns.finals ? `<td style="text-align: center;">${details.finals?.grade ?? "—"}</td>` : ""}
              ${columns.finalGrade ? `<td style="text-align: center;">${details.finalGrade ?? "—"}</td>` : ""}
              ${columns.status ? `<td style="text-align: center;">${details.status || "In Progress"}</td>` : ""}
            </tr>
          `;
        });

        printWindow.document.write(`
          <html>
            <head>
              <title>Academic Grades Report</title>
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
              <h2>Academic Grades Report</h2>
              <div class="meta"><strong>Year Level:</strong> ${studentYearLevel} | <strong>Scope:</strong> ${recordsToIncLabel}</div>
              <table>
                <thead>
                  <tr>
                    ${columns.code ? "<th>Course Code</th>" : ""}
                    ${columns.subject ? "<th>Subject Name</th>" : ""}
                    ${columns.units ? "<th class='text-center'>Units</th>" : ""}
                    ${columns.prelim ? "<th class='text-center'>Prelim</th>" : ""}
                    ${columns.midterm ? "<th class='text-center'>Midterm</th>" : ""}
                    ${columns.finals ? "<th class='text-center'>Finals</th>" : ""}
                    ${columns.finalGrade ? "<th class='text-center'>Final Grade</th>" : ""}
                    ${columns.status ? "<th class='text-center'>Status</th>" : ""}
                  </tr>
                </thead>
                <tbody>
                  ${tableRowsHtml}
                </tbody>
              </table>
              <script>
                window.onload = function() { window.print(); };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        const headers: string[] = [];
        if (columns.code) headers.push("Course Code");
        if (columns.subject) headers.push("Subject Name");
        if (columns.units) headers.push("Units");
        if (columns.prelim) headers.push("Prelim");
        if (columns.midterm) headers.push("Midterm");
        if (columns.finals) headers.push("Finals");
        if (columns.finalGrade) headers.push("Final Grade");
        if (columns.status) headers.push("Status");

        let tableHtml = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="utf-8"/></head>
            <body>
              <h3>Academic Grades Report - Year Level ${studentYearLevel}</h3>
              <p><b>Scope:</b> ${recordsToIncLabel}</p>
              <br/>
              <table border="1">
                <tr style="background-color: #0d5c75; color: white; font-weight: bold;">
                  ${headers.map((h) => `<td>${h}</td>`).join("")}
                </tr>
        `;

        Object.entries(gradesData).forEach(([code, details]: [string, any]) => {
          tableHtml += "<tr>";
          if (columns.code) tableHtml += `<td>${code}</td>`;
          if (columns.subject)
            tableHtml += `<td>${details.subjectName || code}</td>`;
          if (columns.units) tableHtml += `<td>${details.units || 3}</td>`;
          if (columns.prelim)
            tableHtml += `<td>${details.prelim?.grade ?? "—"}</td>`;
          if (columns.midterm)
            tableHtml += `<td>${details.midterm?.grade ?? "—"}</td>`;
          if (columns.finals)
            tableHtml += `<td>${details.finals?.grade ?? "—"}</td>`;
          if (columns.finalGrade)
            tableHtml += `<td>${details.finalGrade ?? "—"}</td>`;
          if (columns.status)
            tableHtml += `<td>${details.status || "In Progress"}</td>`;
          tableHtml += "</tr>";
        });

        tableHtml += `
              </table>
            </body>
          </html>
        `;

        const blob = new Blob([tableHtml], {
          type: "application/vnd.ms-excel;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `Academic_Grades_${recordsToIncLabel.replace(/[^a-zA-Z0-9]/g, "_")}.xls`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      setShowSuccess(true);
      setTimeout(() => {
        handleForceClose();
      }, 1800);
    } catch (err: any) {
      console.error("Export error:", err);
      alert(err.message || "An error occurred while generating your file.");
      setIsExporting(false);
    }
  };

  const recordsOptions = [
    ...availableSemesters.map((sem) => ({ value: sem, label: sem })),
    {
      value: "All semesters (Year level)",
      label: "All semesters (Year level)",
    },
    { value: "Complete Academic Record", label: "Complete Academic Record" },
  ];

  const recordsToIncLabel =
    recordsOptions.find((opt) => opt.value === recordsToInclude)?.label ||
    "-- Choose option --";

  if (loading && availableSemesters.length === 0) {
    return (
      <div className="p-5 text-center text-muted">
        Loading your academic performance...
      </div>
    );
  }

  return (
    <div className="grades-page">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-3">
        <div>
          <h2 className="fw-bold mb-1">Academic Grades</h2>
          <p className="text-muted mb-0">
            View your live academic performance for Year {studentYearLevel}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <select
            className="form-select form-select-sm w-auto"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            {availableSemesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>

          <button
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
            onClick={handleOpenExportModal}
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="mb-3">
        <AuthAlert
          message={alertState.message}
          type={alertState.type}
          visible={alertState.visible}
          loading={alertState.loading}
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-4">
          <StatCard
            icon={TrendingUp}
            tone="neutral"
            value={gpa}
            label="Current GPA"
          />
        </div>
        <div className="col-12 col-lg-4">
          <StatCard
            icon={BookOpen}
            tone="blue"
            value={unitsEnrolled.toString()}
            label="Units Enrolled"
          />
        </div>
        <div className="col-12 col-lg-4">
          <StatCard
            icon={Award}
            tone="green"
            value={academicStanding}
            label="Academic Standing"
            bigTitle
          />
        </div>
      </div>

      <GradesTableCard
        title={`Current Semester Grades ${selectedSemester ? `(${selectedSemester})` : ""}`}
        titleIcon={BookOpen}
        variant="current"
        rows={currentSemesterRows}
        onCellClick={handleCellClick}
      />

      {/* Grade Breakdown Modal */}
      <GradeBreakdownModal
        show={modalState.show}
        onClose={() => setModalState({ ...modalState, show: false })}
        subjectCode={modalState.subjectCode}
        term={modalState.term}
        gradeData={modalState.gradeData}
      />

      {/* MAIN EXPORT MODAL */}
      {exportModalShow && (
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
                    Download your academic grades as a document or spreadsheet.
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
                            format === "excel"
                              ? "border-primary bg-primary-subtle bg-opacity-10 shadow-sm"
                              : "border-light-subtle bg-white text-secondary"
                          }`}
                          style={{
                            borderColor:
                              format === "excel"
                                ? "#0d5c75 !important"
                                : undefined,
                          }}
                          onClick={() => setFormat("excel")}
                          disabled={isExporting}
                        >
                          <FileSpreadsheet
                            size={18}
                            style={{
                              color: format === "excel" ? "#0d5c75" : "#6c757d",
                            }}
                          />
                          <span
                            className={`small fw-semibold mt-0.5 fs-7 ${format === "excel" ? "text-dark" : "text-secondary"}`}
                          >
                            Excel spreadsheet
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
                            borderColor:
                              format === "pdf"
                                ? "#0d5c75 !important"
                                : undefined,
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
                          <span
                            className={`small fw-semibold mt-0.5 fs-7 ${format === "pdf" ? "text-dark" : "text-secondary"}`}
                          >
                            PDF document
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Records To Include Dropdown */}
                  <div className="mb-3 position-relative">
                    <label className="form-label text-dark small fw-medium mb-1">
                      Include *
                    </label>
                    <div
                      className="form-control d-flex justify-content-between align-items-center py-1.5 px-3 rounded-3 border-2 cursor-pointer bg-white"
                      style={{
                        borderColor: recordsToInclude ? "#0d5c75" : "#ced4da",
                      }}
                      onClick={() =>
                        !isExporting &&
                        setIsRecordsDropdownOpen(!isRecordsDropdownOpen)
                      }
                    >
                      <span
                        className={`small fw-medium text-truncate ${recordsToInclude ? "text-dark" : "text-muted"}`}
                      >
                        {recordsToIncLabel}
                      </span>
                      <ChevronDown
                        size={16}
                        className="text-secondary flex-shrink-0 ms-1"
                      />
                    </div>

                    {isRecordsDropdownOpen && (
                      <div
                        className="border-0 shadow-lg rounded-4 p-1.5 bg-white position-absolute w-100 mt-1"
                        style={{ zIndex: 10 }}
                      >
                        {recordsOptions.map((opt) => {
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
                                backgroundColor: isSelected
                                  ? "#0d5c75"
                                  : "transparent",
                              }}
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
                                  isSelected
                                    ? "text-white fw-semibold ms-0"
                                    : "ms-4"
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
                            onClick={() => toggleColumn("code")}
                          >
                            <CheckCircle2
                              size={16}
                              className="flex-shrink-0"
                              style={{
                                fill: columns.code ? "#0d5c75" : "transparent",
                                color: columns.code ? "#fff" : "#a0aec0",
                              }}
                            />
                            <span className="small text-dark fw-medium fs-7">
                              Course Code
                            </span>
                          </div>
                        </div>

                        <div className="col-6">
                          <div
                            className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                            onClick={() => toggleColumn("subject")}
                          >
                            <CheckCircle2
                              size={16}
                              className="flex-shrink-0"
                              style={{
                                fill: columns.subject
                                  ? "#0d5c75"
                                  : "transparent",
                                color: columns.subject ? "#fff" : "#a0aec0",
                              }}
                            />
                            <span className="small text-dark fw-medium fs-7">
                              Subject Name
                            </span>
                          </div>
                        </div>

                        <div className="col-6">
                          <div
                            className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                            onClick={() => toggleColumn("units")}
                          >
                            <CheckCircle2
                              size={16}
                              className="flex-shrink-0"
                              style={{
                                fill: columns.units ? "#0d5c75" : "transparent",
                                color: columns.units ? "#fff" : "#a0aec0",
                              }}
                            />
                            <span className="small text-dark fw-medium fs-7">
                              Units
                            </span>
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
                                fill: columns.prelim
                                  ? "#0d5c75"
                                  : "transparent",
                                color: columns.prelim ? "#fff" : "#a0aec0",
                              }}
                            />
                            <span className="small text-dark fw-medium fs-7">
                              Prelim
                            </span>
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
                                fill: columns.midterm
                                  ? "#0d5c75"
                                  : "transparent",
                                color: columns.midterm ? "#fff" : "#a0aec0",
                              }}
                            />
                            <span className="small text-dark fw-medium fs-7">
                              Midterm
                            </span>
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
                                fill: columns.finals
                                  ? "#0d5c75"
                                  : "transparent",
                                color: columns.finals ? "#fff" : "#a0aec0",
                              }}
                            />
                            <span className="small text-dark fw-medium fs-7">
                              Finals
                            </span>
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
                                fill: columns.finalGrade
                                  ? "#0d5c75"
                                  : "transparent",
                                color: columns.finalGrade ? "#fff" : "#a0aec0",
                              }}
                            />
                            <span className="small text-dark fw-medium fs-7">
                              Final Grade
                            </span>
                          </div>
                        </div>

                        <div className="col-6">
                          <div
                            className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                            onClick={() => toggleColumn("status")}
                          >
                            <CheckCircle2
                              size={16}
                              className="flex-shrink-0"
                              style={{
                                fill: columns.status
                                  ? "#0d5c75"
                                  : "transparent",
                                color: columns.status ? "#fff" : "#a0aec0",
                              }}
                            />
                            <span className="small text-dark fw-medium fs-7">
                              Status
                            </span>
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
                        <Loader2
                          size={16}
                          className="spinner-border spinner-border-sm"
                        />
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
      )}

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
                You have active selections. Leaving now will reset your export
                options.
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
                <strong className="text-dark">{recordsToIncLabel}</strong> as a{" "}
                <strong className="text-dark">{format.toUpperCase()}</strong>{" "}
                file.
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
          <div
            className="modal-dialog modal-dialog-centered px-3"
            style={{ maxWidth: "380px" }}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4 bg-white">
              <div
                className="mx-auto mb-3 text-success bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "52px", height: "52px" }}
              >
                <CheckCircle2 size={30} />
              </div>
              <h5 className="fw-bold text-dark mb-1">File Generated!</h5>
              <p className="text-secondary small mb-0">
                Grades report for <strong>{recordsToIncLabel}</strong> generated
                successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
