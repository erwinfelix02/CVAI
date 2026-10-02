// src/components/DepartmentHead/Schedules/ScheduleToolbar.tsx
import { Search, Filter } from "lucide-react";
import type { DayFilter } from "./types";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;

  day: DayFilter;
  onDayChange: (v: DayFilter) => void;
};

export default function ScheduleToolbar({ query, onQueryChange, day, onDayChange }: Props) {
  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-3 p-md-4">
        <div className="row g-3 align-items-center">
          {/* Search */}
          <div className="col-12 col-lg">
            <div className="input-group input-group-lg dept-input">
              <span className="input-group-text bg-white border-end-0 rounded-start-4">
                <Search size={18} className="text-muted" />
              </span>
              <input
                className="form-control border-start-0 rounded-end-4"
                placeholder="Search by subject, faculty, or code..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
              />
            </div>
          </div>

          {/* Filter */}
          <div className="col-12 col-lg-auto">
            <div className="input-group input-group-lg dept-filter">
              <span className="input-group-text bg-white rounded-start-4">
                <Filter size={18} className="text-muted" />
              </span>
              <select
                className="form-select rounded-end-4"
                value={day}
                onChange={(e) => onDayChange(e.target.value as DayFilter)}
                style={{ minWidth: 170 }}
              >
                <option>All Days</option>
                <option>MWF</option>
                <option>TTh</option>
                <option>Sat</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
