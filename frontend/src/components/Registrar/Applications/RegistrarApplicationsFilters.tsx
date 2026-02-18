import { Search, ChevronDown, Calendar, Filter } from "lucide-react";
import type { ApplicationStatus } from "./types";

type Props = {
  query: string;
  setQuery: (v: string) => void;
  status: ApplicationStatus | "All";
  setStatus: (v: ApplicationStatus | "All") => void;

  // ✅ new
  selectedApprovedCount: number;
  onSendSchedule: () => void;
};

export default function RegistrarApplicationsFilters({
  query,
  setQuery,
  status,
  setStatus,
  selectedApprovedCount,
  onSendSchedule,
}: Props) {
  return (
    <div className="card shadow-sm registrar-card mb-3 mb-md-4">
      <div className="card-body registrar-filters-body">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-lg">
            <div className="input-group registrar-search">
              <span className="input-group-text bg-white">
                <Search size={16} />
              </span>
              <input
                className="form-control"
                placeholder="Search by name or application ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-lg-auto">
            <div className="registrar-select">
              <div className="registrar-select-ic">
                <Filter size={16} />
              </div>

              <select
                className="form-select registrar-select-control"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <ChevronDown size={16} className="registrar-select-caret" />
            </div>
          </div>

          {/* ✅ Send Schedule */}
          <div className="col-12 col-lg-auto">
            <button
              type="button"
              className="btn registrar-primary-btn"
              onClick={onSendSchedule}
              disabled={selectedApprovedCount === 0}
            >
              <Calendar size={16} />
              <span className="ms-2">
                Send Schedule ({selectedApprovedCount})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
