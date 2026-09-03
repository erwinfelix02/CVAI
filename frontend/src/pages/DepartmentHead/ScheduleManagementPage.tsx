// ✅ src/pages/DepartmentHead/Schedules/ScheduleManagementPage.tsx

import { useMemo, useState, useEffect, useCallback } from "react";
import { Plus, CalendarX, Trash2 } from "lucide-react";

import ScheduleToolbar from "../../components/DepartmentHead/Schedules/ScheduleToolbar";
import ScheduleCard from "../../components/DepartmentHead/Schedules/ScheduleCard";
import ScheduleModal, {
  type SubjectOption,
  type SectionOption,
  type RoomOption,
  type FacultyOption,
} from "../../components/DepartmentHead/Schedules/ScheduleModal";
import type { DayFilter, ScheduleRow } from "../../components/DepartmentHead/Schedules/types";
import AuthAlert from "../../components/Authentication/AuthAlert";

import "../../styles/dept-schedules.css";

export default function ScheduleManagementPage() {
  const [query, setQuery] = useState("");
  const [day, setDay] = useState<DayFilter>("All Days");
  const [rows, setRows] = useState<ScheduleRow[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ScheduleRow | null>(null);

  /* =========================================================
     DELETE CONFIRMATION MODAL STATE
     ========================================================= */
  const [deletingRow, setDeletingRow] = useState<ScheduleRow | null>(null);

  /* =========================================================
     AUTH ALERT & CENTERED LOADING OVERLAY STATE
     ========================================================= */
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState("Processing...");

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

  /* =========================================================
     DYNAMIC DATA FETCHING (SCHEDULES, SUBJECTS, SECTIONS, ROOMS, FACULTY)
     ========================================================= */
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);

  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(true);

  const userDepartment = useMemo(() => {
    const userJson = localStorage.getItem("user");
    const currentUser = userJson ? JSON.parse(userJson) : null;
    return currentUser?.department || "";
  }, []);

  const fetchDepartmentData = useCallback(async () => {
    const queryParam = userDepartment
      ? `?department=${encodeURIComponent(userDepartment)}`
      : "";

    // 1. Fetch Department-Specific Schedules
    setIsLoadingSchedules(true);
    try {
      const res = await fetch(`/api/schedules${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRows(
            data.map((s: any) => ({
              id: s._id || s.id,
              code: s.code,
              section: s.section,
              title: s.title,
              faculty: s.faculty,
              room: s.room,
              status: s.status || "Active",
              days: s.days,
              time: s.time,
              department: s.department,
              createdBy: s.createdBy,
            }))
          );
        }
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      setIsLoadingSchedules(false);
    }

    // 2. Fetch Subjects by Department
    setIsLoadingSubjects(true);
    try {
      const res = await fetch(`/api/subjects${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        setSubjects(
          data.map((item: any) => ({
            _id: item._id,
            code: item.code,
            name: item.name,
            program: item.program,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    } finally {
      setIsLoadingSubjects(false);
    }

    // 3. Fetch Sections by Department
    setIsLoadingSections(true);
    try {
      const res = await fetch(`/api/sections${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        setSections(
          data.map((item: any) => ({
            _id: item._id,
            code: item.code,
            program: item.program,
            yearLevel: item.yearLevel,
            room: item.room,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching sections:", err);
    } finally {
      setIsLoadingSections(false);
    }

    // 4. Fetch Rooms by Department
    setIsLoadingRooms(true);
    try {
      let res = await fetch(`/api/sections/rooms${queryParam}`);
      let data = res.ok ? await res.json() : [];

      if (!Array.isArray(data) || data.length === 0) {
        const roomRes = await fetch("/api/rooms");
        if (roomRes.ok) {
          data = await roomRes.json();
        }
      }

      setRooms(
        data.map((item: any) => ({
          _id: item._id,
          name: item.name || item.code || item._id,
          building: item.building,
        }))
      );
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setIsLoadingRooms(false);
    }

    // 5. Fetch Faculty by Department
    setIsLoadingFaculty(true);
    try {
      const res = await fetch(`/api/users/faculty${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        setFacultyList(
          data.map((item: any) => ({
            _id: item._id,
            name: item.name,
            idNumber: item.idNumber,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching faculty:", err);
    } finally {
      setIsLoadingFaculty(false);
    }
  }, [userDepartment]);

  useEffect(() => {
    fetchDepartmentData();
  }, [fetchDepartmentData]);

  /* =========================================================
     FILTERED SCHEDULES
     ========================================================= */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !q ||
        r.code.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.faculty.toLowerCase().includes(q) ||
        r.room.toLowerCase().includes(q) ||
        r.section.toLowerCase().includes(q);

      const matchesDay = day === "All Days" ? true : r.days === day;
      return matchesQuery && matchesDay;
    });
  }, [rows, query, day]);

  /* =========================================================
     ACTION HANDLERS (CREATE / EDIT / DELETE / SAVE)
     ========================================================= */
  const onCreate = () => {
    setEditingRow(null);
    setIsModalOpen(true);
  };

  const onEdit = (row: ScheduleRow) => {
    setEditingRow(row);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (row: ScheduleRow) => {
    setDeletingRow(row);
  };

  const handleCloseDeleteModal = () => {
    if (isSubmitting) return;
    setDeletingRow(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRow) return;

    const targetRow = deletingRow;
    setDeletingRow(null);

    setLoadingText("Deleting schedule...");
    setIsSubmitting(true);

    try {
      if (targetRow.id && targetRow.id.length > 10) {
        const res = await fetch(`/api/schedules/${targetRow.id}`, {
          method: "DELETE",
        });

        const resData = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(resData.message || "Failed to delete schedule");
        }
      }

      setRows((prev) => prev.filter((item) => item.id !== targetRow.id));
      showAlert("Schedule deleted successfully!", "success");
    } catch (err: any) {
      console.error("Error deleting schedule:", err);
      showAlert(
        err.message || "An error occurred while deleting the schedule.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (data: ScheduleRow) => {
    setLoadingText(editingRow ? "Updating schedule..." : "Creating schedule...");
    setIsSubmitting(true);

    const userJson = localStorage.getItem("user");
    const currentUser = userJson ? JSON.parse(userJson) : null;

    const fullUserName = currentUser
      ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.email
      : "Department Head";

    const payload = {
      ...data,
      department: currentUser?.department || data.department || "",
      createdBy: {
        userId: currentUser?._id || currentUser?.id || "",
        userName: fullUserName,
        userRole: currentUser?.role || "Dept Head",
      },
    };

    try {
      if (data.id && data.id.length > 10) {
        // Edit Schedule
        const res = await fetch(`/api/schedules/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(result.message || "Failed to update schedule.");
        }

        const updatedRow = result.schedule
          ? { ...result.schedule, id: result.schedule._id }
          : payload;

        setRows((prev) => prev.map((item) => (item.id === data.id ? updatedRow : item)));
        showAlert("Schedule updated successfully!", "success");
      } else {
        // Create Schedule
        const res = await fetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(result.message || "Failed to create schedule.");
        }

        const newRow = result.schedule
          ? { ...result.schedule, id: result.schedule._id }
          : { ...payload, id: Date.now().toString() };

        setRows((prev) => [newRow, ...prev]);
        showAlert("Schedule created successfully!", "success");
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error saving schedule:", err);
      showAlert(
        err.message || "An error occurred while saving the schedule.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFiltering = query.trim().length > 0 || day !== "All Days";

  return (
    <>
      {/* AUTH ALERT OVERLAY FOR SUCCESS / ERROR MESSAGES */}
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={false}
      />

      {/* CENTERED SPINNER OVERLAY WHEN SAVING OR DELETING */}
      {isSubmitting && (
        <div className="schedule-centered-alert-backdrop">
          <div className="schedule-centered-alert-card p-4 text-center">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
              style={{ width: "2.75rem", height: "2.75rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <h6 className="fw-semibold text-dark mb-0">{loadingText}</h6>
          </div>
        </div>
      )}

      {/* CENTERED DELETE CONFIRMATION MODAL */}
      {deletingRow && !isSubmitting && (
        <div className="schedule-centered-alert-backdrop">
          <div className="schedule-centered-alert-card text-center p-4">
            <div className="schedule-delete-icon-wrapper mb-3 mx-auto">
              <Trash2 size={28} className="text-danger" />
            </div>
            <h5 className="fw-bold text-dark mb-2">Delete Schedule?</h5>
            <p className="text-muted small mb-4">
              Are you sure you want to delete the schedule for{" "}
              <strong>
                {deletingRow.code} ({deletingRow.section})
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="d-flex gap-2 w-100 justify-content-center">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium rounded-3 border"
                onClick={handleCloseDeleteModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 fw-medium rounded-3"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container-fluid py-3 py-md-4 dept-schedules-page">
        {/* Header row */}
        <div className="d-flex align-items-start align-items-md-center justify-content-between gap-3 mb-4 flex-wrap">
          <div>
            <h1 className="fw-bold mb-1">Schedule Management</h1>
            <p className="text-muted mb-0">
              Assigning subjects, faculty, rooms, and time slots
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg rounded-4 px-4 py-2 dept-primary-btn d-inline-flex align-items-center justify-content-center gap-2"
            onClick={onCreate}
            disabled={isSubmitting}
          >
            <Plus size={20} />
            <span>Create Schedule</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="mb-4">
          <ScheduleToolbar
            query={query}
            onQueryChange={setQuery}
            day={day}
            onDayChange={setDay}
          />
        </div>

        {/* List / Loading / Empty State */}
        <div className="d-flex flex-column gap-3">
          {isLoadingSchedules ? (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-5 text-center text-muted">
                <div
                  className="spinner-border spinner-border-sm text-primary me-2"
                  role="status"
                />
                <span>Loading schedules...</span>
              </div>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((row) => (
              <ScheduleCard
                key={row.id}
                row={row}
                onEdit={onEdit}
                onDelete={handleOpenDeleteModal}
              />
            ))
          ) : (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-sm-5 text-center">
                <div
                  className="d-inline-flex align-items-center justify-content-center bg-light text-secondary rounded-circle mb-3 p-3"
                  style={{ width: "64px", height: "64px" }}
                >
                  <CalendarX size={32} />
                </div>
                <h5 className="fw-semibold mb-2">
                  {isFiltering
                    ? "No matching schedules found"
                    : "No schedules created yet"}
                </h5>
                <p
                  className="text-muted mb-0 mx-auto"
                  style={{ maxWidth: "420px", fontSize: "0.95rem" }}
                >
                  {isFiltering
                    ? "We couldn't find any class schedule matching your search parameters."
                    : "There are no class schedules assigned to your department."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        <ScheduleModal
          isOpen={isModalOpen}
          onClose={() => {
            if (!isSubmitting) setIsModalOpen(false);
          }}
          onSave={handleSave}
          editingRow={editingRow}
          subjects={subjects}
          sections={sections}
          rooms={rooms}
          facultyList={facultyList}
          isLoadingSubjects={isLoadingSubjects}
          isLoadingSections={isLoadingSections}
          isLoadingRooms={isLoadingRooms}
          isLoadingFaculty={isLoadingFaculty}
        />
      </div>
    </>
  );
}