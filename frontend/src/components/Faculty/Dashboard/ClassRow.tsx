import { CheckCircle2 } from "lucide-react";

export default function ClassRow({
  time,
  code,
  title,
  meta,
  status,
}: {
  time: string;
  code: string;
  title: string;
  meta: string;
  status: "completed" | "ongoing" | "upcoming";
}) {
  return (
    <div className={`faculty-class-row ${status}`}>
      <div className="faculty-class-time">{time}</div>

      <div className="flex-grow-1 min-w-0">
        <div className="faculty-class-title text-truncate">
          <span className="faculty-class-code">{code}</span>
          <span className="faculty-class-sep"> - </span>
          <span className="faculty-class-name">{title}</span>
        </div>
        <div className="faculty-class-meta text-truncate">{meta}</div>
      </div>

      <span className={`faculty-status-pill ${status}`}>
        {status === "completed" && <CheckCircle2 size={13} className="me-1" />}
        {status}
      </span>
    </div>
  );
}