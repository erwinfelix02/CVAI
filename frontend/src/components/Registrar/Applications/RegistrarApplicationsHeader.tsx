import type { ApplicationStatus } from "./types";

type VisibleStatus = Exclude<ApplicationStatus, "Archived">;

type Props = {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  archivedCount: number;
  activeStatus: VisibleStatus;
  onStatusClick: (status: VisibleStatus) => void;
  onArchivedClick: () => void;
};

export default function RegistrarApplicationsHeader({
  pendingCount,
  approvedCount,
  rejectedCount,
  archivedCount,
  activeStatus,
  onStatusClick,
  onArchivedClick,
}: Props) {
  const getPillClass = (pillStatus: VisibleStatus) =>
    `registrar-pill ${pillStatus.toLowerCase()} ${
      activeStatus === pillStatus ? "active" : ""
    }`;

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
          className={getPillClass("Pending")}
          onClick={() => onStatusClick("Pending")}
        >
          {pendingCount} Pending
        </button>

        <button
          type="button"
          className={getPillClass("Approved")}
          onClick={() => onStatusClick("Approved")}
        >
          {approvedCount} Approved
        </button>

        <button
          type="button"
          className={getPillClass("Rejected")}
          onClick={() => onStatusClick("Rejected")}
        >
          {rejectedCount} Rejected
        </button>

        <button
          type="button"
          className="registrar-pill archived"
          onClick={onArchivedClick}
        >
          {archivedCount} Archived
        </button>
      </div>
    </div>
  );
}