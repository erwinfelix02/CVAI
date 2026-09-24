// ✅ src/components/Student/StudentCoursesContent.tsx

import { useState, useEffect } from "react";
import { BookOpen, ArrowLeft, FileText, Download, Search, MapPin, User, Clock } from "lucide-react";

interface ScheduleItem {
  _id: string;
  code: string;
  title: string;
  faculty: string;
  room: string;
  section: string;
  days: string;
  time: string;
  department: string;
}

interface CourseItem {
  id: string;
  code: string;
  title: string;
  professor: string;
  materialsCount: number;
  room?: string;
  days?: string;
  time?: string;
  department?: string;
  schedules?: ScheduleItem[];
}

interface CourseMaterialFile {
  id: string;
  title: string;
  sizeLabel: string;
  date: string;
  uploadedBy: string;
  filePath: string;
  course: string;
}

export default function StudentCoursesContent() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");
  const [studentCourses, setStudentCourses] = useState<CourseItem[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<Record<string, CourseMaterialFile[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudentAndCourses() {
      try {
        console.log("🔍 [DEBUG] Starting student course & schedule fetch...");
        
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (!userStr) {
          console.warn("⚠️ [DEBUG] No signed-in user found in storage.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        console.log("👤 [DEBUG] Parsed user session object:", user);

        let enrolledSubjects: string[] = user.enrolledSubjects || [];
        let section = user.section || "";
        let facultyName = user.facultyName || "Assigned Faculty";
        const identifier = user.email || user.studentIdNumber || user.idNumber || user.name || user._id;

        // Fetch student record via list query parameter
        if (identifier) {
          try {
            console.log(`📡 [DEBUG] Searching student records for query: "${identifier}"`);
            const listRes = await fetch(`/api/students?q=${encodeURIComponent(identifier)}`);
            
            if (listRes.ok) {
              const listData = await listRes.json();
              if (Array.isArray(listData) && listData.length > 0) {
                const matchedStudent = listData[0];
                if (Array.isArray(matchedStudent.enrolledSubjects) && matchedStudent.enrolledSubjects.length > 0) {
                  enrolledSubjects = matchedStudent.enrolledSubjects;
                }
                if (matchedStudent.section) {
                  section = matchedStudent.section;
                }
                if (matchedStudent.facultyName) {
                  facultyName = matchedStudent.facultyName;
                }
              }
            }
          } catch (apiErr) {
            console.warn("⚠️ [DEBUG] Student record search exception:", apiErr);
          }
        }

        // Fallback default subject if empty
        if (!enrolledSubjects || enrolledSubjects.length === 0) {
          enrolledSubjects = ["MAT151"];
        }

        console.log("📚 [DEBUG] Final Resolved Enrolled Subjects:", enrolledSubjects);

        // Fetch schedules matching enrolled subjects or section
        let schedules: ScheduleItem[] = [];
        const params = new URLSearchParams();
        if (Array.isArray(enrolledSubjects) && enrolledSubjects.length > 0) {
          params.append("enrolledSubjects", enrolledSubjects.join(","));
        }
        if (section) {
          params.append("section", section);
        }

        if (params.toString()) {
          const schedRes = await fetch(`/api/schedules/student?${params.toString()}`);
          if (schedRes.ok) {
            schedules = await schedRes.json();
          }
        }

        // Map schedules to course cards
        let mappedCourses: CourseItem[] = schedules.map((sch) => {
          const cleanCode = sch.code.toLowerCase().replace(/[^a-z0-9]/g, "");
          return {
            id: cleanCode || sch._id,
            code: sch.code,
            title: sch.title,
            professor: sch.faculty || facultyName,
            department: sch.department,
            room: sch.room,
            days: sch.days,
            time: sch.time,
            materialsCount: 0,
            schedules: [sch],
          };
        });

        if (mappedCourses.length === 0 && Array.isArray(enrolledSubjects)) {
          mappedCourses = enrolledSubjects.map((subj: string) => {
            const parts = subj.split("-");
            const code = parts[0]?.trim() || subj;
            const title = parts[1]?.trim() || (code.toLowerCase() === "mat151" ? "Mathematics in the Modern World" : subj);
            const cleanCode = code.toLowerCase().replace(/[^a-z0-9]/g, "");

            return {
              id: cleanCode || "sub",
              code: code,
              title: title,
              professor: facultyName,
              materialsCount: 0,
            };
          });
        }

        // Fetch actual materials uploaded by faculty from backend API
        const materialsRes = await fetch(`/api/materials`);
        const allMaterials: CourseMaterialFile[] = materialsRes.ok ? await materialsRes.json() : [];

        // Group materials by course code match
        const materialsMap: Record<string, CourseMaterialFile[]> = {};
        mappedCourses.forEach((course) => {
          const matchedFiles = allMaterials.filter(
            (mat) =>
              mat.course?.toLowerCase().includes(course.code.toLowerCase()) ||
              mat.course?.toLowerCase().includes(course.title.toLowerCase())
          );
          materialsMap[course.id] = matchedFiles.length > 0 ? matchedFiles : [
            {
              id: `default-${course.id}`,
              title: `${course.code} - Syllabus & Overview.pdf`,
              sizeLabel: "1.5 MB",
              date: "Recent",
              uploadedBy: course.professor,
              filePath: "#",
              course: course.code,
            }
          ];
          course.materialsCount = materialsMap[course.id].length;
        });

        setCourseMaterials(materialsMap);
        setStudentCourses(mappedCourses);
      } catch (err) {
        console.error("❌ [DEBUG ERROR] Critical failure during fetch:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentAndCourses();
  }, []);

  const selectedCourse = studentCourses.find((c) => c.id === selectedCourseId);
  const materials = selectedCourseId ? courseMaterials[selectedCourseId] || [] : [];

  const filteredMaterials = materials.filter((mat) =>
    mat.title.toLowerCase().includes(materialSearchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container-fluid px-0 py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading courses...</span>
        </div>
      </div>
    );
  }

  // 1. Materials View
  if (selectedCourse && selectedCourseId) {
    return (
      <div className="container-fluid px-0 py-3">
        <style>
          {`
            .back-to-courses-btn {
              background-color: #ffffff !important;
              color: #212529 !important;
              border-color: #dee2e6 !important;
              transition: all 0.2s ease-in-out !important;
            }
            .back-to-courses-btn:hover {
              background-color: #0d6efd !important;
              color: #ffffff !important;
              border-color: #0d6efd !important;
            }
          `}
        </style>

        <button
          type="button"
          className="btn btn-sm mb-3 d-inline-flex align-items-center gap-2 px-3 py-2 shadow-sm back-to-courses-btn"
          style={{ borderRadius: "8px" }}
          onClick={() => {
            setSelectedCourseId(null);
            setMaterialSearchQuery("");
          }}
        >
          <ArrowLeft size={16} /> Back to courses
        </button>

        <div className="mb-4">
          <h3 className="fw-bold text-dark mb-1">
            {selectedCourse.code} &middot; {selectedCourse.title}
          </h3>
          <p className="text-muted mb-1 d-flex align-items-center gap-3">
            <span className="d-flex align-items-center gap-1"><User size={14}/> {selectedCourse.professor}</span>
            {selectedCourse.room && <span className="d-flex align-items-center gap-1"><MapPin size={14}/> {selectedCourse.room}</span>}
            {selectedCourse.time && <span className="d-flex align-items-center gap-1"><Clock size={14}/> {selectedCourse.days} {selectedCourse.time}</span>}
          </p>
        </div>

        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "12px" }}>
          <div className="d-flex align-items-center justify-content-between flex-row w-100 mb-4 gap-3">
            <h5 className="fw-bold text-dark mb-0 flex-shrink-0" style={{ fontSize: "1.1rem" }}>
              Course Materials ({materials.length})
            </h5>

            <div className="input-group shadow-sm" style={{ width: "240px", minWidth: "150px" }}>
              <span className="input-group-text bg-white border-end-0 px-2">
                <Search size={14} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0 shadow-none"
                placeholder="Search..."
                value={materialSearchQuery}
                onChange={(e) => setMaterialSearchQuery(e.target.value)}
                style={{ fontSize: "0.9rem" }}
              />
            </div>
          </div>

          <div className="d-flex flex-column gap-3">
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 border rounded-3 bg-white gap-3 shadow-sm"
              >
                <div className="d-flex align-items-start align-items-md-center gap-3">
                  <div
                    className="p-2 rounded-2 bg-light text-primary d-flex align-items-center justify-content-center"
                    style={{ width: "40px", height: "40px", minWidth: "40px" }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <h6 className="fw-semibold text-dark mb-1">{mat.title}</h6>
                    <p className="text-muted small mb-0">
                      {mat.sizeLabel} &bull; Posted {mat.date} &bull; {mat.uploadedBy}
                    </p>
                  </div>
                </div>

                <div>
                  <a
                    href={mat.filePath !== "#" ? `/api/materials/${mat.id}/file` : "#"}
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 justify-content-center"
                    onClick={(e) => {
                      if (mat.filePath === "#") {
                        e.preventDefault();
                        alert(`File simulation for ${mat.title}`);
                      }
                    }}
                  >
                    <Download size={14} /> Download
                  </a>
                </div>
              </div>
            ))}

            {filteredMaterials.length === 0 && (
              <p className="text-muted text-center py-4 mb-0">
                No course materials match your search query.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Courses Grid View
  return (
    <div className="container-fluid px-0 py-3">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">My Enrolled Courses</h2>
        <p className="text-muted mb-0">Assigned schedules, faculty members, and course materials</p>
      </div>

      <div className="row g-3">
        {studentCourses.map((course) => (
          <div key={course.id} className="col-12 col-xl-6">
            <div
              className="card border-0 shadow-sm h-100 p-2 course-card"
              style={{
                cursor: "pointer",
                borderRadius: "12px",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onClick={() => setSelectedCourseId(course.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 .5rem 1rem rgba(0,0,0,.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0,0,0,.075)";
              }}
            >
              <div className="card-body d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="p-3 rounded-3 bg-light text-primary d-flex align-items-center justify-content-center"
                    style={{ width: "54px", height: "54px", minWidth: "54px" }}
                  >
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <span
                      className="badge bg-light text-dark border mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {course.code}
                    </span>
                    <h5 className="fw-bold text-dark mb-1">{course.title}</h5>
                    <p className="text-muted small mb-0 d-flex align-items-center gap-2">
                      <span><User size={12}/> {course.professor}</span>
                      {course.room && <span>&bull; <MapPin size={12}/> {course.room}</span>}
                    </p>
                  </div>
                </div>
                <div className="align-self-start align-self-sm-center">
                  <span className="badge rounded-pill bg-light text-secondary border px-3 py-2 fw-normal">
                    {course.materialsCount} material{course.materialsCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}