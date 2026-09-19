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

type FormatOption = "csv" | "pdf" | "";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  subjects?: { value: string; label: string }[];
  currentSubject?: string;
  currentDate?: string;
};

// Helper to convert YYYY-MM-DD to "Weekday, Month DD, YYYY"
const formatReadableDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const parsedDate = new Date(dateStr + "T00:00:00");
  if (isNaN(parsedDate.getTime())) return dateStr;
  return parsedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ExportAttendanceModal({
  isOpen,
  onClose,
  subjects = [],
  currentSubject = "",
  currentDate = "",
}: Props) {
  // Form States initialized with current page filters
  const [format, setFormat] = useState<FormatOption>("csv");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [exportDate, setExportDate] = useState<string>("");
  const [recordsToInclude, setRecordsToInclude] = useState<string>("filtered");
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

  // Dialog & Progress Overlay States
  const [isExporting, setIsExporting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync initial subject and date when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormat("csv");
      setSelectedSubject(currentSubject || subjects[0]?.value || "");
      setExportDate(currentDate || new Date().toISOString().split("T")[0]);
      setRecordsToInclude("filtered");
      setIsRecordsDropdownOpen(false);
      setShowExitConfirm(false);
      setShowConfirm(false);
      setShowSuccess(false);
      setIsExporting(false);
    }
  }, [isOpen, currentSubject, currentDate, subjects]);

  const isDirty =
    format !== "csv" ||
    selectedSubject !== currentSubject ||
    exportDate !== currentDate ||
    recordsToInclude !== "filtered";

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
    if (!format || !selectedSubject || !exportDate || !recordsToInclude) return;
    setShowConfirm(true);
  };

  /* EXECUTE EXPORT: FETCH DATA & GENERATE CSV / PDF */
  const handleExecuteExport = async () => {
    setShowConfirm(false);
    setIsExporting(true);

    try {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const facultyId = storedUser?.id || storedUser?._id || "";

      // Query recorded attendance for the selected Subject and Date
      const queryParams = new URLSearchParams({
        subject: selectedSubject,
        date: exportDate,
      });
      if (facultyId) queryParams.append("facultyId", facultyId);

      const response = await fetch(`/api/attendance?${queryParams.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      let studentList: any[] = [];

      if (response.ok) {
        const records = await response.json();
        if (records.length > 0 && records[0].students) {
          studentList = records[0].students;
        }
      }

      // Fallback: If no saved attendance session, fetch base course roster
      if (studentList.length === 0) {
        const rosterRes = await fetch(`/api/students?facultyId=${facultyId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (rosterRes.ok) {
          const rawRoster = await rosterRes.json();
          const loaded = Array.isArray(rawRoster) ? rawRoster : rawRoster.students || [];
          studentList = loaded.map((s: any, idx: number) => ({
            studentId: s._id || s.id || `STU-${idx}`,
            name: s.fullName || s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim(),
            studentNo: s.studentIdNumber || s.studentId || `STU-${idx + 1}`,
            status: "pending",
          }));
        }
      }

      // Filter students according to user option
      let filteredStudents = [...studentList];
      if (recordsToInclude === "flagged") {
        filteredStudents = filteredStudents.filter(
          (s) => s.status === "absent" || s.status === "late"
        );
      }

      const activeSubjectObj = subjects.find((s) => s.value === selectedSubject);
      const subjectLabel = activeSubjectObj?.label || selectedSubject;
      const formattedDate = formatReadableDate(exportDate);

      // Export to CSV or PDF
      if (format === "csv") {
        generateCSV(filteredStudents, subjectLabel, formattedDate);
      } else if (format === "pdf") {
        generatePDF(filteredStudents, subjectLabel, formattedDate);
      }

      setShowSuccess(true);
      setTimeout(() => {
        handleForceClose();
      }, 1800);
    } catch (err) {
      console.error("Failed to generate export file:", err);
      alert("Error generating attendance export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  /* CSV GENERATOR */
  const generateCSV = (data: any[], subjectTitle: string, dateLabel: string) => {
    const headers: string[] = [];
    if (columns.student) headers.push("Student Name");
    if (columns.studentId) headers.push("Student ID");
    if (columns.present) headers.push("Present");
    if (columns.absent) headers.push("Absent");
    if (columns.late) headers.push("Late");
    if (columns.attendancePct) headers.push("Status / Attendance %");

    const rows = data.map((s) => {
      const row: string[] = [];
      const status = s.status || "pending";
      if (columns.student) row.push(`"${s.name || "Unknown"}"`);
      if (columns.studentId) row.push(`"${s.studentNo || s.studentId || "N/A"}"`);
      if (columns.present) row.push(status === "present" ? "1" : "0");
      if (columns.absent) row.push(status === "absent" ? "1" : "0");
      if (columns.late) row.push(status === "late" ? "1" : "0");
      if (columns.attendancePct) {
        const pctText = status === "present" ? "100%" : status === "late" ? "50%" : "0%";
        row.push(`"${status.toUpperCase()} (${pctText})"`);
      }
      return row.join(",");
    });

    const csvContent = [
      `"Attendance Report - ${subjectTitle}"`,
      `"Date: ${dateLabel}"`,
      "",
      headers.join(","),
      ...rows,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Attendance_${selectedSubject}_${exportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* PRINTABLE PDF REPORT GENERATOR */
  const generatePDF = (data: any[], subjectTitle: string, dateLabel: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const presentCount = data.filter((s) => s.status === "present").length;
    const absentCount = data.filter((s) => s.status === "absent").length;
    const lateCount = data.filter((s) => s.status === "late").length;
    const totalCount = data.length;
    const rate = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;

    const tableHeaders = `
      <tr>
        ${columns.student ? '<th style="border:1px solid #ddd; padding:8px; text-align:left;">Student Name</th>' : ""}
        ${columns.studentId ? '<th style="border:1px solid #ddd; padding:8px; text-align:left;">Student ID</th>' : ""}
        ${columns.present ? '<th style="border:1px solid #ddd; padding:8px; text-align:center;">Present</th>' : ""}
        ${columns.absent ? '<th style="border:1px solid #ddd; padding:8px; text-align:center;">Absent</th>' : ""}
        ${columns.late ? '<th style="border:1px solid #ddd; padding:8px; text-align:center;">Late</th>' : ""}
        ${columns.attendancePct ? '<th style="border:1px solid #ddd; padding:8px; text-align:center;">Status</th>' : ""}
      </tr>
    `;

    const tableRows = data
      .map((s, idx) => {
        const st = s.status || "pending";
        return `
        <tr style="background-color: ${idx % 2 === 0 ? "#f9f9f9" : "#ffffff"};">
          ${columns.student ? `<td style="border:1px solid #ddd; padding:8px;">${s.name}</td>` : ""}
          ${columns.studentId ? `<td style="border:1px solid #ddd; padding:8px;">${s.studentNo || s.studentId}</td>` : ""}
          ${columns.present ? `<td style="border:1px solid #ddd; padding:8px; text-align:center;">${st === "present" ? "✓" : "-"}</td>` : ""}
          ${columns.absent ? `<td style="border:1px solid #ddd; padding:8px; text-align:center;">${st === "absent" ? "✗" : "-"}</td>` : ""}
          ${columns.late ? `<td style="border:1px solid #ddd; padding:8px; text-align:center;">${st === "late" ? "🕒" : "-"}</td>` : ""}
          ${columns.attendancePct ? `<td style="border:1px solid #ddd; padding:8px; text-align:center; font-weight:bold;">${st.toUpperCase()}</td>` : ""}
        </tr>
      `;
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Report - ${subjectTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { color: #0d5c75; margin-bottom: 5px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
            .stats { display: flex; gap: 15px; margin-bottom: 20px; font-size: 14px; }
            .stat-card { background: #f0f4f8; padding: 10px 15px; border-radius: 6px; border-left: 4px solid #0d5c75; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th { background-color: #0d5c75; color: white; }
          </style>
        </head>
        <body>
          <h2>${subjectTitle}</h2>
          <div class="meta"><strong>Date:</strong> ${dateLabel}</div>
          
          <div class="stats">
            <div class="stat-card"><strong>Total Students:</strong> ${totalCount}</div>
            <div class="stat-card"><strong>Present:</strong> ${presentCount}</div>
            <div class="stat-card"><strong>Absent:</strong> ${absentCount}</div>
            <div class="stat-card"><strong>Late:</strong> ${lateCount}</div>
            <div class="stat-card"><strong>Attendance Rate:</strong> ${rate}%</div>
          </div>

          <table>
            <thead>${tableHeaders}</thead>
            <tbody>${tableRows}</tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const dropdownOptions = [
    { value: "filtered", label: "Current filtered view" },
    { value: "all", label: "All course students" },
    { value: "flagged", label: "Only flagged / absent / late" },
  ];

  const selectedOptionLabel =
    dropdownOptions.find((opt) => opt.value === recordsToInclude)?.label ||
    "Select records to include...";

  const selectedClassLabel =
    subjects.find((s) => s.value === selectedSubject)?.label || selectedSubject;

  return (
    <>
      {/* MAIN EXPORT MODAL - Elevated Z-Index above Navbar */}
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
                            ? "format-card-selected shadow-sm"
                            : "border-light-subtle bg-white text-secondary hover-bg-light"
                        }`}
                        onClick={() => setFormat("csv")}
                        disabled={isExporting}
                      >
                        <FileSpreadsheet
                          size={18}
                          style={{
                            color: format === "csv" ? "#0d5c75" : "#6c757d",
                          }}
                        />
                        <span className="small fw-semibold mt-0.5 fs-7">CSV (Excel)</span>
                      </button>
                    </div>

                    <div className="col-6">
                      <button
                        type="button"
                        className={`btn w-100 py-2 py-sm-2.5 rounded-3 border d-flex flex-column align-items-center justify-content-center gap-1 transition-all ${
                          format === "pdf"
                            ? "format-card-selected shadow-sm"
                            : "border-light-subtle bg-white text-secondary hover-bg-light"
                        }`}
                        onClick={() => setFormat("pdf")}
                        disabled={isExporting}
                      >
                        <FileText
                          size={18}
                          style={{
                            color: format === "pdf" ? "#0d5c75" : "#6c757d",
                          }}
                        />
                        <span className="small fw-semibold mt-0.5 fs-7">PDF Report</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subject & Date Selection */}
                <div className="row g-2.5 mb-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label text-dark small fw-medium mb-1">
                      Class / Course *
                    </label>
                    <select
                      required
                      className="form-select border-2 shadow-none py-1.5 px-3 rounded-3 text-truncate small"
                      style={{ borderColor: "#0d5c75" }}
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      disabled={isExporting}
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

                  <div className="col-12 col-sm-6">
                    <label className="form-label text-dark small fw-medium mb-1">
                      Attendance Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="form-control border-2 shadow-none py-1.5 px-3 rounded-3 small"
                      style={{ borderColor: "#0d5c75" }}
                      value={exportDate}
                      onChange={(e) => setExportDate(e.target.value)}
                      disabled={isExporting}
                    />
                    {exportDate && (
                      <div className="form-text text-muted small mt-0.5 fs-7">
                        {formatReadableDate(exportDate)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Records To Include Dropdown */}
                <div className="mb-3 position-relative">
                  <label className="form-label text-dark small fw-medium mb-1">
                    Records to include *
                  </label>
                  <div
                    className="custom-export-select form-control d-flex justify-content-between align-items-center py-1.5 px-3 rounded-3 border-2 cursor-pointer bg-white"
                    style={{ borderColor: "#0d5c75" }}
                    onClick={() =>
                      !isExporting && setIsRecordsDropdownOpen(!isRecordsDropdownOpen)
                    }
                  >
                    <span
                      className={`small fw-medium text-truncate ${
                        recordsToInclude ? "text-dark" : "text-muted"
                      }`}
                    >
                      {selectedOptionLabel}
                    </span>
                    <ChevronDown size={16} className="text-secondary flex-shrink-0 ms-1" />
                  </div>

                  {isRecordsDropdownOpen && (
                    <div
                      className="custom-export-dropdown border-0 shadow-lg rounded-4 p-1.5 bg-white position-absolute w-100 mt-1"
                      style={{ zIndex: 10 }}
                    >
                      {dropdownOptions.map((opt) => {
                        const isSelected = recordsToInclude === opt.value;
                        return (
                          <div
                            key={opt.value}
                            className={`custom-export-option d-flex align-items-center gap-2 p-2 rounded-3 cursor-pointer small transition-all ${
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
                          <span className="small text-dark fw-medium fs-7">Student</span>
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
                          onClick={() => toggleColumn("present")}
                        >
                          <CheckCircle2
                            size={16}
                            className="flex-shrink-0"
                            style={{
                              fill: columns.present ? "#0d5c75" : "transparent",
                              color: columns.present ? "#fff" : "#a0aec0",
                            }}
                          />
                          <span className="small text-dark fw-medium fs-7">Present</span>
                        </div>
                      </div>

                      <div className="col-6">
                        <div
                          className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                          onClick={() => toggleColumn("absent")}
                        >
                          <CheckCircle2
                            size={16}
                            className="flex-shrink-0"
                            style={{
                              fill: columns.absent ? "#0d5c75" : "transparent",
                              color: columns.absent ? "#fff" : "#a0aec0",
                            }}
                          />
                          <span className="small text-dark fw-medium fs-7">Absent</span>
                        </div>
                      </div>

                      <div className="col-6">
                        <div
                          className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                          onClick={() => toggleColumn("late")}
                        >
                          <CheckCircle2
                            size={16}
                            className="flex-shrink-0"
                            style={{
                              fill: columns.late ? "#0d5c75" : "transparent",
                              color: columns.late ? "#fff" : "#a0aec0",
                            }}
                          />
                          <span className="small text-dark fw-medium fs-7">Late</span>
                        </div>
                      </div>

                      <div className="col-6">
                        <div
                          className="d-flex align-items-center gap-2 cursor-pointer user-select-none"
                          onClick={() => toggleColumn("attendancePct")}
                        >
                          <CheckCircle2
                            size={16}
                            className="flex-shrink-0"
                            style={{
                              fill: columns.attendancePct ? "#0d5c75" : "transparent",
                              color: columns.attendancePct ? "#fff" : "#a0aec0",
                            }}
                          />
                          <span className="small text-dark fw-medium fs-7">
                            Attendance %
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
                  disabled={!format || !selectedSubject || !exportDate || !recordsToInclude || isExporting}
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
                You are about to export attendance for <br />
                <strong className="text-dark">{selectedClassLabel}</strong> on{" "}
                <strong className="text-dark">{formatReadableDate(exportDate)}</strong> as a{" "}
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
                Attendance report for <strong>{selectedClassLabel}</strong> ({formatReadableDate(exportDate)}) generated successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}