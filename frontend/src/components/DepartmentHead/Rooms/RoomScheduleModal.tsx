// src/components/DepartmentHead/Rooms/RoomScheduleModal.tsx
import { X, Loader2, AlertCircle, User, Clock, BookOpen } from "lucide-react";
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
            <div className="room-modal-list" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {schedules.map((item) => (
                <div 
                  key={item._id} 
                  className="room-schedule-card"
                  style={{
                    padding: "0.85rem 1rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="room-schedule-code" style={{ fontWeight: 600, color: "#1f2937", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <BookOpen size={16} color="#2563eb" />
                      {item.code} {item.title ? `- ${item.title}` : ""}
                    </span>
                    <span 
                      style={{ 
                        fontSize: "0.75rem", 
                        padding: "0.15rem 0.5rem", 
                        borderRadius: "999px", 
                        backgroundColor: "#dbeafe", 
                        color: "#1e40af",
                        fontWeight: 500
                      }}
                    >
                      {item.section}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#4b5563", marginTop: "0.25rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <User size={15} color="#6b7280" />
                      <strong>Faculty:</strong> {item.faculty || "Unassigned"}
                    </span>
                    <span className="room-schedule-time" style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 500, color: "#374151" }}>
                      <Clock size={15} color="#6b7280" />
                      {item.days} {item.time}
                    </span>
                  </div>
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