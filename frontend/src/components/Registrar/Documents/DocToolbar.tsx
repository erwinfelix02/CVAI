import { Search } from "lucide-react";
import type { DocStatus } from "./types";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;

  status: "All Status" | DocStatus;
  onStatusChange: (v: "All Status" | DocStatus) => void;

  statusOptions: Array<"All Status" | DocStatus>;
};

export default function DocToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  statusOptions,
}: Props) {
  return (
    <div className="card shadow-sm docs-toolbar mb-3 mb-md-4">
      <div className="card-body">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-lg-9">
            <div className="docs-search">
              <Search size={18} className="docs-search-ic" />
              <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                className="form-control docs-search-input"
                placeholder="Search by student name or request ID..."
              />
            </div>
          </div>

          <div className="col-12 col-lg-3">
            <select
              className="form-select docs-select"
              value={status}
              onChange={(e) => onStatusChange(e.target.value as any)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
