// ✅ src/components/Student/WeeklySummary.tsx
import { useMemo } from "react";
import type { StudentScheduleItem } from "../../pages/Student/StudentSchedulePage";

interface DaySummary {
  day: string;
  fullName: string;
  count: number;
}

const weekDays: { short: string; full: string }[] = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
];

function getTodayIndexMonToSat() {
  const js = new Date().getDay();
  const idx = js - 1;
  return idx < 0 ? 5 : Math.min(idx, 5);
}

function matchesDay(daysStr: string, targetDay: string): boolean {
  if (!daysStr) return false;
  const upper = daysStr.toUpperCase();

  if (targetDay === "Monday") {
    return upper.includes("MON") || upper.includes("MWF") || (upper.includes("M") && !upper.includes("TH"));
  }
  if (targetDay === "Tuesday") {
    return upper.includes("TUE") || upper.includes("TTH") || (upper.includes("T") && !upper.includes("TH") && !upper.includes("SAT"));
  }
  if (targetDay === "Wednesday") {
    return upper.includes("WED") || upper.includes("MWF") || upper.includes("W");
  }
  if (targetDay === "Thursday") {
    return upper.includes("THU") || upper.includes("TTH") || upper.includes("TH") || upper.includes("H");
  }
  if (targetDay === "Friday") {
    return upper.includes("FRI") || upper.includes("MWF") || upper.includes("F");
  }
  if (targetDay === "Saturday") {
    return upper.includes("SAT") || (upper.includes("S") && !upper.includes("TH"));
  }

  return false;
}

export default function WeeklySummary({
  schedules = [],
}: {
  schedules?: StudentScheduleItem[];
}) {
  const todayIndex = useMemo(() => getTodayIndexMonToSat(), []);

  const summary: DaySummary[] = useMemo(() => {
    return weekDays.map((wd) => {
      const count = schedules.filter((sch) => matchesDay(sch.days, wd.full)).length;
      return {
        day: wd.short,
        fullName: wd.full,
        count,
      };
    });
  }, [schedules]);

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
                    active ? "border-primary bg-light" : "border-secondary-subtle"
                  }`}
                >
                  <div className="text-muted small">{item.day}</div>
                  <div className="fs-3 fw-bold">{item.count}</div>
                  <div className="text-muted small">classes</div>
                  {active && (
                    <div className="small fw-semibold text-primary mt-1">Today</div>
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