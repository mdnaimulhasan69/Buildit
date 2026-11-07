/**
 * Shared content for the home page, the showcase, the team section and the demo accounts.
 * The server uses this file too (to create the demo accounts and demo sites), so keep it free of
 * browser-only code.
 *
 * TO EDIT THE TEAM CARDS: change the text in TEAM below (the "passion" lines are drafts).
 * TEAM PHOTOS: put a photo named <slug>.jpg (or .png) in the folder public/team/ , for example
 * public/team/naimul.jpg . Without a photo the card shows the person's initials.
 */
import { STARTER_TEMPLATES } from './starterTemplates.ts';

export interface TeamMember {
  slug: string;
  userId: string;
  name: string;
  studentId: string;
  role: string;
  passion: string;
  worked: string[];
  email: string;
}

export const TEAM: TeamMember[] = [
  {
    slug: 'naimul',
    userId: 'team_naimul',
    name: 'Md. Naimul Hasan',
    studentId: 'CSE 032 08289',
    role: 'Project Manager',
    passion: 'Turning a big idea into a clear plan that the whole team can follow.',
    worked: ['Introduction and architecture', 'Use cases 1 to 6', 'User account and project states', 'Final editing'],
    email: 'naimul@team.buildit.invalid'
  },
  {
    slug: 'tohidul',
    userId: 'team_tohidul',
    name: 'Tohidul Islam Hridoy',
    studentId: 'CSE 032 08294',
    role: 'Team member',
    passion: 'Making complex systems easy to understand, one diagram at a time.',
    worked: ['Conceptual class diagram', 'Use cases 9 to 12, 17 and 18', 'Live editing and team member states'],
    email: 'tohidul@team.buildit.invalid'
  },
  {
    slug: 'chirananda',
    userId: 'team_chirananda',
    name: 'Chirananda Baidya',
    studentId: 'CSE 032 08370',
    role: 'Team member',
    passion: 'Caring about the small details that make software dependable.',
    worked: ['Use cases 7, 8, 13, 14 and 21', 'Activity and sequence diagrams'],
    email: 'chirananda@team.buildit.invalid'
  },
  {
    slug: 'saifulla',
    userId: 'team_saifulla',
    name: 'Md. Saifulla',
    studentId: 'CSE 032 08333',
    role: 'Team member',
    passion: 'Checking every detail until the design and the requirements match.',
    worked: ['Use cases 15, 16, 19, 20, 22 and 23', 'Purchase state machine', 'Conclusion and design review'],
    email: 'saifulla@team.buildit.invalid'
  }
];

export function memberBySlug(slug: string): TeamMember | undefined {
  return TEAM.find((m) => m.slug === slug);
}

export function initialsOf(name: string): string {
  const all = name.split(/\s+/).filter(Boolean);
  const words = all.filter((w) => !/^md\.?$/i.test(w));
  const use = words.length >= 2 ? words : all;
  return use
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/* ------------------------------------------------------------------ demo sites */

export interface DemoSite {
  slug: string;
  address: string;
  title: string;
  blurb: string;
  templateId: string;
  templateName: string;
  category: string;
  ownerSlug: string;
  html: string;
  css: string;
}

const DEMO_CONFIG: Array<{
  templateId: string;
  address: string;
  title: string;
  blurb: string;
  ownerSlug: string;
}> = [
  {
    templateId: 'template-signup-page',
    address: 'student-portal-signup',
    title: 'Student Portal Sign-up',
    blurb: 'A registration page that asks for name, student ID, email and department.',
    ownerSlug: 'naimul'
  },
  {
    templateId: 'template-survey-form',
    address: 'course-feedback-survey',
    title: 'Course Feedback Survey',
    blurb: 'A short survey with rating choices and a comment box for one course.',
    ownerSlug: 'tohidul'
  },
  {
    templateId: 'template-event-reg',
    address: 'hackathon-registration',
    title: 'Hackathon Registration',
    blurb: 'An event page with a banner, the date and place, and a team registration form.',
    ownerSlug: 'chirananda'
  },
  {
    templateId: 'template-attendance-log',
    address: 'lab-attendance-log',
    title: 'Lab Attendance Log',
    blurb: 'A check-in page where a student enters a name, an ID and a workstation for a lab session.',
    ownerSlug: 'saifulla'
  },
  {
    templateId: 'template-booking-page',
    address: 'room-reservation',
    title: 'Lab and Room Reservation',
    blurb: 'A booking page where a student picks a room or lab station, a date and a time slot.',
    ownerSlug: 'naimul'
  },
  {
    templateId: 'template-portfolio',
    address: 'student-portfolio',
    title: 'Student Portfolio',
    blurb: 'A personal page with an introduction, a list of skills and a featured project.',
    ownerSlug: 'tohidul'
  },
  {
    templateId: 'template-research-showcase',
    address: 'research-showcase',
    title: 'Research Showcase',
    blurb: 'A page that presents one research paper with its authors, abstract and links.',
    ownerSlug: 'chirananda'
  }
];

export const DEMO_SITES: DemoSite[] = DEMO_CONFIG.map((c) => {
  const t = STARTER_TEMPLATES.find((x) => x.id === c.templateId);
  if (!t) return null;
  const site: DemoSite = {
    slug: c.address,
    address: c.address,
    title: c.title,
    blurb: c.blurb,
    templateId: t.id,
    templateName: t.name,
    category: t.category,
    ownerSlug: c.ownerSlug,
    html: t.html,
    css: t.css
  };
  return site;
}).filter((x): x is DemoSite => x !== null);

export function demoByAddress(address: string): DemoSite | undefined {
  return DEMO_SITES.find((d) => d.address === address);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Builds a complete HTML page from the pieces of a project. Used for previews and for /p/ pages. */
export function buildSiteDocument(title: string, html: string, css: string, extraBody = ''): string {
  const safeCss = String(css || '').replace(/<\/style/gi, '');
  return (
    '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + escapeHtml(title) + '</title>' +
    '<style>*,*::before,*::after{box-sizing:border-box}html,body{margin:0}body{background:#f1f5f9;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    safeCss +
    '</style></head><body>' +
    String(html || '') +
    extraBody +
    '</body></html>'
  );
}

/* ------------------------------------------------------------------ Port City International University */

/**
 * Facts come from the university's own website (portcity.edu.bd: home page, Facilities page and the
 * Computer Science and Engineering department page) and from Wikipedia. Numbers can change, so please
 * check them against the website before you present.
 */
export const PCIU = {
  name: 'Port City International University',
  short: 'PCIU',
  tagline: 'Excellence in Higher Education',
  intro:
    'A UGC and Government approved private university at Khulshi in Chattogram, Bangladesh, where our team studies Computer Science and Engineering.',
  website: 'https://portcity.edu.bd',
  websiteLabel: 'portcity.edu.bd',
  facts: [
    { label: 'Where', value: '7-14 Nikunja Housing Society, South Khulshi, Chattogram' },
    {
      label: 'What you can study',
      value:
        'Computer Science and Engineering, Civil, Electrical and Electronic and Textile Engineering, Fashion Design, BBA and MBA, English, Law and Journalism'
    },
    {
      label: 'Our department',
      value:
        'The CSE department offers a BSc (156 credit hours) and an MSc in CSE, with a strong practical lab part and 4 CSE labs.'
    },
    {
      label: 'Library',
      value:
        'The Ratnagarva Begum Ashrafunnesa Library is open 7 days a week, 8:30 am to 8:30 pm, with 7,113 e-books and 12,574 printed textbooks.'
    }
  ],
  vision:
    'Vision of the CSE department: to equip students with the knowledge and skills to solve computer science problems and to take on advanced engineering research.',
  sourceNote: 'Information: portcity.edu.bd (Home, Facilities and CSE pages) and Wikipedia.'
};

/**
 * Pictures are tried in this order: a file you put in public/pciu/ first, then the university's own
 * website, then a drawn picture. To use your own photos, save them as public/pciu/campus.jpg,
 * public/pciu/cse.jpg and public/pciu/logo.png .
 */
export const PCIU_IMAGES = {
  campus: [
    '/pciu/campus.jpg',
    'https://portcity.edu.bd/img/sliderimages/beautiful-campus_slider-pciu-campus.jpg'
  ],
  cse: ['/pciu/cse.jpg', 'https://portcity.edu.bd/img/CSE-PICTURE/CSE.JPG'],
  logo: ['/pciu/logo.png', 'https://portcity.edu.bd/img/header-logo-new_Header%20Logo_PCIU-LOGO.png']
};
