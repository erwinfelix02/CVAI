export default function TaskRow({
  title,
  date,
  tone,
}: {
  title: string;
  date: string;
  tone: "danger" | "warning" | "success";
}) {
  return (
    <div className="faculty-task-row">
      <span className={`dot ${tone}`} />
      <div className="flex-grow-1">
        <div className="fw-semibold">{title}</div>
        <div className="text-muted small">{date}</div>
      </div>
    </div>
  );
}
