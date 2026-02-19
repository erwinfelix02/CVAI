import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import EnrollmentStats from "../../components/Registrar/Enrollment/EnrollmentStats";
import PendingEnrollmentList from "../../components/Registrar/Enrollment/PendingEnrollmentList";
import SectionCapacityGrid from "../../components/Registrar/Enrollment/SectionCapacityGrid";

import "../../styles/registrar-enrollment.css";

type EnrollmentItem = {
  _id: string;
  registrationId: string;
  studentName?: string;
  email?: string;

  // status for pending evaluation list
  status: "Scheduled" | "Enrolled" | "Cancelled";

  // optional snapshot fields (if you have them)
  personal?: { firstName?: string; lastName?: string };
  academic?: { program?: string; yearLevel?: string | number };

  createdAt?: string;
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
        url.searchParams.set("status", "Scheduled"); // pending evaluation
        if (query.trim()) url.searchParams.set("q", query.trim());

        const res = await fetch(url.toString());
        const data = await res.json();

        setEnrollments(Array.isArray(data) ? data : []);
        await fetchStats();
      } catch (e) {
        console.error("Failed to load enrollments", e);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [query]);

  // show filtered count during search, otherwise show real DB count
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
        enrolled={stats?.enrolled ?? 0}
        availableSections={4}
        semesterLabel="2nd Sem 2024"
      />

      {/* Search (match screenshot) */}
      <div className="card shadow-sm enroll-card mt-3 mt-md-4">
        <div className="card-body">
          <div className="enroll-searchbar">
            <Search size={18} className="enroll-search-icon" />
            <input
              type="text"
              className="enroll-search-input"
              placeholder="Search students by name or ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 mt-md-4">
        <PendingEnrollmentList
          loading={loading}
          items={enrollments}
          titleCount={pendingCount}
        />
      </div>

      <div className="mt-3 mt-md-4">
        <SectionCapacityGrid />
      </div>
    </div>
  );
}
