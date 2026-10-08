import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { FileText, FileSpreadsheet, Download, Check, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SectionItem } from "./types";
import { API_BASE_URL } from "../../../config";

type Props = {
  open: boolean;
  onClose: () => void;
  sections: SectionItem[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

type ColumnKey = "name" | "section" | "adviser" | "email" | "phone" | "gender" | "attendance" | "age" | "birthdate";

const STUDENT_EXPORT_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "name", label: "Student Name" },
  { key: "section", label: "Section" },
  { key: "adviser", label: "Adviser Name" },
  { key: "email", label: "Email Address" },
  { key: "phone", label: "Phone Number" },
  { key: "gender", label: "Gender" },
  { key: "attendance", label: "Attendance" },
  { key: "age", label: "Age" },
  { key: "birthdate", label: "Birthdate" },
];

export default function ExportSectionsModal({
  open,
  onClose,
  sections,
  onSuccess,
  onError,
}: Props) {
  const [fileFormat, setFileFormat] = useState<"csv" | "pdf">("csv");
  const [sectionScope, setSectionScope] = useState<"all" | "single">("all");
  const [targetSectionId, setTargetSectionId] = useState<string>("");
  const [activeColumns, setActiveColumns] = useState<ColumnKey[]>([
    "name",
    "section",
    "adviser",
    "email",
    "phone",
    "gender",
    "attendance",
    "age",
    "birthdate",
  ]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const activeEnrolledList = useMemo(() => {
    return sections.filter((s: SectionItem) => (s.enrolled || 0) > 0);
  }, [sections]);

  useMemo(() => {
    if (open && activeEnrolledList.length > 0 && !targetSectionId) {
      setTargetSectionId(activeEnrolledList[0].id);
    }
  }, [open, activeEnrolledList, targetSectionId]);

  if (!open) return null;

  const handleToggleColumn = (col: ColumnKey) => {
    setActiveColumns((prev: ColumnKey[]) =>
      prev.includes(col) ? prev.filter((c: ColumnKey) => c !== col) : [...prev, col]
    );
  };

  const sanitize = (val: any): string => {
    if (val === null || val === undefined) return "N/A";
    const str = String(val).trim();
    if (str === "" || str.toLowerCase() === "undefined" || str.startsWith("enc::v1::")) return "N/A";
    return str;
  };

  const calculateAge = (birthdateStr?: string, ageVal?: any): string | number => {
    if (ageVal !== undefined && ageVal !== null && !isNaN(Number(ageVal)) && String(ageVal) !== "N/A") {
      return Number(ageVal);
    }
    if (birthdateStr && birthdateStr !== "N/A") {
      const bDate = new Date(birthdateStr);
      if (!isNaN(bDate.getTime())) {
        const diff = Date.now() - bDate.getTime();
        return Math.abs(new Date(diff).getUTCFullYear() - 1970);
      }
    }
    return "N/A";
  };

  const executeSectionExport = async () => {
    let targetSectionObjs: SectionItem[] = [];
    if (sectionScope === "all") {
      targetSectionObjs = activeEnrolledList;
    } else {
      const found = activeEnrolledList.find((s: SectionItem) => s.id === targetSectionId);
      if (found) targetSectionObjs = [found];
    }

    if (targetSectionObjs.length === 0) {
      onError("No valid sections found to export.");
      return;
    }

    if (activeColumns.length === 0) {
      onError("Please select at least one column to export.");
      return;
    }

    try {
      setIsExporting(true);
      const token = localStorage.getItem("sessionToken") || "";
      const exportedRows: any[] = [];

      for (const sec of targetSectionObjs) {
        let matchingStudents: any[] = [];
        
        try {
          const res = await fetch(`${API_BASE_URL}/students/sections/${sec.id}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            matchingStudents = Array.isArray(data) ? data : data?.students || [];
          }
        } catch {
          // Fallback if needed
        }

        if (matchingStudents.length === 0) {
          const generalRes = await fetch(`${API_BASE_URL}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (generalRes.ok) {
            const generalData = await generalRes.json();
            const allStudents = Array.isArray(generalData) ? generalData : generalData?.students || [];
            const secCode = String(sec.code || "").trim().toLowerCase();
            
            matchingStudents = allStudents.filter((s: any) => {
              const sSec = String(s.section || s.classSection || s.sectionCode || "").trim().toLowerCase();
              const sSecId = String(s.sectionId || s.sectionRef || s.enrollmentId || s.section?._id || "").trim();
              return sSec === secCode || sSecId === String(sec.id);
            });
          }
        }

        const adviserName = sanitize(sec.adviser || "TBA");

        for (const s of matchingStudents) {
          const rawName = s.name || s.fullName || s.user?.name || `${s.firstName || s.user?.firstName || ""} ${s.lastName || s.user?.lastName || ""}`.trim();
          const rawEmail = s.email || s.user?.email;
          const rawPhone = s.phone || s.contactNumber || s.mobileNumber || s.user?.phone;
          const rawGender = s.gender || s.sex || s.user?.gender || s.user?.sex || s.profile?.gender;
          const rawAttendance = s.attendance ?? s.attendancePercentage ?? 100;
          const rawBirthdate = s.birthdate || s.birthDate || s.dob || s.user?.birthdate || s.user?.birthDate;
          const rawAge = s.age || s.user?.age;

          // Format birthdate into a clean readable string if available
          let formattedBirthdate = "N/A";
          if (rawBirthdate && rawBirthdate !== "N/A") {
            const bDate = new Date(rawBirthdate);
            if (!isNaN(bDate.getTime())) {
              formattedBirthdate = bDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });
            }
          }

          exportedRows.push({
            name: sanitize(rawName),
            section: sanitize(sec.code || s.section),
            adviser: adviserName,
            email: sanitize(rawEmail),
            phone: sanitize(rawPhone),
            gender: sanitize(rawGender),
            attendance: sanitize(rawAttendance),
            age: calculateAge(rawBirthdate, rawAge),
            birthdate: formattedBirthdate,
          });
        }
      }

      if (exportedRows.length === 0) {
        onError("No student records found matching the selected section(s).");
        setIsExporting(false);
        return;
      }

      const dateStr = new Date().toISOString().split("T")[0];
      const columnMap: Record<ColumnKey, string> = {
        name: "Student Name",
        section: "Section",
        adviser: "Adviser Name",
        email: "Email Address",
        phone: "Phone Number",
        gender: "Gender",
        attendance: "Attendance",
        age: "Age",
        birthdate: "Birthdate",
      };

      const headers = activeColumns.map((col: ColumnKey) => columnMap[col]);

      if (fileFormat === "csv") {
        const csvRows = exportedRows.map((s: Record<string, any>) =>
          activeColumns.map((col: ColumnKey) => {
            const val = String(s[col] ?? "N/A");
            
            // 🔥 Force Excel to treat birthdates and other text items strictly as literal strings via formula wrapper
            if ((col === "phone" || col === "birthdate" || col === "gender") && val !== "N/A") {
              return `"\t${val.replace(/"/g, '""')}"`;
            }
            
            return `"${val.replace(/"/g, '""')}"`;
          })
        );

        const csvContent = [headers.join(","), ...csvRows.map((r: string[]) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `section_students_report_${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        onSuccess("Section student records exported to CSV successfully!");
      } else {
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 297, 20, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("INSTITUTIONAL REGISTRAR OFFICE", 14, 13);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(15);
        doc.text("Enrolled Section Students Report", 14, 30);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated Date: ${new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 36);

        const tableRows = exportedRows.map((s: Record<string, any>) =>
          activeColumns.map((col: ColumnKey) => String(s[col] ?? "N/A"))
        );

        autoTable(doc, {
          startY: 42,
          head: [headers],
          body: tableRows,
          theme: "striped",
          headStyles: { 
            fillColor: [37, 99, 235], 
            textColor: [255, 255, 255], 
            fontStyle: "bold",
            halign: "center" 
          },
          bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { left: 14, right: 14 },
          columnStyles: {
            0: { fontStyle: "bold" }
          }
        });

        doc.save(`enrolled_section_students_${dateStr}.pdf`);
        onSuccess("Section student records exported to PDF successfully!");
      }

      onClose();
    } catch (err) {
      console.error(err);
      onError("Failed to fetch and export student records from database.");
    } finally {
      setIsExporting(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
        padding: "1rem",
      }}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isExporting) onClose();
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          width: "100%",
          borderRadius: "20px",
          backgroundColor: "#ffffff",
          color: "#0f172a",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          padding: "1.5rem 1.75rem",
        }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                backgroundColor: "#eff6ff",
                border: "1px solid #dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#3b82f6",
                flexShrink: 0,
              }}
            >
              <Download size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: "1.15rem", color: "#0f172a", margin: 0, marginBottom: "2px" }}>
                Export Enrolled Section Students
              </h4>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>
                Fetch database records including section & adviser info.
              </p>
            </div>
          </div>
          <button
            type="button"
            style={{
              width: 32,
              height: 32,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              color: "#64748b",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onClick={onClose}
            disabled={isExporting}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body Container */}
        <div 
          style={{ 
            overflowY: "auto", 
            overflowX: "hidden", 
            paddingRight: "4px",
            scrollbarWidth: "thin",
            flexGrow: 1,
            marginTop: "0.2rem",
            marginBottom: "0.2rem"
          }}
        >
          {/* File Format Section */}
          <div style={{ marginBottom: "1.1rem" }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.5rem" }}>
              File format
            </label>
            <div className="row g-3">
              <div className="col-6">
                <div
                  onClick={() => !isExporting && setFileFormat("csv")}
                  style={{
                    cursor: isExporting ? "not-allowed" : "pointer",
                    padding: "0.75rem",
                    borderRadius: "12px",
                    textAlign: "center",
                    backgroundColor: fileFormat === "csv" ? "#eff6ff" : "#ffffff",
                    border: fileFormat === "csv" ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                    boxShadow: fileFormat === "csv" ? "0 4px 6px -1px rgba(59, 130, 246, 0.1)" : "none",
                    transition: "all 0.15s ease-in-out",
                  }}
                >
                  <FileSpreadsheet size={22} style={{ color: fileFormat === "csv" ? "#3b82f6" : "#64748b", marginBottom: "4px" }} strokeWidth={1.8} />
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: fileFormat === "csv" ? "#1d4ed8" : "#0f172a" }}>CSV (Excel)</div>
                </div>
              </div>

              <div className="col-6">
                <div
                  onClick={() => !isExporting && setFileFormat("pdf")}
                  style={{
                    cursor: isExporting ? "not-allowed" : "pointer",
                    padding: "0.75rem",
                    borderRadius: "12px",
                    textAlign: "center",
                    backgroundColor: fileFormat === "pdf" ? "#eff6ff" : "#ffffff",
                    border: fileFormat === "pdf" ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                    boxShadow: fileFormat === "pdf" ? "0 4px 6px -1px rgba(59, 130, 246, 0.1)" : "none",
                    transition: "all 0.15s ease-in-out",
                  }}
                >
                  <FileText size={22} style={{ color: fileFormat === "pdf" ? "#3b82f6" : "#64748b", marginBottom: "4px" }} strokeWidth={1.8} />
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: fileFormat === "pdf" ? "#1d4ed8" : "#0f172a" }}>PDF Report</div>
                </div>
              </div>
            </div>
          </div>

          {/* Records to Include Selection */}
          <div style={{ marginBottom: "1.1rem" }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.5rem" }}>
              Records to include
            </label>
            <div style={{ position: "relative", marginBottom: "0.4rem" }}>
              <select
                className="form-select shadow-none"
                value={sectionScope}
                disabled={isExporting}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSectionScope(e.target.value as "all" | "single")}
                style={{
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  borderColor: "#cbd5e1",
                  padding: "0.55rem 0.85rem",
                  borderRadius: "10px",
                  fontWeight: 600,
                  color: "#0f172a",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="all">All sections with enrolled students ({activeEnrolledList.length})</option>
                <option value="single">Specific section...</option>
              </select>
            </div>

            {sectionScope === "single" && (
              <div>
                <select
                  className="form-select shadow-none"
                  value={targetSectionId}
                  disabled={isExporting}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetSectionId(e.target.value)}
                  style={{
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    borderColor: "#cbd5e1",
                    padding: "0.55rem 0.85rem",
                    borderRadius: "10px",
                    color: "#0f172a",
                    backgroundColor: "#ffffff",
                  }}
                >
                  {activeEnrolledList.map((s: SectionItem) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.program} (Yr {s.yearLevel}) [{s.enrolled} enrolled]
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Columns Section */}
          <div style={{ marginBottom: "0.2rem" }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.5rem" }}>
              Columns to include
            </label>
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "0.75rem 0.85rem",
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <div className="row g-1">
                {STUDENT_EXPORT_COLUMNS.map((col) => {
                  const isChecked = activeColumns.includes(col.key);
                  return (
                    <div key={col.key} className="col-12 col-sm-4">
                      <div
                        onClick={() => !isExporting && handleToggleColumn(col.key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.3rem 0.4rem",
                          borderRadius: "6px",
                          cursor: isExporting ? "not-allowed" : "pointer",
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            flexShrink: 0,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: isChecked ? "#3b82f6" : "#ffffff",
                            border: isChecked ? "none" : "1.5px solid #cbd5e1",
                            color: "#ffffff",
                          }}
                        >
                          {isChecked && <Check size={10} strokeWidth={3} />}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "#0f172a" }}>
                          {col.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.75rem",
            paddingTop: "0.85rem",
            marginTop: "0.75rem",
            borderTop: "1px solid #f1f5f9",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            className="btn shadow-none"
            onClick={onClose}
            disabled={isExporting}
            style={{
              fontSize: "0.9rem",
              backgroundColor: "#ffffff",
              borderColor: "#cbd5e1",
              color: "#0f172a",
              fontWeight: 600,
              padding: "0.5rem 1.25rem",
              borderRadius: "10px",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn shadow-sm"
            onClick={executeSectionExport}
            disabled={isExporting || activeColumns.length === 0 || (sectionScope === "single" && !targetSectionId)}
            style={{
              backgroundColor: "#3b82f6",
              borderColor: "#3b82f6",
              color: "#ffffff",
              fontSize: "0.9rem",
              fontWeight: 600,
              padding: "0.5rem 1.25rem",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Download size={15} />
            <span>{isExporting ? "Fetching & Exporting..." : "Export Records"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}