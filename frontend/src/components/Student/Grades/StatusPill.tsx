export default function StatusPill({
  value,
}: {
  value: "In Progress" | "Completed" | "Passed" | "Failed";
}) {
  const cls =
    value === "In Progress"
      ? "pill pill-orange"
      : value === "Passed"
      ? "pill pill-green"
      : value === "Failed"
      ? "pill pill-red"
      : "pill pill-blue";

  return <span className={cls}>{value}</span>;
}
