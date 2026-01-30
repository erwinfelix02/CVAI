type Props = {
  pendingCount: number;
};

export default function RegistrarApplicationsHeader({ pendingCount }: Props) {
  return (
    <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3 mb-3 mb-md-4">
      <div>
        <h2 className="fw-bold mb-1">Student Applications</h2>
        <p className="text-muted mb-0">Review and process enrollment applications</p>
      </div>

      <div className="registrar-pill">
        {pendingCount} Pending Review
      </div>
    </div>
  );
}
