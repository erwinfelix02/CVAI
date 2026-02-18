type Props = {
  pendingCount: number;
  approvedCount: number;
};

export default function RegistrarApplicationsHeader({
  pendingCount,
  approvedCount,
}: Props) {
  return (
    <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3 mb-3 mb-md-4">
      <div>
        <h2 className="fw-bold mb-1">Student Applications</h2>
        <p className="text-muted mb-0">
          Review and process enrollment applications
        </p>
      </div>

      <div className="d-flex gap-2">
        <div className="registrar-pill pending">{pendingCount} Pending</div>
        <div className="registrar-pill approved">{approvedCount} Approved</div>
      </div>
    </div>
  );
}
