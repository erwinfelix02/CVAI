// src/components/DepartmentHead/Rooms/RoomScheduleModal.tsx
import { X, Loader2, AlertCircle } from "lucide-react";
import type { ScheduleItem } from "../../../services/scheduleService";


interface RoomScheduleModalProps {
  isOpen: boolean;
  roomName: string;
  schedules: ScheduleItem[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export default function RoomScheduleModal({
  isOpen,
  roomName,
  schedules,
  loading,
  error,
  onClose,
}: RoomScheduleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="room-modal-overlay" onClick={onClose}>
      <div className="room-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="room-modal-header">
          <h2>{roomName} Schedule</h2>
          <button type="button" className="room-modal-close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="room-modal-body">
          {loading && (
            <div className="room-modal-state">
              <Loader2 className="animate-spin" size={24} />
              <p>Loading schedule...</p>
            </div>
          )}

          {!loading && error && (
            <div className="room-modal-state error">
              <AlertCircle size={24} />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && schedules.length === 0 && (
            <div className="room-modal-state">
              <p>No scheduled classes found for this room.</p>
            </div>
          )}

          {!loading && !error && schedules.length > 0 && (
            <div className="room-modal-list">
              {schedules.map((item) => (
                <div key={item._id} className="room-schedule-card">
                  <span className="room-schedule-code">{item.code}</span>
                  <span className="room-schedule-time">
                    {item.days} {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="room-modal-footer">
          <button type="button" className="room-modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}