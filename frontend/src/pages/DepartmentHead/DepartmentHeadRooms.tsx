// ✅ src/pages/DepartmentHead/DepartmentHeadRooms.tsx

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import RoomSearch from "../../components/DepartmentHead/Rooms/RoomSearch";

import RoomCard, {
  type RoomRow,
} from "../../components/DepartmentHead/Rooms/RoomCard";

import "../../styles/department-headRooms.css";

export default function DepartmentHeadRooms() {
  /* =========================================================
     SEARCH / FILTER
     ========================================================= */

  const [search, setSearch] = useState("");
  const [roomType, setRoomType] = useState("All Types");

  /* =========================================================
     ROOM DATA
     ========================================================= */

  const rooms = useMemo<RoomRow[]>(
    () => [
      {
        id: 1,
        name: "Room 301",
        building: "Main Building",
        type: "Lecture",
        seats: 45,
        classes: 2,
        utilization: 78,
      },
      {
        id: 2,
        name: "Room 302",
        building: "Main Building",
        type: "Lecture",
        seats: 40,
        classes: 1,
        utilization: 55,
      },
      {
        id: 3,
        name: "Lab 1",
        building: "IT Building",
        type: "Laboratory",
        seats: 30,
        classes: 2,
        utilization: 92,
      },
      {
        id: 4,
        name: "Lab 2",
        building: "IT Building",
        type: "Laboratory",
        seats: 30,
        classes: 1,
        utilization: 40,
      },
      {
        id: 5,
        name: "Room 405",
        building: "Annex",
        type: "Lecture",
        seats: 50,
        classes: 1,
        utilization: 30,
      },
    ],
    []
  );

  /* =========================================================
     FILTER ROOMS
     ========================================================= */

  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch =
        room.name.toLowerCase().includes(keyword) ||
        room.building.toLowerCase().includes(keyword);

      const matchesType =
        roomType === "All Types" ||
        room.type === roomType;

      return matchesSearch && matchesType;
    });
  }, [rooms, search, roomType]);

  /* =========================================================
     HANDLERS
     ========================================================= */

  const handleRequestRoom = () => {
    console.log("Request Room");
  };

  const handleViewSchedule = (room: RoomRow) => {
    console.log("View schedule:", room);
  };

  return (
    <div className="rooms-page">
      {/* =====================================================
          PAGE CONTENT
          ===================================================== */}

      <div className="rooms-page-content">
        {/* ===================================================
            HEADER
            =================================================== */}

        <div className="rooms-page-header">
          <div className="rooms-page-title">
            <h1>Room Allocation</h1>

            <p>
              Track room usage and available time slots
            </p>
          </div>

          <button
            type="button"
            className="rooms-request-btn"
            onClick={handleRequestRoom}
          >
            <Plus size={20} />

            <span>Request Room</span>
          </button>
        </div>

        {/* ===================================================
            SEARCH / FILTER
            =================================================== */}

        <div className="rooms-filter-card">
          <RoomSearch
            search={search}
            onSearchChange={setSearch}
            roomType={roomType}
            onRoomTypeChange={setRoomType}
          />
        </div>

        {/* ===================================================
            ROOMS
            =================================================== */}

        {filteredRooms.length > 0 && (
          <div className="rooms-grid">
            {filteredRooms.map((room) => (
              <div
                className="rooms-grid-item"
                key={room.id}
              >
                <RoomCard
                  room={room}
                  onViewSchedule={handleViewSchedule}
                />
              </div>
            ))}
          </div>
        )}

        {/* ===================================================
            EMPTY STATE
            =================================================== */}

        {filteredRooms.length === 0 && (
          <div className="rooms-empty-state">
            <h5>No rooms found</h5>

            <p>
              Try changing your search or room type filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}