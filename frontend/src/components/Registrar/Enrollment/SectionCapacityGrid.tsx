import type { SectionItem } from "../../../components/Registrar/Sections/types";

type Props = {
  sections: SectionItem[];
  loading?: boolean;
};

export default function SectionCapacityGrid({ sections, loading }: Props) {
  const hasSections = (sections?.length ?? 0) > 0;

  return (
    <div className="card shadow-sm enroll-card">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0">Section Capacity</h5>

          {loading ? (
            <span className="text-muted small">Loading…</span>
          ) : (
            <span className="text-muted small">
              {sections.length} sections
            </span>
          )}
        </div>

        {!loading && !hasSections ? (
          <div className="text-muted">No official sections found.</div>
        ) : (
          <div className="row g-3">
            {sections.map((s) => {
              const used = s.enrolled ?? 0;
              const total = s.capacity ?? 0;

              const percent =
                total <= 0 ? 0 : Math.min(100, Math.round((used / total) * 100));

              return (
                <div key={s.id ?? s.code} className="col-12 col-md-6">
                  <div className="capacity-card">
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <div>
                        <div className="fw-bold">{s.code}</div>
                        <div className="text-muted">{s.program}</div>
                      </div>

                      <span className="capacity-pill">
                        {used}/{total}
                      </span>
                    </div>

                    <div className="progress my-2">
                      <div
                        className={`progress-bar ${
                          percent >= 90 ? "bg-danger" : "bg-warning"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="text-muted small">
                      Adviser: {s.adviser ?? "TBA"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}