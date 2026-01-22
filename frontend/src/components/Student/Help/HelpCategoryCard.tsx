import type { HelpCategory } from "./HelpCategoryGrid";

type Props = {
  category: HelpCategory;
  onClick: () => void;
};

function toneClass(tone: HelpCategory["tone"]) {
  switch (tone) {
    case "primary":
      return { bg: "bg-primary", shadow: "shadow-sm" };
    case "danger":
      return { bg: "bg-danger", shadow: "shadow-sm" };
    case "success":
      return { bg: "bg-success", shadow: "shadow-sm" };
    case "warning":
      return { bg: "bg-warning", shadow: "shadow-sm" };
    case "purple":
      return { bg: "bg-purple", shadow: "shadow-sm" };
    default:
      return { bg: "bg-secondary", shadow: "shadow-sm" };
  }
}

export default function HelpCategoryCard({ category, onClick }: Props) {
  const Icon = category.icon;
  const t = toneClass(category.tone);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`help-card card border-1 ${t.shadow} w-100 text-start`}
    >
      <div className="card-body p-4">
        <div className={`help-icon ${t.bg} d-inline-flex align-items-center justify-content-center`}>
          <Icon size={22} className="text-white" />
        </div>

        <h5 className="fw-bold mt-3 mb-2">{category.title}</h5>
        <p className="text-muted mb-0">{category.description}</p>
      </div>
    </button>
  );
}
