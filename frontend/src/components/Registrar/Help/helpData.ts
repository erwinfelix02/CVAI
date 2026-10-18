export type QuickGuideStep = {
  step: number;
  title: string;
  description: string;
};

export type QuickGuideItem = {
  id: string;
  icon: "layout-dashboard" | "file-text" | "users" | "book-open" | "layers" | "book" | "building" | "settings";
  title: string;
  subtitle: string;
  steps: QuickGuideStep[];
  tips: string[];
};

export const quickGuides: QuickGuideItem[] = [
  {
    id: "guide-dashboard",
    icon: "layout-dashboard",
    title: "Dashboard Overview",
    subtitle: "Monitoring key metrics and quick actions",
    steps: [
      {
        step: 1,
        title: "Access Dashboard",
        description: "Land on the Dashboard immediately after logging into the Registrar Portal.",
      },
      {
        step: 2,
        title: "Review Key Metrics",
        description: "Check summary widgets for total students, pending applications, active sections, and pending document requests.",
      },
      {
        step: 3,
        title: "Use Quick Actions",
        description: "Click shortcut buttons to quickly jump to processing new student enrollments or reviewing pending requests.",
      },
    ],
    tips: [
      "Check the dashboard daily to stay updated on pending registration backlogs.",
      "Use system indicators to see if enrollment is currently open or closed.",
    ],
  },
  {
    id: "guide-applications",
    icon: "file-text",
    title: "Application Processing",
    subtitle: "Reviewing and approving pre-registrations",
    steps: [
      {
        step: 1,
        title: "Open Applications",
        description: "Navigate to the Applications page from the sidebar to view incoming submissions.",
      },
      {
        step: 2,
        title: "Review Applicant Details",
        description: "Click on an application to review student records, contact information, and initial credentials.",
      },
      {
        step: 3,
        title: "Approve or Reject",
        description: "Approve valid applications to allow subsequent account provisioning and enrollment evaluation.",
      },
    ],
    tips: [
      "Ensure all required pre-registration data is complete before approving an applicant.",
      "Rejected applications should include notes explaining why for future follow-up.",
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
        description: "Go to Students from the sidebar to view all student records.",
      },
      {
        step: 2,
        title: "Search & Filter",
        description: "Use search by name/ID and filter by course, year level, or status.",
      },
      {
        step: 3,
        title: "View Student Profile",
        description: "Click on a student to see their complete profile, enrollment history, and documents.",
      },
      {
        step: 4,
        title: "Update Information",
        description: "Edit student details like contact info, address, or guardian information.",
      },
      {
        step: 5,
        title: "Transfer Section",
        description: "Use the Transfer Section option to move a student, providing a reason for the transfer.",
      },
    ],
    tips: [
      "Always verify the student's identity before making changes.",
      "Section transfers require a valid reason and are logged in the system.",
      "Inactive students can be reactivated through the student profile.",
    ],
  },
  {
    id: "guide-enrollment",
    icon: "book-open",
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
        description: "Use the search bar to find a student by name or ID with 'Pending' enrollment status.",
      },
      {
        step: 3,
        title: "Click Evaluate",
        description: "Click the 'Evaluate' button to start the enrollment evaluation process.",
      },
      {
        step: 4,
        title: "Verify Student Info",
        description: "Review the student's personal information, contact details, and guardian info. Check the verification box.",
      },
      {
        step: 5,
        title: "Check Documents",
        description: "Verify all required documents (Form 137, PSA Birth Certificate, Good Moral, 2x2 photos). Mark each as verified.",
      },
      {
        step: 6,
        title: "Assign Section",
        description: "Select an available section for the student's course and year level.",
      },
      {
        step: 7,
        title: "Confirm Enrollment",
        description: "Add any evaluation notes and click 'Enroll Student' to finalize.",
      },
    ],
    tips: [
      "All required documents must be verified before proceeding to section assignment.",
      "Double-check the student's course and year level before assigning a section.",
      "Add notes for any missing follow-up requirements.",
    ],
  },
  {
    id: "guide-sections",
    icon: "layers",
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
        description: "Click 'Add Section', select the course, year level, and set the section name and capacity.",
      },
      {
        step: 3,
        title: "Assign Adviser",
        description: "Select a faculty member as the class adviser for the section.",
      },
      {
        step: 4,
        title: "Assign Room",
        description: "Choose an available room for the section's homeroom assignment.",
      },
      {
        step: 5,
        title: "Monitor Capacity",
        description: "Track enrolled vs. maximum students to manage section availability.",
      },
    ],
    tips: [
      "Section names typically follow the format: Course-YearLevel-Letter (e.g., BSIT-1A).",
      "Maximum capacity is usually 40 students per section.",
      "Coordinate with Department Heads before creating sections for their courses.",
    ],
  },
  {
    id: "guide-courses",
    icon: "book",
    title: "Course Management",
    subtitle: "Setting up and updating course catalogs",
    steps: [
      {
        step: 1,
        title: "Access Courses",
        description: "Click on Courses from the sidebar navigation.",
      },
      {
        step: 2,
        title: "Add New Course",
        description: "Click 'Add Course' and provide the course code, descriptive title, units, and assign it to the correct department.",
      },
      {
        step: 3,
        title: "Modify Curriculum Details",
        description: "Update pre-requisites and year level availability when curriculum changes happen.",
      },
    ],
    tips: [
      "Ensure course codes match standard institutional guidelines before saving.",
      "Verify that courses are correctly mapped to active departments.",
    ],
  },
  {
    id: "guide-departments",
    icon: "building",
    title: "Department Management",
    subtitle: "Organizing institutional departments",
    steps: [
      {
        step: 1,
        title: "Open Departments Page",
        description: "Navigate to Departments from the sidebar.",
      },
      {
        step: 2,
        title: "Create or Edit Department",
        description: "Add a new department name, code, and assign a department head or dean.",
      },
    ],
    tips: [
      "Deactivating old departments is preferred over deleting to preserve historical course and student mappings.",
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
        description: "Set the current academic year and semester for enrollment processing.",
      },
      {
        step: 3,
        title: "Enrollment Status",
        description: "Toggle enrollment open/closed to control when students can be enrolled.",
      },
      {
        step: 4,
        title: "Notification Preferences",
        description: "Set up email and SMS notification templates and preferences.",
      },
    ],
    tips: [
      "Always close enrollment before changing the academic period.",
      "Notify all departments before opening a new enrollment period.",
    ],
  },
];

export const faqSections = [
  {
    id: "faq-dashboard",
    title: "Dashboard & General",
    items: [
      {
        id: "dash-1",
        question: "What information does the dashboard display?",
        answer: "The dashboard summarizes active metrics such as total student population, pending applications, open sections, and alerts that require registrar action.",
      },
    ],
  },
  {
    id: "faq-enrollment",
    title: "Enrollment & Students",
    items: [
      {
        id: "enroll-1",
        question: "How do I enroll a student to a section?",
        answer: "Open the student’s enrollment evaluation, review submitted details and documents, then assign the student to an available section before confirming enrollment.",
      },
      {
        id: "enroll-2",
        question: "What if a section is full?",
        answer: "If a section has reached maximum capacity, assign the student to another available section or update section capacity in settings if permitted.",
      },
      {
        id: "enroll-3",
        question: "How do I transfer a student to another section?",
        answer: "Locate the student record, open section assignment controls, choose the new section, and save the changes. Ensure slots are available.",
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
        answer: "Go to the Applications page, open the applicant profile, verify submitted information and attachments, then proceed with approval.",
      },
      {
        id: "app-2",
        question: "What documents are required for enrollment?",
        answer: "Required documents typically include a birth certificate, Form 137 or transcript, good moral certificate, and ID photo based on school policy.",
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
        answer: "Go to the Courses page, click add course, fill in the code, title, units, and department, then save.",
      },
      {
        id: "course-2",
        question: "Can I deactivate a department instead of deleting it?",
        answer: "Yes. Deactivating a department is recommended to keep historical data intact for existing student and course logs.",
      },
    ],
  },
];