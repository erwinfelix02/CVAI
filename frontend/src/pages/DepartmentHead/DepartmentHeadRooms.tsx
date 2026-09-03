// src/pages/DepartmentHead/DepartmentHeadRooms.tsx

import { useEffect, useMemo, useState } from "react";
import { Plus, Loader2, AlertCircle } from "lucide-react";

import RoomSearch from "../../components/DepartmentHead/Rooms/RoomSearch";
import RoomCard, {
  type RoomRow,
} from "../../components/DepartmentHead/Rooms/RoomCard";
import RoomScheduleModal from "../../components/DepartmentHead/Rooms/RoomScheduleModal";

import { fetchRoomsByDepartment } from "../../services/roomService";
import { fetchUserProfile } from "../../services/userService";
import {
  fetchSchedulesByDepartment,
  type ScheduleItem,
} from "../../services/scheduleService";

import "../../styles/department-headRooms.css";

/* Helper function to convert 24hr or "13:00-14:30" string to weekly hours */
function parseWeeklyHours(daysStr: string, timeStr: string): number {
  if (!timeStr || !timeStr.includes("-")) return 1.5; // fallback duration per session

  const [start, end] = timeStr.split("-").map((t) => t.trim());

  const parseMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (isNaN(h) ? 0 : h * 60) + (isNaN(m) ? 0 : m);
  };

  const durationMinutes = parseMinutes(end) - parseMinutes(start);
  const sessionHours = Math.max(durationMinutes, 30) / 60; // minimum 30 min default

  // Calculate day multiplier
  let daysCount = 1;
  if (daysStr === "MWF") daysCount = 3;
  else if (daysStr === "TTh") daysCount = 2;
  else if (daysStr) daysCount = daysStr.split(/[\s,]+/).filter(Boolean).length;

  return sessionHours * daysCount;
}

export default function DepartmentHeadRooms() {
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [userDepartment, setUserDepartment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roomType, setRoomType] = useState("All Types");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomName, setSelectedRoomName] = useState("");
  const [roomSchedules, setRoomSchedules] = useState<ScheduleItem[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDepartmentRooms() {
      try {
        setLoading(true);
        setError(null);

        const profile = await fetchUserProfile();
        const dept = profile.department;
        setUserDepartment(dept);

        if (!dept) {
          setError("No department associated with this account.");
          return;
        }

        // Fetch room metadata & current schedule entries concurrently
        const [rawRooms, departmentSchedules] = await Promise.all([
          fetchRoomsByDepartment(dept),
          fetchSchedulesByDepartment(dept).catch(() => []),
        ]);

        // Total available operating hours per week per room (e.g., 50 hours = Mon-Fri 8AM-6PM)
        const TOTAL_AVAILABLE_HOURS_PER_WEEK = 50;

        const formattedRooms: RoomRow[] = rawRooms.map((room: any) => {
          const roomNameLower = (room.name || "").trim().toLowerCase();

          // Find active class schedules allocated to this room
          const matchingSchedules = departmentSchedules.filter(
            (sched: ScheduleItem) =>
              (sched.room || "").trim().toLowerCase() === roomNameLower &&
              (sched.status ? sched.status.toLowerCase() === "active" : true)
          );

          // Calculate total weekly hours occupied
          const totalOccupiedHours = matchingSchedules.reduce((acc, sched) => {
            return acc + parseWeeklyHours(sched.days, sched.time);
          }, 0);

          // Calculate dynamic utilization percentage
          const dynamicUtilization = Math.min(
            100,
            Math.round((totalOccupiedHours / TOTAL_AVAILABLE_HOURS_PER_WEEK) * 100)
          );

          return {
            id: room._id || room.name,
            name: room.name,
            building: room.building || "Main Building",
            type: room.type || "Lecture",
            seats: room.seats || 40,
            classes: matchingSchedules.length, // Dynamic assigned class count
            utilization: dynamicUtilization,   // Dynamic calculated percentage
          };
        });

        setRooms(formattedRooms);
      } catch (err: any) {
        console.error("Error loading rooms for department:", err);
        setError(err.message || "Failed to load rooms.");
      } finally {
        setLoading(false);
      }
    }

    loadDepartmentRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch =
        room.name.toLowerCase().includes(keyword) ||
        room.building.toLowerCase().includes(keyword);

      const matchesType = roomType === "All Types" || room.type === roomType;

      return matchesSearch && matchesType;
    });
  }, [rooms, search, roomType]);

  const handleRequestRoom = () => {
    console.log("Request Room");
  };

  const handleViewSchedule = async (room: RoomRow) => {
    setSelectedRoomName(room.name);
    setIsModalOpen(true);
    setModalLoading(true);
    setModalError(null);

    try {
      if (!userDepartment) {
        throw new Error("Missing user department context.");
      }

      const allSchedules = await fetchSchedulesByDepartment(userDepartment);

      const matchingSchedules = allSchedules.filter(
        (sched) =>
          sched.room.trim().toLowerCase() === room.name.trim().toLowerCase()
      );

      setRoomSchedules(matchingSchedules);
    } catch (err: any) {
      console.error("Error fetching room schedules:", err);
      setModalError(err.message || "Could not fetch room schedule.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="rooms-page">
      <div className="rooms-page-content">
        <div className="rooms-page-header">
          <div className="rooms-page-title">
            <h1>Room Allocation</h1>
            <p>
              {userDepartment
                ? `Managing rooms and allocated sections for ${userDepartment}`
                : "Track room usage and available time slots"}
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

        <div className="rooms-filter-card">
          <RoomSearch
            search={search}
            onSearchChange={setSearch}
            roomType={roomType}
            onRoomTypeChange={setRoomType}
          />
        </div>

        {/* Updated Loading State with Spinning Icon */}
        {loading && (
          <div
            className="rooms-loading-state"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4rem 2rem",
              color: "#6b7280",
            }}
          >
            <Loader2
              size={36}
              style={{
                animation: "spin 1s linear infinite",
                marginBottom: "0.75rem",
                color: "#2563eb",
              }}
            />
            <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 500 }}>
              Loading rooms for {userDepartment || "department"}...
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            className="rooms-error-state"
            style={{ textAlign: "center", color: "#e11d48", padding: "2rem" }}
          >
            <AlertCircle size={32} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredRooms.length > 0 && (
          <div className="rooms-grid">
            {filteredRooms.map((room) => (
              <div className="rooms-grid-item" key={room.id}>
                <RoomCard room={room} onViewSchedule={handleViewSchedule} />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredRooms.length === 0 && (
          <div className="rooms-empty-state">
            <h5>No rooms found</h5>
            <p>
              No sections/rooms found matching your department or search
              criteria.
            </p>
          </div>
        )}
      </div>

      <RoomScheduleModal
        isOpen={isModalOpen}
        roomName={selectedRoomName}
        schedules={roomSchedules}
        loading={modalLoading}
        error={modalError}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}