interface DaySummary {
  day: string;
  count: number;
  active?: boolean;
}

const summary: DaySummary[] = [
  { day: "Mon", count: 3 },
  { day: "Tue", count: 3 },
  { day: "Wed", count: 3 },
  { day: "Thu", count: 3 },
  { day: "Fri", count: 2 },
  { day: "Sat", count: 1, active: true },
];

export default function WeeklySummary() {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h5 className="fw-bold mb-4">Weekly Summary</h5>

        <div className="row g-3">
          {summary.map((item) => (
            <div key={item.day} className="col-6 col-md">
              <div
                className={`border rounded-4 text-center py-3 ${
                  item.active
                    ? "border-primary bg-light"
                    : "border-secondary-subtle"
                }`}
              >
                <div className="text-muted small">{item.day}</div>
                <div className="fs-3 fw-bold">{item.count}</div>
                <div className="text-muted small">classes</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
