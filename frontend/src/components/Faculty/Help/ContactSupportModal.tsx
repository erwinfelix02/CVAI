import { useState } from "react";
import { X, Mail, Phone, Headphones, Copy, Check } from "lucide-react";

interface ContactModalProps {
  onClose: () => void;
}

export default function ContactSupportModal({ onClose }: ContactModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div
        className="card border-0 shadow-lg rounded-4 bg-white w-100 p-4 position-relative"
        style={{ maxWidth: "550px", maxHeight: "90vh", overflowY: "auto" }}
      >
        <button
          type="button"
          className="btn btn-sm p-1 position-absolute top-0 end-0 m-3 text-muted"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h5 className="fw-bold mb-1">Contact Support</h5>
        <p className="text-muted small mb-4">
          Reach out to us through any of these channels
        </p>

        <div className="d-flex flex-column gap-3">
          {/* Email Support Card */}
          <div className="p-3 border rounded-3 bg-light-subtle">
            <div className="d-flex align-items-start gap-3">
              <div className="p-2 bg-primary-subtle text-primary rounded-3">
                <Mail size={20} />
              </div>
              <div className="flex-grow-1">
                <h6 className="fw-bold mb-1">Email Support</h6>
                <p className="text-muted small mb-2">
                  For detailed inquiries and document requests
                </p>
                <div className="d-flex align-items-center justify-content-between bg-white border rounded-2 px-3 py-2">
                  <span className="font-monospace small text-dark">
                    registrar@campus.edu.ph
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-light p-1 border-0"
                    onClick={() => handleCopy("registrar@campus.edu.ph", "email")}
                    title="Copy email"
                  >
                    {copiedField === "email" ? (
                      <Check size={16} className="text-success" />
                    ) : (
                      <Copy size={16} className="text-muted" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Support Card */}
          <div className="p-3 border rounded-3 bg-light-subtle">
            <div className="d-flex align-items-start gap-3">
              <div className="p-2 bg-success-subtle text-success rounded-3">
                <Phone size={20} />
              </div>
              <div className="flex-grow-1">
                <h6 className="fw-bold mb-1">Phone</h6>
                <p className="text-muted small mb-2">
                  For urgent concerns during office hours
                </p>
                <div className="d-flex align-items-center justify-content-between bg-white border rounded-2 px-3 py-2">
                  <span className="font-monospace small text-dark">
                    (02) 8123-4567 loc. 123
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-light p-1 border-0"
                    onClick={() => handleCopy("(02) 8123-4567 loc. 123", "phone")}
                    title="Copy phone"
                  >
                    {copiedField === "phone" ? (
                      <Check size={16} className="text-success" />
                    ) : (
                      <Copy size={16} className="text-muted" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* IT Helpdesk Card */}
          <div className="p-3 border rounded-3 bg-light-subtle">
            <div className="d-flex align-items-start gap-3">
              <div className="p-2 bg-info-subtle text-info rounded-3">
                <Headphones size={20} />
              </div>
              <div className="flex-grow-1">
                <h6 className="fw-bold mb-1">IT Helpdesk</h6>
                <p className="text-muted small mb-2">
                  For system and technical issues
                </p>
                <div className="d-flex align-items-center justify-content-between bg-white border rounded-2 px-3 py-2">
                  <span className="font-monospace small text-dark">
                    it-support@campus.edu.ph
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-light p-1 border-0"
                    onClick={() => handleCopy("it-support@campus.edu.ph", "it")}
                    title="Copy email"
                  >
                    {copiedField === "it" ? (
                      <Check size={16} className="text-success" />
                    ) : (
                      <Copy size={16} className="text-muted" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Office Information Box */}
          <div className="p-3 border rounded-3 bg-light">
            <h6 className="fw-bold mb-2">Office Information</h6>
            <ul className="list-unstyled small text-muted mb-0 d-flex flex-column gap-1">
              <li>🕒 Monday - Friday, 8:00 AM - 5:00 PM</li>
              <li>📍 Room 101, Administration Building, Main Campus</li>
              <li>🌐 www.campus.edu.ph/registrar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}