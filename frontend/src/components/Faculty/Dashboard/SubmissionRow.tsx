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
      <div className="faculty-submission-avatar">{initials}</div>

      <div className="flex-grow-1 min-w-0 ms-2">
        <div className="faculty-submission-name text-truncate">{name}</div>
        <div className="faculty-submission-item text-truncate">{item}</div>
      </div>

      <div className="faculty-submission-right text-end ms-2">
        <span className="faculty-course-pill">{course}</span>
        <div className="faculty-submission-time">{time}</div>
      </div>
    </div>
  );
}