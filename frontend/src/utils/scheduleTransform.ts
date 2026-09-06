import type { DaySchedule, ScheduleItem } from "../pages/Faculty/TeachingSchedulePage";

// Assign consistent visual tones based on subject code
const getTone = (code: string): "blue" | "purple" | "green" | "orange" => {
  const hash = code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tones: ("blue" | "purple" | "green" | "orange")[] = ["blue", "purple", "green", "orange"];
  return tones[hash % tones.length];
};

export function transformApiScheduleToGrid(rawSchedules: any[]): DaySchedule[] {
  // Base 6-day week structure including Saturday
  const daysGrid: Record<string, DaySchedule> = {
    monday: { key: "monday", label: "Monday", items: [] },
    tuesday: { key: "tuesday", label: "Tuesday", items: [] },
    wednesday: { key: "wednesday", label: "Wednesday", items: [] },
    thursday: { key: "thursday", label: "Thursday", items: [] },
    friday: { key: "friday", label: "Friday", items: [] },
    saturday: { key: "saturday", label: "Saturday", items: [] },
  };

  // Highlight today's column dynamically
  const todayKey = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  if (daysGrid[todayKey]) {
    daysGrid[todayKey].isToday = true;
  }

  (Array.isArray(rawSchedules) ? rawSchedules : []).forEach((sch) => {
    const dayCode = (sch.days || "").toUpperCase();

    // Parse time strings like "8:00 AM - 9:30 AM" or "10:00 - 11:30 AM"
    const timeParts = (sch.time || "").split("-").map((t: string) => t.trim());
    const startRaw = timeParts[0] || "8:00 AM";
    const endRaw = timeParts[1] || "9:00 AM";

    const startMatch = startRaw.match(/(\d+:\d+)/);
    const endMatch = endRaw.match(/(\d+:\d+)/);
    const meridiemMatch = (endRaw + " " + startRaw).match(/(AM|PM)/i);

    const item: ScheduleItem = {
      id: sch._id || sch.id || Math.random().toString(),
      start: startMatch ? startMatch[1] : "8:00",
      end: endMatch ? endMatch[1] : "9:00",
      meridiem: (meridiemMatch ? meridiemMatch[1].toUpperCase() : "AM") as "AM" | "PM",
      code: sch.code || "N/A",
      title: sch.title || "Untitled Course",
      locationLabel: sch.room || "TBA",
      students: sch.students || 30,
      tone: getTone(sch.code || "N/A"),
    };

    // Route to appropriate day columns
    if (dayCode.includes("M") && !dayCode.includes("SUN")) {
      daysGrid.monday.items.push(item);
    }

    if (dayCode.includes("TH")) {
      daysGrid.thursday.items.push(item);
    } else if (dayCode.includes("T") && !dayCode.includes("SAT") && !dayCode.includes("SUN")) {
      daysGrid.tuesday.items.push(item);
    }

    if (dayCode.includes("W")) {
      daysGrid.wednesday.items.push(item);
    }

    if (dayCode.includes("F")) {
      daysGrid.friday.items.push(item);
    }

    // Match Saturday codes ("SAT", "SATURDAY", or "S" excluding Sunday/Thursday)
    if (
      dayCode.includes("SAT") ||
      dayCode.includes("SATURDAY") ||
      (dayCode.includes("S") && !dayCode.includes("SUN") && !dayCode.includes("TH"))
    ) {
      daysGrid.saturday.items.push(item);
    }
  });

  return Object.values(daysGrid);
}