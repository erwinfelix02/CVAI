// ✅ src/components/DepartmentHead/Rooms/RoomCard.tsx

import {
  DoorOpen,
  Users,
  CalendarDays,
} from "lucide-react";

export interface RoomRow {
  id: number;
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

export default function RoomCard({
  room,
  onViewSchedule,
}: RoomCardProps) {
  /* =========================================================
     UTILIZATION
     ========================================================= */

  const utilization = Math.min(
    Math.max(room.utilization, 0),
    100
  );

  return (
    <div className="room-card h-100">
      {/* =====================================================
          TOP ROW
          ===================================================== */}

      <div className="room-card-header">
        <div className="room-title-wrapper">
          <DoorOpen
            size={21}
            className="room-title-icon"
          />

          <h5 className="room-name">
            {room.name}
          </h5>
        </div>

        <span className="room-type-badge">
          {room.type}
        </span>
      </div>

      {/* =====================================================
          BUILDING
          ===================================================== */}

      <div className="room-building">
        {room.building}
      </div>

      {/* =====================================================
          ROOM DETAILS
          ===================================================== */}

      <div className="room-details">
        <div className="room-detail">
          <Users size={19} />

          <span>
            {room.seats} seats
          </span>
        </div>

        <div className="room-detail">
          <CalendarDays size={19} />

          <span>
            {room.classes}{" "}
            {room.classes === 1
              ? "class"
              : "classes"}
          </span>
        </div>
      </div>

      {/* =====================================================
          UTILIZATION
          ===================================================== */}

      <div className="room-utilization">
        <div className="room-utilization-header">
          <span>Utilization</span>

          <span>
            {utilization}%
          </span>
        </div>

        <div className="room-progress">
          <div
            className="room-progress-bar"
            style={{
              width: `${utilization}%`,
            }}
          />
        </div>
      </div>

      {/* =====================================================
          VIEW SCHEDULE
          ===================================================== */}

      <button
        type="button"
        className="room-schedule-btn"
        onClick={() =>
          onViewSchedule?.(room)
        }
      >
        View Schedule
      </button>
    </div>
  );
}