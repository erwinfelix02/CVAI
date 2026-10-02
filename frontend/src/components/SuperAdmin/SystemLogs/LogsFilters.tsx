import { Search, ChevronDown } from "lucide-react";
import type { LogStatus, LogType } from "./types";

type Props = {
  query: string;
  setQuery: (v: string) => void;
  type: LogType | "All";
  setType: (v: LogType | "All") => void;
  status: LogStatus | "All";
  setStatus: (v: LogStatus | "All") => void;
};

export default function LogsFilters({
  query,
  setQuery,
  type,
  setType,
  status,
  setStatus,
}: Props) {
  return (
    <div className="card shadow-sm superadmin-logs-card mb-3">
      <div className="card-body p-3">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-lg">
            <div className="superadmin-logs-search">
              <span className="superadmin-logs-search-ic">
                <Search size={16} />
              </span>
              <input
                className="form-control superadmin-logs-search-input"
                placeholder="Search logs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-lg-auto">
            <div className="superadmin-logs-select">
              <select
                className="form-select superadmin-logs-select-control"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="All">All Types</option>
                <option value="Auth">Auth</option>
                <option value="Data">Data</option>
                <option value="Security">Security</option>
                <option value="System">System</option>
              </select>
              <ChevronDown size={16} className="superadmin-logs-select-caret" />
            </div>
          </div>

          <div className="col-12 col-lg-auto">
            <div className="superadmin-logs-select">
              <select
                className="form-select superadmin-logs-select-control"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="All">All Status</option>
                <option value="success">success</option>
                <option value="warning">warning</option>
                <option value="error">error</option>
              </select>
              <ChevronDown size={16} className="superadmin-logs-select-caret" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
