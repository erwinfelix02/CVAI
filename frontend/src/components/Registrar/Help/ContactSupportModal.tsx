import { useEffect, useState } from "react";
import {
  X,
  Mail,
  Phone,
  MessageCircleMore,
  Clock3,
  MapPin,
  Globe,
  Copy,
  Check,
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ContactSupportModal({ open, onClose }: Props) {
  const [copiedValue, setCopiedValue] = useState("");

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      setTimeout(() => setCopiedValue(""), 1500);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="rh-contact-modal-backdrop" onClick={onClose} />

      <div className="rh-contact-modal-wrap">
        <div
          className="rh-contact-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-support-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rh-contact-modal-header">
            <div>
              <h3 id="contact-support-title" className="rh-contact-modal-title">
                Contact Support
              </h3>
              <p className="rh-contact-modal-subtitle mb-0">
                Reach out to us through any of these channels
              </p>
            </div>

            <button
              type="button"
              className="rh-contact-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="rh-contact-modal-body">
            <div className="rh-contact-method-card">
              <div className="rh-contact-method-icon rh-contact-method-icon-blue">
                <Mail size={20} />
              </div>

              <div className="rh-contact-method-content">
                <div className="rh-contact-method-title">Email Support</div>
                <div className="rh-contact-method-desc">
                  For detailed inquiries and document requests
                </div>

                <div className="rh-contact-copy-row">
                  <span className="rh-contact-copy-value">
                    registrar@campus.edu.ph
                  </span>

                  <button
                    type="button"
                    className="rh-contact-copy-btn"
                    onClick={() => handleCopy("registrar@campus.edu.ph")}
                    aria-label="Copy email"
                  >
                    {copiedValue === "registrar@campus.edu.ph" ? (
                      <Check size={17} />
                    ) : (
                      <Copy size={17} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="rh-contact-method-card">
              <div className="rh-contact-method-icon rh-contact-method-icon-green">
                <Phone size={20} />
              </div>

              <div className="rh-contact-method-content">
                <div className="rh-contact-method-title">Phone</div>
                <div className="rh-contact-method-desc">
                  For urgent concerns during office hours
                </div>

                <div className="rh-contact-copy-row">
                  <span className="rh-contact-copy-value">
                    (02) 8123-4567 loc. 123
                  </span>

                  <button
                    type="button"
                    className="rh-contact-copy-btn"
                    onClick={() => handleCopy("(02) 8123-4567 loc. 123")}
                    aria-label="Copy phone"
                  >
                    {copiedValue === "(02) 8123-4567 loc. 123" ? (
                      <Check size={17} />
                    ) : (
                      <Copy size={17} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="rh-contact-method-card">
              <div className="rh-contact-method-icon rh-contact-method-icon-purple">
                <MessageCircleMore size={20} />
              </div>

              <div className="rh-contact-method-content">
                <div className="rh-contact-method-title">IT Helpdesk</div>
                <div className="rh-contact-method-desc">
                  For system and technical issues
                </div>

                <div className="rh-contact-copy-row">
                  <span className="rh-contact-copy-value">
                    it-support@campus.edu.ph
                  </span>

                  <button
                    type="button"
                    className="rh-contact-copy-btn"
                    onClick={() => handleCopy("it-support@campus.edu.ph")}
                    aria-label="Copy IT support email"
                  >
                    {copiedValue === "it-support@campus.edu.ph" ? (
                      <Check size={17} />
                    ) : (
                      <Copy size={17} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="rh-office-info-card">
              <div className="rh-office-info-title">Office Information</div>

              <div className="rh-office-info-list">
                <div className="rh-office-info-item">
                  <Clock3 size={16} />
                  <span>Monday - Friday, 8:00 AM - 5:00 PM</span>
                </div>

                <div className="rh-office-info-item">
                  <MapPin size={16} />
                  <span>Room 101, Administration Building, Main Campus</span>
                </div>

                <div className="rh-office-info-item">
                  <Globe size={16} />
                  <span>www.campus.edu.ph/registrar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}