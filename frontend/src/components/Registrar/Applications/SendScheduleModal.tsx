import { X, Calendar, Clock, MapPin, Info } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

type StudentMini = { id: string; name: string; email?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  students: StudentMini[];
  onSubmit: (payload: {
    studentIds: string[];
    date: string;
    time: string;
    location: string;
    notes: string;
  }) => Promise<void> | void; // ✅ allow async submit
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

  const [sending, setSending] = useState(false); // ✅
  const [error, setError] = useState<string | null>(null); // ✅

  const count = students.length;
  const title = useMemo(() => "Send Enrollment Schedule", []);

  // ✅ reset form every time modal opens
  useEffect(() => {
    if (open) {
      setDate("");
      setTime("");
      setLocation("");
      setNotes("");
      setError(null);
      setSending(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSend = async () => {
    try {
      setSending(true);
      setError(null);

      await onSubmit({
        studentIds: students.map((s) => s.id),
        date,
        time,
        location,
        notes,
      });

      // ✅ close after successful send
      onClose();
    } catch (e) {
      console.error(e);
      setError((e as Error).message || "Failed to send schedule");
    } finally {
      setSending(false);
    }
  };

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
            disabled={sending}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="rs-modal-body">
          <p className="rs-muted">
            Send an enrollment schedule notification to <b>{count}</b> selected
            student(s).
          </p>

          <div className="rs-student-box">
            {students.map((s) => (
              <div className="rs-student-row" key={s.id}>
                <div className="rs-student-name">{s.name}</div>
                <div className="rs-student-email">{s.email ?? ""}</div>
              </div>
            ))}
          </div>

          {/* ✅ show error */}
          {error && (
            <div style={{ marginTop: 10, color: "crimson", fontSize: 14 }}>
              {error}
            </div>
          )}

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
                disabled={sending}
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
                disabled={sending}
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
              disabled={sending}
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
              disabled={sending}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="rs-modal-footer">
          <button
            className="rs-btn rs-btn-ghost"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </button>

          <button
            className="rs-btn rs-btn-primary"
            onClick={handleSend}
            disabled={!date || !time || !location || students.length === 0 || sending}
          >
            {sending ? "Sending..." : `Send Schedule to ${count} Student(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
