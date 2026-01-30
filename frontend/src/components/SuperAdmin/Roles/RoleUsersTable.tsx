import { useMemo, useState } from "react";
import type { UserItem } from "./types";

type Props = {
  users: UserItem[]; // already filtered users
  total: number; // total users in role (not filtered)
  selectedUserId: string | null;
  onSelect: (id: string) => void;
};

export default function RoleUsersTable({
  users,
  total,
  selectedUserId,
  onSelect,
}: Props) {
  // pagination state
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // reset to page 1 if users list changes (search/filter)
  useMemo(() => {
    setPage(1);
  }, [users.length]);

  const totalFiltered = users.length;
  const pageCount = Math.max(1, Math.ceil(totalFiltered / pageSize));

  const safePage = Math.min(page, pageCount);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);

  const pageUsers = useMemo(() => {
    return users.slice(startIndex, endIndex);
  }, [users, startIndex, endIndex]);

  // page buttons (compact window)
  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);

    let start = Math.max(1, safePage - half);
    let end = Math.min(pageCount, start + windowSize - 1);

    // adjust start if we're near the end
    start = Math.max(1, end - windowSize + 1);

    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [safePage, pageCount]);

  const goto = (p: number) => setPage(Math.min(Math.max(1, p), pageCount));

  return (
    <div className="card shadow-sm role-users-card">
      {/* header controls */}
      <div className="role-users-topbar">
        <div className="text-muted small">
          Showing <span className="fw-semibold">{totalFiltered === 0 ? 0 : startIndex + 1}</span>
          {"–"}
          <span className="fw-semibold">{endIndex}</span> of{" "}
          <span className="fw-semibold">{totalFiltered}</span>{" "}
          <span className="d-none d-md-inline">filtered</span>
          <span className="text-muted"> • </span>
          <span className="text-muted">
            {total} total
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small d-none d-md-inline">Rows</span>
          <select
            className="form-select form-select-sm role-page-size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="table-responsive role-users-table-wrap">
        <table className="table align-middle mb-0 table-hover role-users-table">
          <thead className="table-light">
            <tr>
              <th className="text-nowrap role-col-id">User ID</th>
              <th className="role-col-name">Name</th>
              <th className="role-col-email">Email</th>
              <th className="text-nowrap role-col-status">Status</th>
            </tr>
          </thead>

          <tbody>
            {pageUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted p-3">
                  No matching users.
                </td>
              </tr>
            ) : (
              pageUsers.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => onSelect(u.id)}
                  className={selectedUserId === u.id ? "table-active" : ""}
                  style={{ cursor: "pointer" }}
                >
                  <td className="fw-semibold text-nowrap">{u.userId}</td>

                  <td className="role-td-truncate" title={u.fullName}>
                    <span className="fw-semibold role-truncate">{u.fullName}</span>
                  </td>

                  <td className="role-td-truncate" title={u.email}>
                    <span className="text-muted role-truncate">{u.email}</span>
                  </td>

                  <td className="text-nowrap">
                    <span
                      className={`badge rounded-pill ${
                        u.status === "Active"
                          ? "text-bg-success"
                          : "text-bg-secondary"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* pagination footer */}
      <div className="role-users-footer">
        <nav aria-label="Users pagination" className="ms-auto">
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${safePage <= 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => goto(safePage - 1)}>
                Prev
              </button>
            </li>

            {pageNumbers[0] !== 1 && (
              <>
                <li className="page-item">
                  <button className="page-link" onClick={() => goto(1)}>
                    1
                  </button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">…</span>
                </li>
              </>
            )}

            {pageNumbers.map((n) => (
              <li key={n} className={`page-item ${n === safePage ? "active" : ""}`}>
                <button className="page-link" onClick={() => goto(n)}>
                  {n}
                </button>
              </li>
            ))}

            {pageNumbers[pageNumbers.length - 1] !== pageCount && (
              <>
                <li className="page-item disabled">
                  <span className="page-link">…</span>
                </li>
                <li className="page-item">
                  <button className="page-link" onClick={() => goto(pageCount)}>
                    {pageCount}
                  </button>
                </li>
              </>
            )}

            <li className={`page-item ${safePage >= pageCount ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => goto(safePage + 1)}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
