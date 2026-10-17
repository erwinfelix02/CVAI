// ✅ src/pages/DepartmentHead/DepartmentHeadStudentsPage.tsx

import { useState, useMemo, useEffect } from "react";
import type { DepartmentStudent } from "../../components/DepartmentHead/Students/departmentStudent";
import { StudentFilters } from "../../components/DepartmentHead/Students/StudentFilters";
import { StudentTable } from "../../components/DepartmentHead/Students/StudentTable";
import {
  Users,
  UserCheck,
  AlertTriangle,
  ArrowRightLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  BookOpen,
  History,
  Clock,
  CheckCircle2,
  RotateCcw,
  Download,
} from "lucide-react";
import { API_BASE_URL } from "../../config";
import AuthAlert from "../../components/Authentication/AuthAlert";

export default function DepartmentHeadStudentsPage() {
  const [students, setStudents] = useState<DepartmentStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState("All");

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [showAlert, setShowAlert] = useState(false);

  const triggerAlert = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [studentToView, setStudentToView] = useState<DepartmentStudent | null>(
    null,
  );

  const [showDropModal, setShowDropModal] = useState(false);
  const [studentToDrop, setStudentToDrop] = useState<DepartmentStudent | null>(
    null,
  );
  const [dropReason, setDropReason] = useState("");

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [studentToTransfer, setStudentToTransfer] =
    useState<DepartmentStudent | null>(null);
  const [transferType, setTransferType] = useState<"internal" | "external">(
    "internal",
  );
  const [targetCourse, setTargetCourse] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("");
  const [transferReason, setTransferReason] = useState("");

  // Requests History Modal State (Unified for Transfers & Drops)
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [transferHistory, setTransferHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [departmentCourses, setDepartmentCourses] = useState<any[]>([]);
  const [allActiveCourses, setAllActiveCourses] = useState<any[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>(
    [],
  );

  const fetchTransferHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch(`${API_BASE_URL}/transfers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token") || ""}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTransferHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch request history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const fetchDepartmentStudents = async () => {
      let userDepartment = "";
      try {
        const storedUser =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          userDepartment = parsed.department || "";
        }
      } catch (e) {
        console.error("Error reading user session", e);
      }

      try {
        setLoading(true);
        const studentUrl = userDepartment
          ? `${API_BASE_URL}/students?department=${encodeURIComponent(userDepartment)}`
          : `${API_BASE_URL}/students`;

        const response = await fetch(studentUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token") || ""}`,
          },
        });

        if (!response.ok)
          throw new Error("Failed to fetch department students");

        const data = await response.json();

        if (Array.isArray(data)) {
          const mappedStudents: DepartmentStudent[] = data.map((st: any) => {
            const rawBirthdate = st.birthdate || st.birthDate;
            const formattedBirthdate = rawBirthdate
              ? new Date(rawBirthdate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A";

            const rawSection = st.section ? st.section.trim() : "";
            const finalSection =
              rawSection && rawSection !== "" && rawSection !== "—"
                ? rawSection
                : "Unassigned";

            return {
              id: st.id || st._id,
              name: st.name || st.fullName || "Unnamed Student",
              studentNo: st.studentNo || st.studentIdNumber || st.id || "—",
              year: st.year || st.yearLevel || 1,
              status:
                st.status === "good" ? "Enrolled" : st.status || "Enrolled",
              workflowState: st.workflowState || "None",
              course: st.program || st.course || "—",
              section: finalSection,
              email: st.email || "",
              phone: st.phone || "",
              address: st.address || "N/A",
              birthdate: formattedBirthdate,
              guardian: st.guardian || st.emergencyContact || "Not Specified",
            };
          });
          setStudents(mappedStudents);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentStudents();
    fetchTransferHistory();
  }, []);

  const years = useMemo(
    () =>
      Array.from(
        new Set(students.map((s) => s.year?.toString() || "1")),
      ).sort(),
    [students],
  );

  const sections = useMemo(() => {
    return Array.from(
      new Set(
        students
          .map((s) => s.section)
          .filter(
            (sec) =>
              sec && sec !== "—" && sec !== "Unassigned" && sec.trim() !== "",
          ),
      ),
    ).sort();
  }, [students]);

  const courses = useMemo(
    () =>
      Array.from(
        new Set(students.map((s) => s.course).filter((c) => c && c !== "—")),
      ).sort(),
    [students],
  );

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesYear =
        selectedYear === "All" || student.year?.toString() === selectedYear;
      
      const matchesSection =
        selectedSection === "All" || student.section === selectedSection;

      const matchesCourse =
        selectedCourse === "All" || student.course === selectedCourse;

      let matchesStatus = true;
      if (selectedStatus !== "All") {
        if (selectedStatus === "Unassigned") {
          matchesStatus = student.section === "Unassigned" || !student.section;
        } else if (selectedStatus === "Drop Requested" || selectedStatus === "Transfer Pending") {
          matchesStatus = student.workflowState === selectedStatus;
        } else {
          matchesStatus = student.status === selectedStatus && student.workflowState === "None";
        }
      }

      return (
        matchesSearch &&
        matchesYear &&
        matchesSection &&
        matchesStatus &&
        matchesCourse
      );
    });
  }, [
    students,
    searchTerm,
    selectedYear,
    selectedSection,
    selectedStatus,
    selectedCourse,
  ]);

  const totalStudentsCount = students.length;
  
  const enrolledInSectionCount = students.filter(
    (s) =>
      s.section &&
      s.section !== "Unassigned" &&
      s.section !== "" &&
      s.section.trim() !== "—",
  ).length;

  const approvedTransferCount = transferHistory.filter(
    (h) => h.status === "Approved",
  ).length;
  const returnedTransferCount = transferHistory.filter(
    (h) => h.status === "Returned",
  ).length;
  const pendingTransferCount = transferHistory.filter(
    (h) => h.status === "Pending",
  ).length;

  const handleViewStudent = (student: DepartmentStudent) => {
    setStudentToView(student);
    setShowViewModal(true);
  };

  const handleOpenDropModal = (student: DepartmentStudent) => {
    setStudentToDrop(student);
    setDropReason("");
    setShowDropModal(true);
  };

  const handleConfirmDropRequest = async () => {
    if (!studentToDrop) return;
    if (!dropReason.trim()) {
      triggerAlert("Please provide a reason for the drop request.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/students/${studentToDrop.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            section: "",
            workflowState: "Drop Requested",
            reason: dropReason.trim(),
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to submit drop request");

      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentToDrop.id
            ? { ...s, workflowState: "Drop Requested", section: "Unassigned" }
            : s,
        ),
      );
      setShowDropModal(false);
      setStudentToDrop(null);
      setDropReason("");
      fetchTransferHistory();
      triggerAlert(
        `Drop request submitted to Registrar for ${studentToDrop.name}. Section has been unassigned.`,
        "success",
      );
    } catch (err: any) {
      triggerAlert(err.message || "Error processing drop request.", "error");
    }
  };

  const handleOpenTransferModal = async (student: DepartmentStudent) => {
    setStudentToTransfer(student);
    setTransferType("internal");
    setTargetDepartment("");
    setTransferReason("");

    let userDepartment = "";
    try {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userDepartment = parsed.department || "";
      }
    } catch (e) {
      console.error("Error reading user session", e);
    }

    try {
      const resCourses = await fetch(
        `${API_BASE_URL}/courses?department=${encodeURIComponent(userDepartment)}&status=Active`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token") || ""}`,
          },
        },
      );
      if (resCourses.ok) {
        const coursesData = await resCourses.json();
        setDepartmentCourses(coursesData);

        const availableInternal = coursesData.filter((crs: any) => {
          const fullName = `${crs.code} ${crs.name}`.toLowerCase();
          const current = student.course.toLowerCase();
          return (
            !fullName.includes(current) &&
            current !== crs.code.toLowerCase() &&
            current !== crs.name.toLowerCase()
          );
        });

        if (availableInternal.length > 0) {
          setTargetCourse(availableInternal[0].name);
        } else {
          setTargetCourse("");
        }
      }

      const resAllCourses = await fetch(
        `${API_BASE_URL}/courses?status=Active`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token") || ""}`,
          },
        },
      );
      if (resAllCourses.ok) {
        const allCourses = await resAllCourses.json();
        setAllActiveCourses(allCourses);

        const uniqueDepts = Array.from(
          new Set(
            allCourses
              .map((c: any) => c.department)
              .filter(
                (d: string) =>
                  d &&
                  d.toLowerCase() !== userDepartment.toLowerCase() &&
                  d.toLowerCase() !== student.course.toLowerCase(),
              ),
          ),
        ) as string[];

        setAvailableDepartments(uniqueDepts);
        if (uniqueDepts.length > 0) {
          setTargetDepartment(uniqueDepts[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch transfer data:", err);
    }

    setShowTransferModal(true);
  };

  const handleConfirmTransferRequest = async () => {
    if (!studentToTransfer) return;
    if (!transferReason.trim()) {
      triggerAlert("Please provide a reason for the program transfer.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/transfers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          studentId: studentToTransfer.id,
          transferType,
          targetCourse,
          targetDepartment:
            transferType === "external"
              ? targetDepartment
              : studentToTransfer.course,
          reason: transferReason.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to submit transfer request");
      }

      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentToTransfer.id
            ? { ...s, workflowState: "Transfer Pending", section: "Unassigned" }
            : s,
        ),
      );

      setShowTransferModal(false);
      setStudentToTransfer(null);
      setTransferReason("");
      fetchTransferHistory();
      triggerAlert(
        "Transfer request submitted successfully. Student section updated to Transfer Pending.",
        "success",
      );
    } catch (error: any) {
      console.error("Error submitting transfer request:", error);
      triggerAlert(
        error.message || "Error processing transfer request.",
        "error",
      );
    }
  };

  const handleExportHistory = () => {
    if (transferHistory.length === 0) {
      triggerAlert("No request history records to export.", "error");
      return;
    }

    try {
      const headers = ["Student Name", "Request Type", "Transfer Type", "Target Course / Reason", "Department", "Status"];
      const csvRows = [headers.join(",")];

      transferHistory.forEach((item) => {
        const studentName = `"${(item.studentName || item.student?.name || "Student").replace(/"/g, '""')}"`;
        const reqType = item.requestType === "drop" ? "Official Drop" : "Transfer";
        const transferType = `"${(item.transferType || "N/A").replace(/"/g, '""')}"`;
        const targetOrReason = `"${(item.requestType === 'drop' ? item.reason : item.targetCourse || "").replace(/"/g, '""')}"`;
        const dept = `"${(item.requestType === 'drop' ? "Registrar Drop Request" : item.targetDepartment || "").replace(/"/g, '""')}"`;
        const status = `"${(item.status || "").replace(/"/g, '""')}"`;

        csvRows.push([studentName, reqType, transferType, targetOrReason, dept, status].join(","));
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

      triggerAlert("Requests history exported successfully.", "success");
    } catch (err) {
      console.error("Failed to export requests history", err);
      triggerAlert("Failed to export requests history.", "error");
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4 bg-light min-vh-100">
      <div className="mx-auto" style={{ maxWidth: "1200px" }}>
        {showAlert && (
          <div className="mb-3">
            <AuthAlert
              message={alertMessage}
              type={alertType}
              visible={showAlert}
            />
          </div>
        )}

        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Department Students</h2>
            <p className="text-muted small mb-0">
              View students enrolled in your department and manage academic
              workflows
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="bg-white px-3 py-2 rounded-3 border shadow-sm d-flex align-items-center gap-2 small fw-medium text-secondary">
              <Users size={16} className="text-primary" />
              <span>{totalStudentsCount} total</span>
            </div>
            <div className="bg-dark text-white px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2 small fw-medium">
              <UserCheck size={16} className="text-info" />
              <span>{enrolledInSectionCount} enrolled in sections</span>
            </div>

            <button
              type="button"
              className="btn btn-sm px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2 bg-white text-primary border border-primary fw-medium"
              onClick={() => {
                fetchTransferHistory();
                setShowHistoryModal(true);
              }}
            >
              <History size={16} />
              <span>Requests History</span>
              <span className="badge bg-primary text-white rounded-pill ms-1">
                {pendingTransferCount +
                  approvedTransferCount +
                  returnedTransferCount}
              </span>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <StudentFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            selectedSection={selectedSection}
            onSectionChange={setSelectedSection}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedCourse={selectedCourse}
            onCourseChange={setSelectedCourse}
            years={years}
            sections={sections}
            courses={courses}
          />
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <StudentTable
            students={filteredStudents}
            onViewStudent={handleViewStudent}
            onRequestDrop={handleOpenDropModal}
            onRequestTransfer={handleOpenTransferModal}
          />
        )}
      </div>

      {/* Requests History Modal (Unified for Transfers & Drops) */}
      {showHistoryModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content border-0 shadow-lg rounded-4 overflow-hidden"
              style={{ maxHeight: "85vh", display: "flex", flexDirection: "column" }}
            >
              <div className="modal-header border-bottom px-4 py-3 bg-white">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center">
                    <History size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0 fs-5">
                      Requests History
                    </h5>
                    <p className="text-muted small mb-0">
                      Track status updates, returns, and approvals for department
                      transfers and drops
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setShowHistoryModal(false)}
                />
              </div>

              <div
                className="modal-body p-4 bg-light"
                style={{ overflowY: "auto", flex: 1 }}
              >
                <div className="row g-3 mb-3">
                  <div className="col-4">
                    <div className="bg-white p-3 rounded-3 border shadow-sm text-center">
                      <span className="text-muted small d-block mb-1">
                        Approved
                      </span>
                      <span className="fs-4 fw-bold text-success d-flex align-items-center justify-content-center gap-1">
                        <CheckCircle2 size={18} /> {approvedTransferCount}
                      </span>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="bg-white p-3 rounded-3 border shadow-sm text-center">
                      <span className="text-muted small d-block mb-1">
                        Returned / Revision
                      </span>
                      <span className="fs-4 fw-bold text-danger d-flex align-items-center justify-content-center gap-1">
                        <RotateCcw size={18} /> {returnedTransferCount}
                      </span>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="bg-white p-3 rounded-3 border shadow-sm text-center">
                      <span className="text-muted small d-block mb-1">
                        Pending Review
                      </span>
                      <span className="fs-4 fw-bold text-warning d-flex align-items-center justify-content-center gap-1">
                        <Clock size={18} /> {pendingTransferCount}
                      </span>
                    </div>
                  </div>
                </div>

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

                {historyLoading ? (
                  <div className="text-center py-5">
                    <div
                      className="spinner-border text-primary spinner-border-sm"
                      role="status"
                    />
                  </div>
                ) : transferHistory.length === 0 ? (
                  <div className="text-center py-5 bg-white rounded-3 border p-4">
                    <p className="text-muted mb-0 small">
                      No request history records found for this department.
                    </p>
                  </div>
                ) : (
                  <div
                    className="bg-white rounded-3 border shadow-sm overflow-hidden"
                    style={{ maxHeight: "320px", overflowY: "auto" }}
                  >
                    <table className="table align-middle mb-0 small">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th className="py-3 px-3">Student</th>
                          <th className="py-3">Request Type</th>
                          <th className="py-3">Details / Target</th>
                          <th className="py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transferHistory.map((req) => {
                          const studentName =
                            req.studentName ||
                            req.student?.fullName ||
                            req.student?.name ||
                            "Student";
                          const statusClass =
                            req.status === "Approved"
                              ? "bg-success-subtle text-success"
                              : req.status === "Returned"
                              ? "bg-danger-subtle text-danger"
                              : "bg-warning-subtle text-warning-emphasis";

                          return (
                            <tr key={req.id || req._id}>
                              <td className="px-3">
                                <div className="fw-semibold text-dark">
                                  {studentName}
                                </div>
                                <div
                                  className="text-muted"
                                  style={{ fontSize: "11px" }}
                                >
                                  {req.currentCourse}
                                </div>
                              </td>
                              <td className="text-capitalize">
                                <span className={`badge ${req.requestType === 'drop' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                                  {req.requestType === 'drop' ? 'Official Drop' : `Transfer (${req.transferType})`}
                                </span>
                              </td>
                              <td>
                                <div className="fw-medium text-primary">
                                  {req.requestType === 'drop' ? req.reason : req.targetCourse}
                                </div>
                                <div
                                  className="text-muted"
                                  style={{ fontSize: "11px" }}
                                >
                                  {req.requestType === 'drop' ? 'Registrar Drop Request' : req.targetDepartment}
                                </div>
                              </td>
                              <td>
                                <span
                                  className={`badge px-2 py-1 ${statusClass}`}
                                >
                                  {req.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top px-4 py-3 bg-white">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-4 rounded-3 shadow-none"
                  onClick={() => setShowHistoryModal(false)}
                >
                  Close History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Student Details Modal */}
      {showViewModal && studentToView && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-bottom px-4 py-3 bg-white">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center">
                    <User size={22} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0 fs-5">
                      Student Information Profile
                    </h5>
                    <p className="text-muted small mb-0">
                      Detailed academic and personal records
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setShowViewModal(false)}
                />
              </div>

              <div className="modal-body p-4 bg-light">
                <div className="bg-white p-4 rounded-4 border shadow-sm mb-3">
                  <div className="d-flex flex-column flex-sm-row align-items-center gap-3 text-center text-sm-start">
                    <div
                      className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold fs-3 border border-primary-subtle"
                      style={{
                        width: "70px",
                        height: "70px",
                        minWidth: "70px",
                      }}
                    >
                      {studentToView.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="fw-bold text-dark mb-1">
                        {studentToView.name}
                      </h4>
                      <div className="text-muted small mb-2">
                        Student No:{" "}
                        <span className="fw-semibold text-dark">
                          {studentToView.studentNo}
                        </span>
                      </div>
                      <div className="d-flex flex-wrap justify-content-center justify-content-sm-start gap-2">
                        <span className="badge bg-primary-subtle text-primary fw-medium px-2 py-1">
                          {studentToView.course}
                        </span>
                        <span className="badge bg-light text-secondary border px-2 py-1">
                          Year {studentToView.year} {studentToView.section}
                        </span>
                        <span className="badge bg-success-subtle text-success fw-medium px-2 py-1">
                          {studentToView.status}
                        </span>
                        {studentToView.workflowState &&
                          studentToView.workflowState !== "None" && (
                            <span className="badge bg-warning-subtle text-warning fw-semibold px-2 py-1">
                              {studentToView.workflowState}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="bg-white p-3 rounded-4 border h-100 shadow-sm">
                      <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2">
                        <BookOpen size={16} className="me-2 text-primary" />{" "}
                        Contact Details
                      </h6>
                      <div className="mb-2">
                        <span className="text-muted small d-block">
                          Email Address
                        </span>
                        <span className="fw-medium text-dark d-flex align-items-center gap-2 mt-1">
                          <Mail size={15} className="text-muted" />{" "}
                          {studentToView.email || "N/A"}
                        </span>
                      </div>
                      <div className="mt-3">
                        <span className="text-muted small d-block">
                          Phone Number
                        </span>
                        <span className="fw-medium text-dark d-flex align-items-center gap-2 mt-1">
                          <Phone size={15} className="text-muted" />{" "}
                          {studentToView.phone || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="bg-white p-3 rounded-4 border h-100 shadow-sm">
                      <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2">
                        <MapPin size={16} className="me-2 text-primary" />{" "}
                        Personal Information
                      </h6>
                      <div className="mb-2">
                        <span className="text-muted small d-block">
                          Residential Address
                        </span>
                        <span className="fw-medium text-dark d-flex align-items-center gap-2 mt-1">
                          <MapPin size={15} className="text-muted" />{" "}
                          {studentToView.address || "N/A"}
                        </span>
                      </div>
                      <div className="mt-3">
                        <span className="text-muted small d-block">
                          Birthdate
                        </span>
                        <span className="fw-medium text-dark d-flex align-items-center gap-2 mt-1">
                          <Calendar size={15} className="text-muted" />{" "}
                          {studentToView.birthdate || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top px-4 py-3 bg-white">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-4 rounded-3 shadow-none"
                  onClick={() => setShowViewModal(false)}
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Drop Modal */}
      {showDropModal && studentToDrop && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                  <AlertTriangle size={20} /> Request Official Drop
                </h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setShowDropModal(false)}
                />
              </div>
              <div className="modal-body py-3">
                <p className="text-muted small mb-3">
                  You are submitting a formal request to the Registrar's Office
                  to drop <strong>{studentToDrop.name}</strong> (
                  {studentToDrop.studentNo}). This will clear their section
                  assignment.
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">
                    Reason for Drop Request <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control rounded-3 shadow-none"
                    rows={3}
                    placeholder="Provide a valid reason (required)..."
                    value={dropReason}
                    onChange={(e) => setDropReason(e.target.value)}
                  />
                  {!dropReason.trim() && (
                    <div className="text-danger" style={{ fontSize: "11px" }}>
                      Reason is required to submit.
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light btn-sm px-3 rounded-3"
                  onClick={() => setShowDropModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-3 rounded-3"
                  disabled={!dropReason.trim()}
                  onClick={handleConfirmDropRequest}
                >
                  Submit Drop Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Program Transfer Modal */}
      {showTransferModal && studentToTransfer && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-bottom px-4 py-3 bg-white">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center">
                    <ArrowRightLeft size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0 fs-5">
                      Request Program Transfer
                    </h5>
                    <p className="text-muted small mb-0">
                      Shift student to a new curriculum path
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setShowTransferModal(false)}
                />
              </div>

              <div className="modal-body p-4 bg-white">
                <div className="p-3 bg-light rounded-3 border mb-3">
                  <span className="d-block text-muted small mb-1">
                    Student Record
                  </span>
                  <div className="fw-semibold text-dark">
                    {studentToTransfer.name}{" "}
                    <span className="text-muted fw-normal">
                      ({studentToTransfer.studentNo})
                    </span>
                  </div>
                  <div className="text-muted small mt-1">
                    Current Program:{" "}
                    <span className="badge bg-primary-subtle text-primary fw-medium px-2 py-1">
                      {studentToTransfer.course}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    className="form-label small fw-bold text-uppercase text-secondary mb-1"
                    style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                  >
                    Reason for Program Transfer <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control rounded-3 shadow-none"
                    rows={2}
                    placeholder="Provide reason for transfer (required)..."
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                  />
                  {!transferReason.trim() && (
                    <div className="text-danger" style={{ fontSize: "11px" }}>
                      Reason is required to submit.
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    className="form-label small fw-bold text-uppercase text-secondary mb-2"
                    style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                  >
                    Transfer Destination Type
                  </label>
                  <div className="row g-2">
                    <div className="col-6">
                      <div
                        onClick={() => {
                          setTransferType("internal");
                          const availableInternal = departmentCourses.filter(
                            (crs: any) => {
                              const fullName =
                                `${crs.code} ${crs.name}`.toLowerCase();
                              const current =
                                studentToTransfer.course.toLowerCase();
                              return (
                                !fullName.includes(current) &&
                                current !== crs.code.toLowerCase() &&
                                current !== crs.name.toLowerCase()
                              );
                            },
                          );
                          if (availableInternal.length > 0) {
                            setTargetCourse(availableInternal[0].name);
                          } else {
                            setTargetCourse("");
                          }
                        }}
                        className={`p-3 rounded-3 border transition-all ${transferType === "internal" ? "border-primary bg-primary-subtle bg-opacity-10 text-primary fw-semibold" : "border-light bg-light text-secondary"}`}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="form-check mb-1">
                          <input
                            className="form-check-input shadow-none"
                            type="radio"
                            name="transferType"
                            checked={transferType === "internal"}
                            onChange={() => setTransferType("internal")}
                          />
                          <label className="form-check-label small fw-semibold text-dark">
                            Internal Shift
                          </label>
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          Within your department
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div
                        onClick={() => {
                          setTransferType("external");
                          if (availableDepartments.length > 0) {
                            const firstDept = availableDepartments[0];
                            setTargetDepartment(firstDept);
                            const firstDeptCourses = allActiveCourses.filter(
                              (c: any) => c.department === firstDept,
                            );
                            if (firstDeptCourses.length > 0) {
                              setTargetCourse(firstDeptCourses[0].name);
                            } else {
                              setTargetCourse("");
                            }
                          }
                        }}
                        className={`p-3 rounded-3 border transition-all ${transferType === "external" ? "border-primary bg-primary-subtle bg-opacity-10 text-primary fw-semibold" : "border-light bg-light text-secondary"}`}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="form-check mb-1">
                          <input
                            className="form-check-input shadow-none"
                            type="radio"
                            name="transferType"
                            checked={transferType === "external"}
                            onChange={() => setTransferType("external")}
                          />
                          <label className="form-check-label small fw-semibold text-dark">
                            External Transfer
                          </label>
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          To another department
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {transferType === "internal" ? (
                  <div className="mb-3">
                    <label
                      className="form-label small fw-bold text-uppercase text-secondary mb-1"
                      style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                    >
                      Target Program / Course
                    </label>
                    <select
                      className="form-select rounded-3 shadow-none py-2"
                      value={targetCourse}
                      onChange={(e) => setTargetCourse(e.target.value)}
                    >
                      {departmentCourses.filter((crs) => {
                        const fullName = `${crs.code} ${crs.name}`.toLowerCase();
                        const current = studentToTransfer.course.toLowerCase();
                        return (
                          !fullName.includes(current) &&
                          current !== crs.code.toLowerCase() &&
                          current !== crs.name.toLowerCase()
                        );
                      }).length > 0 ? (
                        departmentCourses
                          .filter((crs) => {
                            const fullName =
                              `${crs.code} ${crs.name}`.toLowerCase();
                            const current =
                              studentToTransfer.course.toLowerCase();
                            return (
                              !fullName.includes(current) &&
                              current !== crs.code.toLowerCase() &&
                              current !== crs.name.toLowerCase()
                            );
                          })
                          .map((crs) => (
                            <option key={crs.id || crs._id} value={crs.name}>
                              {crs.name}
                            </option>
                          ))
                      ) : (
                        <option value="" disabled>
                          No other active programs available in this department
                        </option>
                      )}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <label
                        className="form-label small fw-bold text-uppercase text-secondary mb-1"
                        style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                      >
                        Target Receiving Department
                      </label>
                      <select
                        className="form-select rounded-3 shadow-none py-2"
                        value={targetDepartment}
                        onChange={(e) => {
                          const selectedDept = e.target.value;
                          setTargetDepartment(selectedDept);
                          const deptCourses = allActiveCourses.filter(
                            (c: any) => c.department === selectedDept,
                          );
                          if (deptCourses.length > 0) {
                            setTargetCourse(deptCourses[0].name);
                          } else {
                            setTargetCourse("");
                          }
                        }}
                      >
                        {availableDepartments.map((dept, idx) => (
                          <option key={idx} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label
                        className="form-label small fw-bold text-uppercase text-secondary mb-1"
                        style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                      >
                        New Degree Program Name
                      </label>
                      <select
                        className="form-select rounded-3 shadow-none py-2"
                        value={targetCourse}
                        onChange={(e) => setTargetCourse(e.target.value)}
                      >
                        {allActiveCourses.filter(
                          (c: any) => c.department === targetDepartment,
                        ).length > 0 ? (
                          allActiveCourses
                            .filter(
                              (c: any) => c.department === targetDepartment,
                            )
                            .map((crs) => (
                              <option key={crs.id || crs._id} value={crs.name}>
                                {crs.name}
                              </option>
                            ))
                        ) : (
                          <option value="" disabled>
                            No active programs found for this department
                          </option>
                        )}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer border-top px-4 py-3 bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-4 rounded-3 shadow-none"
                  onClick={() => setShowTransferModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm px-4 rounded-3 shadow-sm"
                  disabled={!transferReason.trim()}
                  onClick={handleConfirmTransferRequest}
                >
                  Submit Transfer Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}