import { Sparkles } from "lucide-react";

interface FeatureCard {
  tag: string;
  tagClass: string;
  date: string;
  title: string;
  description: string;
}

const features: FeatureCard[] = [
  {
    tag: "New",
    tagClass: "bg-success-subtle text-success border border-success-subtle",
    date: "Sep 2026",
    title: "Class Details Modal",
    description:
      "Click Students, Materials, or Grades on any class card in My Classes to open a full tabbed view with roster search, grade averages, and material downloads.",
  },
  {
    tag: "New",
    tagClass: "bg-success-subtle text-success border border-success-subtle",
    date: "Sep 2026",
    title: "Email Class Report",
    description:
      "Send a formatted class report (PDF, CSV, or HTML) with roster, attendance, grades, and materials to your inbox or the Registrar.",
  },
  {
    tag: "Improved",
    tagClass: "bg-primary-subtle text-primary border border-primary-subtle",
    date: "Aug 2026",
    title: "Attendance Bulk Actions",
    description:
      "Mark the whole class present in one click, then adjust only the exceptions before submitting.",
  },
  {
    tag: "Improved",
    tagClass: "bg-primary-subtle text-primary border border-primary-subtle",
    date: "Aug 2026",
    title: "Message Templates",
    description:
      "Email students with ready-made templates for attendance warnings, grade concerns, and consultation invites.",
  },
];

export default function WhatsNewSection() {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <div className="d-flex align-items-center gap-2 mb-3">
        <Sparkles className="text-warning" size={20} />
        <h5 className="fw-bold mb-0">What's New in the Faculty Portal</h5>
      </div>

      <div className="row g-3">
        {features.map((item, idx) => (
          <div key={idx} className="col-12 col-md-6">
            <div className="card h-100 border rounded-4 p-3 shadow-none bg-light-subtle">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className={`badge px-2 py-1 rounded-pill small fw-medium ${item.tagClass}`}>
                  {item.tag}
                </span>
                <small className="text-muted">{item.date}</small>
              </div>
              <h6 className="fw-bold mb-1">{item.title}</h6>
              <p className="text-muted small mb-0">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}