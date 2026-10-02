import { Clock, MapPin, User } from "lucide-react";

interface ScheduleCardProps {
  time: string;
  title: string;
  code: string;
  room: string;
  instructor: string;
  type: "Lecture" | "Laboratory";
}

export default function ScheduleCard({
  time,
  title,
  code,
  room,
  instructor,
  type,
}: ScheduleCardProps) {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body d-flex flex-column flex-md-row justify-content-between gap-3">
        {/* Left */}
        <div className="d-flex gap-3">
          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center"
               style={{ width: 40, height: 40 }}>
            <Clock size={18} />
          </div>

          <div>
            <div className="fw-semibold">{time}</div>
            <h6 className="mb-0 fw-bold">{title}</h6>
            <small className="text-muted">{code}</small>

            <div className="text-muted small mt-1 d-flex gap-3 flex-wrap">
              <span><MapPin size={14} /> {room}</span>
              <span><User size={14} /> {instructor}</span>
            </div>
          </div>
        </div>

        {/* Right badge */}
        <div className="align-self-md-center">
          <span
            className={`badge rounded-pill px-3 py-2 ${
              type === "Lecture" ? "bg-primary-subtle text-primary" : "bg-purple-subtle text-purple"
            }`}
          >
            {type}
          </span>
        </div>
      </div>
    </div>
  );
}
