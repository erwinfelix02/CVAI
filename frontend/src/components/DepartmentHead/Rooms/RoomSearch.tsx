// ✅ src/components/DepartmentHead/Rooms/RoomSearch.tsx

import {
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";

interface RoomSearchProps {
  search: string;
  onSearchChange: (value: string) => void;

  roomType: string;
  onRoomTypeChange: (value: string) => void;
}

export default function RoomSearch({
  search,
  onSearchChange,
  roomType,
  onRoomTypeChange,
}: RoomSearchProps) {
  return (
    <div className="room-search-wrapper">
      {/* =====================================================
          SEARCH
          ===================================================== */}

      <div className="room-search-box">
        <Search
          size={21}
          className="room-search-icon"
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search room or building..."
        />
      </div>

      {/* =====================================================
          TYPE FILTER
          ===================================================== */}

      <div className="room-type-filter">
        <Filter size={19} />

        <select
          value={roomType}
          onChange={(event) =>
            onRoomTypeChange(event.target.value)
          }
          aria-label="Filter by room type"
        >
          <option value="All Types">
            All Types
          </option>

          <option value="Lecture">
            Lecture
          </option>

          <option value="Laboratory">
            Laboratory
          </option>
        </select>

        <ChevronDown
          size={18}
          className="room-filter-arrow"
        />
      </div>
    </div>
  );
}