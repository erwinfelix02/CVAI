import { useMemo, useState } from "react";
import RegistrarApplicationsHeader from "../../components/Registrar/Applications/RegistrarApplicationsHeader";
import RegistrarApplicationsFilters from "../../components/Registrar/Applications/RegistrarApplicationsFilters";
import RegistrarApplicationsList from "../../components/Registrar/Applications/RegistrarApplicationsList";

import type { ApplicationRow, ApplicationStatus } from "../../components/Registrar/Applications/types";

import "../../styles/registrar-applications.css";

const seed: ApplicationRow[] = [
  {
    id: "ENR-24001",
    initials: "MS",
    name: "Maria Santos",
    program: "BS Computer Science",
    yearLevel: "Year 1",
    submitted: "2024-01-20",
    status: "Pending",
  },
  {
    id: "ENR-24002",
    initials: "JDC",
    name: "Juan Dela Cruz",
    program: "BS Information Technology",
    yearLevel: "Year 1",
    submitted: "2024-01-20",
    status: "Pending",
  },
  {
    id: "ENR-24003",
    initials: "AR",
    name: "Ana Reyes",
    program: "BS Civil Engineering",
    yearLevel: "Year 2",
    submitted: "2024-01-19",
    status: "Approved",
  },
];

export default function ApplicationsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "All">("All");

  const pendingCount = useMemo(
    () => seed.filter((x) => x.status === "Pending").length,
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return seed.filter((a) => {
      const matchesQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q);

      const matchesStatus = status === "All" ? true : a.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  return (
    <div className="registrar-applications">
      <RegistrarApplicationsHeader pendingCount={pendingCount} />

      <RegistrarApplicationsFilters
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
      />

      <RegistrarApplicationsList
        title={`Applications (${filtered.length})`}
        items={filtered}
        onReview={(id) => alert(`Review ${id}`)}
      />
    </div>
  );
}
