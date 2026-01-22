export default function AcademicProgress() {
  return (
    <div className="card shadow-sm p-3 mt-3">
      <h5 className="fw-semibold mb-3">Academic Progress</h5>
      <div className="mb-2 d-flex justify-content-between small">
        <span>Degree Completion</span>
        <span>65%</span>
      </div>
      <div className="progress mb-2" style={{ height: "8px" }}>
        <div className="progress-bar bg-primary" role="progressbar" style={{ width: "65%" }} />
      </div>
      <p className="text-muted small mb-0">Credits Earned: 98 / 150</p>
    </div>
  );
}
