import type { DaySchedule, ScheduleItem } from "../pages/Faculty/TeachingSchedulePage";

// Assign consistent visual tones based on subject code
const getTone = (code: string): "blue" | "purple" | "green" | "orange" => {
  const hash = code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tones: ("blue" | "purple" | "green" | "orange")[] = ["blue", "purple", "green", "orange"];
  return tones[hash % tones.length];
};

export function transformApiScheduleToGrid(rawSchedules: any[]): DaySchedule[] {
  // Base week structure
  const daysGrid: Record<string, DaySchedule> = {
    monday: { key: "monday", label: "Monday", items: [] },
    tuesday: { key: "tuesday", label: "Tuesday", items: [] },
    wednesday: { key: "wednesday", label: "Wednesday", items: [] },
    thursday: { key: "thursday", label: "Thursday", items: [] },
    friday: { key: "friday", label: "Friday", items: [] },
  };

  // Mark today
  const todayKey = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  if (daysGrid[todayKey]) {
    daysGrid[todayKey].isToday = true;
  }

  rawSchedules.forEach((sch) => {
    const dayCode = (sch.days || "").toUpperCase();
    
    // Parse time like "8:00 AM - 9:00 AM" or "10:00 - 11:30 AM"
    const timeParts = (sch.time || "").split("-").map((t: string) => t.trim());
    const startRaw = timeParts[0] || "8:00 AM";
    const endRaw = timeParts[1] || "9:00 AM";

    const startMatch = startRaw.match(/(\d+:\d+)/);
    const endMatch = endRaw.match(/(\d+:\d+)/);
    const meridiemMatch = (endRaw + " " + startRaw).match(/(AM|PM)/i);

    const item: ScheduleItem = {
      id: sch._id,
      start: startMatch ? startMatch[1] : "8:00",
      end: endMatch ? endMatch[1] : "9:00",
      meridiem: (meridiemMatch ? meridiemMatch[1].toUpperCase() : "AM") as "AM" | "PM",
      code: sch.code,
      title: sch.title,
      locationLabel: sch.room,
      students: sch.students || 30, // Default student estimate
      tone: getTone(sch.code),
    };

    // Map schedule items to target days
    if (dayCode.includes("M")) daysGrid.monday.items.push(item);
    if (dayCode.includes("TH")) {
      daysGrid.thursday.items.push(item);
    } else if (dayCode.includes("T")) {
      daysGrid.tuesday.items.push(item);
    }
    if (dayCode.includes("W")) daysGrid.wednesday.items.push(item);
    if (dayCode.includes("F")) daysGrid.friday.items.push(item);
  });

  return Object.values(daysGrid);
}