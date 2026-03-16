import { useEffect, useMemo, useState } from "react";
import { Download, X, FileSpreadsheet, TriangleAlert } from "lucide-react";
import {
  getStudentById,
  getStudentRecords,
  updateStudentInfo,
} from "../../api/studentService";
import { getCourses } from "../../api/courseService";
import { getDepartments } from "../../api/departmentService";

import RecordsHeader from "../../components/Registrar/Records/RecordsHeader";
import RecordsStats from "../../components/Registrar/Records/RecordsStats";
import RecordsFilters from "../../components/Registrar/Records/RecordsFilters";
import StudentsTable from "../../components/Registrar/Records/StudentsTable";
import StudentDetailsModal from "../../components/Registrar/Records/StudentDetailsModal";
import EditStudentInfoModal from "../../components/Registrar/Records/EditStudentInfoModal";
import AuthAlert from "../../components/Authentication/AuthAlert";

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

  gpa?: string;
};

type ExportStatus = "All" | "Active" | "Dropped" | "Graduated";

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

const API_BASE_URL = "http://localhost:5000/api";

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

  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<
    DepartmentOption[]
  >([]);

  const [registrarAccount, setRegistrarAccount] =
    useState<RegistrarAccount | null>(null);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedExportStatus, setSelectedExportStatus] =
    useState<ExportStatus>("All");

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

  const load = async () => {
    try {
      setLoading(true);

      const data = await getStudentRecords({
        q: query.trim(),
        status,
        course,
        year,
        section,
      });

      setRows(data);
    } catch (e: any) {
      console.error(e);
      setRows([]);
      showAlert(e?.message || "Failed to load student records.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadEditOptions = async () => {
    try {
      const [coursesData, departmentsData] = await Promise.all([
        getCourses(),
        getDepartments(),
      ]);

      const mappedCourses: CourseOption[] = (
        Array.isArray(coursesData) ? coursesData : []
      )
        .map(
          (c: any): CourseOption => ({
            id: c._id,
            code: c.code,
            name: c.name,
            yearLevels: Number(c.yearLevels ?? 4),
            department: c.department,
            status: c.status === "Inactive" ? "Inactive" : "Active",
          }),
        )
        .filter((c) => c.status === "Active");

      const mappedDepartments: DepartmentOption[] = (
        Array.isArray(departmentsData) ? departmentsData : []
      )
        .map(
          (d: any): DepartmentOption => ({
            id: d._id,
            code: d.code,
            name: d.name,
            status: d.status === "Inactive" ? "Inactive" : "Active",
          }),
        )
        .filter((d) => d.status === "Active");

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
      const res = await fetch("http://localhost:5000/api/users/role/registrar", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setRegistrarAccount(null);
        return;
      }

      setRegistrarAccount(data || null);
    } catch (e) {
      console.error("Failed to load registrar account", e);
      setRegistrarAccount(null);
    }
  };

  useEffect(() => {
    load();
    loadEditOptions();
    loadRegistrarAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, course, year, section]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || exporting) return;

      if (confirmModalOpen) {
        setConfirmModalOpen(false);
        return;
      }

      if (exportModalOpen) {
        setExportModalOpen(false);
      }
    };

    if (exportModalOpen || confirmModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [exportModalOpen, confirmModalOpen, exporting]);

  const courses = useMemo<string[]>(() => {
    const values = rows
      .map((s) => s.course)
      .filter((value): value is string => Boolean(value) && value !== "—");

    return ["All", ...Array.from(new Set(values)).sort()];
  }, [rows]);

  const years = useMemo<Array<number | "All">>(() => {
    const values = rows
      .map((s) => s.year)
      .filter(
        (value): value is number =>
          typeof value === "number" && !Number.isNaN(value),
      );

    return ["All", ...Array.from(new Set(values)).sort((a, b) => a - b)];
  }, [rows]);

  const sections = useMemo<string[]>(() => {
    const values = rows
      .map((s) => s.section)
      .filter((value): value is string => Boolean(value) && value !== "—");

    return ["All", ...Array.from(new Set(values)).sort()];
  }, [rows]);

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((s) => s.status === "Active").length;
    const dropped = rows.filter((s) => s.status === "Dropped").length;
    const graduated = rows.filter((s) => s.status === "Graduated").length;

    return { total, active, dropped, graduated };
  }, [rows]);

  const handleViewDetails = async (id: string) => {
    try {
      const student = await getStudentById(id);
      setSelectedStudent(student);
      setDetailsOpen(true);
    } catch (err: any) {
      console.error(err);
      showAlert(err?.message || "Failed to fetch student details.", "error");
    }
  };

  const handleEditInfo = async (id: string) => {
    try {
      setEditLoading(true);
      const student = await getStudentById(id);
      setEditStudent(student);
      setEditOpen(true);
    } catch (err: any) {
      console.error(err);
      showAlert(err?.message || "Failed to fetch student details.", "error");
    } finally {
      setEditLoading(false);
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
  }) => {
    if (!editStudent) return;

    try {
      setEditLoading(true);

      await updateStudentInfo(editStudent.id, {
        email: payload.email,
        phone: payload.phone,
        guardian: payload.guardian,
        guardianPhone: payload.guardianPhone,
        birthdate: payload.birthdate,
        program: payload.course,
        yearLevel: payload.year,
        department: payload.department,
        updatedBy: registrarEmail,
      });

      await load();

      if (selectedStudent?.id === editStudent.id) {
        const refreshed = await getStudentById(editStudent.id);
        setSelectedStudent(refreshed);
      }

      setEditOpen(false);
      setEditStudent(null);

      showAlert("Student information updated successfully.", "success");
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

  const handleMarkDropped = (id: string) => {
    alert(`Mark as dropped for ${id}`);
  };

  const handleExport = () => {
    setSelectedExportStatus("All");
    setConfirmModalOpen(false);
    setExportModalOpen(true);
  };

  const handleOpenConfirm = () => {
    setConfirmModalOpen(true);
  };

  const handleCloseExportModal = () => {
    if (exporting) return;
    setExportModalOpen(false);
  };

  const handleCloseConfirmModal = () => {
    if (exporting) return;
    setConfirmModalOpen(false);
  };

  const handleDownloadExport = async () => {
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

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={loading || exporting || editLoading}
      />

      <div className="registrar-records">
        <RecordsHeader
          title="Student Records"
          subtitle="Manage and view all enrolled students"
          actionLabel={loading ? "Loading..." : "Export Records"}
          actionIcon={Download}
          onAction={handleExport}
        />

        <RecordsStats stats={stats} />

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

        <StudentsTable
          title={`Students (${rows.length})`}
          rows={rows}
          onViewDetails={handleViewDetails}
          onEditInfo={handleEditInfo}
          onMarkDropped={handleMarkDropped}
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
          }}
          student={editStudent}
          courseOptions={courseOptions}
          departmentOptions={departmentOptions}
          onSave={handleSaveEdit}
          loading={editLoading}
        />

        {exportModalOpen && (
          <div
            className="registrar-export-modal-backdrop"
            onClick={handleCloseExportModal}
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
                  className="registrar-export-modal-close"
                  onClick={handleCloseExportModal}
                  disabled={exporting}
                >
                  <X size={18} />
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

                  <button
                    type="button"
                    className={`registrar-export-option ${
                      selectedExportStatus === "Graduated" ? "active" : ""
                    }`}
                    onClick={() => setSelectedExportStatus("Graduated")}
                    disabled={exporting}
                  >
                    <div className="fw-semibold">Graduated Students</div>
                    <div className="text-muted small">
                      Export only graduated students from the current list
                    </div>
                  </button>
                </div>
              </div>

              <div className="registrar-export-modal-footer">
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={handleCloseExportModal}
                  disabled={exporting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={handleOpenConfirm}
                  disabled={exporting}
                >
                  <Download size={16} />
                  Export Records
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmModalOpen && (
          <div
            className="registrar-confirm-backdrop"
            onClick={handleCloseConfirmModal}
          >
            <div
              className="registrar-confirm-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="registrar-confirm-icon">
                <TriangleAlert size={22} />
              </div>

              <h5 className="fw-bold mb-2 text-center">Confirm Export</h5>

              <p className="text-muted text-center mb-0">
                Are you sure you want to export{" "}
                <span className="fw-semibold">{selectedExportStatus}</span>{" "}
                student records as a CSV file?
              </p>

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
          </div>
        )}
      </div>
    </>
  );
}