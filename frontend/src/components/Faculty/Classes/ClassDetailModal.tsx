import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import type { ClassItem } from "./types";

interface Student {
  id: string;
  name: string;
  studentId: string;
  yearLevel: string;
  attendance: number;
  status: "Enrolled" | "At Risk";
  quizzes: number;
  midterm: number;
  project: number;
  finals: number;
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
}

const MOCK_STUDENTS: Student[] = [
  { id: "1", name: "Ana Reyes", studentId: "2024-0001", yearLevel: "1st Year", attendance: 96, status: "Enrolled", quizzes: 95, midterm: 92, project: 94, finals: 90 },
  { id: "2", name: "Miguel Santos", studentId: "2024-0002", yearLevel: "1st Year", attendance: 88, status: "Enrolled", quizzes: 86, midterm: 84, project: 88, finals: 83 },
  { id: "3", name: "Liza Cruz", studentId: "2024-0003", yearLevel: "2nd Year", attendance: 74, status: "At Risk", quizzes: 72, midterm: 76, project: 80, finals: 74 },
  { id: "4", name: "Paolo Garcia", studentId: "2024-0004", yearLevel: "1st Year", attendance: 99, status: "Enrolled", quizzes: 98, midterm: 94, project: 96, finals: 93 },
  { id: "5", name: "Jenny Lim", studentId: "2024-0005", yearLevel: "2nd Year", attendance: 91, status: "Enrolled", quizzes: 89, midterm: 87, project: 90, finals: 86 },
];

export default function ClassDetailModal({ item, initialTab = "students", onClose }: ClassDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"students" | "materials" | "grades">(initialTab);
  const [searchTerm, setSearchTerm] = useState("");

  // Dynamic Course Materials State
  const [courseMaterials, setCourseMaterials] = useState<Material[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  /* =========================================================
     FETCH COURSE MATERIALS BASED ON SELECTED CLASS CODE
     ========================================================= */
  const fetchClassMaterials = useCallback(async () => {
    if (!item?.code && !item?.title) return;

    setIsLoadingMaterials(true);
    setMaterialsError(null);

    try {
      const token = localStorage.getItem("token");
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;

      const params = new URLSearchParams();
      // Match by course code or course title
      if (item.code) params.append("course", item.code);
      if (user?.id || user?._id) params.append("facultyId", user.id || user._id);
      if (user?.department) params.append("department", user.department);

      const res = await fetch(`/api/materials?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to load course materials.");
      }

      const data = await res.json();
      setCourseMaterials(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("fetchClassMaterials error:", err);
      setMaterialsError(err.message || "Failed to load materials.");
    } finally {
      setIsLoadingMaterials(false);
    }
  }, [item]);

  useEffect(() => {
    if (activeTab === "materials") {
      fetchClassMaterials();
    }
  }, [activeTab, fetchClassMaterials]);

  const filteredStudents = MOCK_STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAverage = (student: Student) => {
    return Math.round((student.quizzes + student.midterm + student.project + student.finals) / 4);
  };

  const overallClassAverage = Math.round(
    MOCK_STUDENTS.reduce((acc, curr) => acc + calculateAverage(curr), 0) / MOCK_STUDENTS.length
  );

  const handleDownload = async (material: Material) => {
    try {
      // Trigger download count increment
      await fetch(`/api/materials/${material.id}/download`, { method: "PATCH" });

      // Update local state download counter
      setCourseMaterials((prev) =>
        prev.map((m) => (m.id === material.id ? { ...m, downloads: m.downloads + 1 } : m))
      );

      // Open or download file URL
      if (material.filePath) {
        window.open(material.filePath, "_blank");
      }
    } catch (err) {
      console.error("Download trigger error:", err);
    }
  };

  return (
    <div
      className="modal fade show d-block tab-modal-backdrop"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(4px)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable px-2">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style={{ backgroundColor: "#FAFAFC" }}>
          
          {/* Header */}
          <div className="modal-header border-0 pb-0 pt-4 px-4 align-items-start justify-content-between">
            <div className="d-flex flex-column gap-1">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="badge rounded-pill bg-white border px-2 py-1 fw-bold fs-7" style={{ color: "#1E293B", borderColor: "#E2E8F0" }}>
                  {item.code}
                </span>
                <h4 className="fw-bold mb-0 fs-5" style={{ color: "#0F172A" }}>{item.title}</h4>
              </div>
              <p className="small mb-0" style={{ color: "#64748B" }}>
                {item.section} &bull; {item.schedule} &bull; {item.room}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-link p-1 border-0 shadow-none rounded-circle"
              style={{ color: "#64748B" }}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            
            {/* Segmented Navigation Tabs */}
            <div className="nav-tabs-wrapper p-1 rounded-3 mb-4" style={{ backgroundColor: "#F1F5F9" }}>
              <div className="row g-1 text-center">
                <div className="col-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("students")}
                    className={`btn w-100 py-2 border-0 rounded-2 fw-medium d-flex align-items-center justify-content-center gap-2 transition-all ${
                      activeTab === "students" ? "bg-white shadow-sm" : "hover-bg"
                    }`}
                    style={{ color: activeTab === "students" ? "#0F172A" : "#64748B" }}
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
                      activeTab === "materials" ? "bg-white shadow-sm" : "hover-bg"
                    }`}
                    style={{ color: activeTab === "materials" ? "#0F172A" : "#64748B" }}
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
                      activeTab === "grades" ? "bg-white shadow-sm" : "hover-bg"
                    }`}
                    style={{ color: activeTab === "grades" ? "#0F172A" : "#64748B" }}
                  >
                    <ClipboardList size={16} />
                    <span className="d-none d-sm-inline">Grades</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TAB 1: STUDENTS */}
            {activeTab === "students" && (
              <div className="tab-pane-content">
                <div className="position-relative mb-3">
                  <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: "#94A3B8" }} />
                  <input
                    type="text"
                    className="form-control ps-5 py-2 rounded-3 shadow-none bg-white"
                    style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
                    placeholder="Search student name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="d-flex flex-column gap-2 max-h-350 overflow-y-auto pe-1">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 bg-white rounded-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
                        style={{ border: "1px solid #F1F5F9" }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle fw-semibold d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: "42px", height: "42px", fontSize: "0.85rem", backgroundColor: "#F1F5F9", color: "#334155" }}
                          >
                            {getInitials(s.name)}
                          </div>
                          <div>
                            <div className="fw-semibold mb-0" style={{ color: "#1E293B" }}>{s.name}</div>
                            <div className="small" style={{ color: "#64748B" }}>
                              {s.studentId} &bull; {s.yearLevel}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3 minw-180">
                          <div className="text-sm-end">
                            <div className="small mb-1" style={{ color: "#64748B" }}>Attendance {s.attendance}%</div>
                            <div className="progress" style={{ height: "5px", width: "100px", backgroundColor: "#E2E8F0" }}>
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${s.attendance}%`,
                                  backgroundColor: s.attendance < 80 ? "#DC3545" : "#0D3B52",
                                }}
                              />
                            </div>
                          </div>

                          {s.status === "At Risk" ? (
                            <span 
                              className="badge rounded-pill px-3 py-2 fw-medium border-0" 
                              style={{ backgroundColor: "#DC3545", color: "#FFFFFF" }}
                            >
                              At Risk
                            </span>
                          ) : (
                            <span 
                              className="badge rounded-pill px-3 py-2 fw-medium border-0" 
                              style={{ backgroundColor: "#E9EEF5", color: "#0D3B52" }}
                            >
                              Enrolled
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4" style={{ color: "#64748B" }}>No students found matching your search.</div>
                  )}
                </div>

                <div className="small mt-3 ms-1" style={{ color: "#64748B" }}>
                  Showing {filteredStudents.length} of {MOCK_STUDENTS.length} enrolled students
                </div>
              </div>
            )}

            {/* TAB 2: DYNAMIC MATERIALS */}
            {activeTab === "materials" && (
              <div className="tab-pane-content">
                {isLoadingMaterials ? (
                  <div className="p-5 text-center text-muted">
                    <Loader2 size={24} className="spinner-border spinner-border-sm text-primary me-2" />
                    <span>Loading materials for {item.code}...</span>
                  </div>
                ) : materialsError ? (
                  <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                    <AlertCircle size={18} />
                    <div>{materialsError}</div>
                  </div>
                ) : courseMaterials.length === 0 ? (
                  <div className="text-center py-5 bg-white rounded-3 border" style={{ borderColor: "#F1F5F9" }}>
                    <FileText size={36} className="text-muted mb-2 opacity-50" />
                    <h6 className="fw-semibold text-dark mb-1">No Materials Found</h6>
                    <p className="text-muted small mb-0">
                      No learning materials uploaded yet for <strong>{item.code}</strong>.
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
                            style={{ width: "42px", height: "42px", backgroundColor: "#E0F2FE", color: "#0284C7" }}
                          >
                            <FileText size={20} />
                          </div>
                          <div className="minw-0">
                            <div className="fw-semibold mb-0 text-truncate" style={{ color: "#1E293B" }}>{mat.title}</div>
                            <div className="small" style={{ color: "#64748B" }}>
                              <span className="text-uppercase fw-semibold">{mat.type}</span> &bull; {mat.sizeLabel} &bull; Uploaded {mat.date}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3 flex-shrink-0">
                          <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ backgroundColor: "#F8FAFC", color: "#1E293B", border: "1px solid #E2E8F0" }}>
                            {mat.downloads} downloads
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => handleDownload(mat)}
                            className="btn btn-link p-1 shadow-none rounded-2 hover-bg"
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

            {/* TAB 3: GRADES */}
            {activeTab === "grades" && (
              <div className="tab-pane-content">
                <div className="table-responsive">
                  <table className="table align-middle text-nowrap border-0 mb-0">
                    <thead>
                      <tr className="border-bottom" style={{ borderColor: "#E2E8F0" }}>
                        <th className="border-0 fw-semibold ps-2 py-2" style={{ color: "#64748B" }}>Student</th>
                        <th className="border-0 fw-semibold text-center py-2" style={{ color: "#64748B" }}>Quizzes</th>
                        <th className="border-0 fw-semibold text-center py-2" style={{ color: "#64748B" }}>Midterm</th>
                        <th className="border-0 fw-semibold text-center py-2" style={{ color: "#64748B" }}>Project</th>
                        <th className="border-0 fw-semibold text-center py-2" style={{ color: "#64748B" }}>Finals</th>
                        <th className="border-0 fw-semibold text-center pe-2 py-2" style={{ color: "#64748B" }}>Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_STUDENTS.map((s) => {
                        const avg = calculateAverage(s);
                        const isHighGrade = avg >= 90;
                        return (
                          <tr key={s.id} className="border-bottom" style={{ borderColor: "#F1F5F9" }}>
                            <td className="ps-2 py-3 fw-medium" style={{ color: "#1E293B" }}>{s.name}</td>
                            <td className="text-center py-3" style={{ color: "#475569" }}>{s.quizzes}</td>
                            <td className="text-center py-3" style={{ color: "#475569" }}>{s.midterm}</td>
                            <td className="text-center py-3" style={{ color: "#475569" }}>{s.project}</td>
                            <td className="text-center py-3" style={{ color: "#475569" }}>{s.finals}</td>
                            <td className="text-center pe-2 py-3">
                              <span
                                className="badge rounded-pill px-3 py-2 fw-bold border-0"
                                style={{
                                  backgroundColor: isHighGrade ? "#0D3B52" : "#E9EEF5",
                                  color: isHighGrade ? "#FFFFFF" : "#0D3B52",
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

                <div className="small mt-3 ms-1" style={{ color: "#64748B" }}>
                  Class average: <span className="fw-semibold" style={{ color: "#1E293B" }}>{overallClassAverage}%</span>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn bg-white px-4 py-2 rounded-3 fw-medium"
              style={{ color: "#1E293B", border: "1px solid #E2E8F0" }}
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn text-white px-4 py-2 rounded-3 fw-medium d-inline-flex align-items-center gap-2 shadow-sm border-0"
              style={{ backgroundColor: "#0D3B52", color: "#FFFFFF" }}
            >
              <Mail size={16} />
              Email Class Report
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}