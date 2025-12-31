import StatCard from "../../components/Admin/StatCard";
import RecentActivity from "../../components/Admin/RecentActivity";

export default function AdminDashboard() {
  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Welcome back, Admin</p>

      <div className="row g-4 mb-4">
        <StatCard
          title="Total Users"
          value="1,234"
          change="+12% from last month"
        />
        <StatCard
          title="Active Chats"
          value="56"
          change="+8% from last month"
        />
        <StatCard title="FAQs Added" value="48" change="+5 from last month" />
        <StatCard
          title="Queries Today"
          value="328"
          change="+23% from last month"
        />
      </div>

      <RecentActivity />
    </>
  );
}
