// ✅ src/pages/DepartmentHead/DepartmentHeadHelpSupport.tsx

import { useMemo, useState } from "react";
import {
  Users,
  CalendarDays,
  DoorOpen,
  BookOpen,
  Search,
} from "lucide-react";

import HelpTopicCard, {
  type HelpTopic,
} from "../../components/DepartmentHead/HelpSupport/HelpTopicCard";

import FAQCard, {
  type FAQItem,
} from "../../components/DepartmentHead/HelpSupport/FAQCard";

import "../../styles/department-headHelpSupport.css";

export default function DepartmentHeadHelpSupport() {
  /* =========================================================
     SEARCH
     ========================================================= */

  const [search, setSearch] = useState("");

  /* =========================================================
     HELP TOPICS
     ========================================================= */

  const helpTopics = useMemo<HelpTopic[]>(
    () => [
      {
        id: 1,
        title: "Managing Faculty Loads",
        description:
          "Balance teaching units across your department",
        icon: Users,
      },
      {
        id: 2,
        title: "Creating Schedules",
        description:
          "Assign subjects, faculty, rooms, and time slots",
        icon: CalendarDays,
      },
      {
        id: 3,
        title: "Allocating Rooms",
        description:
          "Track utilization and free time slots",
        icon: DoorOpen,
      },
      {
        id: 4,
        title: "Managing Subject Offerings",
        description:
          "Maintain the curriculum for each program",
        icon: BookOpen,
      },
    ],
    []
  );

  /* =========================================================
     FAQ DATA
     ========================================================= */

  const faqItems = useMemo<FAQItem[]>(
    () => [
      {
        id: 1,
        question:
          "How do I resolve a schedule conflict?",
        answer:
          "Review the conflicting faculty, room, subject, and time slot in the schedule. Adjust the assignment to an available room or time slot, then save the updated schedule.",
      },
      {
        id: 2,
        question:
          "What is the maximum teaching load?",
        answer:
          "The maximum teaching load is based on the department preference configured in Settings. The default maximum teaching load is 21 units.",
      },
      {
        id: 3,
        question:
          "Can I add a new room?",
        answer:
          "Yes. Open Room Allocation and use the room request option to submit a new room request. The room can then be reviewed and added to the available rooms.",
      },
      {
        id: 4,
        question:
          "How do I assign a faculty member to a subject?",
        answer:
          "Open the schedule management page, select the subject, and choose an available faculty member. Make sure the faculty member's teaching load does not exceed the configured maximum.",
      },
      {
        id: 5,
        question:
          "How do I create a new schedule?",
        answer:
          "Open Schedule Management and create a schedule by selecting the subject, faculty member, room, meeting days, and time slot.",
      },
      {
        id: 6,
        question:
          "Where can I view faculty teaching loads?",
        answer:
          "Faculty teaching loads can be viewed from the Department Head Dashboard or the faculty load management page.",
      },
    ],
    []
  );

  /* =========================================================
     FILTER HELP TOPICS
     ========================================================= */

  const filteredTopics = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return helpTopics;
    }

    return helpTopics.filter((topic) => {
      return (
        topic.title
          .toLowerCase()
          .includes(keyword) ||
        topic.description
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [helpTopics, search]);

  /* =========================================================
     FILTER FAQ
     ========================================================= */

  const filteredFAQs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return faqItems;
    }

    return faqItems.filter((faq) => {
      return (
        faq.question
          .toLowerCase()
          .includes(keyword) ||
        faq.answer
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [faqItems, search]);

  /* =========================================================
     HANDLERS
     ========================================================= */

  const handleTopicClick = (topic: HelpTopic) => {
    console.log(
      "Help topic selected:",
      topic.title
    );
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <main className="department-help-page">
      <div className="department-help-content">
        {/* =====================================================
            PAGE HEADER
            ===================================================== */}

        <div className="help-page-header">
          <div className="help-page-header-content">
            <h1>Help &amp; Support</h1>

            <p>
              Guides and answers for department head
              tasks
            </p>
          </div>
        </div>

        {/* =====================================================
            SEARCH
            ===================================================== */}

        <div className="help-search-wrapper">
          <div className="help-search">
            <Search
              size={21}
              strokeWidth={1.8}
              className="help-search-icon"
            />

            <input
              type="text"
              className="help-search-input"
              placeholder="Search help topics..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search help topics"
            />
          </div>
        </div>

        {/* =====================================================
            HELP TOPICS
            ===================================================== */}

        {filteredTopics.length > 0 && (
          <div className="help-topics-grid">
            {filteredTopics.map((topic) => (
              <div
                className="help-topic-column"
                key={topic.id}
              >
                <HelpTopicCard
                  topic={topic}
                  onClick={handleTopicClick}
                />
              </div>
            ))}
          </div>
        )}

        {/* =====================================================
            NO HELP TOPICS
            ===================================================== */}

        {filteredTopics.length === 0 && (
          <div className="help-empty-state">
            <h5>No help topics found</h5>

            <p>
              Try searching for another topic.
            </p>
          </div>
        )}

        {/* =====================================================
            FAQ
            ===================================================== */}

        {filteredFAQs.length > 0 && (
          <div className="faq-wrapper">
            <FAQCard items={filteredFAQs} />
          </div>
        )}

        {/* =====================================================
            NO FAQ RESULTS
            ===================================================== */}

        {filteredFAQs.length === 0 &&
          filteredTopics.length > 0 && (
            <div className="help-empty-state">
              <h5>
                No frequently asked questions found
              </h5>

              <p>
                Try searching for another question.
              </p>
            </div>
          )}
      </div>
    </main>
  );
}