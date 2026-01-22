import { AlertCircle } from "lucide-react";
import TaskRow from "./TaskRow";

const tasks = [
  { title: "Grade CS 201 Midterm Exams", date: "Today", tone: "danger" as const },
  { title: "Submit Course Outline", date: "Tomorrow", tone: "warning" as const },
  { title: "Faculty Meeting Preparation", date: "Mar 20", tone: "success" as const },
    { title: "Faculty Meeting Preparation", date: "Mar 20", tone: "success" as const },
];

export default function PendingTasks() {
  return (
    <div className="card shadow-sm faculty-card">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="section-icon warn">
            <AlertCircle size={18} />
          </span>
          <h5 className="mb-0 fw-bold">Pending Tasks</h5>
        </div>

        {/* ✅ Scrollable task list */}
        <div className="faculty-task-list">
          {tasks.map((t) => (
            <TaskRow key={t.title} {...t} />
          ))}
        </div>
      </div>
    </div>
  );
}

