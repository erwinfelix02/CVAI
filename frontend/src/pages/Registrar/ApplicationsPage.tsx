import { useMemo, useState, useEffect } from "react";
import RegistrarApplicationsHeader from "../../components/Registrar/Applications/RegistrarApplicationsHeader";
import RegistrarApplicationsFilters from "../../components/Registrar/Applications/RegistrarApplicationsFilters";
import RegistrarApplicationsList from "../../components/Registrar/Applications/RegistrarApplicationsList";
import ApplicationDetailsModal from "../../components/Registrar/Applications/ApplicationDetailsModal";

import type {
  ApplicationRow,
  ApplicationStatus,
} from "../../components/Registrar/Applications/types";

import "../../styles/registrar-applications.css";

export default function ApplicationsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "All">("All");

  // 🔥 Store RAW MongoDB data
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Modal state
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ Fetch from MongoDB
  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch("http://localhost:5000/api/preregistrations");
        const data = await res.json();

        setApplications(data); // 🔥 store full raw data
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  // 🔥 Convert RAW data → UI format
  const mappedApplications: ApplicationRow[] = useMemo(() => {
    return applications.map((app) => ({
      id: app.registrationId,
      initials:
        app.personal?.firstName?.[0] +
        (app.personal?.lastName?.[0] || ""),
      name: `${app.personal?.firstName} ${app.personal?.lastName}`,
      program: app.academic?.course,
      yearLevel: app.academic?.applicantType,
      submitted: new Date(app.createdAt).toISOString().split("T")[0],
      status: app.status,
    }));
  }, [applications]);

  // Pending count
  const pendingCount = useMemo(
    () => mappedApplications.filter((x) => x.status === "Pending").length,
    [mappedApplications]
  );

  // Filtering
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return mappedApplications.filter((a) => {
      const matchesQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q);

      const matchesStatus =
        status === "All" ? true : a.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [mappedApplications, query, status]);

  return (
    <div className="registrar-applications">
      <RegistrarApplicationsHeader pendingCount={pendingCount} />

      <RegistrarApplicationsFilters
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
      />

      {loading ? (
        <div className="text-center py-4">Loading applications...</div>
      ) : (
        <RegistrarApplicationsList
          title={`Applications (${filtered.length})`}
          items={filtered}
          onReview={(id) => {
            const found = applications.find(
              (a) => a.registrationId === id
            );

            if (found) {
              setSelectedApp(found);
              setModalOpen(true);
            }
          }}
        />
      )}

      {/* 🔥 Modal */}
      <ApplicationDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        application={selectedApp}
      />
    </div>
  );
}
