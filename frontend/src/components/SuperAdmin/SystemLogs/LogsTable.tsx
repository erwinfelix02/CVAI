import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LogRow } from "./types";

function RolePill({ role }: { role: LogRow["role"] }) {
  const cls =
    role === "admin"
      ? "admin"
      : role === "faculty"
      ? "faculty"
      : role === "student"
      ? "student"
      : "neutral";

  return <span className={`superadmin-logs-pill role ${cls}`}>{role}</span>;
}

function TypePill({ type }: { type: LogRow["type"] }) {
  const cls =
    type === "Auth"
      ? "auth"
      : type === "Data"
      ? "data"
      : type === "Security"
      ? "security"
      : "system";

  return <span className={`superadmin-logs-pill type ${cls}`}>{type}</span>;
}

function StatusPill({ status }: { status: LogRow["status"] }) {
  const Icon =
    status === "success"
      ? CheckCircle2
      : status === "warning"
      ? AlertTriangle
      : XCircle;

  return (
    <span className={`superadmin-logs-pill status ${status}`}>
      <Icon size={16} className="me-2" />
      {status}
    </span>
  );
}

function formatLogDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatLogTime(time: string) {
  const parsed = new Date(`1970-01-01T${time}`);
  if (Number.isNaN(parsed.getTime())) return time;

  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function LogsTable({ rows }: { rows: LogRow[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [rows, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const startIndex = (safePage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return rows.slice(startIndex, endIndex);
  }, [rows, safePage, rowsPerPage]);

  const startItem = rows.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const endItem = Math.min(safePage * rowsPerPage, rows.length);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getVisiblePages = () => {
    const pages: number[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (safePage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (safePage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [safePage - 2, safePage - 1, safePage, safePage + 1, safePage + 2];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="card shadow-sm superadmin-logs-card">
      <div className="card-body p-0">
        <div className="table-responsive superadmin-logs-tablewrap">
          <table className="table align-middle mb-0 superadmin-logs-table">
            <thead>
              <tr>
                <th className="ps-4">Timestamp</th>
                <th>Action</th>
                <th>User</th>
                <th>Type</th>
                <th>Details</th>
                <th>IP Address</th>
                <th className="pe-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.map((r) => (
                <tr key={r.id}>
                  <td className="ps-4">
                    <div className="fw-semibold">{formatLogDate(r.date)}</div>
                    <div className="text-muted small">
                      {formatLogTime(r.time)}
                    </div>
                  </td>

                  <td className="fw-semibold">{r.action}</td>

                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="superadmin-logs-useric">
                        <User size={14} />
                      </span>
                      <span className="fw-semibold">{r.user}</span>
                      <RolePill role={r.role} />
                    </div>
                  </td>

                  <td>
                    <TypePill type={r.type} />
                  </td>

                  <td className="text-muted superadmin-logs-details">
                    {r.details}
                  </td>

                  <td className="text-muted superadmin-logs-mono">{r.ip}</td>

                  <td className="pe-4">
                    <StatusPill status={r.status} />
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {rows.length > 0 && (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 px-4 py-3 border-top">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="text-muted small">Show</span>
              <select
                className="form-select form-select-sm"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                style={{ width: "90px" }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
              </select>
              <span className="text-muted small">entries</span>
            </div>

            <div className="text-muted small">
              Showing {startItem} to {endItem} of {rows.length} logs
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-light border btn-sm d-flex align-items-center gap-1"
                onClick={handlePrev}
                disabled={safePage === 1}
              >
                <ChevronLeft size={16} />
                Prev
              </button>

              {visiblePages[0] > 1 && (
                <>
                  <button
                    type="button"
                    className="btn btn-light border btn-sm"
                    onClick={() => handlePageClick(1)}
                  >
                    1
                  </button>
                  {visiblePages[0] > 2 && (
                    <span className="px-1 text-muted">...</span>
                  )}
                </>
              )}

              {visiblePages.map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`btn btn-sm ${
                    safePage === page ? "btn-primary" : "btn-light border"
                  }`}
                  onClick={() => handlePageClick(page)}
                >
                  {page}
                </button>
              ))}

              {visiblePages[visiblePages.length - 1] < totalPages && (
                <>
                  {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                    <span className="px-1 text-muted">...</span>
                  )}
                  <button
                    type="button"
                    className="btn btn-light border btn-sm"
                    onClick={() => handlePageClick(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                type="button"
                className="btn btn-light border btn-sm d-flex align-items-center gap-1"
                onClick={handleNext}
                disabled={safePage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}