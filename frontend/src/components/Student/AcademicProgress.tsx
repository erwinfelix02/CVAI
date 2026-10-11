// ✅ src/components/Student/AcademicProgress.tsx

interface AcademicProgressProps {
  earnedCredits?: number;
  totalCreditsRequired?: number;
}

export default function AcademicProgress({
  earnedCredits = 98,
  totalCreditsRequired = 150,
}: AcademicProgressProps) {
  const completionPercentage = Math.min(
    Math.round((earnedCredits / totalCreditsRequired) * 100),
    100
  );

  return (
    <div className="card shadow-sm p-3 mt-3">
      <h5 className="fw-semibold mb-3">Academic Progress</h5>
      <div className="mb-2 d-flex justify-content-between small">
        <span>Degree Completion</span>
        <span>{completionPercentage}%</span>
      </div>
      <div className="progress mb-2" style={{ height: "8px" }}>
        <div 
          className="progress-bar bg-primary" 
          role="progressbar" 
          style={{ width: `${completionPercentage}%` }} 
          aria-valuenow={completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="text-muted small mb-0">
        Credits Earned: {earnedCredits} / {totalCreditsRequired}
      </p>
    </div>
  );
}