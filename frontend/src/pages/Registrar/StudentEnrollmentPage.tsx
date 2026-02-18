import { Users } from "lucide-react";
import { useEffect, useState } from "react";

import EnrollmentStats from "../../components/Registrar/Enrollment/EnrollmentStats";
import PendingEnrollmentList from "../../components/Registrar/Enrollment/PendingEnrollmentList";
import SectionCapacityGrid from "../../components/Registrar/Enrollment/SectionCapacityGrid";

import "../../styles/registrar-enrollment.css";

type EnrollmentItem = {
  _id: string;
  registrationId: string;
  studentName: string;
  email: string;
  status: "Scheduled" | "Enrolled" | "Cancelled";
  schedule: { date: string; time: string; location: string; notes?: string };
  createdAt: string;
};

export default function StudentEnrollmentPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [stats, setStats] = useState<{
    pending: number;
    enrolled: number;
    semesterLabel: string;
  } | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/enrollments/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Failed to load enrollment stats", e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const url = new URL("http://localhost:5000/api/enrollments");
        url.searchParams.set("status", "Scheduled");
        if (query.trim()) url.searchParams.set("q", query.trim());

        const res = await fetch(url.toString());
        const data = await res.json();

        setEnrollments(Array.isArray(data) ? data : []);

        // ✅ refresh stats too (so numbers stay correct after changes)
        await fetchStats();
      } catch (e) {
        console.error("Failed to load enrollments", e);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [query]);

  // ✅ show filtered count during search, otherwise show real DB count
  const pendingCount = query.trim()
    ? enrollments.length
    : (stats?.pending ?? enrollments.length);

  return (
    <div className="registrar-enrollment container-fluid px-3 px-md-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Student Enrollment</h2>
        <p className="text-muted mb-0">Assign approved students to sections</p>
      </div>

      <EnrollmentStats
        pending={pendingCount}
        availableSections={4}
        semesterLabel={stats?.semesterLabel ?? "—"}
      />

      <div className="card shadow-sm enroll-card mt-3 mt-md-4">
        <div className="card-body">
          <div className="input-group enroll-search">
            <span className="input-group-text bg-white border-end-0">
              <Users size={18} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search pending students by name or ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 mt-md-4">
        <PendingEnrollmentList loading={loading} items={enrollments} />
      </div>

      <div className="mt-3 mt-md-4">
        <SectionCapacityGrid />
      </div>
    </div>
  );
}
