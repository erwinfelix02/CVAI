import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import "../../styles/registrar-help.css";

import HelpHero from "../../components/Registrar/Help/HelpHero";
import QuickGuideCard from "../../components/Registrar/Help/QuickGuideCard";
import FaqSection from "../../components/Registrar/Help/FaqSection";
import ContactSupportModal from "../../components/Registrar/Help/ContactSupportModal";
import QuickGuideModal from "../../components/Registrar/Help/QuickGuideModal";

import {
  BookOpen,
  Users,
  FileText,
  UserPlus,
  ShieldCheck,
  Settings,
  Phone,
} from "lucide-react";

import {
  quickGuides,
  faqSections,
  type QuickGuideItem,
} from "../../components/Registrar/Help/helpData";

export default function RegistrarHelpPage() {
  const [query, setQuery] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<QuickGuideItem | null>(null);

  const filteredSections = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return faqSections;

    return faqSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.question.toLowerCase().includes(term) ||
            item.answer.toLowerCase().includes(term) ||
            section.title.toLowerCase().includes(term),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query]);

  const iconMap: Record<string, ReactNode> = {
    book: <BookOpen size={28} />,
    users: <Users size={28} />,
    file: <FileText size={28} />,
    userplus: <UserPlus size={28} />,
    shield: <ShieldCheck size={28} />,
    settings: <Settings size={28} />,
  };

  return (
    <>
      <div className="registrar-help-page">
        <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-md-between gap-3 mb-3 mb-md-4">
          <div className="min-w-0">
            <div className="d-flex align-items-center gap-2 mb-1">
              <div className="rh-header-icon-wrap">
                <span className="rh-header-icon">?</span>
              </div>
              <h2 className="fw-bold mb-0">Help Center</h2>
            </div>

            <p className="text-muted mb-0">
              Guides, FAQs, and support resources
            </p>
          </div>

          <div className="d-flex rh-header-actions">
            <button
              type="button"
              className="btn rh-contact-btn"
              onClick={() => setContactOpen(true)}
            >
              <Phone size={18} />
              <span>Contact</span>
            </button>
          </div>
        </div>

        <HelpHero query={query} onChangeQuery={setQuery} />

        <section className="mt-4 mt-md-5">
          <h3 className="fw-bold mb-3">Quick Guides</h3>

          <div className="row g-3 g-md-4 rh-guide-row">
            {quickGuides.map((guide) => (
              <div
                className="col-12 col-sm-6 col-lg-4 col-xl-2 d-flex"
                key={guide.id}
              >
                <QuickGuideCard
                  icon={iconMap[guide.icon]}
                  title={guide.title}
                  subtitle={guide.subtitle}
                  onClick={() => setSelectedGuide(guide)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 mt-md-5">
          <div className="rh-faq-card">
            <div className="rh-faq-card-body">
              <h3 className="fw-bold mb-4">Frequently Asked Questions</h3>

              {filteredSections.length === 0 ? (
                <div className="rh-empty-state">
                  <div className="rh-empty-icon">🔎</div>
                  <h5 className="mb-2">No matching help topics found</h5>
                  <p className="text-muted mb-0">
                    Try searching for a different keyword.
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {filteredSections.map((section) => (
                    <FaqSection
                      key={section.id}
                      title={section.title}
                      items={section.items}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <ContactSupportModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
      />

      <QuickGuideModal
        open={!!selectedGuide}
        guide={selectedGuide}
        icon={selectedGuide ? iconMap[selectedGuide.icon] : null}
        onClose={() => setSelectedGuide(null)}
      />
    </>
  );
}