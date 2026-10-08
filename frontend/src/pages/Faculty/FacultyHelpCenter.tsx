// ✅ src/pages/Faculty/FacultyHelpCenter.tsx

import { useState } from "react";
import HelpSearchHeader from "../../components/Faculty/Help/HelpSearchHeader";
import WhatsNewSection from "../../components/Faculty/Help/WhatsNewSection";
import FaqAccordionSection from "../../components/Faculty/Help/FaqAccordionSection";
import ContactSupportModal from "../../components/Faculty/Help/ContactSupportModal";
import SubmitTicketModal from "../../components/Faculty/Help/SubmitTicketModal";
import AuthAlert from "../../components/Authentication/AuthAlert";
import { HelpCircle, Phone, Ticket } from "lucide-react";

export default function FacultyHelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // AuthAlert states for ticket submission feedback
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("success");
  const [alertVisible, setAlertVisible] = useState(false);

  const showAlert = (message: string, type: "error" | "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 4000);
  };

  return (
    <div className="faculty-help-center-page container-fluid px-4 py-3">
      {/* Top Header & Quick Action Buttons */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <HelpCircle className="text-primary" size={24} />
            <h2 className="fw-bold mb-0">Help Center</h2>
          </div>
          <p className="text-muted mb-0">
            Faculty guides, FAQs, updates, and support
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm"
            onClick={() => setShowContactModal(true)}
          >
            <Phone size={16} />
            <span>Contact</span>
          </button>

          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm"
            onClick={() => setShowTicketModal(true)}
          >
            <Ticket size={16} />
            <span>Submit Ticket</span>
          </button>
        </div>
      </div>

      {/* AuthAlert Banner */}
      <div className="mb-3">
        <AuthAlert 
          message={alertMessage} 
          type={alertType} 
          visible={alertVisible} 
          loading={false} 
        />
      </div>

      {/* Search Header Hero Component */}
      <HelpSearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* What's New in Faculty Portal Section */}
      <div className="mt-4">
        <WhatsNewSection />
      </div>

      {/* FAQs Accordion Filter Section */}
      <div className="mt-4">
        <FaqAccordionSection searchQuery={searchQuery} />
      </div>

      {/* Contact Support Modal */}
      {showContactModal && (
        <ContactSupportModal onClose={() => setShowContactModal(false)} />
      )}

      {/* Submit Ticket Modal */}
      {showTicketModal && (
        <SubmitTicketModal 
          onClose={() => setShowTicketModal(false)}
          onSuccess={() => showAlert("Support ticket submitted successfully!", "success")}
          onError={(msg) => showAlert(msg, "error")}
        />
      )}
    </div>
  );
}