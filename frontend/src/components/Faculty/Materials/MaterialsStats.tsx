import { FileText, Video, Download } from "lucide-react";

type Props = {
  stats: {
    totalFiles: number;
    videos: number;
    documents: number;
    downloads: number;
  };
};

export default function MaterialsStats({ stats }: Props) {
  const items = [
    {
      label: "Total Files",
      value: stats.totalFiles,
      icon: FileText,
      tone: "blue",
    },
    { label: "Videos", value: stats.videos, icon: Video, tone: "purple" },
    { label: "Documents", value: stats.documents, icon: FileText, tone: "red" },
    {
      label: "Downloads",
      value: stats.downloads,
      icon: Download,
      tone: "green",
    },
  ] as const;

  return (
    <div className="row g-3 mb-3 mb-md-4">
      {items.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="col-12 col-sm-6 col-lg-3">
            <div className="card shadow-sm h-100 faculty-stat-card">
              <div className="card-body d-flex align-items-center gap-3">
                <div className={`stat-icon ${s.tone}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="fw-bold fs-4 stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
