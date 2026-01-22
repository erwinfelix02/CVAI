    import { useMemo, useState } from "react";
    import DocumentsTabs from "../../components/Student/Documents/DocumentsTabs";
    import type { DocTabKey } from "../../components/Student/Documents/DocumentsTabs";
    import AvailableDocumentsTable from "../../components/Student/Documents/AvailableDocumentsTable";
    import RequestDocumentsList from "../../components/Student/Documents/RequestDocumentsList";
    import PendingRequestsTable from "../../components/Student/Documents/PendingRequestsTable";
    import "../../styles/student-documents.css";

    export type AvailableDoc = {
    id: string;
    name: string;
    type: "PDF" | "DOCX";
    size: string;
    lastUpdated: string;
    };

    export type RequestDoc = {
    id: string;
    name: string;
    eta: string; // e.g. "5-7 working days"
    fee: number; // pesos
    };

    export type PendingDoc = {
    id: string;
    name: string;
    requestDate: string;
    expectedDate: string;
    status: "Processing" | "Ready for Pickup";
    };

    export default function DocumentsPage() {
    const [activeTab, setActiveTab] = useState<DocTabKey>("available");

    // ✅ sample data (replace with API later)
    const availableDocs: AvailableDoc[] = useMemo(
        () => [
        { id: "1", name: "Certificate of Registration (COR)", type: "PDF", size: "245 KB", lastUpdated: "Jan 10, 2025" },
        { id: "2", name: "Student ID Card", type: "PDF", size: "1.2 MB", lastUpdated: "Aug 15, 2024" },
        { id: "3", name: "Enrollment Form", type: "PDF", size: "180 KB", lastUpdated: "Jan 5, 2025" },
        { id: "4", name: "Student Handbook 2024-2025", type: "PDF", size: "5.8 MB", lastUpdated: "Jul 1, 2024" },
        { id: "5", name: "Academic Calendar", type: "PDF", size: "320 KB", lastUpdated: "Jun 15, 2024" },
        ],
        []
    );

    const requestDocs: RequestDoc[] = useMemo(
        () => [
        { id: "r1", name: "Transcript of Records (TOR)", eta: "5-7 working days", fee: 150 },
        { id: "r2", name: "Certificate of Good Moral", eta: "3-5 working days", fee: 100 },
        { id: "r3", name: "Certificate of Enrollment", eta: "1-2 working days", fee: 50 },
        { id: "r4", name: "Honorable Dismissal", eta: "7-10 working days", fee: 200 },
        ],
        []
    );

    const pendingDocs: PendingDoc[] = useMemo(
        () => [
        { id: "p1", name: "Transcript of Records (TOR)", requestDate: "Jan 12, 2025", expectedDate: "Jan 20, 2025", status: "Processing" },
        { id: "p2", name: "Certificate of Good Moral", requestDate: "Jan 8, 2025", expectedDate: "Jan 13, 2025", status: "Ready for Pickup" },
        ],
        []
    );

    const pendingCount = pendingDocs.length;

    return (
          <div className="documents-page">
        {/* Title */}
        <div className="mb-3">
            <h2 className="fw-bold mb-1">Documents</h2>
            <p className="text-muted mb-0">Access and request academic documents</p>
        </div>

        {/* Tabs */}
        <DocumentsTabs
            active={activeTab}
            onChange={setActiveTab}
            pendingCount={pendingCount}
        />

        {/* Content */}
        <div className="mt-3">
            {activeTab === "available" && (
            <AvailableDocumentsTable
                docs={availableDocs}
                onView={(doc) => console.log("view", doc)}
                onDownload={(doc) => console.log("download", doc)}
            />
            )}

            {activeTab === "request" && (
            <RequestDocumentsList
                docs={requestDocs}
                onRequest={(doc) => console.log("request", doc)}
            />
            )}

            {activeTab === "pending" && (
            <PendingRequestsTable docs={pendingDocs} />
            )}
        </div>
        </div>
    );
    }
