function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

export default function ProfileHero({
  fullName,
  subtitle,
  tags,
}: {
  fullName: string;
  subtitle: string;
  tags: string[];
}) {
  return (
    <div className="card shadow-sm border-1 profile-hero">
      <div className="profile-hero__banner" />

      <div className="card-body profile-hero__body">
        <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-3 gap-md-4">
          <div className="profile-hero__avatar">
            <span>{initials(fullName)}</span>
          </div>

          <div className="text-center text-md-start flex-grow-1">
            <h3 className="fw-bold mb-1">{fullName}</h3>
            <p className="text-muted mb-2">{subtitle}</p>

            <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
              {tags.map((t) => (
                <span key={t} className="badge rounded-pill text-bg-light border">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="d-none d-lg-block" style={{ width: 12 }} />
        </div>
      </div>
    </div>
  );
}
