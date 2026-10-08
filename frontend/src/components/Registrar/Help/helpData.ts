export type QuickGuideStep = {
  step: number;
  title: string;
  description: string;
};

export type QuickGuideItem = {
  id: string;
  icon: "book" | "users" | "file" | "userplus" | "shield" | "settings";
  title: string;
  subtitle: string;
  steps: QuickGuideStep[];
  tips: string[];
};

export const quickGuides: QuickGuideItem[] = [
  {
    id: "guide-enrollment",
    icon: "book",
    title: "Enrollment Guide",
    subtitle: "Step-by-step enrollment process",
    steps: [
      {
        step: 1,
        title: "Open Enrollment Page",
        description: "Navigate to the Enrollment section from the sidebar.",
      },
      {
        step: 2,
        title: "Search for Student",
        description:
          "Use the search bar to find a student by name or ID with 'Pending' enrollment status.",
      },
      {
        step: 3,
        title: "Click Evaluate",
        description:
          "Click the 'Evaluate' button to start the enrollment evaluation process.",
      },
      {
        step: 4,
        title: "Verify Student Info",
        description:
          "Review the student's personal information, contact details, and guardian info. Check the verification box.",
      },
      {
        step: 5,
        title: "Check Documents",
        description:
          "Verify all required documents (Form 137, PSA Birth Certificate, Good Moral, 2x2 photos). Mark each as verified.",
      },
      {
        step: 6,
        title: "Assign Section",
        description:
          "Select an available section for the student's course and year level.",
      },
      {
        step: 7,
        title: "Confirm Enrollment",
        description:
          "Add any evaluation notes and click 'Enroll Student' to finalize.",
      },
    ],
    tips: [
      "All required documents must be verified before proceeding to section assignment.",
      "Double-check the student's course and year level before assigning a section.",
      "Add notes for any missing follow-up requirements.",
    ],
  },
  {
    id: "guide-students",
    icon: "users",
    title: "Student Management",
    subtitle: "Managing student records",
    steps: [
      {
        step: 1,
        title: "Access Students Page",
        description:
          "Go to Students from the sidebar to view all student records.",
      },
      {
        step: 2,
        title: "Search & Filter",
        description:
          "Use search by name/ID and filter by course, year level, or status.",
      },
      {
        step: 3,
        title: "View Student Profile",
        description:
          "Click on a student to see their complete profile, enrollment history, and documents.",
      },
      {
        step: 4,
        title: "Update Information",
        description:
          "Edit student details like contact info, address, or guardian information.",
      },
      {
        step: 5,
        title: "Transfer Section",
        description:
          "Use the Transfer Section option to move a student, providing a reason for the transfer.",
      },
    ],
    tips: [
      "Always verify the student's identity before making changes.",
      "Section transfers require a valid reason and are logged in the system.",
      "Inactive students can be reactivated through the student profile.",
    ],
  },
  {
    id: "guide-docs",
    icon: "file",
    title: "Document Processing",
    subtitle: "Handling document requests",
    steps: [
      {
        step: 1,
        title: "View Requests",
        description:
          "Go to Documents to see all pending, processing, and completed document requests.",
      },
      {
        step: 2,
        title: "Start Processing",
        description:
          "Click 'Start Processing' on a pending request to begin preparation.",
      },
      {
        step: 3,
        title: "Prepare Document",
        description:
          "Generate or prepare the requested document based on student records.",
      },
      {
        step: 4,
        title: "Mark as Ready",
        description:
          "Once prepared, mark the document as 'Ready for Pickup' — the student will be notified.",
      },
      {
        step: 5,
        title: "Release Document",
        description:
          "When the student claims the document, click 'Release' and have them sign the logbook.",
      },
    ],
    tips: [
      "TOR requests may take 3-5 working days. Certificates are usually ready within 1-2 days.",
      "Document fees: TOR ₱75/copy, Certificates ₱50/copy, Diploma replacement ₱200.",
      "Rush processing is available for an additional ₱100 fee.",
    ],
  },
  {
    id: "guide-accounts",
    icon: "userplus",
    title: "Account Provisioning",
    subtitle: "Creating student & faculty accounts",
    steps: [
      {
        step: 1,
        title: "Approve Application",
        description:
          "First approve the student's pre-registration application from the Applications page.",
      },
      {
        step: 2,
        title: "Create Account",
        description:
          "Go to the approved student and click 'Create Account' to generate credentials.",
      },
      {
        step: 3,
        title: "Review Credentials",
        description:
          "A unique Student ID and temporary password will be generated automatically.",
      },
      {
        step: 4,
        title: "Dispatch Credentials",
        description:
          "Click 'Send Credentials' to send login details to the student via email/SMS.",
      },
      {
        step: 5,
        title: "Verify Activation",
        description:
          "The account starts as 'Inactive' and becomes 'Active' once credentials are dispatched.",
      },
    ],
    tips: [
      "Faculty accounts follow the same process — create from Faculty Accounts page.",
      "Students must change their temporary password on first login.",
      "Keep credential dispatch records for audit purposes.",
    ],
  },
  {
    id: "guide-sections",
    icon: "shield",
    title: "Section Management",
    subtitle: "Creating and managing sections",
    steps: [
      {
        step: 1,
        title: "Open Sections Page",
        description: "Navigate to Sections from the sidebar.",
      },
      {
        step: 2,
        title: "Create Section",
        description:
          "Click 'Add Section', select the course, year level, and set the section name and capacity.",
      },
      {
        step: 3,
        title: "Assign Adviser",
        description:
          "Select a faculty member as the class adviser for the section.",
      },
      {
        step: 4,
        title: "Assign Room",
        description:
          "Choose an available room for the section's homeroom assignment.",
      },
      {
        step: 5,
        title: "Monitor Capacity",
        description:
          "Track enrolled vs. maximum students to manage section availability.",
      },
    ],
    tips: [
      "Section names typically follow the format: Course-YearLevel-Letter (e.g., BSIT-1A).",
      "Maximum capacity is usually 40 students per section.",
      "Coordinate with Department Heads before creating sections for their courses.",
    ],
  },
  {
    id: "guide-settings",
    icon: "settings",
    title: "System Settings",
    subtitle: "Configuration and preferences",
    steps: [
      {
        step: 1,
        title: "Access Settings",
        description: "Go to Settings from the sidebar menu.",
      },
      {
        step: 2,
        title: "Academic Period",
        description:
          "Set the current academic year and semester for enrollment processing.",
      },
      {
        step: 3,
        title: "Enrollment Status",
        description:
          "Toggle enrollment open/closed to control when students can be enrolled.",
      },
      {
        step: 4,
        title: "Document Settings",
        description:
          "Configure document types, fees, and processing time estimates.",
      },
      {
        step: 5,
        title: "Notification Preferences",
        description:
          "Set up email and SMS notification templates and preferences.",
      },
    ],
    tips: [
      "Always close enrollment before changing the academic period.",
      "Notify all departments before opening a new enrollment period.",
      "Review document fee schedules at the start of each academic year.",
    ],
  },
];

export const faqSections = [
  {
    id: "faq-enrollment",
    title: "Enrollment",
    items: [
      {
        id: "enroll-1",
        question: "How do I enroll a student to a section?",
        answer:
          "Open the student’s enrollment evaluation, review the submitted details and documents, then assign the student to an available section before confirming enrollment.",
      },
      {
        id: "enroll-2",
        question: "What if a section is full?",
        answer:
          "If a section has reached its maximum capacity, assign the student to another available section or update section capacity in registrar settings if permitted.",
      },
      {
        id: "enroll-3",
        question: "How do I transfer a student to another section?",
        answer:
          "Locate the student record, open the section assignment controls, choose the new section, and save the changes. Make sure the destination section still has available slots.",
      },
      {
        id: "enroll-4",
        question: "What is the enrollment evaluation process?",
        answer:
          "The evaluation process usually includes checking the student’s application details, validating submitted documents, confirming eligibility, and assigning the proper section and academic details.",
      },
    ],
  },
  {
    id: "faq-applications",
    title: "Applications & Accounts",
    items: [
      {
        id: "app-1",
        question: "How do I review a student application?",
        answer:
          "Go to the applications or pending enrollment list, open the student profile, verify all submitted information and attachments, then proceed with approval, scheduling, or enrollment evaluation.",
      },
      {
        id: "app-2",
        question: "What documents are required for enrollment?",
        answer:
          "Required documents may include a birth certificate, Form 137 or transcript, good moral certificate, and ID photo, depending on your school’s enrollment policy.",
      },
      {
        id: "app-3",
        question: "How do I create a student account?",
        answer:
          "After the student is officially enrolled, use the account provisioning or send credentials feature to generate and send login details to the student’s registered email.",
      },
      {
        id: "app-4",
        question: "Why is a student account showing as 'Inactive'?",
        answer:
          "An account may appear inactive if it has not been activated yet, credentials were not sent successfully, or the student record has not been fully processed in the system.",
      },
    ],
  },
  {
    id: "faq-documents",
    title: "Documents",
    items: [
      {
        id: "docs-1",
        question: "How do I process a document request?",
        answer:
          "Open the document request queue, review the request details, confirm payment or approval if needed, then mark the request as processing, completed, or ready for release.",
      },
      {
        id: "docs-2",
        question: "How are document fees calculated?",
        answer:
          "Document fees are based on the request type and the fee structure configured by the registrar. Some documents may also include rush or additional copy charges.",
      },
      {
        id: "docs-3",
        question: "How long does document processing take?",
        answer:
          "Processing time depends on the configured number of processing days in registrar settings and the complexity of the document request.",
      },
    ],
  },
  {
    id: "faq-courses",
    title: "Courses & Departments",
    items: [
      {
        id: "course-1",
        question: "How do I add a new course?",
        answer:
          "Go to the course management area, create a new course record, fill in the code, title, department, and other required details, then save it.",
      },
      {
        id: "course-2",
        question: "How do I manage departments?",
        answer:
          "Use the departments module to create, update, activate, or organize departments according to the academic structure of your institution.",
      },
      {
        id: "course-3",
        question: "Can I deactivate a department?",
        answer:
          "Yes, if your system supports it. Deactivating a department is recommended instead of deleting it when existing records are already linked to that department.",
      },
    ],
  },
];