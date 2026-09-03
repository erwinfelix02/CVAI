// src/components/DepartmentHead/Rooms/RoomCard.tsx

import { DoorOpen, Users, CalendarDays } from "lucide-react";

export interface RoomRow {
  id: number | string;
  name: string;
  building: string;
  type: "Lecture" | "Laboratory";
  seats: number;
  classes: number;
  utilization: number;
}

interface RoomCardProps {
  room: RoomRow;
  onViewSchedule?: (room: RoomRow) => void;
}

export default function RoomCard({ room, onViewSchedule }: RoomCardProps) {
  const utilization = Math.min(Math.max(room.utilization, 0), 100);

  // Dynamic progress bar color indicator depending on utilization load
  const getProgressBarColor = (val: number) => {
    if (val >= 85) return "#e11d48"; // High utilization (Red/Rose)
    if (val >= 50) return "#2563eb"; // Moderate utilization (Blue)
    return "#10b981";                // Light utilization (Green)
  };

  return (
    <div className="room-card h-100">
      <div className="room-card-header">
        <div className="room-title-wrapper">
          <DoorOpen size={21} className="room-title-icon" />
          <h5 className="room-name">{room.name}</h5>
        </div>
        <span className="room-type-badge">{room.type}</span>
      </div>

      <div className="room-building">{room.building}</div>

      <div className="room-details">
        <div className="room-detail">
          <Users size={19} />
          <span>{room.seats} seats</span>
        </div>

        <div className="room-detail">
          <CalendarDays size={19} />
          <span>
            {room.classes} {room.classes === 1 ? "class" : "classes"}
          </span>
        </div>
      </div>

      <div className="room-utilization">
        <div className="room-utilization-header">
          <span>Utilization</span>
          <span style={{ fontWeight: 600 }}>{utilization}%</span>
        </div>

        <div className="room-progress">
          <div
            className="room-progress-bar"
            style={{
              width: `${utilization}%`,
              backgroundColor: getProgressBarColor(utilization),
              transition: "width 0.3s ease, background-color 0.3s ease",
            }}
          />
        </div>
      </div>

      <button
        type="button"
        className="room-schedule-btn"
        onClick={() => onViewSchedule?.(room)}
      >
        View Schedule
      </button>
    </div>
  );
}