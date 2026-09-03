import { useState, useMemo, useEffect } from "react";
import {
  X,
  ClipboardList,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
} from "lucide-react";

export type ModalAttendanceStatus = "present" | "late" | "absent";

export type ModalStudent = {
  id: string;
  name: string;
  studentNo: string;
  status: ModalAttendanceStatus;
};

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: { value: string; label: string }[];
  initialSubject: string;
  initialDate: string;
  studentsList: ModalStudent[];
  onSave: (subject: string, date: string, records: ModalStudent[]) => void;
}

export default function AttendanceModal({
  isOpen,
  onClose,
  subjects,
  initialSubject,
  initialDate,
  studentsList,
  onSave,
}: AttendanceModalProps) {
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || "");
  const [selectedDate, setSelectedDate] = useState(initialDate || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<ModalStudent[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedSubject(initialSubject || "");
      setSelectedDate(initialDate || "");
      setSearchQuery("");
      setRecords(JSON.parse(JSON.stringify(studentsList)));
    }
  }, [isOpen, initialSubject, initialDate, studentsList]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q)
    );
  }, [records, searchQuery]);

  const counts = useMemo(() => {
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    return { present, absent, late };
  }, [records]);

  if (!isOpen) return null;

  const handleStatusChange = (id: string, status: ModalAttendanceStatus) => {
    setRecords((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const handleAllPresent = () => {
    setRecords((prev) => prev.map((s) => ({ ...s, status: "present" })));
  };

  const handleAllAbsent = () => {
    setRecords((prev) => prev.map((s) => ({ ...s, status: "absent" })));
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSaveAndSubmit = () => {
    if (!selectedSubject) {
      alert("Please select a course before saving.");
      return;
    }
    onSave(selectedSubject, selectedDate, records);
    onClose();
  };

  return (
    <div
      className="modal fade show d-block modal-blur-backdrop-fixed"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", zIndex: 1050 }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg px-2 px-sm-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3 text-white p-2"
                style={{ backgroundColor: "#8b5cf6", width: 44, height: 44 }}
              >
                <ClipboardList size={22} />
              </div>
              <h4 className="modal-title fw-bold text-dark mb-0">
                Record Attendance
              </h4>
            </div>

            <button
              type="button"
              className="btn btn-light p-2 rounded-circle border-0 d-flex align-items-center justify-content-center text-secondary"
              aria-label="Close"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body p-3 p-md-4">
            {/* Course & Date Row */}
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-dark small">
                  Course <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg rounded-3 border fs-6 shadow-none"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="" disabled>
                    Select Course...
                  </option>
                  {subjects.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-dark small">
                  Date
                </label>
                <input
                  type="date"
                  className="form-control form-control-lg rounded-3 border fs-6 shadow-none"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Actions & Badges Card - Single Line Layout */}
            <div className="p-3 bg-light rounded-4 d-flex align-items-center justify-content-between gap-2 mb-3 border overflow-x-auto">
              {/* Status Counters */}
              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                <span className="badge rounded-pill bg-emerald-subtle text-emerald border border-emerald px-3 py-2 fs-6 fw-semibold d-inline-flex align-items-center gap-1 text-nowrap">
                  <CheckCircle2 size={16} />
                  {counts.present} Present
                </span>

                <span className="badge rounded-pill bg-rose-subtle text-rose border border-rose px-3 py-2 fs-6 fw-semibold d-inline-flex align-items-center gap-1 text-nowrap">
                  <XCircle size={16} />
                  {counts.absent} Absent
                </span>

                <span className="badge rounded-pill bg-amber-subtle text-amber border border-amber px-3 py-2 fs-6 fw-semibold d-inline-flex align-items-center gap-1 text-nowrap">
                  <Clock size={16} />
                  {counts.late} Late
                </span>
              </div>

              {/* Bulk Toggle Buttons */}
              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-white bg-white border rounded-3 px-3 py-2 fw-semibold text-dark d-inline-flex align-items-center gap-2 text-nowrap shadow-sm"
                  onClick={handleAllPresent}
                >
                  <CheckCircle2 size={18} className="text-success" />
                  All Present
                </button>

                <button
                  type="button"
                  className="btn btn-white bg-white border rounded-3 px-3 py-2 fw-semibold text-dark d-inline-flex align-items-center gap-2 text-nowrap shadow-sm"
                  onClick={handleAllAbsent}
                >
                  <XCircle size={18} className="text-danger" />
                  All Absent
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="position-relative mb-3">
              <Search
                size={18}
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              />
              <input
                type="text"
                className="form-control form-control-lg rounded-3 border ps-5 fs-6 shadow-none"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Students List Container */}
            <div
              className="d-flex flex-column gap-2 overflow-auto pe-1"
              style={{ maxHeight: "360px" }}
            >
              {filteredStudents.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No students found matching your search.
                </div>
              ) : (
                filteredStudents.map((s) => {
                  const isPresent = s.status === "present";
                  const isLate = s.status === "late";
                  const isAbsent = s.status === "absent";

                  return (
                    <div
                      key={s.id}
                      className={`p-3 rounded-4 border d-flex align-items-center justify-content-between gap-3 transition-all ${
                        isPresent
                          ? "bg-emerald-light border-emerald-subtle"
                          : isLate
                          ? "bg-amber-light border-amber-subtle"
                          : isAbsent
                          ? "bg-rose-light border-rose-subtle"
                          : "bg-white"
                      }`}
                    >
                      {/* Student Info */}
                      <div className="d-flex align-items-center gap-3 min-w-0">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                          style={{
                            width: 44,
                            height: 44,
                            backgroundColor: "#3b82f6",
                          }}
                        >
                          {getInitials(s.name)}
                        </div>
                        <div className="text-truncate">
                          <h6 className="fw-bold text-dark mb-0 text-truncate">
                            {s.name}
                          </h6>
                          <small className="text-muted">{s.studentNo}</small>
                        </div>
                      </div>

                      {/* Status Button Toggle Group */}
                      <div className="d-flex align-items-center gap-1 flex-shrink-0">
                        {/* Present Button */}
                        <button
                          type="button"
                          className={`btn p-2 rounded-3 border-0 d-flex align-items-center justify-content-center ${
                            isPresent
                              ? "bg-emerald text-white shadow-sm"
                              : "bg-light text-secondary"
                          }`}
                          style={{ width: 40, height: 40 }}
                          title="Mark Present"
                          onClick={() => handleStatusChange(s.id, "present")}
                        >
                          <CheckCircle2 size={20} />
                        </button>

                        {/* Late Button */}
                        <button
                          type="button"
                          className={`btn p-2 rounded-3 border-0 d-flex align-items-center justify-content-center ${
                            isLate
                              ? "bg-amber text-white shadow-sm"
                              : "bg-light text-secondary"
                          }`}
                          style={{ width: 40, height: 40 }}
                          title="Mark Late"
                          onClick={() => handleStatusChange(s.id, "late")}
                        >
                          <Clock size={20} />
                        </button>

                        {/* Absent Button */}
                        <button
                          type="button"
                          className={`btn p-2 rounded-3 border-0 d-flex align-items-center justify-content-center ${
                            isAbsent
                              ? "bg-rose text-white shadow-sm"
                              : "bg-light text-secondary"
                          }`}
                          style={{ width: 40, height: 40 }}
                          title="Mark Absent"
                          onClick={() => handleStatusChange(s.id, "absent")}
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light rounded-3 px-4 py-2 border text-muted fw-medium"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success rounded-3 px-4 py-2 fw-medium d-inline-flex align-items-center gap-2"
              onClick={handleSaveAndSubmit}
            >
              <Check size={18} />
              Save Attendance Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}