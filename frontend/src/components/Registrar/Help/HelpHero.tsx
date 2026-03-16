import { Search } from "lucide-react";

type Props = {
  query: string;
  onChangeQuery: (value: string) => void;
};

export default function HelpHero({ query, onChangeQuery }: Props) {
  return (
    <div className="rh-hero-card">
      <div className="rh-hero-body">
        <h2 className="rh-hero-title">How can we help you?</h2>

        <div className="rh-search-wrap">
          <Search size={22} className="rh-search-icon" />
          <input
            type="text"
            className="rh-search-input"
            placeholder="Search FAQs, guides, and help topics..."
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}