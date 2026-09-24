import { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Trash2,
  Loader2,
  Clock,
  Calendar,
  X,
  Edit3,
  CheckCircle2,
} from "lucide-react";
import { createPortal } from "react-dom";
import AuthAlert from "../../../components/Authentication/AuthAlert";

interface TodoItem {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  role: string;
  email: string;
}

// Helper to format ISO date string into readable date and time badge
const formatDateTime = (isoString: string): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${dateStr} at ${timeStr}`;
};

export default function PendingTasks() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit State Tracking
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  // New/Edit Todo Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // AuthAlert State
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

  const getUserInfo = () => {
    try {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        return {
          email: user.email || "",
          role: user.role || "Faculty",
        };
      }
    } catch (e) {
      console.error("Error reading user from localStorage", e);
    }
    return { email: "", role: "Faculty" };
  };

  const fetchTodos = async () => {
    const { email } = getUserInfo();
    if (!email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/todos?email=${encodeURIComponent(email)}`,
      );
      if (res.ok) {
        const data = await res.json();
        const rawList: TodoItem[] = Array.isArray(data) ? data : [];

        const currentTime = Date.now();
        const activeTodos: TodoItem[] = [];
        const expiredIds: string[] = [];

        rawList.forEach((t) => {
          const dueTime = new Date(t.dueDate).getTime();
          if (dueTime <= currentTime) {
            expiredIds.push(t._id);
          } else {
            activeTodos.push(t);
          }
        });

        setTodos(activeTodos);

        if (expiredIds.length > 0) {
          await Promise.all(
            expiredIds.map((id) =>
              fetch(`http://localhost:5000/api/todos/${id}`, {
                method: "DELETE",
              }).catch(() => {}),
            ),
          );
        }
      }
    } catch (err) {
      console.error("Failed to load todos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();

    const interval = setInterval(() => {
      setTodos((prev) =>
        prev.filter((t) => new Date(t.dueDate).getTime() > Date.now()),
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenAddModal = () => {
    setEditingTodoId(null);
    setTitle("");
    setDescription("");
    setTaskDate("");
    setTaskTime("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: TodoItem) => {
    setEditingTodoId(task._id);
    setTitle(task.title);
    setDescription(task.description || "");

    if (task.dueDate) {
      const dateObj = new Date(task.dueDate);
      if (!isNaN(dateObj.getTime())) {
        setTaskDate(dateObj.toISOString().split("T")[0]);
        setTaskTime(
          `${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`,
        );
      }
    }

    setIsModalOpen(true);
  };

  const handleSaveTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !taskDate) return;

    const selectedDateTime = new Date(`${taskDate}T${taskTime || "23:59"}:00`);
    if (selectedDateTime.getTime() <= Date.now()) {
      showAlert(
        "You cannot schedule a task for a date and time that has already passed.",
        "error",
      );
      return;
    }

    const { email, role } = getUserInfo();
    if (!email) {
      showAlert("User email not found. Please log in again.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const url = editingTodoId
        ? `http://localhost:5000/api/todos/${editingTodoId}`
        : "http://localhost:5000/api/todos";

      const method = editingTodoId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          title: title.trim(),
          description: description.trim(),
          date: taskDate,
          time: taskTime,
        }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setTaskDate("");
        setTaskTime("");
        setEditingTodoId(null);
        setIsModalOpen(false);
        fetchTodos();
        showAlert(
          editingTodoId
            ? "Task updated successfully."
            : "Task scheduled successfully.",
          "success",
        );
      } else {
        showAlert("Failed to save task.", "error");
      }
    } catch (err) {
      console.error("Error saving task:", err);
      showAlert("An error occurred while saving the task.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsDone = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:5000/api/todos/${id}/complete`, {
        method: "PATCH",
      });
      if (res.ok) {
        setTodos((prev) => prev.filter((t) => t._id !== id));
        showAlert("Task completed and removed successfully!", "success");
      } else {
        showAlert("Failed to mark task as done.", "error");
      }
    } catch (err) {
      console.error("Error completing task:", err);
      showAlert("An error occurred while completing the task.", "error");
    }
  };

  const handleDeleteTodo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTodos((prev) => prev.filter((t) => t._id !== id));
        showAlert("Task deleted successfully.", "success");
      } else {
        showAlert("Failed to delete task.", "error");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      showAlert("An error occurred while deleting the task.", "error");
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={submitting}
      />

      <div className="card shadow-sm faculty-card d-flex flex-column h-100 border-0 rounded-4">
        <div className="card-body p-3 p-md-4 d-flex flex-column h-100">
          {/* Widget Header */}
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3 pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-inline-flex align-items-center justify-content-center text-primary bg-primary-subtle rounded-3 flex-shrink-0"
                style={{ width: 38, height: 38 }}
              >
                <CheckSquare size={19} />
              </div>
              <h5 className="mb-0 fw-bold text-dark fs-6 fs-md-5">
                My To-Do List
              </h5>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-primary d-inline-flex align-items-center justify-content-center gap-1.5 px-3 py-1.5 rounded-pill shadow-sm align-self-start align-self-sm-auto"
              onClick={handleOpenAddModal}
            >
              <Plus size={15} />
              <span>Add Task</span>
            </button>
          </div>

          {/* Tasks List Content */}
          <div
            className="faculty-task-list flex-grow-1 overflow-auto pe-1"
            style={{ maxHeight: "310px" }}
          >
            {loading ? (
              <div className="text-center py-5 text-muted">
                <Loader2
                  size={24}
                  className="spinner-border spinner-border-sm text-primary mb-2"
                />
                <p className="small mb-0">Loading your tasks...</p>
              </div>
            ) : todos.length > 0 ? (
              <div className="d-flex flex-column gap-2.5">
                {todos.map((t) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-3 border bg-white d-flex align-items-start justify-content-between gap-3 shadow-sm transition-all position-relative"
                    style={{ borderColor: "#e2e8f0" }}
                  >
                    {/* Task Info Wrapper */}
                    <div
                      className="min-w-0 flex-grow-1"
                      style={{
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                    >
                      <h6
                        className="fw-bold text-dark mb-1"
                        style={{ fontSize: "0.95rem", lineHeight: "1.4" }}
                      >
                        {t.title}
                      </h6>
                      {t.description && (
                        <p
                          className="text-muted small mb-2"
                          style={{ fontSize: "0.85rem", lineHeight: "1.3" }}
                        >
                          {t.description}
                        </p>
                      )}
                      <span
                        className="badge border font-monospace px-2 py-1.5 d-inline-flex align-items-center gap-1.5 rounded-2 bg-light text-secondary"
                        style={{ fontSize: "0.73rem", whiteSpace: "nowrap" }}
                      >
                        <Clock size={12} className="flex-shrink-0" />
                        {formatDateTime(t.dueDate)}
                      </span>
                    </div>

                    {/* Action Buttons: Complete, Edit, and Trash side-by-side */}
                    <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        className="btn btn-sm btn-light text-success p-2 rounded-circle border-0 d-flex align-items-center justify-content-center"
                        title="Mark as Done"
                        onClick={(e) => handleMarkAsDone(t._id, e)}
                        style={{ width: 34, height: 34 }}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-light text-primary p-2 rounded-circle border-0 d-flex align-items-center justify-content-center"
                        title="Edit Task"
                        onClick={() => handleOpenEditModal(t)}
                        style={{ width: 34, height: 34 }}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-light text-danger p-2 rounded-circle border-0 d-flex align-items-center justify-content-center"
                        title="Delete Task"
                        onClick={(e) => handleDeleteTodo(t._id, e)}
                        style={{ width: 34, height: 34 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                <div className="fs-2 mb-2">📋</div>
                <h6 className="fw-semibold text-dark mb-1">
                  No custom tasks yet
                </h6>
                <p className="text-muted small mb-0 px-3">
                  Click &ldquo;Add Task&rdquo; to schedule your tasks by
                  separate date and time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      {isModalOpen &&
        createPortal(
          <div
            className="modal-backdrop-custom"
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 1050,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <div
              className="card shadow-lg border-0 rounded-4 w-100 overflow-hidden animate-scale my-auto"
              style={{
                maxWidth: "480px",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="d-flex align-items-center justify-content-between p-3 p-md-4 pb-3 border-bottom bg-white flex-shrink-0">
                <div className="d-flex align-items-center gap-2.5">
                  <div
                    className="d-inline-flex align-items-center justify-content-center text-primary bg-primary-subtle rounded-3 p-2"
                    style={{ width: 40, height: 40 }}
                  >
                    <CheckSquare size={20} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark fs-6 fs-md-5">
                      {editingTodoId ? "Edit Task" : "Schedule New Task"}
                    </h5>
                    <p className="text-muted small mb-0 d-none d-sm-block">
                      {editingTodoId
                        ? "Modify task details and timeline"
                        : "Set task title, description, date and time"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-light rounded-circle p-2 border-0 d-flex align-items-center justify-content-center text-secondary"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleSaveTodo}
                className="d-flex flex-column overflow-hidden flex-grow-1"
              >
                <div className="p-3 p-md-4 bg-light d-flex flex-column gap-3 overflow-auto flex-grow-1">
                  <div>
                    <label className="form-label fw-semibold text-dark small mb-1">
                      Task Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-md shadow-none rounded-3"
                      placeholder="e.g. Upload Midterm Grades"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label fw-semibold text-dark small mb-1">
                      Description{" "}
                      <span className="text-muted fw-normal">(Optional)</span>
                    </label>
                    <textarea
                      className="form-control form-control-md shadow-none rounded-3"
                      rows={2}
                      placeholder="Add any extra instructions or details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-12 col-sm-7">
                      <label className="form-label fw-semibold text-dark small mb-1">
                        Due Date <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 rounded-start-3 text-muted">
                          <Calendar size={16} />
                        </span>
                        <input
                          type="date"
                          className="form-control form-control-md shadow-none border-start-0 rounded-end-3 ps-0"
                          value={taskDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setTaskDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-sm-5">
                      <label className="form-label fw-semibold text-dark small mb-1">
                        Due Time <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 rounded-start-3 text-muted">
                          <Clock size={16} />
                        </span>
                        <input
                          type="time"
                          className="form-control form-control-md shadow-none border-start-0 rounded-end-3 ps-0"
                          value={taskTime}
                          onChange={(e) => setTaskTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-white px-3 px-md-4 py-3 d-flex justify-content-end gap-2 flex-shrink-0">
                  <button
                    type="button"
                    className="btn btn-light border px-3 px-md-4 py-2 rounded-3 text-secondary fw-medium shadow-none"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-3 px-md-4 py-2 rounded-3 fw-medium d-inline-flex align-items-center gap-2 shadow-none"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={16}
                          className="spinner-border spinner-border-sm"
                        />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingTodoId ? "Update Task" : "Save Task"}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}