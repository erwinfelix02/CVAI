import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // ✅ icon arrows
import UsersToolbar from "../../components/SuperAdmin/Users/UsersToolbar";
import UsersTable from "../../components/SuperAdmin/Users/UsersTable";
import "../../styles/superadmin-user.css";

export type UserRole =
  | "Student"
  | "Faculty"
  | "Registrar"
  | "Department Head"
  | "Finance"
  | "Super Admin";

export type UserStatus = "active" | "inactive";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

const ROLE_FILTERS: Array<"All" | UserRole> = [
  "All",
  "Student",
  "Faculty",
  "Registrar",
  "Department Head",
  "Finance",
  "Super Admin",
];

// sample data (replace with API later)
const seedUsers: UserRow[] = [
  { id: "STU-2024-001", name: "John Doe", email: "john.doe@university.edu", role: "Student", status: "active" },
  { id: "FAC-001", name: "Dr. Jane Smith", email: "jane.smith@university.edu", role: "Faculty", status: "active" },
  { id: "STU-2024-002", name: "Bob Wilson", email: "bob.wilson@university.edu", role: "Student", status: "active" },
  { id: "FAC-002", name: "Dr. Alice Brown", email: "alice.brown@university.edu", role: "Faculty", status: "active" },
  { id: "STU-2024-003", name: "Charlie Davis", email: "charlie.davis@university.edu", role: "Student", status: "inactive" },
  { id: "REG-001", name: "Mark Reyes", email: "mark.reyes@university.edu", role: "Registrar", status: "active" },
  { id: "DH-001", name: "Atty. Carla Lim", email: "carla.lim@university.edu", role: "Department Head", status: "active" },
  { id: "FIN-001", name: "Paolo Cruz", email: "paolo.cruz@university.edu", role: "Finance", status: "active" },
  { id: "SA-001", name: "Super Admin", email: "superadmin@university.edu", role: "Super Admin", status: "active" },
];

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<(typeof ROLE_FILTERS)[number]>("All");

  /* ---------------- Pagination ---------------- */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return seedUsers.filter((u) => {
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesQuery =
        !q ||
        u.id.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [query, roleFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, roleFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const pageNumbers = useMemo(() => {
    const maxBtns = 5;
    let start = Math.max(1, page - Math.floor(maxBtns / 2));
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const showingFrom = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, filtered.length);

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-3">
        <h1 className="h3 fw-bold mb-1">Users</h1>
        <p className="text-muted mb-0">View all users of the system</p>
      </div>

      {/* Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-3 p-md-4">
          <UsersToolbar
            query={query}
            onQueryChange={setQuery}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            roleOptions={ROLE_FILTERS}
          />

          <UsersTable rows={pageRows} onView={(u) => console.log("view", u)} />

          {/* Pagination */}
          {filtered.length > 0 && totalPages > 1 && (
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mt-3 pt-3 border-top">
              <div className="text-muted small">
                Showing <strong>{showingFrom}</strong>–<strong>{showingTo}</strong>{" "}
                of <strong>{filtered.length}</strong> users
              </div>

              <div className="d-flex align-items-center gap-3 flex-wrap">
                {/* Page size */}
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">Rows:</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 90 }}
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={5}>5</option>    
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                  </select>
                </div>

                {/* Pagination controls (✅ icon buttons) */}
                <nav aria-label="Users pagination">
                  <ul className="pagination pagination-sm mb-0 align-items-center">
                    {/* Previous */}
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link d-flex align-items-center justify-content-center"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-label="Previous page"
                        title="Previous"
                      >
                        <ChevronLeft size={16} />
                      </button>
                    </li>

                    {/* Page numbers */}
                    {pageNumbers.map((n) => (
                      <li
                        key={n}
                        className={`page-item ${n === page ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage(n)}
                          aria-label={`Page ${n}`}
                        >
                          {n}
                        </button>
                      </li>
                    ))}

                    {/* Next */}
                    <li
                      className={`page-item ${page === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link d-flex align-items-center justify-content-center"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        aria-label="Next page"
                        title="Next"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
