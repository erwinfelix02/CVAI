import { Bell } from "lucide-react";
import SubmissionRow from "./SubmissionRow";

const submissions = [
  {
    initials: "MS",
    name: "Maria Santos",
    item: "Project 2 Submission",
    course: "CS 201",
    time: "10 min ago",
  },
  {
    initials: "JD",
    name: "Juan Dela Cruz",
    item: "Homework 5",
    course: "CS 101",
    time: "25 min ago",
  },
  {
    initials: "AR",
    name: "Ana Reyes",
    item: "Lab Report 3",
    course: "CS 301",
    time: "1 hour ago",
  },
];

export default function RecentSubmissions() {
  return (
    <div className="card shadow-sm faculty-card">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="faculty-section-icon purple">
            <Bell size={18} />
          </span>
          <h5 className="mb-0">Recent Student Submissions</h5>
        </div>

        <div className="faculty-submission-list">
          {submissions.map((s, index) => (
            <SubmissionRow key={`${s.name}-${index}`} {...s} />
          ))}
        </div>
      </div>
    </div>
  );
}