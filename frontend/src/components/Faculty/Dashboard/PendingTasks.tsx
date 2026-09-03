import { AlertCircle } from "lucide-react";
import TaskRow from "./TaskRow";

const tasks = [
  {
    title: "Grade CS 201 Midterm Exams",
    date: "Today",
    tone: "danger" as const,
  },
  {
    title: "Submit Course Outline",
    date: "Tomorrow",
    tone: "warning" as const,
  },
  {
    title: "Faculty Meeting Preparation",
    date: "Mar 20",
    tone: "success" as const,
  },
];

export default function PendingTasks() {
  return (
    <div className="card shadow-sm faculty-card d-flex flex-column h-100">
      <div className="card-body p-3 p-md-4 d-flex flex-column h-100">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="faculty-section-icon warn">
            <AlertCircle size={18} />
          </span>
          <h5 className="mb-0">Pending Tasks</h5>
        </div>

        <div className="faculty-task-list flex-grow-1">
          {tasks.map((t, index) => (
            <TaskRow key={`${t.title}-${index}`} {...t} />
          ))}
        </div>
      </div>
    </div>
  );
}