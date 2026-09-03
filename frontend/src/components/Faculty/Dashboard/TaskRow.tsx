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
      <span className={`faculty-task-dot ${tone}`} />
      <div className="flex-grow-1 min-w-0 ms-2">
        <div className="faculty-task-title text-truncate">{title}</div>
        <div className="faculty-task-date">{date}</div>
      </div>
    </div>
  );
}