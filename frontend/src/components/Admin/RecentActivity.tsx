const activities = [
  { title: "New user registered", subtitle: "john.doe@university.edu", time: "2 min ago" },
  { title: "FAQ updated", subtitle: "Admin", time: "15 min ago" },
  { title: "New help request", subtitle: "jane.smith@university.edu", time: "1 hour ago" },
  { title: "User role changed", subtitle: "teacher@university.edu", time: "2 hours ago" },
];

export default function RecentActivity() {
  return (
    <div className="activity-card">
      <h5 className="mb-4">Recent Activity</h5>

      {activities.map((a, i) => (
        <div key={i} className="activity-item">
          <div>
            <strong>{a.title}</strong>
            <p>{a.subtitle}</p>
          </div>
          <span>{a.time}</span>
        </div>
      ))}
    </div>
  );
}
