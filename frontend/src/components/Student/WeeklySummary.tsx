import { useMemo } from "react";

interface DaySummary {
  day: string;
  count: number;
}

const summary: DaySummary[] = [
  { day: "Mon", count: 3 },
  { day: "Tue", count: 3 },
  { day: "Wed", count: 3 },
  { day: "Thu", count: 3 },
  { day: "Fri", count: 2 },
  { day: "Sat", count: 1 },
];

function getTodayIndexMonToSat() {
  const js = new Date().getDay(); // Sun=0..Sat=6
  const idx = js - 1; // Mon=0..Sat=5
  return idx < 0 ? 5 : Math.min(idx, 5); // Sunday fallback -> Sat
}

export default function WeeklySummary() {
  const todayIndex = useMemo(() => getTodayIndexMonToSat(), []);

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h5 className="fw-bold mb-4">Weekly Summary</h5>

        <div className="row g-3">
          {summary.map((item, i) => {
            const active = i === todayIndex;
            return (
              <div key={item.day} className="col-6 col-md">
                <div
                  className={`border rounded-4 text-center py-3 ${
                    active
                      ? "border-primary bg-light"
                      : "border-secondary-subtle"
                  }`}
                >
                  <div className="text-muted small">{item.day}</div>
                  <div className="fs-3 fw-bold">{item.count}</div>
                  <div className="text-muted small">classes</div>
                  {active && (
                    <div className="small fw-semibold text-primary mt-1">
                      Today
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
