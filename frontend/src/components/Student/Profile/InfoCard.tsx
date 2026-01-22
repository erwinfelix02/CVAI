import type { LucideIcon } from "lucide-react";

type Item = {
  label: string;
  value: string;
  icon?: LucideIcon;
};

export default function InfoCard({
  title,
  icon: TitleIcon,
  items,
}: {
  title: string;
  icon: LucideIcon;
  items: Item[];
}) {
  return (
    <div className="card shadow-sm border-1 h-100">
      <div className="card-body p-3 p-md-4">
        {/* Header */}
       <div className="d-flex align-items-center gap-2 mb-3">
  <span className="profile-card__icon">
    <TitleIcon className="profile-card__icon-svg" />
  </span>
  <h5 className="fw-bold mb-0">{title}</h5>
</div>


        {/* Fields */}
        <div className="row g-3">
          {items.map((it) => (
            <div key={it.label} className="col-12">
              <div className="profile-field">
                <div className="profile-field__label d-flex align-items-center">
                  {it.icon && (
                    <it.icon
                      size={14}
                      className="me-2 text-muted"
                      aria-hidden="true"
                    />
                  )}
                  {it.label}
                </div>

                <div className="profile-field__value">{it.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
