// ✅ src/components/DepartmentHead/Sections/RequestSectionModal.tsx

import { useState, useEffect, useMemo } from "react";
import { Send, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../../../config";

export interface NewSectionFormData {
  sectionName: string;
  yearLevel: string;
  program: string;
  capacity: number;
  preferredRoom: string;
  reason: string;
  department: string;
}

interface CourseOption {
  id: string;
  code: string;
  name: string;
  department: string;
  yearLevels: number;
  status: string;
}

interface RequestSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: NewSectionFormData) => void;
}

export default function RequestSectionModal({ isOpen, onClose, onSubmit }: RequestSectionModalProps) {
  const [maxCapacity, setMaxCapacity] = useState<number>(45);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState<NewSectionFormData>({
    sectionName: "",
    yearLevel: "Year 1",
    program: "",
    capacity: 45,
    preferredRoom: "",
    reason: "",
    department: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      return;
    }

    const loadData = async () => {
      let userDepartment = "";
      try {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          userDepartment = parsed.department || "";
        }
      } catch (e) {
        console.error("Failed to parse user session", e);
      }

      setForm((prev) => ({ 
        ...prev, 
        department: userDepartment, 
        sectionName: "", 
        preferredRoom: "", 
        reason: "" 
      }));
      setErrorMessage(null);

      try {
        setLoadingSettings(true);
        setLoadingCourses(true);

        const settingsRes = await fetch(`${API_BASE_URL}/registrar/settings`);
        const settingsData = await settingsRes.json();

        if (settingsRes.ok) {
          const max = Number(settingsData?.maxStudentsPerSection ?? 45);
          const limit = Number.isFinite(max) && max > 0 ? max : 45;
          setMaxCapacity(limit);

          setForm((prev) => ({
            ...prev,
            capacity: prev.capacity > limit ? limit : prev.capacity,
          }));
        }

        const courseUrl = userDepartment
          ? `${API_BASE_URL}/courses?status=Active&department=${encodeURIComponent(userDepartment)}`
          : `${API_BASE_URL}/courses?status=Active`;

        const courseRes = await fetch(courseUrl);
        const courseData = await courseRes.json();

        if (courseRes.ok && Array.isArray(courseData)) {
          setCourses(courseData);
          if (courseData.length > 0) {
            const firstCourse = courseData[0];
            setForm((prev) => ({ 
              ...prev, 
              program: firstCourse.name,
              yearLevel: "Year 1"
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load modal data:", err);
      } finally {
        setLoadingSettings(false);
        setLoadingCourses(false);
      }
    };

    loadData();
  }, [isOpen]);

  const selectedCourse = useMemo(() => {
    return courses.find((c) => c.name === form.program) || null;
  }, [courses, form.program]);

  const yearOptions = useMemo(() => {
    const maxYears = selectedCourse?.yearLevels ?? 4;
    return Array.from({ length: maxYears }, (_, i) => `Year ${i + 1}`);
  }, [selectedCourse]);

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProgram = e.target.value;
    const course = courses.find((c) => c.name === newProgram);
    const maxYears = course?.yearLevels ?? 4;

    setForm((prev) => {
      const currentYearNum = parseInt(prev.yearLevel.replace("Year ", "")) || 1;
      const validYear = currentYearNum <= maxYears ? prev.yearLevel : "Year 1";

      return {
        ...prev,
        program: newProgram,
        yearLevel: validYear,
      };
    });
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side completeness check
    if (!form.sectionName.trim() || !form.preferredRoom.trim() || !form.reason.trim() || !form.program.trim() || !form.department.trim()) {
      setErrorMessage("Please complete all required fields before submitting your request.");
      return;
    }

    if (form.capacity > maxCapacity) {
      setErrorMessage(`Capacity cannot exceed the registrar's configured maximum limit of ${maxCapacity} students per section.`);
      return;
    }

    onSubmit(form);
  };

  return (
    <div
      className="modal show fade d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto" }}
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" style={{ boxSizing: "border-box" }}>
        <div className="modal-content border-0 shadow" style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
          <div className="modal-header border-bottom-0 pb-0">
            <div>
              <h5 className="modal-title fw-bold">Request New Section</h5>
              {form.department && (
                <small className="text-muted">Department: {form.department}</small>
              )}
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {errorMessage && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" role="alert" style={{ fontSize: "13px" }}>
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <div>{errorMessage}</div>
                </div>
              )}

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Section Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={form.sectionName}
                    onChange={(e) => setForm({ ...form, sectionName: e.target.value })}
                    placeholder="e.g. BSCS-1C"
                  />
                </div>
                
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Year Level</label>
                  <select
                    className="form-select"
                    value={form.yearLevel}
                    onChange={(e) => setForm({ ...form, yearLevel: e.target.value })}
                    required
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Course/Program</label>
                  <select
                    className="form-select"
                    value={form.program}
                    onChange={handleProgramChange}
                    required
                    disabled={loadingCourses || courses.length === 0}
                  >
                    {loadingCourses ? (
                      <option value="">Loading courses...</option>
                    ) : courses.length === 0 ? (
                      <option value="">No courses found for your department</option>
                    ) : (
                      courses.map((c) => (
                        <option key={c.id || c.code} value={c.name}>
                          {c.name} ({c.code})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">
                    Capacity {loadingSettings ? "(Loading limit...)" : <span className="text-muted fw-normal">(Max: {maxCapacity})</span>}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max={maxCapacity}
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Preferred Room</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. Room 301"
                    value={form.preferredRoom}
                    onChange={(e) => setForm({ ...form, preferredRoom: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Reason</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    required
                    placeholder="e.g. Influx of rising 2nd-year students and transferees"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer border-top-0">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn text-white d-flex align-items-center gap-1 border-0 shadow-sm"
                style={{ backgroundColor: "#0d5173" }}
              >
                <Send size={16} /> Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}