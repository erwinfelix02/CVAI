import { X, Calendar, Clock, MapPin, Info } from "lucide-react";
import { useMemo, useState } from "react";

type StudentMini = { id: string; name: string; email?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  students: StudentMini[]; // selected approved students
  onSubmit: (payload: {
    studentIds: string[];
    date: string;
    time: string;
    location: string;
    notes: string;
  }) => void;
};

export default function SendScheduleModal({
  open,
  onClose,
  students,
  onSubmit,
}: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const count = students.length;

  const title = useMemo(() => "Send Enrollment Schedule", []);

  if (!open) return null;

  return (
    <div className="rs-modal-backdrop" role="dialog" aria-modal="true">
      <div className="rs-modal" role="document">
        {/* Header */}
        <div className="rs-modal-header">
          <div className="rs-modal-title">
            <Calendar size={18} />
            <span>{title}</span>
          </div>

          <button
            className="rs-icon-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="rs-modal-body">
          <p className="rs-muted">
            Send an enrollment schedule notification to <b>{count}</b> selected
            student(s).
          </p>

          {/* Selected students */}
          <div className="rs-student-box">
            {students.map((s) => (
              <div className="rs-student-row" key={s.id}>
                <div className="rs-student-name">{s.name}</div>
                <div className="rs-student-email">{s.email ?? ""}</div>
              </div>
            ))}
          </div>

          {/* Date + Time (responsive grid) */}
          <div className="rs-grid-2">
            <div className="rs-field">
              <label className="rs-label">
                <Calendar size={16} /> Date
              </label>
              <input
                className="rs-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="rs-field">
              <label className="rs-label">
                <Clock size={16} /> Time
              </label>
              <input
                className="rs-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="rs-field">
            <label className="rs-label">
              <MapPin size={16} /> Room / Location
            </label>
            <input
              className="rs-input"
              placeholder="e.g. Room 201, Admin Building"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="rs-field">
            <label className="rs-label">
              <Info size={16} /> Additional Information (optional)
            </label>
            <textarea
              className="rs-textarea"
              placeholder="e.g. Bring original documents, wear school uniform..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="rs-modal-footer">
          <button className="rs-btn rs-btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="rs-btn rs-btn-primary"
            onClick={() =>
              onSubmit({
                studentIds: students.map((s) => s.id),
                date,
                time,
                location,
                notes,
              })
            }
            disabled={!date || !time || !location || students.length === 0}
          >
            Send Schedule to {count} Student(s)
          </button>
        </div>
      </div>
    </div>
  );
}
