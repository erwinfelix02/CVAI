// ✅ src/components/Student/MyCalendar.tsx

import { useState, useEffect } from "react";
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

  // Confirmation modal states
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToToggle, setTaskToToggle] = useState<Task | null>(null);

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
          setTasks(data);
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
        setTasks((prev) => [createdTask, ...prev]);
        setNewTaskText("");
      }
    } catch (err) {
      console.error("Failed to create task", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmToggleTask = async () => {
    if (!taskToToggle) return;
    const taskId = taskToToggle.id;
    const newCompletedStatus = !taskToToggle.completed;

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
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      }
    } catch (err) {
      console.error("Failed to update task", err);
    } finally {
      setTaskToToggle(null);
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    const taskId = taskToDelete.id;

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
      setTaskToDelete(null);
    }
  };

  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : "";
  const filteredTasks = tasks.filter((t) => t.dateKey === selectedDateKey);

  return (
    <div className="h-100">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
          <CalendarIcon size={20} className="text-primary" />
          My Calendar & Tasks
        </h5>

        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-3 rounded-pill"
            onClick={goToToday}
          >
            Today
          </button>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold text-dark" style={{ minWidth: 130 }}>
              {monthNames[month]} {year}
            </span>
            <div className="btn-group shadow-sm">
              <button
                type="button"
                className="btn btn-light border btn-sm"
                onClick={prevMonth}
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="btn btn-light border btn-sm"
                onClick={nextMonth}
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="row text-center text-muted fw-semibold small mb-2 g-0">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div className="col" key={d}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="row g-1 text-center">
        {daysGrid.map((item, index) => {
          const itemNormalized = new Date(item.dateObj.getFullYear(), item.dateObj.getMonth(), item.dateObj.getDate());
          const isTodayCell = itemNormalized.getTime() === today.getTime();
          const dateKey = formatDateKey(item.dateObj);
          const hasTasks = tasks.some((t) => t.dateKey === dateKey);

          return (
            <div className="col-1.5 p-1" style={{ width: "14.28%" }} key={index}>
              <div
                onClick={() => handleDayClick(item.dateObj)}
                className={`d-flex flex-column align-items-center justify-content-center rounded-circle mx-auto fw-medium small position-relative ${
                  isTodayCell
                    ? "bg-primary text-white fw-bold shadow-sm"
                    : item.isCurrentMonth
                    ? "text-dark hover-bg-light"
                    : "text-muted opacity-50"
                }`}
                style={{ height: 38, width: 38, cursor: "pointer" }}
                title="Click to view/manage tasks"
              >
                <span>{item.day}</span>
                {hasTasks && (
                  <span
                    className="position-absolute bottom-0 bg-info rounded-circle"
                    style={{ width: 5, height: 5, marginBottom: 4 }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* TASK MANAGER MODAL */}
      {showModal && selectedDate && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow border-0">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">
                  Tasks for {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                {isPastDate ? (
                  <div className="alert alert-warning d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>You cannot add new tasks to past dates.</span>
                  </div>
                ) : (
                  <form onSubmit={handleAddTask} className="d-flex gap-2 mb-3">
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="Add a to-do or event..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      disabled={loading}
                      autoFocus
                    />
                    <button type="submit" className="btn btn-primary rounded-3 d-flex align-items-center px-3" disabled={loading}>
                      <Plus size={18} />
                    </button>
                  </form>
                )}

                {/* Task List */}
                <div className="task-list" style={{ maxHeight: 250, overflowY: "auto" }}>
                  {filteredTasks.length === 0 ? (
                    <p className="text-muted text-center small py-3 mb-0">No tasks scheduled for this date.</p>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="d-flex align-items-center justify-content-between p-2 mb-2 rounded-3 border bg-light"
                      >
                        <div
                          className="d-flex align-items-center gap-2 flex-grow-1"
                          style={{ cursor: "pointer" }}
                          onClick={() => setTaskToToggle(task)}
                          title="Click to change status"
                        >
                          {task.completed ? (
                            <CheckCircle size={18} className="text-success flex-shrink-0" />
                          ) : (
                            <Circle size={18} className="text-secondary flex-shrink-0" />
                          )}
                          <span
                            className={`small ${task.completed ? "text-decoration-line-through text-muted" : "text-dark"}`}
                          >
                            {task.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-link text-danger p-0 ms-2"
                          onClick={() => setTaskToDelete(task)}
                          title="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-pill px-4"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM TOGGLE MODAL */}
      {taskToToggle && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content rounded-4 shadow border-0 text-center p-3">
              <div className="modal-body">
                <h6 className="fw-bold text-dark mb-2">Update Task Status</h6>
                <p className="text-muted small mb-3">
                  Mark this task as {taskToToggle.completed ? "incomplete" : "completed"}?
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    onClick={() => setTaskToToggle(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-pill px-3"
                    onClick={confirmToggleTask}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {taskToDelete && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content rounded-4 shadow border-0 text-center p-3">
              <div className="modal-body">
                <h6 className="fw-bold text-dark mb-2">Delete Task</h6>
                <p className="text-muted small mb-3">Are you sure you want to delete this task?</p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    onClick={() => setTaskToDelete(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm rounded-pill px-3"
                    onClick={confirmDeleteTask}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}