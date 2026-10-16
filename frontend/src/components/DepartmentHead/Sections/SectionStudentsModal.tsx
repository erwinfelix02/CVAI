// ✅ src/components/DepartmentHead/Sections/SectionStudentsModal.tsx

import { useState, useEffect } from "react";
import { User, Search, Mail, Phone, Hash } from "lucide-react";
import { API_BASE_URL } from "../../../config";

interface Student {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  studentNo: string;
  section?: string;
}

interface SectionStudentsModalProps {
  sectionId: string | null;
  sectionName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SectionStudentsModal({
  sectionId,
  sectionName,
  isOpen,
  onClose,
}: SectionStudentsModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen || (!sectionId && !sectionName)) {
      setSearchQuery("");
      setStudents([]);
      return;
    }

    const fetchAllStudentsAndFilter = async () => {
      setLoading(true);
      try {
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

        // Fetch all students (same endpoint used for bulk assignment)
        const studentUrl = userDepartment
          ? `${API_BASE_URL}/students?department=${encodeURIComponent(userDepartment)}`
          : `${API_BASE_URL}/students`;

        const res = await fetch(studentUrl);
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          const targetSection = (sectionName || sectionId || "").trim().toLowerCase();

          // Filter students who belong to this specific section
          const sectionStudents = data.filter((st: any) => {
            const stSection = String(st.section || "").trim().toLowerCase();
            return stSection === targetSection;
          });

          const mappedStudents: Student[] = sectionStudents.map((st: any) => ({
            id: st.id || st._id,
            name: st.name || st.fullName || "Unnamed Student",
            email: st.email || "N/A",
            phone: st.phone || st.guardianPhone || "N/A",
            gender: st.gender || "",
            studentNo: st.studentNo || st.id || "—",
            section: st.section,
          }));

          setStudents(mappedStudents);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error("Failed to fetch department students for section:", err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudentsAndFilter();
  }, [isOpen, sectionId, sectionName]);

  if (!isOpen) return null;

  const filteredStudents = students.filter(
    (st) =>
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.studentNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-3">
          
          {/* Header */}
          <div className="modal-header bg-white px-4 py-3 border-bottom">
            <div>
              <h5 className="modal-title fw-bold text-dark mb-0">Section Roster</h5>
              <small className="text-muted">{sectionName}</small>
            </div>
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
            />
          </div>

          {/* Body */}
          <div className="modal-body p-4 bg-white">
            {!loading && students.length > 0 && (
              <div className="mb-3 position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm ps-5 rounded-pill border shadow-sm py-2"
                  placeholder="Search student by name, ID number, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-2" role="status" style={{ width: "2rem", height: "2rem" }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted small mb-0">Loading student roster...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-5 text-muted bg-light rounded-3 border p-4">
                <User size={40} className="text-muted opacity-50 mb-2" />
                <p className="mb-0 fw-semibold">No students currently enrolled in this section.</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-4 text-muted bg-light rounded-3 border">
                <p className="mb-0">No students match your search query "{searchQuery}".</p>
              </div>
            ) : (
              <div className="table-responsive border rounded-3">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-uppercase text-muted" style={{ fontSize: "0.75rem" }}>
                    <tr>
                      <th className="ps-3 py-3">Student Name</th>
                      <th className="py-3">Student ID</th>
                      <th className="py-3">Email</th>
                      <th className="py-3 pe-3">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((st, index) => (
                      <tr key={st.id || index}>
                        <td className="ps-3 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle bg-light text-primary fw-bold d-flex align-items-center justify-content-center border flex-shrink-0"
                              style={{ width: "38px", height: "38px", fontSize: "0.9rem" }}
                            >
                              {st.name ? st.name.charAt(0).toUpperCase() : <User size={16} />}
                            </div>
                            <div>
                              <div className="fw-semibold text-dark">{st.name}</div>
                              {st.gender && <small className="text-muted">{st.gender}</small>}
                            </div>
                          </div>
                        </td>
                        <td className="text-secondary fw-medium">
                          <div className="d-flex align-items-center gap-1">
                            <Hash size={13} className="opacity-50" />
                            <span>{st.studentNo}</span>
                          </div>
                        </td>
                        <td className="text-secondary">
                          <div className="d-flex align-items-center gap-1">
                            <Mail size={13} className="opacity-50" />
                            <span>{st.email || "N/A"}</span>
                          </div>
                        </td>
                        <td className="text-secondary pe-3">
                          <div className="d-flex align-items-center gap-1">
                            <Phone size={13} className="opacity-50" />
                            <span>{st.phone || "N/A"}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light border-top px-4 py-3">
            <div className="text-muted small me-auto">
              Showing <span className="fw-semibold text-dark">{filteredStudents.length}</span> of{" "}
              <span className="fw-semibold text-dark">{students.length}</span> students
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm px-4"
              onClick={onClose}
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}