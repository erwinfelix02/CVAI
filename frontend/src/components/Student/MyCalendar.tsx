// ✅ src/components/Student/MyCalendar.tsx

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle, Circle, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../../config";

interface Task {
  id: string;
  _id?: string;
  dateKey: string;
  text: string;
  completed: boolean;
  dueDate: string;
}

export default function MyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [loading, setLoading] = useState(false);

  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);
  const [taskToToggleId, setTaskToToggleId] = useState<string | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = parsedUser?.id || parsedUser?._id || localStorage.getItem("userId") || "default_user";
  const currentUserEmail = parsedUser?.email || localStorage.getItem("userEmail") || "student@example.com";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const daysGrid = [];
  
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    daysGrid.push({ 
      day: prevMonthTotalDays - i, 
      isCurrentMonth: false, 
      dateObj: new Date(prevMonthYear, prevMonthIdx, prevMonthTotalDays - i) 
    });
  }

  for (let i = 1; i <= totalDays; i++) {
    daysGrid.push({ 
      day: i, 
      isCurrentMonth: true, 
      dateObj: new Date(year, month, i) 
    });
  }

  const remainingCells = 42 - daysGrid.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    daysGrid.push({ 
      day: i, 
      isCurrentMonth: false, 
      dateObj: new Date(nextMonthYear, nextMonthIdx, i) 
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch(`${API_BASE_URL}/tasks`, {
          headers: {
            "x-user-id": currentUserId,
            "x-user-email": currentUserEmail,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const normalized = data.map((t: any) => ({ ...t, id: t.id || t._id }));
          setTasks(normalized);
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    }
    fetchTasks();
  }, [currentUserId, currentUserEmail]);

  const handleDayClick = (dateObj: Date) => {
    setSelectedDate(dateObj);
    setShowModal(true);
    setNewTaskText("");
    setTaskToDeleteId(null);
    setTaskToToggleId(null);
  };

  const isPastDate = selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) < today : false;

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !selectedDate || isPastDate) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
          "x-user-email": currentUserEmail,
        },
        body: JSON.stringify({
          dateKey: formatDateKey(selectedDate),
          text: newTaskText.trim(),
          dueDate: selectedDate,
        }),
      });

      if (res.ok) {
        const createdTask = await res.json();
        const normalizedTask = { ...createdTask, id: createdTask.id || createdTask._id };
        setTasks((prev) => [normalizedTask, ...prev]);
        setNewTaskText("");
      }
    } catch (err) {
      console.error("Failed to create task", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmToggleTask = async (task: Task) => {
    const taskId = task.id;
    const newCompletedStatus = !task.completed;

    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
          "x-user-email": currentUserEmail,
        },
        body: JSON.stringify({ completed: newCompletedStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        const normalizedUpdated = { ...updated, id: updated.id || updated._id };
        setTasks((prev) => prev.map((t) => (t.id === taskId ? normalizedUpdated : t)));
      }
    } catch (err) {
      console.error("Failed to update task", err);
    } finally {
      setTaskToToggleId(null);
    }
  };

  const confirmDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": currentUserId,
          "x-user-email": currentUserEmail,
        },
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (err) {
      console.error("Failed to delete task", err);
    } finally {
      setTaskToDeleteId(null);
    }
  };

  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : "";
  const filteredTasks = tasks.filter((t) => t.dateKey === selectedDateKey);

  // Clean, modern modal content rendered via Portal
  const modalContent = showModal && selectedDate && (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 99999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowModal(false);
        }
      }}
    >
      <div 
        className="bg-white rounded-4 shadow-lg border-0 w-100 overflow-hidden"
        style={{ maxWidth: "460px", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-4 pt-4 pb-3">
          <h5 className="fw-bold text-dark fs-5 mb-0 text-truncate pe-2">
            Tasks for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </h5>
          <button
            type="button"
            className="btn-close shadow-none"
            onClick={() => setShowModal(false)}
            aria-label="Close"
          />
        </div>
        
        {/* Body */}
        <div className="px-4 pb-4 overflow-y-auto" style={{ flexGrow: 1 }}>
          {isPastDate ? (
            <div className="alert alert-warning d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>You cannot add new tasks to past dates.</span>
            </div>
          ) : (
            <form onSubmit={handleAddTask} className="d-flex gap-2 mb-3">
              <input
                type="text"
                className="form-control rounded-3 form-control-sm form-control-md shadow-none"
                placeholder="Add a to-do or event..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <button 
                type="submit" 
                className="btn btn-primary rounded-3 d-flex align-items-center justify-content-center px-3 flex-shrink-0 shadow-none" 
                style={{ minWidth: "42px", minHeight: "38px" }} 
                disabled={loading}
              >
                <Plus size={18} />
              </button>
            </form>
          )}

          <div className="task-list" style={{ maxHeight: "240px", overflowY: "auto" }}>
            {filteredTasks.length === 0 ? (
              <p className="text-muted text-center small py-4 mb-0">No tasks scheduled for this date.</p>
            ) : (
              filteredTasks.map((task) => {
                const isDeleting = taskToDeleteId === task.id;
                const isToggling = taskToToggleId === task.id;

                return (
                  <div
                    key={task.id}
                    className="p-2 mb-2 rounded-3 border bg-light position-relative"
                    style={{ minHeight: "52px", display: "flex", alignItems: "center" }}
                  >
                    <div className="w-100">
                      {!isDeleting && !isToggling && (
                        <div className="d-flex align-items-center justify-content-between gap-2 w-100">
                          <div
                            className="d-flex align-items-center gap-2 flex-grow-1 text-break py-1"
                            style={{ cursor: "pointer", minWidth: 0 }}
                            onClick={() => setTaskToToggleId(task.id)}
                            title="Click to change status"
                          >
                            {task.completed ? (
                              <CheckCircle size={18} className="text-success flex-shrink-0" />
                            ) : (
                              <Circle size={18} className="text-secondary flex-shrink-0" />
                            )}
                            <span
                              className={`small text-break ${task.completed ? "text-decoration-line-through text-muted" : "text-dark"}`}
                            >
                              {task.text}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-link text-danger p-1 ms-1 flex-shrink-0 text-decoration-none shadow-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTaskToDeleteId(task.id);
                            }}
                            title="Delete task"
                            style={{ minHeight: "32px", minWidth: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}

                      {isToggling && (
                        <div className="d-flex align-items-center justify-content-between w-100 px-1">
                          <span className="small text-dark fw-semibold">
                            Mark as {task.completed ? "incomplete" : "completed"}?
                          </span>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 shadow-none"
                              onClick={() => setTaskToToggleId(null)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm rounded-pill px-3 py-1 shadow-none"
                              onClick={() => confirmToggleTask(task)}
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      )}

                      {isDeleting && (
                        <div className="d-flex align-items-center justify-content-between w-100 px-1">
                          <span className="small text-danger fw-semibold">Delete this task?</span>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 shadow-none"
                              onClick={() => setTaskToDeleteId(null)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm rounded-pill px-3 py-1 shadow-none"
                              onClick={() => confirmDeleteTask(task.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid px-1 px-md-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-dark fs-6 fs-md-5">
          <CalendarIcon size={20} className="text-primary flex-shrink-0" />
          <span>My Calendar & Tasks</span>
        </h5>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-2 px-md-3 rounded-pill"
            onClick={goToToday}
          >
            Today
          </button>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold text-dark text-nowrap small" style={{ minWidth: 100 }}>
              {monthNames[month]} {year}
            </span>
            <div className="btn-group shadow-sm">
              <button
                type="button"
                className="btn btn-light border btn-sm px-2 py-1"
                onClick={prevMonth}
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="btn btn-light border btn-sm px-2 py-1"
                onClick={nextMonth}
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row text-center text-muted fw-semibold small mb-2 g-0">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div className="col" key={d}>
            {d}
          </div>
        ))}
      </div>

      <div className="row g-1 text-center">
        {daysGrid.map((item, index) => {
          const itemNormalized = new Date(item.dateObj.getFullYear(), item.dateObj.getMonth(), item.dateObj.getDate());
          const isTodayCell = itemNormalized.getTime() === today.getTime();
          const dateKey = formatDateKey(item.dateObj);
          const hasTasks = tasks.some((t) => t.dateKey === dateKey);

          return (
            <div className="p-1" style={{ width: "14.28%" }} key={index}>
              <div
                onClick={() => handleDayClick(item.dateObj)}
                className={`d-flex flex-column align-items-center justify-content-center rounded-circle mx-auto fw-medium small position-relative ${
                  isTodayCell
                    ? "bg-primary text-white fw-bold shadow-sm"
                    : item.isCurrentMonth
                    ? "text-dark hover-bg-light"
                    : "text-muted opacity-50"
                }`}
                style={{ height: "34px", width: "34px", cursor: "pointer", maxWidth: "100%" }}
                title="Click to view/manage tasks"
              >
                <span className="small">{item.day}</span>
                {hasTasks && (
                  <span
                    className="position-absolute bottom-0 bg-info rounded-circle"
                    style={{ width: 4, height: 4, marginBottom: 3 }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Render modal directly into document.body using Portal */}
      {createPortal(modalContent, document.body)}
    </div>
  );
}