import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  X,
  FileSpreadsheet,
  TriangleAlert,
  AlertTriangle,
  History,
  CheckCircle2,
  RotateCcw,
  Eye,
  UserX,
} from "lucide-react";
import {
  getStudentById,
  getStudentRecords,
  updateStudentInfo,
} from "../../api/studentService";
import { getCourses } from "../../api/courseService";
import { getDepartments } from "../../api/departmentService";
import { getRegistrarByRole } from "../../api/userService";
import RecordsStats from "../../components/Registrar/Records/RecordsStats";
import RecordsFilters from "../../components/Registrar/Records/RecordsFilters";
import StudentsTable from "../../components/Registrar/Records/StudentsTable";
import StudentDetailsModal from "../../components/Registrar/Records/StudentDetailsModal";
import EditStudentInfoModal from "../../components/Registrar/Records/EditStudentInfoModal";
import TransferRequestsSection from "../../components/Registrar/Records/TransferRequestsSection";
import AuthAlert from "../../components/Authentication/AuthAlert";

// Imported dynamic API base URL config
import { API_BASE_URL } from "../../config";

import type {
  StudentRow,
  StudentStatus,
} from "../../components/Registrar/Records/types";

import "../../styles/registrar-records.css";
import "../../styles/application-modal.css";

type StudentDetails = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;

  course: string;
  year: number;
  section?: string;
  department?: string;

  guardian?: string;
  guardianPhone?: string;

  birthdate?: string;
  enrolledDate?: string;

  status: "Active" | "Inactive" | "Dropped" | "Graduated";
  initials?: string;
  avatarUrl?: string;

  gpa?: string;
  verifiedDocs?: string[];
  dropReason?: string;
};

type ExportStatus = "All" | "Active" | "Dropped";

type CourseOption = {
  id: string;
  code: string;
  name: string;
  yearLevels: number;
  department: string;
  status: "Active" | "Inactive";
};

type DepartmentOption = {
  id: string;
  code: string;
  name: string;
  status: "Active" | "Inactive";
};

type RegistrarAccount = {
  _id?: string;
  email?: string;
  user?: string;
  role?: string;
};

const backdropBlurStyle: React.CSSProperties = {
  backgroundColor: "rgba(15, 23, 42, 0.45)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};

export default function StudentRecordsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StudentStatus | "All">("All");
  const [course, setCourse] = useState<string | "All">("All");
  const [year, setYear] = useState<number | "All">("All");
  const [section, setSection] = useState<string | "All">("All");

  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(
    null,
  );

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editStudent, setEditStudent] = useState<StudentDetails | null>(null);

  // Transfer & Drop requests state & active review context
  const [transferRequests, setTransferRequests] = useState<any[]>([]);
  const [transferHistory, setTransferHistory] = useState<any[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [activeTransferReq, setActiveTransferReq] = useState<any | null>(null);

  // Drop student state variables
  const [dropModalOpen, setDropModalOpen] = useState(false);
  const [droppingStudent, setDroppingStudent] = useState<StudentDetails | null>(null);
  const [dropReason, setDropReason] = useState("");
  const [dropping, setDropping] = useState(false);

  // Dropped students modal state
  const [droppedModalOpen, setDroppedModalOpen] = useState(false);

  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<
    DepartmentOption[]
  >([]);

  const [registrarAccount, setRegistrarAccount] =
    useState<RegistrarAccount | null>(null);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [exitConfirmModalOpen, setExitConfirmModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedExportStatus, setSelectedExportStatus] =
    useState<ExportStatus | null>(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const showAlert = (message: string, type: "success" | "error") => {
    setAnimateAlert(false);

    setTimeout(() => {
      setAlertMessage(message);
      setAlertType(type);
      setAnimateAlert(true);
    }, 50);
  };

  useEffect(() => {
    if (!animateAlert) return;

    const t = setTimeout(() => {
      setAnimateAlert(false);
    }, 3000);

    return () => clearTimeout(t);
  }, [animateAlert]);

  const registrarEmail =
    registrarAccount?.user || registrarAccount?.email || "";

  // Helper function to resolve course code/id to full course name
  const resolveCourseName = (courseVal: string) => {
    if (!courseVal) return "";
    const matched = courseOptions.find(
      (c) => c.code === courseVal || c.id === courseVal || c.name === courseVal
    );
    return matched ? matched.name : courseVal;
  };

  // Normalization helper with type cast for row matching
  const parseStudentDetails = (
    responsePayload: any,
    targetId: string,
  ): StudentDetails => {
    const s =
      responsePayload?.student ||
      responsePayload?.data?.student ||
      responsePayload?.data ||
      responsePayload ||
      {};

    const matchingRow = rows.find(
      (r) =>
        r.id === targetId ||
        (r as any)._id === targetId ||
        (r as any).studentIdNumber === targetId,
    );

    const rawAvatar =
      s.avatarUrl ||
      s.photo ||
      s.image ||
      s.avatar ||
      s.profilePicture ||
      s.profileImg ||
      s.picture ||
      s.profile_image ||
      s.profile_pic ||
      s.avatar_url ||
      matchingRow?.avatarUrl ||
      s.user?.avatarUrl ||
      s.user?.photo ||
      s.user?.profilePicture ||
      s.user?.image ||
      s.user?.avatar ||
      s.account?.avatarUrl ||
      s.account?.photo ||
      s.profile?.avatarUrl ||
      s.profile?.photo ||
      "";

    const rawCourse = s.course || s.program || s.degree || "";

    return {
      ...s,
      id: s.id || s._id || s.studentIdNumber || targetId || "",
      name:
        s.name ||
        s.fullName ||
        (s.firstName || s.lastName
          ? `${s.firstName || ""} ${s.lastName || ""}`.trim()
          : ""),
      email: s.email || s.user?.email || "",
      phone: s.phone || s.contactNumber || s.mobileNumber || "",
      course: resolveCourseName(rawCourse),
      year: Number(s.year || s.yearLevel || 1),
      department: s.department || "",
      status: s.status || "Active",
      avatarUrl: rawAvatar,
      verifiedDocs: s.verifiedDocs || s.documents || [],
      dropReason: s.dropReason || s.reason || "",
    };
  };

  const load = async () => {
    try {
      setLoading(true);

      const data: any = await getStudentRecords({
        q: query.trim(),
        status,
        course,
        year,
        section,
      });

      const recordsArray = Array.isArray(data)
        ? data
        : data?.students || data?.data || [];

      const mappedRows: StudentRow[] = recordsArray.map((s: any) => {
        let rawAvatar =
          s.avatarUrl ||
          s.photo ||
          s.image ||
          s.avatar ||
          s.profilePicture ||
          s.user?.avatarUrl ||
          s.user?.photo ||
          s.user?.profilePicture ||
          "";

        if (!rawAvatar && s && typeof s === "object") {
          for (const key of Object.keys(s)) {
            const val = s[key];
            if (
              typeof val === "string" &&
              (val.includes("uploads") ||
                val.includes("images") ||
                val.includes("avatars") ||
                val.startsWith("http") ||
                val.startsWith("data:") ||
                val.endsWith(".jpg") ||
                val.endsWith(".jpeg") ||
                val.endsWith(".png") ||
                val.endsWith(".webp"))
            ) {
              rawAvatar = val;
              break;
            }
          }
        }

        const rawCourse = s.course || s.program || s.degree || "";

        return {
          ...s,
          id: s.id || s._id || s.studentIdNumber || s.studentId,
          course: resolveCourseName(rawCourse),
          avatarUrl: rawAvatar,
        };
      });

      setRows(mappedRows);
    } catch (e: any) {
      console.error(e);
      setRows([]);
      showAlert(e?.message || "Failed to load student records.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadTransferRequests = async () => {
    try {
      const [transfersRes, dropsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/transfers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("sessionToken") || ""}` },
        }),
        fetch(`${API_BASE_URL}/students/drop-requests`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("sessionToken") || ""}` },
        }).catch(() => ({ ok: false, json: async () => [] }))
      ]);

      let allRequests: any[] = [];
      if (transfersRes.ok) {
        const tData = await transfersRes.json();
        const formattedTransfers = (Array.isArray(tData) ? tData : []).map(t => ({ ...t, requestType: t.requestType || "transfer" }));
        allRequests.push(...formattedTransfers);
      }
      if ('ok' in dropsRes && dropsRes.ok) {
        const dData = await (dropsRes as Response).json();
        const formattedDrops = (Array.isArray(dData) ? dData : []).map(d => ({
          ...d,
          requestType: "drop",
          transferType: "Drop",
          currentCourse: d.course || d.student?.course,
          targetCourse: "Dropped",
          targetDepartment: "Unassigned"
        }));
        allRequests.push(...formattedDrops);
      }

      const active = allRequests.filter(
        (r: any) => r.status === "Pending" || r.status === "Under Review" || !r.status
      );
      const history = allRequests.filter(
        (r: any) => r.status === "Approved" || r.status === "Returned" || r.status === "Completed" || r.status === "Rejected"
      );

      setTransferRequests(active);
      setTransferHistory(history);
    } catch (err) {
      console.error("Failed to load requests", err);
    }
  };

  const loadEditOptions = async () => {
    try {
      const [coursesDataRaw, departmentsDataRaw] = await Promise.all([
        getCourses(),
        getDepartments(),
      ]);

      const coursesData: any = coursesDataRaw;
      const departmentsData: any = departmentsDataRaw;

      const coursesArray = Array.isArray(coursesData)
        ? coursesData
        : coursesData?.courses || coursesData?.data || [];

      const departmentsArray = Array.isArray(departmentsData)
        ? departmentsData
        : departmentsData?.departments || departmentsData?.data || [];

      const mappedCourses: CourseOption[] = coursesArray
        .map(
          (c: any): CourseOption => ({
            id: c._id || c.id,
            code: c.code,
            name: c.name,
            yearLevels: Number(c.yearLevels ?? 4),
            department: c.department,
            status: c.status === "Inactive" ? "Inactive" : "Active",
          }),
        )
        .filter((c: CourseOption) => c.status === "Active");

      const mappedDepartments: DepartmentOption[] = departmentsArray
        .map(
          (d: any): DepartmentOption => ({
            id: d._id || d.id,
            code: d.code,
            name: d.name,
            status: d.status === "Inactive" ? "Inactive" : "Active",
          }),
        )
        .filter((d: DepartmentOption) => d.status === "Active");

      setCourseOptions(mappedCourses);
      setDepartmentOptions(mappedDepartments);
    } catch (e) {
      console.error("Failed to load edit options", e);
      setCourseOptions([]);
      setDepartmentOptions([]);
    }
  };

  const loadRegistrarAccount = async () => {
    try {
      const data: any = await getRegistrarByRole();
      setRegistrarAccount(
        data?.registrar || data?.user || data?.data || data || null,
      );
    } catch (e) {
      console.error("Failed to load registrar account", e);
      setRegistrarAccount(null);
    }
  };

  useEffect(() => {
    loadEditOptions();
    loadRegistrarAccount();
    loadTransferRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (courseOptions.length > 0) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, course, year, section, courseOptions]);

  // Filter out dropped students from the main view table rows
  const activeDisplayRows = useMemo(() => {
    return rows.filter((s) => {
      const st = (s.status || "").trim().toLowerCase();
      return st !== "dropped" && st !== "warning" && st !== "inactive";
    });
  }, [rows]);

  // Get list of dropped students for the modal list
  const droppedStudentsList = useMemo(() => {
    return rows.filter((s) => {
      const st = (s.status || "").trim().toLowerCase();
      return st === "dropped" || st === "warning" || st === "inactive";
    });
  }, [rows]);

 const handleExportDroppedStudents = () => {
    if (droppedStudentsList.length === 0) {
      showAlert("No dropped students records to export.", "error");
      return;
    }

    try {
      const headers = ["Student ID", "Full Name", "Email", "Phone", "Course", "Year Level", "Drop Reason"];
      const csvRows = [headers.join(",")];

      droppedStudentsList.forEach((studentItem) => {
        // Cast as any to safely access optional/extended properties
        const item = studentItem as any;

        const id = `"${(item.id || item._id || "").replace(/"/g, '""')}"`;
        const name = `"${(item.name || "").replace(/"/g, '""')}"`;
        const email = `"${(item.email || item.user?.email || "").replace(/"/g, '""')}"`;
        const phone = `"${(item.phone || item.contactNumber || "").replace(/"/g, '""')}"`;
        const courseName = `"${(item.course || "").replace(/"/g, '""')}"`;
        const yearLvl = `"${(item.year || item.yearLevel || "").toString().replace(/"/g, '""')}"`;
        const reason = `"${(item.dropReason || item.reason || "").replace(/"/g, '""')}"`;

        csvRows.push([id, name, email, phone, courseName, yearLvl, reason].join(","));
      });

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dropped-students-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      showAlert("Dropped students records exported successfully.", "success");
    } catch (err) {
      console.error("Failed to export dropped students", err);
      showAlert("Failed to export dropped students records.", "error");
    }
  };

  const handleAttemptCloseExportModal = () => {
    if (exporting) return;

    if (selectedExportStatus !== null) {
      setExitConfirmModalOpen(true);
    } else {
      setExportModalOpen(false);
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || exporting) return;

      if (exitConfirmModalOpen) {
        setExitConfirmModalOpen(false);
        return;
      }

      if (confirmModalOpen) {
        setConfirmModalOpen(false);
        return;
      }

      if (exportModalOpen) {
        handleAttemptCloseExportModal();
      }
    };

    if (exportModalOpen || confirmModalOpen || exitConfirmModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [
    exportModalOpen,
    confirmModalOpen,
    exitConfirmModalOpen,
    exporting,
    selectedExportStatus,
  ]);

  const courses = useMemo<string[]>(() => {
    const values = activeDisplayRows
      .map((s) => s.course)
      .filter((value): value is string => Boolean(value) && value !== "—");

    return ["All", ...Array.from(new Set(values)).sort()];
  }, [activeDisplayRows]);

  const years = useMemo<Array<number | "All">>(() => {
    const values = activeDisplayRows
      .map((s) => s.year)
      .filter(
        (value): value is number =>
          typeof value === "number" && !Number.isNaN(value),
      );

    return ["All", ...Array.from(new Set(values)).sort((a, b) => a - b)];
  }, [activeDisplayRows]);

  const sections = useMemo<string[]>(() => {
    const values = activeDisplayRows
      .map((s) => s.section)
      .filter((value): value is string => Boolean(value) && value !== "—");

    return ["All", ...Array.from(new Set(values)).sort()];
  }, [activeDisplayRows]);

  const stats = useMemo(() => {
    const total = activeDisplayRows.length;
    const active = rows.filter((s) => {
      const st = (s.status || "").trim().toLowerCase();
      return st === "active" || st === "good";
    }).length;
    const dropped = rows.filter((s) => {
      const st = (s.status || "").trim().toLowerCase();
      return st === "dropped" || st === "warning" || st === "inactive";
    }).length;

    return { total, active, dropped };
  }, [rows, activeDisplayRows]);

  const handleViewDetails = async (id: string) => {
    try {
      const studentData = await getStudentById(id);
      setSelectedStudent(parseStudentDetails(studentData, id));
      setDetailsOpen(true);
    } catch (err: any) {
      console.error(err);
      showAlert(err?.message || "Failed to fetch student details.", "error");
    }
  };

  const handleEditInfo = async (id: string) => {
    try {
      setEditLoading(true);
      const studentData = await getStudentById(id);
      setEditStudent(parseStudentDetails(studentData, id));
      setEditOpen(true);
    } catch (err: any) {
      console.error(err);
      showAlert(err?.message || "Failed to fetch student details.", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenEditFromTransfer = async (req: any) => {
    const targetStudentId = req.student?.id || req.studentId || req.student;
    if (targetStudentId) {
      const resolvedReq = {
        ...req,
        targetCourse: resolveCourseName(req.targetCourse || req.course),
      };
      setActiveTransferReq(resolvedReq);
      await handleEditInfo(targetStudentId);
    }
  };

  const handleApproveRequest = async (request: any) => {
    try {
      setLoading(true);
      const endpoint = `${API_BASE_URL}/transfers/${request.id}/approve`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sessionToken") || ""}`,
        },
        body: JSON.stringify({ updatedBy: registrarEmail }),
      });

      if (!res.ok) throw new Error("Failed to process request approval.");

      showAlert(`${request.requestType === "drop" ? "Drop request approved. Account deactivated and email notification sent." : "Transfer request approved successfully."}`, "success");
      await loadTransferRequests();
      await load();
    } catch (err: any) {
      showAlert(err?.message || "Error approving request.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnRequest = async (request: any) => {
    try {
      setLoading(true);
      const endpoint = `${API_BASE_URL}/transfers/${request.id}/return`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sessionToken") || ""}`,
        },
        body: JSON.stringify({ updatedBy: registrarEmail }),
      });

      if (!res.ok) throw new Error("Failed to return request.");

      showAlert("Request returned successfully.", "success");
      await loadTransferRequests();
      await load();
    } catch (err: any) {
      showAlert(err?.message || "Error returning request.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (payload: {
    email: string;
    phone: string;
    guardian: string;
    guardianPhone: string;
    birthdate: string;
    course: string;
    year: number;
    department: string;
    verifiedDocs: string[];
  }) => {
    if (!editStudent) return;

    try {
      setEditLoading(true);

      if (activeTransferReq) {
        const endpoint = `${API_BASE_URL}/transfers/${activeTransferReq.id}/approve`;

        const res = await fetch(endpoint, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("sessionToken") || ""}`,
          },
          body: JSON.stringify({ updatedBy: registrarEmail }),
        });

        if (!res.ok) {
          let errorMsg = "Failed to finalize request.";
          try {
            const errData = await res.json();
            errorMsg = errData?.message || errorMsg;
          } catch {
            // fallback
          }
          throw new Error(errorMsg);
        }

        setActiveTransferReq(null);
      } else {
        await updateStudentInfo(editStudent.id, {
          email: payload.email,
          phone: payload.phone,
          guardian: payload.guardian,
          guardianPhone: payload.guardianPhone,
          birthdate: payload.birthdate,
          program: payload.course,
          yearLevel: payload.year,
          department: payload.department,
          verifiedDocs: payload.verifiedDocs,
          updatedBy: registrarEmail,
        } as any);
      }

      await load();
      await loadTransferRequests();

      if (selectedStudent?.id === editStudent.id) {
        const refreshed = await getStudentById(editStudent.id);
        setSelectedStudent(parseStudentDetails(refreshed, editStudent.id));
      }

      setEditOpen(false);
      setEditStudent(null);

      showAlert(
        activeTransferReq
          ? "Request approved and completed successfully."
          : "Student information updated successfully.",
        "success"
      );
    } catch (err: any) {
      console.error(err);
      showAlert(
        err?.message || "Failed to update student information.",
        "error",
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleMarkDroppedClick = async (id: string) => {
    try {
      const studentData = await getStudentById(id);
      const details = parseStudentDetails(studentData, id);
      setDroppingStudent(details);
      setDropReason("");
      setDropModalOpen(true);
    } catch (err: any) {
      console.error(err);
      showAlert(err?.message || "Failed to fetch student details for dropping.", "error");
    }
  };

  const handleConfirmDrop = async () => {
    if (!droppingStudent) return;
    if (!dropReason.trim()) {
      showAlert("Please provide a reason for dropping the student.", "error");
      return;
    }

    try {
      setDropping(true);

      const res = await fetch(`${API_BASE_URL}/students/${droppingStudent.id}/drop`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sessionToken") || ""}`,
        },
        body: JSON.stringify({
          reason: dropReason.trim(),
          updatedBy: registrarEmail,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to drop student.";
        try {
          const errData = await res.json();
          msg = errData?.message || msg;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      await load();
      await loadTransferRequests();
      setDropModalOpen(false);
      setDroppingStudent(null);
      setDropReason("");
      showAlert(`Student ${droppingStudent.name} has been marked as dropped, account deactivated, and notified via email.`, "success");
    } catch (err: any) {
      console.error(err);
      showAlert(err?.message || "Failed to drop student.", "error");
    } finally {
      setDropping(false);
    }
  };

  const handleOpenExport = () => {
    setSelectedExportStatus(null);
    setExportModalOpen(true);
  };

  const handleConfirmExitExport = () => {
    setExitConfirmModalOpen(false);
    setConfirmModalOpen(false);
    setExportModalOpen(false);
    setSelectedExportStatus(null);
  };

  const handleOpenConfirmExport = () => {
    if (!selectedExportStatus) return;
    setConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    if (exporting) return;
    setConfirmModalOpen(false);
  };

  const handleDownloadExport = async () => {
    if (!selectedExportStatus) return;

    try {
      setExporting(true);

      const qs = new URLSearchParams();

      if (query.trim()) qs.set("q", query.trim());
      if (status !== "All") qs.set("status", status);
      if (course !== "All") qs.set("course", course);
      if (year !== "All") qs.set("year", String(year));
      if (section !== "All") qs.set("section", section);
      if (selectedExportStatus !== "All") {
        qs.set("exportStatus", selectedExportStatus);
      }

      const res = await fetch(
        `${API_BASE_URL}/students/export?${qs.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("sessionToken") || ""}`,
          },
        },
      );

      if (!res.ok) {
        let message = "Failed to export student records.";
        try {
          const err = await res.json();
          message = err?.message || message;
        } catch {
          //
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const suffix =
        selectedExportStatus === "All"
          ? "all"
          : selectedExportStatus.toLowerCase();

      link.href = url;
      link.download = `student-records-${suffix}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setConfirmModalOpen(false);
      setExportModalOpen(false);
      setSelectedExportStatus(null);
      showAlert(
        `Student records exported successfully (${selectedExportStatus}).`,
        "success",
      );
    } catch (error) {
      console.error("Failed to export student records:", error);
      showAlert("Failed to export student records.", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleExportHistory = () => {
    if (transferHistory.length === 0) {
      showAlert("No request history records to export.", "error");
      return;
    }

    try {
      const headers = ["Student Name", "Request Type", "Transfer Type", "Target Course", "Status", "Reason", "Resolved Date"];
      const csvRows = [headers.join(",")];

      transferHistory.forEach((item) => {
        const studentName = `"${(item.studentName || item.student?.name || "Student").replace(/"/g, '""')}"`;
        const reqType = item.requestType === "drop" ? "Official Drop" : "Transfer";
        const transferType = `"${(item.transferType || "N/A").replace(/"/g, '""')}"`;
        const targetCourse = `"${(resolveCourseName(item.targetCourse || item.course) || "N/A").replace(/"/g, '""')}"`;
        const status = `"${(item.status || "").replace(/"/g, '""')}"`;
        const reason = `"${(item.reason || "").replace(/"/g, '""')}"`;
        const resolvedDate = `"${(item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "").replace(/"/g, '""')}"`;

        csvRows.push([studentName, reqType, transferType, targetCourse, status, reason, resolvedDate].join(","));
      });

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `requests-history-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      showAlert("Requests history exported successfully.", "success");
    } catch (err) {
      console.error("Failed to export requests history", err);
      showAlert("Failed to export requests history.", "error");
    }
  };

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={loading || exporting || editLoading || dropping}
      />

      <div className="registrar-records">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
          <div>
            <h2 className="mb-1 fw-bold fs-4">Student Records</h2>
            <p className="text-muted mb-0 small">Manage and view all enrolled students</p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
              onClick={handleOpenExport}
              disabled={loading}
              style={{ fontSize: "0.875rem", borderRadius: "0.5rem" }}
            >
              <Download size={16} />
              <span>{loading ? "Loading..." : "Export Records"}</span>
            </button>

            <button
              type="button"
              className="btn btn-dark d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
              style={{
                fontSize: "0.875rem",
                borderRadius: "0.5rem",
                backgroundColor: "#212529",
                borderColor: "#212529",
              }}
              onClick={() => setHistoryModalOpen(true)}
            >
              <History size={16} />
              <span>Requests History</span>
              <span className="badge bg-light text-dark ms-1 rounded-pill">
                {transferHistory.length}
              </span>
            </button>
          </div>
        </div>

        <TransferRequestsSection
          requests={transferRequests}
          onOpenEditModal={handleOpenEditFromTransfer}
          onApprove={handleApproveRequest}
          onReturn={handleReturnRequest}
          loading={loading}
        />

        {/* Clickable Dropped Stats Card */}
        <RecordsStats 
          stats={stats} 
          onCardClick={(type) => {
            if (type === "dropped") {
              setDroppedModalOpen(true);
            }
          }} 
        />

        <RecordsFilters
          query={query}
          setQuery={setQuery}
          status={status}
          setStatus={setStatus}
          course={course}
          setCourse={setCourse}
          year={year}
          setYear={setYear}
          years={years}
          section={section}
          setSection={setSection}
          sections={sections}
          courses={courses}
        />

        {/* Main table filtered to exclude dropped students */}
        <StudentsTable
          title={`Students (${activeDisplayRows.length})`}
          rows={activeDisplayRows}
          transferRequests={transferRequests}
          onViewDetails={handleViewDetails}
          onEditInfo={handleEditInfo}
          onMarkDropped={handleMarkDroppedClick}
        />

        <StudentDetailsModal
          open={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
        />

        <EditStudentInfoModal
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditStudent(null);
            setActiveTransferReq(null);
          }}
          student={editStudent}
          transferRequest={activeTransferReq}
          courseOptions={courseOptions}
          departmentOptions={departmentOptions}
          onSave={handleSaveEdit}
          loading={editLoading}
        />

        {/* DROPPED STUDENTS LIST POPUP MODAL */}
        {droppedModalOpen &&
          createPortal(
            <div
              className="students-modal-backdrop"
              style={{
                ...backdropBlurStyle,
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 2050,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "clamp(0.75rem, 3vw, 1.5rem)",
                overflowY: "auto",
              }}
              onClick={() => setDroppedModalOpen(false)}
            >
              <div
                className="students-modal-card p-4 shadow-lg"
                style={{
                  maxWidth: "750px",
                  width: "100%",
                  maxHeight: "85vh",
                  overflowY: "auto",
                  borderRadius: "0.75rem",
                  backgroundColor: "#fff",
                  margin: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <UserX size={20} className="text-danger" />
                    <h5 className="mb-0 fw-bold">Dropped Students Records</h5>
                  </div>
                  <button
                    type="button"
                    className="app-icon-btn app-icon-btn-sm"
                    onClick={() => setDroppedModalOpen(false)}
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="text-muted small mb-0">
                    List of all students who have been officially dropped from active enrollment.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 flex-shrink-0"
                    onClick={handleExportDroppedStudents}
                    disabled={droppedStudentsList.length === 0}
                  >
                    <Download size={14} />
                    <span>Export Dropped</span>
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", maxHeight: "55vh" }}>
                  {droppedStudentsList.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <UserX size={36} className="mb-2 opacity-50" />
                      <p className="mb-0">No dropped students found.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {droppedStudentsList.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-3 border rounded-3 bg-light d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
                        >
                          <div className="d-flex flex-column gap-1">
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <span className="fw-semibold text-dark">{item.name}</span>
                              <span className="badge bg-danger-subtle text-danger">Dropped</span>
                              <span className="text-muted small">({item.id})</span>
                            </div>
                            <div className="text-muted small">
                              Course: <span className="text-dark fw-medium">{item.course || "—"}</span> | Year: <span className="text-dark fw-medium">{item.year || "—"}</span>
                            </div>
                            {(item.dropReason || item.reason) && (
                              <div className="text-muted small fst-italic mt-1">
                                Reason: "{item.dropReason || item.reason}"
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center gap-1 flex-shrink-0"
                            onClick={() => {
                              setDroppedModalOpen(false);
                              handleViewDetails(item.id);
                            }}
                          >
                            <Eye size={14} />
                            <span>View Profile</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )}

        {/* REQUESTS HISTORY MODAL */}
        {historyModalOpen &&
          createPortal(
            <div
              className="students-modal-backdrop"
              style={{
                ...backdropBlurStyle,
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 2050,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "clamp(0.75rem, 3vw, 1.5rem)",
                overflowY: "auto",
              }}
              onClick={() => setHistoryModalOpen(false)}
            >
              <div
                className="students-modal-card p-4 shadow-lg"
                style={{
                  maxWidth: "750px",
                  width: "100%",
                  maxHeight: "85vh",
                  overflowY: "auto",
                  borderRadius: "0.75rem",
                  backgroundColor: "#fff",
                  margin: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <History size={20} className="text-primary" />
                    <h5 className="mb-0 fw-bold">Requests History</h5>
                  </div>
                  <button
                    type="button"
                    className="app-icon-btn app-icon-btn-sm"
                    onClick={() => setHistoryModalOpen(false)}
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-muted small mb-3">
                  Track status updates, returns, and approvals for department transfers and official student drops.
                </p>

                <div className="mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                    onClick={handleExportHistory}
                    disabled={transferHistory.length === 0}
                  >
                    <Download size={14} />
                    <span>Export History</span>
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", maxHeight: "50vh" }}>
                  {transferHistory.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <History size={36} className="mb-2 opacity-50" />
                      <p className="mb-0">No request history records found.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {transferHistory.map((item, idx) => {
                        const isApproved = item.status === "Approved" || item.status === "Completed";
                        const isDrop = item.requestType === "drop";
                        const resolvedDateStr = item.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—";

                        return (
                          <div
                            key={item.id || item._id || idx}
                            className="p-3 border rounded-3 bg-light d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
                          >
                            <div className="d-flex flex-column gap-1">
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span className="fw-semibold text-dark">
                                  {item.studentName || item.student?.name || "Student"}
                                </span>
                                <span
                                  className={`badge ${
                                    isDrop ? "bg-danger-subtle text-danger" : "bg-primary-subtle text-primary"
                                  }`}
                                >
                                  {isDrop ? "Official Drop" : `Transfer (${item.transferType || "Program"})`}
                                </span>
                                <span
                                  className={`badge ${
                                    isApproved ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"
                                  } d-flex align-items-center gap-1`}
                                >
                                  {isApproved ? <CheckCircle2 size={12} /> : <RotateCcw size={12} />}
                                  {item.status}
                                </span>
                              </div>

                              <div className="text-muted small mt-1">
                                {isDrop ? (
                                  <div>
                                    <span className="fw-semibold text-secondary">Reason for Drop:</span>{" "}
                                    <span className="text-dark fst-italic">"{item.reason || "No reason provided"}"</span>
                                  </div>
                                ) : (
                                  <>
                                    <div>
                                      <span className="fw-semibold text-secondary">Target Course/Program:</span>{" "}
                                      <span className="text-dark fw-medium">{resolveCourseName(item.targetCourse || item.course) || "—"}</span>
                                    </div>
                                    {item.reason && (
                                      <div className="mt-1">
                                        <span className="fw-semibold text-secondary">Reason for Transfer:</span>{" "}
                                        <span className="text-dark fst-italic">"{item.reason}"</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>

                              <div className="text-secondary small mt-1" style={{ fontSize: "0.8rem" }}>
                                Resolved on: <span className="fw-medium text-dark">{resolvedDateStr}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center gap-1 flex-shrink-0"
                              onClick={() => {
                                const studentId = item.student?.id || item.studentId || item.student;
                                if (studentId) {
                                  setHistoryModalOpen(false);
                                  handleViewDetails(studentId);
                                }
                              }}
                            >
                              <Eye size={14} />
                              <span>View Student</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )}

        {/* DROP STUDENT CONFIRMATION MODAL */}
        {dropModalOpen && droppingStudent &&
          createPortal(
            <div
              className="students-modal-backdrop"
              style={{
                ...backdropBlurStyle,
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 2050,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "clamp(0.75rem, 3vw, 1.5rem)",
                overflowY: "auto",
              }}
              onClick={() => !dropping && setDropModalOpen(false)}
            >
              <div
                className="students-modal-card p-3 p-sm-4 shadow-lg"
                style={{
                  maxWidth: "480px",
                  width: "100%",
                  maxHeight: "85vh",
                  overflowY: "auto",
                  borderRadius: "0.75rem",
                  backgroundColor: "#fff",
                  margin: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2 text-danger">
                    <AlertTriangle size={22} className="flex-shrink-0" />
                    <h5 className="mb-0 fw-bold fs-6 fs-sm-5">Mark Student as Dropped</h5>
                  </div>
                  <button
                    type="button"
                    className="app-icon-btn app-icon-btn-sm"
                    onClick={() => setDropModalOpen(false)}
                    disabled={dropping}
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-muted small mb-3">
                  You are about to drop <span className="fw-semibold text-dark">{droppingStudent.name}</span> ({droppingStudent.email}). Their portal account will be deactivated and an email notification detailing the reason will be sent.
                </p>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    Reason for Dropping <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter reason for dropping (required)..."
                    value={dropReason}
                    onChange={(e) => setDropReason(e.target.value)}
                    disabled={dropping}
                  />
                  {!dropReason.trim() && (
                    <div className="text-danger mt-1" style={{ fontSize: "11px" }}>
                      Reason is required to submit drop request.
                    </div>
                  )}
                </div>

                <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light border w-100 w-sm-auto"
                    onClick={() => setDropModalOpen(false)}
                    disabled={dropping}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger d-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto"
                    onClick={handleConfirmDrop}
                    disabled={dropping || !dropReason.trim()}
                  >
                    {dropping ? "Processing..." : "Confirm & Send Email"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}

        {/* EXPORT OPTIONS MODAL */}
        {exportModalOpen &&
          createPortal(
            <div
              className="registrar-export-modal-backdrop"
              style={{ ...backdropBlurStyle, zIndex: 1050 }}
              onClick={(e) => {
                if (e.target === e.currentTarget)
                  handleAttemptCloseExportModal();
              }}
            >
              <div
                className="registrar-export-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="registrar-export-modal-header">
                  <div className="d-flex align-items-center gap-2">
                    <div className="registrar-export-modal-icon">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold">Export Student Records</h5>
                      <p className="text-muted mb-0">
                        Choose which student records you want to export.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="app-icon-btn app-icon-btn-sm"
                    onClick={handleAttemptCloseExportModal}
                    disabled={exporting}
                    aria-label="Close"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="registrar-export-modal-body">
                  <div className="registrar-export-options">
                    <button
                      type="button"
                      className={`registrar-export-option ${
                        selectedExportStatus === "All" ? "active" : ""
                      }`}
                      onClick={() => setSelectedExportStatus("All")}
                      disabled={exporting}
                    >
                      <div className="fw-semibold">All Listed Students</div>
                      <div className="text-muted small">
                        Export all students currently shown in the list
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`registrar-export-option ${
                        selectedExportStatus === "Active" ? "active" : ""
                      }`}
                      onClick={() => setSelectedExportStatus("Active")}
                      disabled={exporting}
                    >
                      <div className="fw-semibold">Active Students</div>
                      <div className="text-muted small">
                        Export only active students from the current list
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`registrar-export-option ${
                        selectedExportStatus === "Dropped" ? "active" : ""
                      }`}
                      onClick={() => setSelectedExportStatus("Dropped")}
                      disabled={exporting}
                    >
                      <div className="fw-semibold">Dropped Students</div>
                      <div className="text-muted small">
                        Export only dropped students from the current list
                      </div>
                    </button>
                  </div>
                </div>

                <div className="registrar-export-modal-footer">
                  <button
                    type="button"
                    className="btn btn-light border"
                    onClick={handleAttemptCloseExportModal}
                    disabled={exporting}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleOpenConfirmExport}
                    disabled={exporting || !selectedExportStatus}
                  >
                    <Download size={16} />
                    Export Records
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}

        {/* CONFIRM EXPORT MODAL */}
        {confirmModalOpen &&
          createPortal(
            <div
              className="registrar-confirm-backdrop"
              style={{ ...backdropBlurStyle, zIndex: 2000 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) handleCloseConfirmModal();
              }}
            >
              <div
                className="registrar-confirm-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="registrar-confirm-header">
                  <div className="registrar-confirm-title">Confirm Export</div>

                  <button
                    type="button"
                    className="app-icon-btn app-icon-btn-sm"
                    onClick={handleCloseConfirmModal}
                    disabled={exporting}
                    aria-label="Close"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="registrar-confirm-body">
                  <div className="registrar-confirm-icon">
                    <TriangleAlert size={22} />
                  </div>

                  <p className="text-muted text-center mb-0">
                    Are you sure you want to export{" "}
                    <span className="fw-semibold">{selectedExportStatus}</span>{" "}
                    student records as a CSV file?
                  </p>
                </div>

                <div className="registrar-confirm-actions">
                  <button
                    type="button"
                    className="btn btn-light border"
                    onClick={handleCloseConfirmModal}
                    disabled={exporting}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleDownloadExport}
                    disabled={exporting}
                  >
                    <Download size={16} />
                    {exporting ? "Exporting..." : "Yes, Export"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}

        {/* EXIT CONFIRMATION MODAL */}
        {exitConfirmModalOpen &&
          createPortal(
            <div
              className="registrar-confirm-backdrop"
              style={{ ...backdropBlurStyle, zIndex: 2010 }}
              onClick={(e) => {
                if (e.target === e.currentTarget && !exporting) {
                  setExitConfirmModalOpen(false);
                }
              }}
            >
              <div
                className="registrar-confirm-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="registrar-confirm-header">
                  <div className="registrar-confirm-title">Cancel Export?</div>

                  <button
                    type="button"
                    className="app-icon-btn app-icon-btn-sm"
                    onClick={() => setExitConfirmModalOpen(false)}
                    disabled={exporting}
                    aria-label="Close"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="registrar-confirm-body">
                  <div className="registrar-confirm-icon bg-warning-subtle text-warning">
                    <AlertTriangle size={22} />
                  </div>

                  <p className="text-muted text-center mb-0">
                    Are you sure you want to exit? Your selected export options
                    will be cleared.
                  </p>
                </div>

                <div className="registrar-confirm-actions">
                  <button
                    type="button"
                    className="btn btn-light border"
                    onClick={() => setExitConfirmModalOpen(false)}
                    disabled={exporting}
                  >
                    Continue Export
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleConfirmExitExport}
                    disabled={exporting}
                  >
                    Discard & Exit
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </>
  );
}