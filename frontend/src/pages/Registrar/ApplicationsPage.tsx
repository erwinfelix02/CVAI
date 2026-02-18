import { useMemo, useState, useEffect } from "react";
import RegistrarApplicationsHeader from "../../components/Registrar/Applications/RegistrarApplicationsHeader";
import RegistrarApplicationsFilters from "../../components/Registrar/Applications/RegistrarApplicationsFilters";
import RegistrarApplicationsList from "../../components/Registrar/Applications/RegistrarApplicationsList";
import ApplicationDetailsModal from "../../components/Registrar/Applications/ApplicationDetailsModal";
import SendScheduleModal from "../../components/Registrar/Applications/SendScheduleModal";

import type {
  ApplicationRow,
  ApplicationStatus,
} from "../../components/Registrar/Applications/types";
import "../../styles/registrar-applications.css";

export default function ApplicationsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "All">("All");

  const [scheduleOpen, setScheduleOpen] = useState(false);

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedApprovedIds, setSelectedApprovedIds] = useState<Set<string>>(
    new Set<string>(),
  );

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch("http://localhost:5000/api/preregistrations");
        const data: any[] = await res.json();

        setApplications(data);

        const approvedIds = new Set<string>(
          data
            .filter((a) => a.status === "Approved")
            .map((a) => String(a.registrationId)),
        );

        setSelectedApprovedIds(approvedIds);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  // ✅ map raw DB -> UI row
  const mappedApplications: ApplicationRow[] = useMemo(() => {
    return applications.map((app) => ({
      id: String(app.registrationId),
      initials:
        (app.personal?.firstName?.[0] || "") +
        (app.personal?.lastName?.[0] || ""),
      name: `${app.personal?.firstName ?? ""} ${app.personal?.lastName ?? ""}`.trim(),
      program: app.academic?.course ?? "-",
      yearLevel: app.academic?.applicantType ?? "-",
      submitted: new Date(app.createdAt).toISOString().split("T")[0],
      status: app.status,
      accountSent: Boolean(
        app.accountSent || app.credentialsSent || app.accountCreated,
      ),
    }));
  }, [applications]);

  // ✅ quick lookup by registrationId to avoid repeated find()
  const appById = useMemo(() => {
    const m = new Map<string, any>();
    for (const a of applications) m.set(String(a.registrationId), a);
    return m;
  }, [applications]);

  // ✅ build selected students AFTER mappedApplications exists
  const selectedStudents = useMemo(() => {
    const selected = mappedApplications.filter(
      (a) => a.status === "Approved" && selectedApprovedIds.has(a.id),
    );

    return selected.map((a) => ({
      id: a.id,
      name: a.name,
      email: appById.get(a.id)?.personal?.email ?? "",
    }));
  }, [mappedApplications, selectedApprovedIds, appById]);

  const pendingCount = useMemo(
    () => mappedApplications.filter((x) => x.status === "Pending").length,
    [mappedApplications],
  );

  const approvedCount = useMemo(
    () => mappedApplications.filter((x) => x.status === "Approved").length,
    [mappedApplications],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return mappedApplications.filter((a) => {
      const matchesQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q);

      const matchesStatus = status === "All" ? true : a.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [mappedApplications, query, status]);

  const selectedApprovedCount = selectedApprovedIds.size;

  const toggleApproved = (id: string) => {
    setSelectedApprovedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deselectAllApproved = () => setSelectedApprovedIds(new Set<string>());

  // ✅ open modal (ONLY ONE handler)
  const openScheduleModal = () => setScheduleOpen(true);

  return (
    <div className="registrar-applications">
      <RegistrarApplicationsHeader
        pendingCount={pendingCount}
        approvedCount={approvedCount}
      />

      <RegistrarApplicationsFilters
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
        selectedApprovedCount={selectedApprovedCount}
        onSendSchedule={openScheduleModal}
      />

      {loading ? (
        <div className="text-center py-4">Loading applications...</div>
      ) : (
        <RegistrarApplicationsList
          title={`Applications (${filtered.length})`}
          items={filtered}
          selectedApprovedIds={selectedApprovedIds}
          onToggleApproved={toggleApproved}
          onDeselectAllApproved={deselectAllApproved}
          onSendSchedule={openScheduleModal}
          onReview={(id) => {
            const found = applications.find(
              (a) => String(a.registrationId) === id,
            );
            if (found) {
              setSelectedApp(found);
              setModalOpen(true);
            }
          }}
        />
      )}

      <SendScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        students={selectedStudents}
        onSubmit={(payload) => {
          console.log("SEND TO API:", payload);
          setScheduleOpen(false);
        }}
      />

      <ApplicationDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        application={selectedApp}
      />
    </div>
  );
}
