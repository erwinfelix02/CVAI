import { useMemo, useState, useEffect } from "react";
import RegistrarApplicationsHeader from "../../components/Registrar/Applications/RegistrarApplicationsHeader";
import RegistrarApplicationsFilters from "../../components/Registrar/Applications/RegistrarApplicationsFilters";
import RegistrarApplicationsList from "../../components/Registrar/Applications/RegistrarApplicationsList";
import ApplicationDetailsModal from "../../components/Registrar/Applications/ApplicationDetailsModal";
import SendScheduleModal from "../../components/Registrar/Applications/SendScheduleModal";
import ArchivedApplicationsModal from "../../components/Registrar/Applications/ArchivedApplicationsModal";
import AuthAlert from "../../components/Authentication/AuthAlert";

import type {
  ApplicationRow,
  ApplicationStatus,
} from "../../components/Registrar/Applications/types";
import "../../styles/registrar-applications.css";

type FilterStatus = Exclude<ApplicationStatus, "Archived"> | "All";
type HeaderStatus = Exclude<ApplicationStatus, "Archived">;

export default function ApplicationsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FilterStatus>("All");
  const [headerStatus, setHeaderStatus] = useState<HeaderStatus>("Pending");

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [archivedModalOpen, setArchivedModalOpen] = useState(false);

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedApprovedIds, setSelectedApprovedIds] = useState<Set<string>>(
    new Set<string>(),
  );

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const showAlert = (message: string, type: "success" | "error") => {
    setAnimateAlert(false);

    setTimeout(() => {
      setAlertMessage(message);
      setAlertType(type);
      setAnimateAlert(true);
    }, 50);
  };

  useEffect(() => {
    if (!animateAlert) return;

    const t = setTimeout(() => {
      setAnimateAlert(false);
    }, 3000);

    return () => clearTimeout(t);
  }, [animateAlert]);

  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true);

        const res = await fetch("http://localhost:5000/api/preregistrations");
        if (!res.ok) throw new Error("Failed to fetch applications");

        const data: any[] = await res.json();
        setApplications(data);

        const approvedIds = new Set<string>(
          data
            .filter((a) => a.status === "Approved" && !a.scheduleSentAt)
            .map((a) => String(a.registrationId)),
        );

        setSelectedApprovedIds(approvedIds);
      } catch (err: any) {
        console.error("Failed to fetch applications", err);
        showAlert(err.message || "Failed to fetch applications", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  const mappedApplications: ApplicationRow[] = useMemo(() => {
    return applications.map((app) => ({
      id: String(app.registrationId),
      initials:
        (app.personal?.firstName?.[0] || "") +
        (app.personal?.lastName?.[0] || ""),
      name: `${app.personal?.firstName ?? ""} ${
        app.personal?.lastName ?? ""
      }`.trim(),
      program: app.academic?.course ?? "-",
      yearLevel: app.academic?.applicantType ?? "-",
      submitted: new Date(app.createdAt).toISOString().split("T")[0],
      status: app.status,
      accountSent: Boolean(
        app.accountSent || app.credentialsSent || app.accountCreated,
      ),
      scheduleSent: Boolean(app.scheduleSentAt),
    }));
  }, [applications]);

  const appById = useMemo(() => {
    const m = new Map<string, any>();
    for (const a of applications) m.set(String(a.registrationId), a);
    return m;
  }, [applications]);

  const selectedStudents = useMemo(() => {
    const selected = mappedApplications.filter(
      (a) =>
        a.status === "Approved" &&
        !a.scheduleSent &&
        selectedApprovedIds.has(a.id),
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

  const rejectedCount = useMemo(
    () => mappedApplications.filter((x) => x.status === "Rejected").length,
    [mappedApplications],
  );

  const archivedCount = useMemo(
    () => mappedApplications.filter((x) => x.status === "Archived").length,
    [mappedApplications],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return mappedApplications.filter((a) => {
      if (a.status === "Archived") return false;

      const matchesQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q);

      const matchesStatus = status === "All" ? true : a.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [mappedApplications, query, status]);

  const archivedItems = useMemo(() => {
    return mappedApplications.filter((a) => a.status === "Archived");
  }, [mappedApplications]);

  const selectedApprovedCount = selectedStudents.length;

  const toggleApproved = (id: string) => {
    const row = mappedApplications.find((a) => a.id === id);
    if (row?.scheduleSent) return;

    setSelectedApprovedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deselectAllApproved = () => setSelectedApprovedIds(new Set<string>());

  const openScheduleModal = () => setScheduleOpen(true);

  const handleSendSchedule = async (payload: {
    studentIds: string[];
    date: string;
    time: string;
    location: string;
    notes: string;
  }) => {
    try {
      setIsSubmitting(true);

      const res = await fetch(
        "http://localhost:5000/api/enrollments/schedule",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to send schedules");
      }

      const data = await res.json();
      const sentIds: string[] = data.sentIds ?? payload.studentIds;

      setApplications((prev: any[]) =>
        prev.map((a: any) =>
          sentIds.includes(String(a.registrationId))
            ? { ...a, scheduleSentAt: new Date().toISOString() }
            : a,
        ),
      );

      setSelectedApprovedIds((prev) => {
        const next = new Set(prev);
        for (const id of sentIds) next.delete(id);
        return next;
      });

      setScheduleOpen(false);
      showAlert("Schedule sent successfully.", "success");
    } catch (e: any) {
      console.error(e);
      showAlert(e.message || "Failed to send schedules", "error");
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdated = (
    registrationId: string,
    newStatus: "Approved" | "Rejected",
  ) => {
    setApplications((prev: any[]) =>
      prev.map((app: any) =>
        String(app.registrationId) === String(registrationId)
          ? {
              ...app,
              status: newStatus,
              approvedAt:
                newStatus === "Approved" ? new Date().toISOString() : null,
              rejectedAt:
                newStatus === "Rejected" ? new Date().toISOString() : null,
            }
          : app,
      ),
    );

    setSelectedApp((prev: any | null) =>
      prev && String(prev.registrationId) === String(registrationId)
        ? {
            ...prev,
            status: newStatus,
            approvedAt:
              newStatus === "Approved" ? new Date().toISOString() : null,
            rejectedAt:
              newStatus === "Rejected" ? new Date().toISOString() : null,
          }
        : prev,
    );
  };

  const handleArchive = async (registrationId: string) => {
    try {
      setIsSubmitting(true);

      const res = await fetch(
        `http://localhost:5000/api/preregistrations/${registrationId}/archive`,
        {
          method: "POST",
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to archive application");
      }

      setApplications((prev: any[]) =>
        prev.map((app: any) =>
          String(app.registrationId) === String(registrationId)
            ? { ...app, status: "Archived" }
            : app,
        ),
      );

      setSelectedApp((prev: any | null) =>
        prev && String(prev.registrationId) === String(registrationId)
          ? { ...prev, status: "Archived" }
          : prev,
      );

      setSelectedApprovedIds((prev) => {
        const next = new Set(prev);
        next.delete(String(registrationId));
        return next;
      });

      showAlert("Application archived successfully.", "success");
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || "Failed to archive application", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnarchive = async (registrationId: string) => {
    try {
      setIsSubmitting(true);

      const res = await fetch(
        `http://localhost:5000/api/preregistrations/${registrationId}/unarchive`,
        {
          method: "POST",
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to unarchive application");
      }

      const data = await res.json();
      const restoredStatus = data?.restored?.status || "Rejected";

      setApplications((prev: any[]) =>
        prev.map((app: any) =>
          String(app.registrationId) === String(registrationId)
            ? { ...app, status: restoredStatus }
            : app,
        ),
      );

      setSelectedApp((prev: any | null) =>
        prev && String(prev.registrationId) === String(registrationId)
          ? { ...prev, status: restoredStatus }
          : prev,
      );

      showAlert("Application unarchived successfully.", "success");
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || "Failed to unarchive application", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArchived = async (registrationIds: string[]) => {
    try {
      setIsSubmitting(true);

      const results = await Promise.all(
        registrationIds.map(async (registrationId) => {
          const res = await fetch(
            `http://localhost:5000/api/preregistrations/${registrationId}`,
            {
              method: "DELETE",
            },
          );

          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            throw new Error(
              data.message || `Failed to delete ${registrationId}`,
            );
          }

          return registrationId;
        }),
      );

      setApplications((prev: any[]) =>
        prev.filter(
          (app: any) => !results.includes(String(app.registrationId)),
        ),
      );

      setSelectedApp((prev: any | null) =>
        prev && results.includes(String(prev.registrationId)) ? null : prev,
      );

      showAlert(
        `Permanently deleted ${results.length} archived application${
          results.length > 1 ? "s" : ""
        }.`,
        "success",
      );
    } catch (err: any) {
      console.error(err);
      showAlert(
        err.message || "Failed to delete archived applications",
        "error",
      );
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHeaderStatusClick = (nextStatus: HeaderStatus) => {
    setHeaderStatus(nextStatus);
    setStatus(nextStatus);
  };

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={isSubmitting || loading}
      />

      <div className="registrar-applications">
        <RegistrarApplicationsHeader
          pendingCount={pendingCount}
          approvedCount={approvedCount}
          rejectedCount={rejectedCount}
          archivedCount={archivedCount}
          activeStatus={headerStatus}
          onStatusClick={handleHeaderStatusClick}
          onArchivedClick={() => setArchivedModalOpen(true)}
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
            title={
              status === "All"
                ? `Applications (${filtered.length})`
                : `${status} Applications (${filtered.length})`
            }
            items={filtered}
            selectedApprovedIds={selectedApprovedIds}
            onToggleApproved={toggleApproved}
            onDeselectAllApproved={deselectAllApproved}
            onSendSchedule={openScheduleModal}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
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

        <ArchivedApplicationsModal
          open={archivedModalOpen}
          onClose={() => setArchivedModalOpen(false)}
          items={archivedItems}
          onUnarchive={handleUnarchive}
          onDelete={handleDeleteArchived}
        />

        <SendScheduleModal
          open={scheduleOpen}
          onClose={() => setScheduleOpen(false)}
          students={selectedStudents}
          onSubmit={handleSendSchedule}
        />

        <ApplicationDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          application={selectedApp}
          onStatusUpdated={handleStatusUpdated}
          showAlert={showAlert}
        />
      </div>
    </>
  );
}
