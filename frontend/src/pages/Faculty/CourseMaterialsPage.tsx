import { useMemo, useState } from "react";
import { Upload } from "lucide-react";

import MaterialsFilters from "../../components/Faculty/Materials/MaterialsFilters";
import MaterialsStats from "../../components/Faculty/Materials/MaterialsStats";
import MaterialsList from "../../components/Faculty/Materials/MaterialsList";
import type { MaterialItem } from "../../components/Faculty/Materials/types";

import "../../styles/faculty-materials.css";

const sampleMaterials: MaterialItem[] = [
  { id: "m1", title: "Week 1 - Introduction to Programming.pdf", sizeLabel: "2.4 MB", date: "3/1/2025", course: "CS 101", downloads: 145, type: "pdf" },
  { id: "m2", title: "Data Structures Lecture 5.mp4", sizeLabel: "156 MB", date: "3/5/2025", course: "CS 201", downloads: 89, type: "video" },
  { id: "m3", title: "Sorting Algorithms Demo", sizeLabel: "45 KB", date: "3/8/2025", course: "CS 301", downloads: 67, type: "doc" },
  { id: "m4", title: "Project Guidelines.pdf", sizeLabel: "1.1 MB", date: "3/9/2025", course: "CS 401", downloads: 52, type: "pdf" },
  { id: "m5", title: "Midterm Coverage.pdf", sizeLabel: "850 KB", date: "3/10/2025", course: "CS 201", downloads: 61, type: "pdf" },
  { id: "m6", title: "Week 2 Slides.pdf", sizeLabel: "3.2 MB", date: "3/11/2025", course: "CS 101", downloads: 51, type: "pdf" },
];

export default function CourseMaterialsPage() {
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [search, setSearch] = useState("");

  const courses = useMemo(() => {
    const unique = Array.from(new Set(sampleMaterials.map((m) => m.course)));
    return ["All Courses", ...unique];
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sampleMaterials.filter((m) => {
      const matchCourse = courseFilter === "All Courses" || m.course === courseFilter;
      const matchSearch =
        q.length === 0 ||
        m.title.toLowerCase().includes(q) ||
        m.course.toLowerCase().includes(q);
      return matchCourse && matchSearch;
    });
  }, [courseFilter, search]);

  const stats = useMemo(() => {
    return {
      totalFiles: sampleMaterials.length,
      videos: sampleMaterials.filter((m) => m.type === "video").length,
      documents: sampleMaterials.filter((m) => m.type !== "video").length,
      downloads: sampleMaterials.reduce((sum, m) => sum + m.downloads, 0),
    };
  }, []);

  return (
    <div className="container-fluid faculty-materials-scope">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Course Materials</h3>
          <p className="text-muted mb-0">
            Upload and manage course materials for students
          </p>
        </div>

        <button className="btn btn-success d-inline-flex align-items-center gap-2 px-3">
          <Upload size={18} />
          Upload Material
        </button>
      </div>

      <MaterialsFilters
        courses={courses}
        courseFilter={courseFilter}
        setCourseFilter={setCourseFilter}
        search={search}
        setSearch={setSearch}
      />

      <MaterialsStats stats={stats} />

      <MaterialsList materials={filtered} totalCount={sampleMaterials.length} />
    </div>
  );
}
