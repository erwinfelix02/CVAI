// src/components/Registrar/Applications/RegistrarApplicationsHeader.tsx

import type { ApplicationStatus } from "./types";

type VisibleStatus = Exclude<ApplicationStatus, "Archived">;

type Props = {
  pendingCount: number;
  approvedCount: number;
  returnedCount: number;
  archivedCount: number;
  activeStatus: VisibleStatus;
  onStatusClick: (status: VisibleStatus) => void;
  onArchivedClick: () => void;
};

export default function RegistrarApplicationsHeader({
  pendingCount,
  approvedCount,
  returnedCount,
  archivedCount,
  activeStatus,
  onStatusClick,
  onArchivedClick,
}: Props) {
  const getPillClass = (pillStatus: VisibleStatus) => {
    const isActive = activeStatus === pillStatus;
    const statusClass = 
      pillStatus === "Approved"
        ? "approved"
        : pillStatus === "Returned"
        ? "returned"
        : "pending";

    // Combines the registrar-status style with an active indicator if selected
    return `registrar-status ${statusClass} ${isActive ? "registrar-status-active border border-dark" : ""}`;
  };

  return (
    <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3 mb-3 mb-md-4">
      <div>
        <h2 className="fw-bold mb-1">Student Applications</h2>
        <p className="text-muted mb-0">
          Review and process enrollment applications
        </p>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button
          type="button"
          className={`btn p-0 border-0 bg-transparent ${activeStatus === "Pending" ? "opacity-100" : "opacity-75"}`}
          onClick={() => onStatusClick("Pending")}
        >
          <span className={getPillClass("Pending")}>
            {pendingCount} Pending
          </span>
        </button>

        <button
          type="button"
          className={`btn p-0 border-0 bg-transparent ${activeStatus === "Approved" ? "opacity-100" : "opacity-75"}`}
          onClick={() => onStatusClick("Approved")}
        >
          <span className={getPillClass("Approved")}>
            {approvedCount} Approved
          </span>
        </button>

        <button
          type="button"
          className={`btn p-0 border-0 bg-transparent ${activeStatus === "Returned" ? "opacity-100" : "opacity-75"}`}
          onClick={() => onStatusClick("Returned")}
        >
          <span className={getPillClass("Returned")}>
            {returnedCount} Returned
          </span>
        </button>

        <button
          type="button"
          className="btn p-0 border-0 bg-transparent opacity-75"
          onClick={onArchivedClick}
        >
          <span className="registrar-status archived">
            {archivedCount} Archived
          </span>
        </button>
      </div>
    </div>
  );
}