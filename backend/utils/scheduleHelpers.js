// Maps Javascript getDay() numbers (0-6) to standard academic abbreviation codes
export const getTodayAbbr = () => {
  const dayMap = ["SU", "M", "T", "W", "TH", "F", "S"];
  return dayMap[new Date().getDay()];
};

// Converts standard time strings like "8:00 AM - 10:00 AM" or "1:00 PM" into minute counts from midnight
export const parseTimeRange = (timeStr) => {
  if (!timeStr) return { startMinutes: 0, endMinutes: 0 };

  const parts = timeStr.split("-").map((s) => s.trim());
  
  const parseSingleTime = (t) => {
    const match = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3] ? match[3].toUpperCase() : null;

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const startMinutes = parseSingleTime(parts[0]);
  // Default to 1 hour duration if end time is omitted
  const endMinutes = parts[1] ? parseSingleTime(parts[1]) : startMinutes + 60;

  return { startMinutes, endMinutes };
};

// Determines whether a schedule slot is completed, ongoing, or upcoming
export const calculateScheduleStatus = (timeStr) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const { startMinutes, endMinutes } = parseTimeRange(timeStr);

  if (currentMinutes > endMinutes) return "completed";
  if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) return "ongoing";
  return "upcoming";
};