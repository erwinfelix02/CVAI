import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  FileText,
  ClipboardList,
  Search,
  Download,
  Mail,
  X,
  Loader2,
  AlertCircle,
  FileCheck,
  Send,
  CheckCircle2,
  Info,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ClassItem } from "./types";

interface Student {
  id: string;
  _id?: string;
  name: string;
  studentId: string;
  yearLevel: string;
  attendance: number;
  status: "Enrolled" | "At Risk";
  quizzes: number;
  midterm: number;
  project: number;
  finals: number;
  avatarUrl?: string; // 👈 Added avatarUrl support
}

interface Material {
  id: string;
  title: string;
  type: "pdf" | "doc" | "video";
  sizeLabel: string;
  date: string;
  downloads: number;
  filePath: string;
  course: string;
}

interface ClassDetailModalProps {
  item: ClassItem;
  initialTab?: "students" | "materials" | "grades";
  onClose: () => void;
  onStudentCountUpdate?: (classId: string, count: number) => void;
}

const formatReadableDate = (dateStr: string): string => {
  if (!dateStr) return "";

  let year: number, month: number, day: number;

  if (dateStr.includes("/")) {
    const parts = dateStr.split("/").map((p) => parseInt(p, 10));
    if (parts.length === 3 && !parts.some(isNaN)) {
      month = parts[0] - 1;
      day = parts[1];
      year = parts[2];
    }
  } else if (dateStr.includes("-")) {
    const cleanDate = dateStr.split("T")[0];
    const parts = cleanDate.split("-").map((p) => parseInt(p, 10));
    if (parts.length === 3 && !parts.some(isNaN)) {
      year = parts[0];
      month = parts[1] - 1;
      day = parts[2];
    }
  }

  if (year! && month! !== undefined && day!) {
    const localDate = new Date(year, month, day);
    if (!isNaN(localDate.getTime())) {
      return localDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return dateStr;
};

export default function ClassDetailModal({
  item,
  initialTab = "students",
  onClose,
  onStudentCountUpdate,
}: ClassDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"students" | "materials" | "grades">(
    initialTab
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  // Track image load errors per student ID
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const [courseMaterials, setCourseMaterials] = useState<Material[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  const [downloadingMaterial, setDownloadingMaterial] = useState<Material | null>(
    null
  );
  const [isDownloading, setIsDownloading] = useState(false);

  const [showEmailReportModal, setShowEmailReportModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [reportFormat, setReportFormat] = useState<
    "PDF attachment" | "CSV attachment"
  >("PDF attachment");
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "roster",
    "attendance",
    "grades",
    "materials",
  ]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [emailReportSuccess, setEmailReportSuccess] = useState(false);
  const [emailReportError, setEmailReportError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        const u = JSON.parse(userJson);
        if (u?.email) setCurrentUserEmail(u.email);
      }
    } catch {
      // ignore
    }
  }, []);

  const getInitials = (name: string) =>
    (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "ST";

  // Helper to format proper backend image source URL
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
    return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const fetchClassStudents = useCallback(async () => {
    setIsLoadingStudents(true);
    setStudentsError(null);

    try {
      const token = localStorage.getItem("token");
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;

      const facultyId = user?.id || user?._id || "";
      const facultyName =
        user?.name ||
        (user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.email || "");

      const params = new URLSearchParams();
      if (item.section) params.append("section", item.section);
      if (facultyId) params.append("facultyId", facultyId);
      if (facultyName) params.append("facultyName", facultyName);

      const attParams = new URLSearchParams({
        subject: item.code,
      });
      if (facultyId) attParams.append("facultyId", facultyId);

      const [studentsRes, attendanceRes] = await Promise.all([
        fetch(`/api/students?${params.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }),
        fetch(`/api/attendance?${attParams.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }).catch(() => null),
      ]);

      if (!studentsRes.ok) {
        throw new Error("Failed to load students for this class.");
      }

      const data = await studentsRes.json();
      const rawList = Array.isArray(data) ? data : data.students || [];

      const attendanceMap = new Map<
        string,
        { present: number; total: number }
      >();

      if (attendanceRes && attendanceRes.ok) {
        const attRecords = await attendanceRes.json();

        if (Array.isArray(attRecords)) {
          attRecords.forEach((record: any) => {
            if (Array.isArray(record.students)) {
              record.students.forEach((st: any) => {
                const sKey = (st.studentId || st.studentNo || "")
                  .toString()
                  .trim()
                  .toLowerCase();
                if (!sKey) return;

                const prev = attendanceMap.get(sKey) || {
                  present: 0,
                  total: 0,
                };
                const isPresent =
                  st.status === "present" || st.status === "late";
                attendanceMap.set(sKey, {
                  present: prev.present + (isPresent ? 1 : 0),
                  total: prev.total + 1,
                });
              });
            }
          });
        }
      }

      const formattedStudents: Student[] = rawList.map(
        (s: any, idx: number) => {
          const fullName = s.fullName || s.name || "Unknown Student";
          const studentIdNum =
            s.studentIdNumber || s.studentId || s.id || `STU-${idx + 1}`;
          const yearLevelStr = s.yearLevel
            ? typeof s.yearLevel === "number"
              ? `${s.yearLevel} Year`
              : String(s.yearLevel)
            : "1st Year";

          const lookupKey = (s._id || s.id || studentIdNum)
            .toString()
            .trim()
            .toLowerCase();
          const attStats =
            attendanceMap.get(lookupKey) ||
            attendanceMap.get(studentIdNum.toLowerCase());

          let calculatedPct = 100;
          if (attStats && attStats.total > 0) {
            calculatedPct = Math.round(
              (attStats.present / attStats.total) * 100
            );
          } else if (typeof s.attendance === "number") {
            calculatedPct = s.attendance;
          }

          return {
            id: s._id || s.id || `stu-${idx}`,
            _id: s._id,
            name: fullName,
            studentId: studentIdNum,
            yearLevel: yearLevelStr,
            attendance: calculatedPct,
            status: calculatedPct < 80 ? "At Risk" : "Enrolled",
            quizzes: s.quizzes ?? 88,
            midterm: s.midterm ?? 85,
            project: s.project ?? 90,
            finals: s.finals ?? 87,
            avatarUrl: s.avatarUrl || s.photo || s.image, // 👈 Map backend avatar property
          };
        }
      );

      setStudents(formattedStudents);

      if (onStudentCountUpdate) {
        onStudentCountUpdate(item.id, formattedStudents.length);
      }
      return formattedStudents;
    } catch (err: any) {
      console.error("fetchClassStudents error:", err);
      setStudentsError(err.message || "Failed to load class students.");
      return [];
    } finally {
      setIsLoadingStudents(false);
    }
  }, [item, onStudentCountUpdate]);

  const fetchClassMaterials = useCallback(async () => {
    if (!item?.code && !item?.title) return [];

    setIsLoadingMaterials(true);
    setMaterialsError(null);

    try {
      const token = localStorage.getItem("token");
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;

      const params = new URLSearchParams();
      if (item.code) params.append("course", item.code);
      if (user?.id || user?._id)
        params.append("facultyId", user.id || user._id);
      if (user?.department) params.append("department", user.department);

      const res = await fetch(`/api/materials?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load course materials.");
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setCourseMaterials(list);
      return list;
    } catch (err: any) {
      console.error("fetchClassMaterials error:", err);
      setMaterialsError(err.message || "Failed to load materials.");
      return [];
    } finally {
      setIsLoadingMaterials(false);
    }
  }, [item]);

  useEffect(() => {
    fetchClassStudents();
    fetchClassMaterials();
  }, [fetchClassStudents, fetchClassMaterials]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAverage = (student: Student) => {
    return Math.round(
      (student.quizzes + student.midterm + student.project + student.finals) / 4
    );
  };

  const overallClassAverage =
    students.length > 0
      ? Math.round(
          students.reduce((acc, curr) => acc + calculateAverage(curr), 0) /
            students.length
        )
      : 0;

  const handleOpenDownloadConfirm = (mat: Material) => {
    setDownloadingMaterial(mat);
  };

  const handleConfirmDownload = async () => {
    if (!downloadingMaterial) return;

    setIsDownloading(true);

    try {
      const mat = downloadingMaterial;

      await fetch(`/api/materials/${mat.id}/download`, {
        method: "PATCH",
      }).catch(() => null);

      setCourseMaterials((prev) =>
        prev.map((m) =>
          m.id === mat.id ? { ...m, downloads: m.downloads + 1 } : m
        )
      );

      if (mat.filePath) {
        const downloadUrl = `/api/materials/${mat.id}/file`;

        const response = await fetch(downloadUrl);
        if (!response.ok) {
          window.open(mat.filePath, "_blank");
          return;
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;

        let ext = mat.filePath.substring(mat.filePath.lastIndexOf("."));
        if (!ext || ext.length > 5 || !ext.includes(".")) {
          ext =
            mat.type === "video"
              ? ".mp4"
              : mat.type === "pdf"
              ? ".pdf"
              : ".docx";
        }

        a.download = `${mat.title}${ext}`;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Error downloading material file:", err);
      if (downloadingMaterial?.filePath) {
        window.open(downloadingMaterial.filePath, "_blank");
      }
    } finally {
      setIsDownloading(false);
      setDownloadingMaterial(null);
    }
  };

  const generatePdfBase64 = (
    currentStudentsList: Student[],
    currentMaterialsList: Material[]
  ): string => {
    const doc = new jsPDF();

    doc.setFillColor(11, 74, 111);
    doc.rect(0, 0, 210, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Class Summary Report - ${item.code}`, 14, 16);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Course: ${item.title}`, 14, 33);
    doc.text(
      `Section: ${item.section} | Schedule: ${item.schedule} | Room: ${item.room}`,
      14,
      39
    );
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 45);

    if (additionalNotes) {
      doc.setFont("helvetica", "italic");
      doc.text(`Notes: ${additionalNotes}`, 14, 51);
    }

    let startY = additionalNotes ? 57 : 51;

    if (selectedSections.includes("roster")) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("Class Roster", 14, startY);
      startY += 4;

      const rosterHead = [["#", "Student ID", "Full Name", "Year Level"]];
      const rosterData = currentStudentsList.map((s, idx) => [
        idx + 1,
        s.studentId,
        s.name,
        s.yearLevel,
      ]);

      autoTable(doc, {
        startY,
        head: rosterHead,
        body: rosterData,
        theme: "striped",
        headStyles: { fillColor: [11, 74, 111] },
      });

      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    if (selectedSections.includes("attendance")) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("Attendance Summary", 14, startY);
      startY += 4;

      const attHead = [
        ["Student ID", "Full Name", "Attendance Rate", "Academic Status"],
      ];
      const attData = currentStudentsList.map((s) => [
        s.studentId,
        s.name,
        `${s.attendance}%`,
        s.status,
      ]);

      autoTable(doc, {
        startY,
        head: attHead,
        body: attData,
        theme: "striped",
        headStyles: { fillColor: [11, 74, 111] },
      });

      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    if (selectedSections.includes("grades")) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `Grade Summary (Class Avg: ${overallClassAverage}%)`,
        14,
        startY
      );
      startY += 4;

      const gradeHead = [
        ["Student Name", "Quizzes", "Midterm", "Project", "Finals", "Average"],
      ];
      const gradeData = currentStudentsList.map((s) => [
        s.name,
        s.quizzes,
        s.midterm,
        s.project,
        s.finals,
        calculateAverage(s),
      ]);

      autoTable(doc, {
        startY,
        head: gradeHead,
        body: gradeData,
        theme: "striped",
        headStyles: { fillColor: [11, 74, 111] },
      });

      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    if (selectedSections.includes("materials")) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("Course Materials List", 14, startY);
      startY += 4;

      const matHead = [
        ["Title", "Type", "File Size", "Upload Date", "Downloads"],
      ];
      const matData = currentMaterialsList.map((m) => [
        m.title,
        m.type.toUpperCase(),
        m.sizeLabel,
        m.date,
        m.downloads,
      ]);

      autoTable(doc, {
        startY,
        head: matHead,
        body: matData,
        theme: "striped",
        headStyles: { fillColor: [11, 74, 111] },
      });
    }

    const pdfDataUri = doc.output("datauristring");
    return pdfDataUri.split(",")[1];
  };

  const generateCsvBase64 = (
    currentStudentsList: Student[],
    currentMaterialsList: Material[]
  ): string => {
    let csvContent = `Class Report Summary - ${item.code}\n`;
    csvContent += `Course,${item.title}\nSection,${item.section}\nSchedule,${item.schedule}\nRoom,${item.room}\n\n`;

    if (selectedSections.includes("roster")) {
      csvContent += `CLASS ROSTER\nStudent ID,Full Name,Year Level\n`;
      currentStudentsList.forEach((s) => {
        csvContent += `"${s.studentId}","${s.name}","${s.yearLevel}"\n`;
      });
      csvContent += `\n`;
    }

    if (selectedSections.includes("attendance")) {
      csvContent += `ATTENDANCE SUMMARY\nStudent ID,Full Name,Attendance %,Status\n`;
      currentStudentsList.forEach((s) => {
        csvContent += `"${s.studentId}","${s.name}",${s.attendance}%,"${s.status}"\n`;
      });
      csvContent += `\n`;
    }

    if (selectedSections.includes("grades")) {
      csvContent += `GRADE SUMMARY (Overall Average: ${overallClassAverage}%)\nStudent Name,Quizzes,Midterm,Project,Finals,Average\n`;
      currentStudentsList.forEach((s) => {
        csvContent += `"${s.name}",${s.quizzes},${s.midterm},${s.project},${s.finals},${calculateAverage(
          s
        )}\n`;
      });
      csvContent += `\n`;
    }

    if (selectedSections.includes("materials")) {
      csvContent += `MATERIALS LIST\nTitle,Type,File Size,Upload Date,Downloads\n`;
      currentMaterialsList.forEach((m) => {
        csvContent += `"${m.title}","${m.type.toUpperCase()}","${m.sizeLabel}","${m.date}",${m.downloads}\n`;
      });
    }

    const bytes = new TextEncoder().encode(csvContent);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const toggleSection = (sectionKey: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionKey)
        ? prev.filter((s) => s !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const handleSendClassReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientEmail || selectedSections.length === 0) {
      setEmailReportError(
        "Please enter a valid recipient email and select at least one section."
      );
      return;
    }

    setIsSendingReport(true);
    setEmailReportError(null);

    try {
      let activeStudents = students;
      let activeMaterials = courseMaterials;

      if (activeStudents.length === 0) {
        activeStudents = await fetchClassStudents();
      }
      if (activeMaterials.length === 0) {
        activeMaterials = await fetchClassMaterials();
      }

      const isPdf = reportFormat === "PDF attachment";
      const fileExt = isPdf ? "pdf" : "csv";
      const mimeType = isPdf ? "application/pdf" : "text/csv";
      const fileName = `Class_Report_${item.code}_${item.section.replace(
        /\s+/g,
        "_"
      )}.${fileExt}`;

      const base64Content = isPdf
        ? generatePdfBase64(activeStudents, activeMaterials)
        : generateCsvBase64(activeStudents, activeMaterials);

      const sectionLabels: Record<string, string> = {
        roster: "Class Roster",
        attendance: "Attendance Summary",
        grades: "Grade Summary",
        materials: "Materials List",
      };

      const includedSectionsList = selectedSections
        .map((s) => sectionLabels[s])
        .filter(Boolean)
        .join(", ");

      const subject = `Class Report: ${item.code} (${item.section})`;
      const message = `Hello,\n\nPlease find attached the class report for ${
        item.code
      } (${item.section}).\n\nCourse: ${item.title}\nSchedule: ${
        item.schedule
      }\nRoom: ${item.room}\nIncluded Sections: ${includedSectionsList}\n\nAdditional Notes:\n${
        additionalNotes || "None"
      }\n\nBest regards,\nAcademic Faculty Portal`;

      const response = await fetch("/api/users/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recipientEmail,
          subject,
          message,
          attachments: [
            {
              filename: fileName,
              content: base64Content,
              encoding: "base64",
              contentType: mimeType,
            },
          ],
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(
          resData.message || "Failed to send class report email."
        );
      }

      setEmailReportSuccess(true);
      setTimeout(() => {
        setEmailReportSuccess(false);
        setShowEmailReportModal(false);
      }, 1600);
    } catch (err: any) {
      console.error("Failed to send report:", err);
      setEmailReportError(
        err.message || "An error occurred while sending the report."
      );
    } finally {
      setIsSendingReport(false);
    }
  };

  return (
    <>
      {/* Main Class Detail Modal - Elevated Z-Index above Navbar */}
      <div
        className="modal fade show d-block tab-modal-backdrop"
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
        onClick={onClose}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-scrollable my-2 my-sm-auto mx-auto px-2"
          style={{
            maxWidth: "800px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            minHeight: "calc(100% - 1rem)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="modal-content border-0 shadow-lg rounded-4 overflow-hidden w-100 d-flex flex-column"
            style={{
              backgroundColor: "#FAFAFC",
              maxHeight: "calc(100vh - 1.5rem)",
            }}
          >
            {/* Header */}
            <div className="modal-header border-0 pb-2 pt-3 pt-sm-4 px-3 px-sm-4 align-items-start justify-content-between flex-shrink-0">
              <div className="d-flex flex-column gap-1 pe-2">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span
                    className="badge rounded-pill bg-white border px-2 py-1 fw-bold fs-7"
                    style={{ color: "#1E293B", borderColor: "#E2E8F0" }}
                  >
                    {item.code}
                  </span>
                  <h4
                    className="fw-bold mb-0 fs-6 fs-sm-5"
                    style={{ color: "#0F172A" }}
                  >
                    {item.title}
                  </h4>
                </div>
                <p className="small mb-0" style={{ color: "#64748B" }}>
                  {item.section} &bull; {item.schedule} &bull; {item.room}
                </p>
              </div>
              <button
                type="button"
                className="btn-close shadow-none mt-1"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            {/* Scrollable Body */}
            <div className="modal-body p-3 p-sm-4 overflow-y-auto">
              <div
                className="nav-tabs-wrapper p-1 rounded-3 mb-3 mb-sm-4"
                style={{ backgroundColor: "#F1F5F9" }}
              >
                <div className="row g-1 text-center">
                  <div className="col-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab("students")}
                      className={`btn w-100 py-2 border-0 rounded-2 fw-medium d-flex align-items-center justify-content-center gap-2 transition-all ${
                        activeTab === "students"
                          ? "bg-white shadow-sm"
                          : "hover-bg"
                      }`}
                      style={{
                        color: activeTab === "students" ? "#0F172A" : "#64748B",
                      }}
                    >
                      <Users size={16} />
                      <span className="d-none d-sm-inline">Students</span>
                    </button>
                  </div>

                  <div className="col-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab("materials")}
                      className={`btn w-100 py-2 border-0 rounded-2 fw-medium d-flex align-items-center justify-content-center gap-2 transition-all ${
                        activeTab === "materials"
                          ? "bg-white shadow-sm"
                          : "hover-bg"
                      }`}
                      style={{
                        color: activeTab === "materials" ? "#0F172A" : "#64748B",
                      }}
                    >
                      <FileText size={16} />
                      <span className="d-none d-sm-inline">Materials</span>
                    </button>
                  </div>

                  <div className="col-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab("grades")}
                      className={`btn w-100 py-2 border-0 rounded-2 fw-medium d-flex align-items-center justify-content-center gap-2 transition-all ${
                        activeTab === "grades"
                          ? "bg-white shadow-sm"
                          : "hover-bg"
                      }`}
                      style={{
                        color: activeTab === "grades" ? "#0F172A" : "#64748B",
                      }}
                    >
                      <ClipboardList size={16} />
                      <span className="d-none d-sm-inline">Grades</span>
                    </button>
                  </div>
                </div>
              </div>

              {activeTab === "students" && (
                <div className="tab-pane-content">
                  <div className="position-relative mb-3">
                    <Search
                      size={18}
                      className="position-absolute top-50 start-0 translate-middle-y ms-3"
                      style={{ color: "#94A3B8" }}
                    />
                    <input
                      type="text"
                      className="form-control ps-5 py-2 rounded-3 shadow-none bg-white small"
                      style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
                      placeholder="Search student name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {isLoadingStudents ? (
                    <div className="p-4 p-sm-5 text-center text-muted">
                      <Loader2
                        size={24}
                        className="spinner-border spinner-border-sm text-primary me-2"
                      />
                      <span>
                        Loading attendance records for section {item.section}...
                      </span>
                    </div>
                  ) : studentsError ? (
                    <div
                      className="alert alert-danger d-flex align-items-center gap-2 small"
                      role="alert"
                    >
                      <AlertCircle size={18} />
                      <div>{studentsError}</div>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex flex-column gap-2 max-h-350 overflow-y-auto pe-1">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((s) => {
                            const resolvedAvatarUrl = getFullAvatarUrl(s.avatarUrl);
                            const showAvatar = Boolean(resolvedAvatarUrl) && !imageErrors[s.id];

                            return (
                              <div
                                key={s.id}
                                className="p-3 bg-white rounded-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
                                style={{ border: "1px solid #F1F5F9" }}
                              >
                                <div className="d-flex align-items-center gap-3">
                                  <div
                                    className="rounded-circle fw-semibold d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden border"
                                    style={{
                                      width: "42px",
                                      height: "42px",
                                      minWidth: "42px",
                                      minHeight: "42px",
                                      fontSize: "0.85rem",
                                      backgroundColor: "#F1F5F9",
                                      color: "#334155",
                                    }}
                                  >
                                    {showAvatar ? (
                                      <img
                                        src={resolvedAvatarUrl}
                                        alt={s.name}
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                          display: "block",
                                          borderRadius: "50%",
                                        }}
                                        onError={() => {
                                          setImageErrors((prev) => ({ ...prev, [s.id]: true }));
                                        }}
                                      />
                                    ) : (
                                      getInitials(s.name)
                                    )}
                                  </div>
                                  <div>
                                    <div
                                      className="fw-semibold mb-0"
                                      style={{ color: "#1E293B" }}
                                    >
                                      {s.name}
                                    </div>
                                    <div
                                      className="small"
                                      style={{ color: "#64748B" }}
                                    >
                                      {s.studentId} &bull; {s.yearLevel}
                                    </div>
                                  </div>
                                </div>

                                <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3 minw-180">
                                  <div className="text-sm-end">
                                    <div
                                      className="small mb-1"
                                      style={{ color: "#64748B" }}
                                    >
                                      Attendance {s.attendance}%
                                    </div>
                                    <div
                                      className="progress"
                                      style={{
                                        height: "5px",
                                        width: "100px",
                                        backgroundColor: "#E2E8F0",
                                      }}
                                    >
                                      <div
                                        className="progress-bar"
                                        style={{
                                          width: `${s.attendance}%`,
                                          backgroundColor:
                                            s.attendance < 80
                                              ? "#DC3545"
                                              : "#0D3B52",
                                        }}
                                      />
                                    </div>
                                  </div>

                                  {s.status === "At Risk" ? (
                                    <span
                                      className="badge rounded-pill px-3 py-2 fw-medium border-0"
                                      style={{
                                        backgroundColor: "#DC3545",
                                        color: "#FFFFFF",
                                      }}
                                    >
                                      At Risk
                                    </span>
                                  ) : (
                                    <span
                                      className="badge rounded-pill px-3 py-2 fw-medium border-0"
                                      style={{
                                        backgroundColor: "#E9EEF5",
                                        color: "#0D3B52",
                                      }}
                                    >
                                      Enrolled
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div
                            className="text-center py-4"
                            style={{ color: "#64748B" }}
                          >
                            No students found matching section{" "}
                            <strong>{item.section}</strong>.
                          </div>
                        )}
                      </div>

                      <div
                        className="small mt-3 ms-1"
                        style={{ color: "#64748B" }}
                      >
                        Showing {filteredStudents.length} of {students.length}{" "}
                        enrolled students
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "materials" && (
                <div className="tab-pane-content">
                  {isLoadingMaterials ? (
                    <div className="p-4 p-sm-5 text-center text-muted">
                      <Loader2
                        size={24}
                        className="spinner-border spinner-border-sm text-primary me-2"
                      />
                      <span>Loading materials for {item.code}...</span>
                    </div>
                  ) : materialsError ? (
                    <div
                      className="alert alert-danger d-flex align-items-center gap-2 small"
                      role="alert"
                    >
                      <AlertCircle size={18} />
                      <div>{materialsError}</div>
                    </div>
                  ) : courseMaterials.length === 0 ? (
                    <div
                      className="text-center py-5 bg-white rounded-3 border"
                      style={{ borderColor: "#F1F5F9" }}
                    >
                      <FileText
                        size={36}
                        className="text-muted mb-2 opacity-50"
                      />
                      <h6 className="fw-semibold text-dark mb-1">
                        No Materials Found
                      </h6>
                      <p className="text-muted small mb-0">
                        No learning materials uploaded yet for{" "}
                        <strong>{item.code}</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2 max-h-350 overflow-y-auto pe-1">
                      {courseMaterials.map((mat) => (
                        <div
                          key={mat.id}
                          className="p-3 bg-white rounded-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3"
                          style={{ border: "1px solid #F1F5F9" }}
                        >
                          <div className="d-flex align-items-center gap-3 minw-0">
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                width: "42px",
                                height: "42px",
                                backgroundColor: "#E0F2FE",
                                color: "#0284C7",
                              }}
                            >
                              <FileText size={20} />
                            </div>
                            <div className="minw-0">
                              <div
                                className="fw-semibold mb-0 text-truncate"
                                style={{ color: "#1E293B" }}
                              >
                                {mat.title}
                              </div>
                              <div
                                className="small"
                                style={{ color: "#64748B" }}
                              >
                                <span className="text-uppercase fw-semibold">
                                  {mat.type}
                                </span>{" "}
                                &bull; {mat.sizeLabel} &bull; Uploaded{" "}
                                {formatReadableDate(mat.date)}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3 flex-shrink-0">
                            <span
                              className="badge rounded-pill px-3 py-2 fw-bold"
                              style={{
                                backgroundColor: "#F8FAFC",
                                color: "#1E293B",
                                border: "1px solid #E2E8F0",
                              }}
                            >
                              {mat.downloads} downloads
                            </span>

                            <button
                              type="button"
                              onClick={() => handleOpenDownloadConfirm(mat)}
                              className="btn btn-light border p-2 shadow-none rounded-2 hover-bg d-flex align-items-center justify-content-center"
                              style={{ color: "#334155" }}
                              title={`Download ${mat.title}`}
                              aria-label={`Download ${mat.title}`}
                            >
                              <Download size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "grades" && (
                <div className="tab-pane-content">
                  {isLoadingStudents ? (
                    <div className="p-4 p-sm-5 text-center text-muted">
                      <Loader2
                        size={24}
                        className="spinner-border spinner-border-sm text-primary me-2"
                      />
                      <span>Loading grade data for {item.section}...</span>
                    </div>
                  ) : studentsError ? (
                    <div
                      className="alert alert-danger d-flex align-items-center gap-2 small"
                      role="alert"
                    >
                      <AlertCircle size={18} />
                      <div>{studentsError}</div>
                    </div>
                  ) : students.length === 0 ? (
                    <div
                      className="text-center py-5 bg-white rounded-3 border"
                      style={{ borderColor: "#F1F5F9" }}
                    >
                      <ClipboardList
                        size={36}
                        className="text-muted mb-2 opacity-50"
                      />
                      <h6 className="fw-semibold text-dark mb-1">
                        No Grades Recorded
                      </h6>
                      <p className="text-muted small mb-0">
                        No student grade records available for section{" "}
                        <strong>{item.section}</strong>.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table align-middle text-nowrap border-0 mb-0">
                          <thead>
                            <tr
                              className="border-bottom"
                              style={{ borderColor: "#E2E8F0" }}
                            >
                              <th
                                className="border-0 fw-semibold ps-2 py-2"
                                style={{ color: "#64748B" }}
                              >
                                Student
                              </th>
                              <th
                                className="border-0 fw-semibold text-center py-2"
                                style={{ color: "#64748B" }}
                              >
                                Quizzes
                              </th>
                              <th
                                className="border-0 fw-semibold text-center py-2"
                                style={{ color: "#64748B" }}
                              >
                                Midterm
                              </th>
                              <th
                                className="border-0 fw-semibold text-center py-2"
                                style={{ color: "#64748B" }}
                              >
                                Project
                              </th>
                              <th
                                className="border-0 fw-semibold text-center py-2"
                                style={{ color: "#64748B" }}
                              >
                                Finals
                              </th>
                              <th
                                className="border-0 fw-semibold text-center pe-2 py-2"
                                style={{ color: "#64748B" }}
                              >
                                Average
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.map((s) => {
                              const avg = calculateAverage(s);
                              const isHighGrade = avg >= 90;
                              return (
                                <tr
                                  key={s.id}
                                  className="border-bottom"
                                  style={{ borderColor: "#F1F5F9" }}
                                >
                                  <td
                                    className="ps-2 py-3 fw-medium"
                                    style={{ color: "#1E293B" }}
                                  >
                                    {s.name}
                                  </td>
                                  <td
                                    className="text-center py-3"
                                    style={{ color: "#475569" }}
                                  >
                                    {s.quizzes}
                                  </td>
                                  <td
                                    className="text-center py-3"
                                    style={{ color: "#475569" }}
                                  >
                                    {s.midterm}
                                  </td>
                                  <td
                                    className="text-center py-3"
                                    style={{ color: "#475569" }}
                                  >
                                    {s.project}
                                  </td>
                                  <td
                                    className="text-center py-3"
                                    style={{ color: "#475569" }}
                                  >
                                    {s.finals}
                                  </td>
                                  <td className="text-center pe-2 py-3">
                                    <span
                                      className="badge rounded-pill px-3 py-2 fw-bold border-0"
                                      style={{
                                        backgroundColor: isHighGrade
                                          ? "#0D3B52"
                                          : "#E9EEF5",
                                        color: isHighGrade
                                          ? "#FFFFFF"
                                          : "#0D3B52",
                                      }}
                                    >
                                      {avg}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div
                        className="small mt-3 ms-1"
                        style={{ color: "#64748B" }}
                      >
                        Class average:{" "}
                        <span
                          className="fw-semibold"
                          style={{ color: "#1E293B" }}
                        >
                          {overallClassAverage}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 px-3 px-sm-4 pb-3 pt-0 flex-shrink-0 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn bg-white px-3 py-1.5 rounded-3 fw-medium small"
                style={{ color: "#1E293B", border: "1px solid #E2E8F0" }}
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="btn text-white px-3 py-1.5 rounded-3 fw-medium d-inline-flex align-items-center gap-2 shadow-sm border-0 small"
                style={{ backgroundColor: "#0D3B52", color: "#FFFFFF" }}
                onClick={() => setShowEmailReportModal(true)}
              >
                <Mail size={16} />
                Email Class Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Material Download Confirmation Dialog */}
      {downloadingMaterial && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 modal-blur-backdrop"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 10000,
          }}
          onClick={() => {
            if (!isDownloading) setDownloadingMaterial(null);
          }}
        >
          <div
            className="bg-white rounded-4 p-4 shadow-lg text-center position-relative"
            style={{ maxWidth: 420, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn btn-light p-1 position-absolute top-0 end-0 m-3 rounded-circle border-0 text-muted"
              disabled={isDownloading}
              onClick={() => setDownloadingMaterial(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary mb-3"
              style={{ width: 52, height: 52 }}
            >
              <FileCheck size={26} />
            </div>

            <h5 className="fw-bold text-dark mb-1">Download Material?</h5>
            <p className="text-muted small mb-3">
              Are you sure you want to download{" "}
              <strong>{downloadingMaterial.title}</strong>?
            </p>

            <div className="bg-light p-3 rounded-3 mb-4 text-start small">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Course:</span>
                <span className="fw-semibold text-dark">
                  {downloadingMaterial.course}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Type:</span>
                <span className="fw-semibold text-uppercase text-dark">
                  {downloadingMaterial.type}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">File Size:</span>
                <span className="fw-semibold text-dark">
                  {downloadingMaterial.sizeLabel}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Upload Date:</span>
                <span className="fw-semibold text-dark">
                  {formatReadableDate(downloadingMaterial.date)}
                </span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light border w-50 py-2 rounded-3 fw-medium text-muted small"
                disabled={isDownloading}
                onClick={() => setDownloadingMaterial(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary w-50 py-2 rounded-3 fw-medium d-inline-flex align-items-center justify-content-center gap-2 small"
                disabled={isDownloading}
                onClick={handleConfirmDownload}
              >
                {isDownloading ? (
                  <>
                    <Loader2
                      size={16}
                      className="spinner-border spinner-border-sm"
                    />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLY RESPONSIVE & SCROLLABLE EMAIL REPORT SUB-MODAL */}
      {showEmailReportModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 10000,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: "auto",
          }}
          onClick={() => {
            if (!isSendingReport) setShowEmailReportModal(false);
          }}
        >
          <div
            className="modal-dialog modal-dialog-scrollable my-2 my-sm-auto mx-auto px-2"
            style={{
              maxWidth: "520px",
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
              {/* Responsive Header */}
              <div className="modal-header border-bottom-0 pb-2 pt-3 pt-sm-4 px-3 px-sm-4 align-items-start justify-content-between flex-shrink-0">
                <div className="pe-2">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Mail size={20} style={{ color: "#0B4A6F" }} />
                    <h5 className="modal-title fw-bold text-dark m-0 fs-6 fs-sm-5">
                      Email Class Report
                    </h5>
                  </div>
                  <p className="text-secondary small mb-0 d-flex align-items-center gap-1 flex-wrap">
                    <span>Send a summarized report for</span>
                    <span className="badge bg-light text-dark border px-2 py-1 rounded fw-semibold">
                      {item.code}
                    </span>
                    <span>
                      {item.section} &middot; {item.schedule}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none mt-1"
                  disabled={isSendingReport}
                  onClick={() => setShowEmailReportModal(false)}
                  aria-label="Close"
                />
              </div>

              {/* Responsive Body Form */}
              <form
                onSubmit={handleSendClassReport}
                className="d-flex flex-column flex-grow-1 overflow-hidden m-0"
              >
                <div className="modal-body p-3 p-sm-4 overflow-y-auto">
                  {emailReportError && (
                    <div
                      className="alert alert-danger small mb-3 rounded-3"
                      role="alert"
                    >
                      {emailReportError}
                    </div>
                  )}

                  {currentUserEmail && (
                    <div
                      className="d-flex align-items-center gap-2 p-2 px-3 mb-3 bg-light rounded-3 text-secondary small border"
                      style={{ borderColor: "#E2E8F0" }}
                    >
                      <Info size={15} className="text-primary flex-shrink-0" />
                      <span className="text-truncate">
                        Your account email:{" "}
                        <strong className="text-dark">{currentUserEmail}</strong>
                      </span>
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 ms-auto text-primary text-decoration-none fw-semibold flex-shrink-0"
                        onClick={() => setRecipientEmail(currentUserEmail)}
                      >
                        Use mine
                      </button>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label text-dark small fw-medium mb-1">
                      Recipient email *
                    </label>
                    <input
                      type="email"
                      required
                      disabled={isSendingReport}
                      className="form-control bg-light bg-opacity-50 border-1 py-1.5 px-3 rounded-3 shadow-none small"
                      style={{ borderColor: "#E2E8F0" }}
                      placeholder="e.g. faculty@school.edu"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark small fw-medium mb-1">
                      Report format
                    </label>
                    <select
                      className="form-select bg-white border-1 py-1.5 px-3 rounded-3 shadow-none small"
                      style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
                      value={reportFormat}
                      disabled={isSendingReport}
                      onChange={(e) =>
                        setReportFormat(
                          e.target.value as "PDF attachment" | "CSV attachment"
                        )
                      }
                    >
                      <option value="PDF attachment">PDF attachment</option>
                      <option value="CSV attachment">CSV attachment</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <label className="form-label text-dark small fw-medium m-0">
                        Include sections
                      </label>
                      <span className="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-pill fw-semibold small">
                        {selectedSections.length} selected
                      </span>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      <div
                        className={`p-2.5 rounded-3 border transition-all cursor-pointer ${
                          selectedSections.includes("roster")
                            ? "bg-light bg-opacity-50 border-secondary"
                            : "bg-white border-light-subtle"
                        }`}
                        style={{
                          borderColor: selectedSections.includes("roster")
                            ? "#CBD5E1"
                            : "#E2E8F0",
                        }}
                        onClick={() =>
                          !isSendingReport && toggleSection("roster")
                        }
                      >
                        <div className="form-check d-flex align-items-start gap-2 m-0 ps-0">
                          <input
                            type="checkbox"
                            className="form-check-input flex-shrink-0 mt-1 shadow-none"
                            style={{ cursor: "pointer" }}
                            checked={selectedSections.includes("roster")}
                            onChange={() => {}}
                            disabled={isSendingReport}
                          />
                          <div>
                            <div className="fw-semibold text-dark small d-flex align-items-center gap-1.5">
                              <Users size={16} className="text-secondary" />
                              Class Roster
                            </div>
                            <div className="text-muted small fs-7">
                              Student names, IDs, and section details
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-2.5 rounded-3 border transition-all cursor-pointer ${
                          selectedSections.includes("attendance")
                            ? "bg-light bg-opacity-50 border-secondary"
                            : "bg-white border-light-subtle"
                        }`}
                        style={{
                          borderColor: selectedSections.includes("attendance")
                            ? "#CBD5E1"
                            : "#E2E8F0",
                        }}
                        onClick={() =>
                          !isSendingReport && toggleSection("attendance")
                        }
                      >
                        <div className="form-check d-flex align-items-start gap-2 m-0 ps-0">
                          <input
                            type="checkbox"
                            className="form-check-input flex-shrink-0 mt-1 shadow-none"
                            style={{ cursor: "pointer" }}
                            checked={selectedSections.includes("attendance")}
                            onChange={() => {}}
                            disabled={isSendingReport}
                          />
                          <div>
                            <div className="fw-semibold text-dark small d-flex align-items-center gap-1.5">
                              <FileCheck size={16} className="text-secondary" />
                              Attendance Summary
                            </div>
                            <div className="text-muted small fs-7">
                              Per-student attendance rates and at-risk flags
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-2.5 rounded-3 border transition-all cursor-pointer ${
                          selectedSections.includes("grades")
                            ? "bg-light bg-opacity-50 border-secondary"
                            : "bg-white border-light-subtle"
                        }`}
                        style={{
                          borderColor: selectedSections.includes("grades")
                            ? "#CBD5E1"
                            : "#E2E8F0",
                        }}
                        onClick={() =>
                          !isSendingReport && toggleSection("grades")
                        }
                      >
                        <div className="form-check d-flex align-items-start gap-2 m-0 ps-0">
                          <input
                            type="checkbox"
                            className="form-check-input flex-shrink-0 mt-1 shadow-none"
                            style={{ cursor: "pointer" }}
                            checked={selectedSections.includes("grades")}
                            onChange={() => {}}
                            disabled={isSendingReport}
                          />
                          <div>
                            <div className="fw-semibold text-dark small d-flex align-items-center gap-1.5">
                              <ClipboardList
                                size={16}
                                className="text-secondary"
                              />
                              Grade Summary
                            </div>
                            <div className="text-muted small fs-7">
                              Scores, averages, and final grade overview
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-2.5 rounded-3 border transition-all cursor-pointer ${
                          selectedSections.includes("materials")
                            ? "bg-light bg-opacity-50 border-secondary"
                            : "bg-white border-light-subtle"
                        }`}
                        style={{
                          borderColor: selectedSections.includes("materials")
                            ? "#CBD5E1"
                            : "#E2E8F0",
                        }}
                        onClick={() =>
                          !isSendingReport && toggleSection("materials")
                        }
                      >
                        <div className="form-check d-flex align-items-start gap-2 m-0 ps-0">
                          <input
                            type="checkbox"
                            className="form-check-input flex-shrink-0 mt-1 shadow-none"
                            style={{ cursor: "pointer" }}
                            checked={selectedSections.includes("materials")}
                            onChange={() => {}}
                            disabled={isSendingReport}
                          />
                          <div>
                            <div className="fw-semibold text-dark small d-flex align-items-center gap-1.5">
                              <FileText size={16} className="text-secondary" />
                              Materials List
                            </div>
                            <div className="text-muted small fs-7">
                              Uploaded files, dates, and download counts
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label text-dark small fw-medium mb-1">
                      Additional notes
                    </label>
                    <textarea
                      rows={2}
                      disabled={isSendingReport}
                      className="form-control bg-light bg-opacity-50 border-1 p-2 rounded-3 shadow-none small"
                      style={{ borderColor: "#E2E8F0" }}
                      placeholder="Add a short message or instructions to include with the report..."
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className="modal-footer border-top-0 px-3 px-sm-4 py-2.5 bg-white flex-shrink-0 d-flex justify-content-end align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light px-3 py-1.5 rounded-3 border text-dark fw-medium small"
                    style={{ borderColor: "#E2E8F0" }}
                    onClick={() => setShowEmailReportModal(false)}
                    disabled={isSendingReport}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReport}
                    className="btn text-white px-3.5 py-1.5 rounded-3 d-flex align-items-center gap-2 fw-medium shadow-sm small"
                    style={{ backgroundColor: "#0B4A6F" }}
                  >
                    {isSendingReport ? (
                      <>
                        <Loader2
                          size={16}
                          className="spinner-border spinner-border-sm me-1"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Alert */}
      {emailReportSuccess && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 10100,
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
              <h5 className="fw-bold text-dark mb-1">Class Report Sent!</h5>
              <p className="text-secondary small mb-0">
                Report successfully delivered to <br />
                <strong className="text-dark">{recipientEmail}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}