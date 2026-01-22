export default function ClassRow({
  time,
  code,
  title,
  meta,
  status,
}: {
  time: string;
  code: string;
  title: string;
  meta: string;
  status: "completed" | "ongoing" | "upcoming";
}) {
  return (
    <div className={`faculty-class-row ${status}`}>
      <div className="time">{time}</div>

      <div className="flex-grow-1">
        <div className="title">
          <span className="code">{code}</span> - {title}
        </div>
        <div className="meta">{meta}</div>
      </div>

      <span className={`status-pill ${status}`}>
        {status === "completed" ? "completed" : status === "ongoing" ? "ongoing" : "upcoming"}
      </span>
    </div>
  );
}
