import { Search } from "lucide-react";

interface HelpSearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function HelpSearchHeader({
  searchQuery,
  setSearchQuery,
}: HelpSearchHeaderProps) {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center bg-white">
      <h4 className="fw-bold mb-3">How can we help you?</h4>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="input-group input-group-lg bg-light rounded-pill border px-3 py-1 shadow-none">
            <span className="input-group-text bg-transparent border-0 text-muted pe-2">
              <Search size={20} />
            </span>
            <input
              type="text"
              className="form-control bg-transparent border-0 shadow-none ps-1"
              placeholder="Search FAQs and help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}