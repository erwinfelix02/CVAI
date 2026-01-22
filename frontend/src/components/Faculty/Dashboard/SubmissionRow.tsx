export default function SubmissionRow({
  initials,
  name,
  item,
  course,
  time,
}: {
  initials: string;
  name: string;
  item: string;
  course: string;
  time: string;
}) {
  return (
    <div className="faculty-submission-row">
      <div className="avatar">{initials}</div>

      <div className="flex-grow-1">
        <div className="fw-semibold">{name}</div>
        <div className="text-muted small">{item}</div>
      </div>

      <div className="right text-end">
        <span className="course-pill">{course}</span>
        <div className="text-muted small mt-1">{time}</div>
      </div>
    </div>
  );
}
