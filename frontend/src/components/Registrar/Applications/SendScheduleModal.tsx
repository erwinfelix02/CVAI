// src/components/Registrar/Applications/SendScheduleModal.tsx

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
  }) => Promise<void> | void;
};

const DEFAULT_NOTES = `Please bring the following required documents during your scheduled visit:
- Original Birth Certificate (PSA)
- Original Good Moral Certificate
- 2x2 ID Photo`
;

export default function SendScheduleModal({
  open,
  onClose,
  students,
  onSubmit,
}: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState(DEFAULT_NOTES);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = students.length;
  const title = useMemo(() => "Send Enrollment Schedule", []);

  // Get tomorrow's date string in YYYY-MM-DD format as the minimum allowed date
  const minDateStr = useMemo(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1); // Add 1 day so today cannot be selected
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Generate 30-minute time options strictly from 07:30 to 17:00 (5:00 PM)
  const timeOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [];

    // 7:30 AM (07:30)
    options.push({ label: "07:30 AM", value: "07:30" });

    // From 8:00 AM (08:00) to 5:00 PM (17:00)
    for (let hour = 8; hour <= 17; hour++) {
      for (const minute of [0, 30]) {
        if (hour === 17 && minute > 0) break; // Don't go past 17:00

        const hourStr = String(hour).padStart(2, "0");
        const minuteStr = String(minute).padStart(2, "0");
        const value = `${hourStr}:${minuteStr}`;

        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const label = `${String(displayHour).padStart(2, "0")}:${minuteStr} ${ampm}`;

        options.push({ label, value });
      }
    }
    return options;
  }, []);

  useEffect(() => {
    if (open) {
      setDate("");
      setTime("");
      setLocation("");
      setNotes(DEFAULT_NOTES);
      setError(null);
      setSending(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSend = async () => {
    if (!date || !time || !location || students.length === 0 || sending) return;

    // Validate against past dates or times
    const selectedDateTime = new Date(`${date}T${time}`);
    if (selectedDateTime < new Date()) {
      setError("Cannot schedule an appointment in the past.");
      return;
    }

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
    } catch (e) {
      console.error(e);
      setError((e as Error).message || "Failed to send schedule");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="rs-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (!sending) onClose();
      }}
    >
      <div
        className="rs-modal"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rs-modal-header">
          <div className="rs-modal-title">
            <Calendar size={18} />
            <span>{title}</span>
          </div>

          <button
            className="rs-icon-btn"
            onClick={() => {
              if (!sending) onClose();
            }}
            aria-label="Close modal"
            disabled={sending}
          >
            <X size={18} />
          </button>
        </div>

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
                min={minDateStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={sending}
              />
            </div>

            <div className="rs-field">
              <label className="rs-label">
                <Clock size={16} /> Time (7:30 AM - 5:00 PM)
              </label>
              <select
                className="rs-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={sending}
              >
                <option value="" disabled>
                  Select Time Slot
                </option>
                {timeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
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
              <Info size={16} /> Additional Information / Documents to Bring
            </label>
            <textarea
              className="rs-textarea"
              placeholder="List document requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              disabled={sending}
            />
          </div>
        </div>

        <div className="rs-modal-footer">
          <button
            className="rs-btn rs-btn-ghost"
            onClick={() => {
              if (!sending) onClose();
            }}
            disabled={sending}
          >
            Cancel
          </button>

          <button
            className="rs-btn rs-btn-primary"
            onClick={handleSend}
            disabled={
              !date || !time || !location || students.length === 0 || sending
            }
          >
            {sending ? "Sending..." : `Send Schedule to ${count} Student(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}