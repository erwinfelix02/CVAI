import type { LucideIcon } from "lucide-react";

type Item = {
  label: string;
  value: string;
  icon?: LucideIcon;

  onChange?: (value: string) => void;
  multiline?: boolean;
  readOnly?: boolean;
};

export default function InfoCard({
  title,
  icon: TitleIcon,
  items,
  editable = false,
}: {
  title: string;
  icon: LucideIcon;
  items: Item[];
  editable?: boolean;
}) {
  return (
    <div className="card shadow-sm border-1 h-100 profile-card">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="profile-card__icon">
            <TitleIcon className="profile-card__icon-svg" />
          </span>
          <h5 className="fw-bold mb-0">{title}</h5>
        </div>

        <div className="row g-3">
          {items.map((it) => {
            const isLocked = !editable || it.readOnly;

            return (
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

                  {isLocked ? (
                    <div className="profile-field__value">{it.value}</div>
                  ) : it.multiline ? (
                    <textarea
                      className="form-control profile-input"
                      value={it.value}
                      onChange={(e) => it.onChange?.(e.target.value)}
                      rows={2}
                    />
                  ) : (
                    <input
                      className="form-control profile-input"
                      value={it.value}
                      onChange={(e) => it.onChange?.(e.target.value)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
