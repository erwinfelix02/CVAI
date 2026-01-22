import type { LucideIcon } from "lucide-react";
import HelpCategoryCard from "./HelpCategoryCard";

export type HelpCategoryTone =
  | "primary"
  | "danger"
  | "success"
  | "warning"
  | "gray"
  | "purple";

export type HelpCategory = {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: HelpCategoryTone;
};

type Props = {
  categories: HelpCategory[];
  onSelect: (cat: HelpCategory) => void;
};

export default function HelpCategoryGrid({ categories, onSelect }: Props) {
  return (
    <div className="row g-3 g-md-4 justify-content-center">
      {categories.map((c) => (
        <div key={c.key} className="col-12 col-sm-6 col-lg-4">
          <HelpCategoryCard category={c} onClick={() => onSelect(c)} />
        </div>
      ))}
    </div>
  );
}
