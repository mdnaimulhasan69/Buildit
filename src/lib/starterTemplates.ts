export interface StarterTemplateDef {
  id: string;
  name: string;
  description: string;
  category: string;
  picture: string; // SVG card
  price: number; // 0 for free, >0 for paid (Part 5B)
  html: string;
  css: string;
}

const makeSvgCard = (bgColor: string, accentColor: string, title: string, subtitle: string, iconType: string) => {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380" fill="none">
    <rect width="600" height="380" rx="12" fill="${bgColor}"/>
    <rect x="30" y="30" width="540" height="44" rx="8" fill="${accentColor}" opacity="0.95"/>
    <text x="50" y="58" fill="white" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">${title}</text>
    <rect x="30" y="95" width="280" height="18" rx="4" fill="%234B5563"/>
    <text x="30" y="135" fill="%236B7280" font-family="system-ui, sans-serif" font-size="13">${subtitle}</text>
    <rect x="30" y="160" width="540" height="180" rx="10" fill="white" stroke="%23E5E7EB" stroke-width="2"/>
    <rect x="55" y="185" width="200" height="14" rx="3" fill="%239CA3AF"/>
    <rect x="55" y="210" width="490" height="36" rx="6" fill="%23F9FAFB" stroke="%23D1D5DB"/>
    <rect x="55" y="260" width="140" height="14" rx="3" fill="%239CA3AF"/>
    <rect x="55" y="285" width="120" height="36" rx="6" fill="${accentColor}"/>
  </svg>`.replace(/\s+/g, ' ');
};

export const STARTER_TEMPLATES: StarterTemplateDef[] = [
  {
    id: 'template-signup-page',
    name: 'Sign-up Page',
    description: 'Clean student registration page with Student ID, full name, department, and email validation fields.',
    category: 'Forms & Registration',
    price: 0,
    picture: makeSvgCard('%23EFF6FF', '%232563EB', 'Student Portal Sign-up', 'Instant account creation for students', 'form'),
    html: `
      <div style="max-width: 650px; margin: 40px auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); font-family: system-ui, sans-serif;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h2 style="font-size: 26px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Student Account Registration</h2>
          <p style="font-size: 14px; color: #64748b; margin: 0;">Register your university student account to access campus courses and resources.</p>
        </div>
        <form style="display: flex; flex-direction: column; gap: 18px;">
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Full Name</label>
            <input type="text" placeholder="e.g. Naimul Hasan" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px;" />
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Student ID / Roll Number</label>
            <input type="text" placeholder="e.g. CSE-2026-042" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px;" />
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Academic Email</label>
            <input type="email" placeholder="student@portcity.edu" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px;" />
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Department</label>
            <select style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; background: white;">
              <option>Computer Science & Engineering</option>
              <option>Electrical & Electronic Engineering</option>
              <option>Business Administration</option>
              <option>Civil Engineering</option>
            </select>
          </div>
          <button type="submit" style="margin-top: 10px; background-color: #2563eb; color: #ffffff; padding: 12px; font-size: 14px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer;">Complete Registration</button>
        </form>
      </div>
    `,
    css: `body { background-color: #f8fafc; font-family: system-ui, sans-serif; }`
  },
  {
    id: 'template-survey-form',
    name: 'Survey Form',
    description: 'Course evaluation and academic feedback questionnaire with rating metrics and suggestion areas.',
    category: 'Forms & Surveys',
    price: 0,
    picture: makeSvgCard('%23F0FDF4', '%2316A34A', 'Course Feedback Survey', 'Gather feedback from your class', 'survey'),
    html: `
      <div style="max-width: 700px; margin: 40px auto; padding: 36px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; font-family: system-ui, sans-serif;">
        <h2 style="font-size: 24px; font-weight: 700; color: #15803d; margin: 0 0 10px 0;">Semester Course Feedback Survey</h2>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">Your honest review helps instructors improve curriculum delivery and laboratory sessions.</p>
        <form style="display: flex; flex-direction: column; gap: 20px;">
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Course Code & Title</label>
            <input type="text" placeholder="e.g. CSE-311: Database Management Systems" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px;" />
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Instructor Clarity & Engagement (1 to 5)</label>
            <div style="display: flex; gap: 16px; font-size: 14px; color: #475569; margin-top: 4px;">
              <label><input type="radio" name="rating" value="1" /> 1 - Poor</label>
              <label><input type="radio" name="rating" value="2" /> 2 - Fair</label>
              <label><input type="radio" name="rating" value="3" /> 3 - Good</label>
              <label><input type="radio" name="rating" value="4" /> 4 - Very Good</label>
              <label><input type="radio" name="rating" value="5" defaultChecked /> 5 - Excellent</label>
            </div>
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">What topics were most valuable or challenging?</label>
            <textarea rows="3" placeholder="Share your experience..." style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px;"></textarea>
          </div>
          <button type="submit" style="background-color: #16a34a; color: white; padding: 12px; font-size: 14px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer;">Submit Anonymous Survey</button>
        </form>
      </div>
    `,
    css: `body { background-color: #f8fafc; font-family: system-ui, sans-serif; }`
  },
  {
    id: 'template-event-reg',
    name: 'Event Registration',
    description: 'Campus tech fest or hackathon registration portal with date, schedule, venue, and team details.',
    category: 'Events & Programs',
    price: 0,
    picture: makeSvgCard('%23FAF5FF', '%239333EA', 'Annual Hackathon 2026', 'Campus Tech Fest registration', 'event'),
    html: `
      <div style="max-width: 750px; margin: 40px auto; padding: 36px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; font-family: system-ui, sans-serif;">
        <div style="background: linear-gradient(135deg, #7e22ce, #9333ea); padding: 24px; border-radius: 8px; color: white; margin-bottom: 28px;">
          <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">Annual Campus Hackathon</span>
          <h2 style="font-size: 28px; font-weight: 800; margin: 8px 0;">BuildIt TechFest 2026</h2>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">Date: November 15-16, 2026 • Campus Auditorium • 24-Hour Hackathon</p>
        </div>
        <form style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Team Name</label>
            <input type="text" placeholder="e.g. CodeCraft" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px;" />
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Team Leader Contact Email</label>
            <input type="email" placeholder="leader@portcity.edu" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px;" />
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Track / Category</label>
            <select style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; background: white;">
              <option>Web Apps & Cloud Solutions</option>
              <option>AI & Machine Learning</option>
              <option>Cybersecurity & Networks</option>
              <option>EdTech & Campus Innovation</option>
            </select>
          </div>
          <button type="submit" style="background-color: #9333ea; color: white; padding: 12px; font-size: 14px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer;">Register Team</button>
        </form>
      </div>
    `,
    css: `body { background-color: #f8fafc; font-family: system-ui, sans-serif; }`
  },
  {
    id: 'template-attendance-log',
    name: 'Attendance Log',
    description: 'Quick student lab attendance and workshop check-in tracker with session timestamps.',
    category: 'Forms & Surveys',
    price: 0,
    picture: makeSvgCard('%23FFFBEB', '%23D97706', 'Daily Lab Attendance', 'Student check-in tracker', 'attendance'),
    html: `
      <div style="max-width: 650px; margin: 40px auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; font-family: system-ui, sans-serif;">
        <h2 style="font-size: 24px; font-weight: 700; color: #b45309; margin: 0 0 8px 0;">Laboratory Session Attendance</h2>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">Please check in with your university credentials upon entering the computer lab.</p>
        <form style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Student Name</label>
            <input type="text" placeholder="Full name" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px;" />
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Student ID</label>
            <input type="text" placeholder="ID Number" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px;" />
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Assigned Workstation / PC #</label>
            <input type="text" placeholder="e.g. Lab-3 / PC-12" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px;" />
          </div>
          <button type="submit" style="background-color: #d97706; color: white; padding: 12px; font-size: 14px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer;">Record My Attendance</button>
        </form>
      </div>
    `,
    css: `body { background-color: #f8fafc; font-family: system-ui, sans-serif; }`
  },
  {
    id: 'template-booking-page',
    name: 'Booking Page',
    description: 'Seminar room and campus lab equipment reservation calendar with time slot selection.',
    category: 'Bookings & Schedule',
    price: 0,
    picture: makeSvgCard('%23F0FDFA', '%230D9488', 'Room & Equipment Booking', 'Reserve campus facilities', 'booking'),
    html: `
      <div style="max-width: 680px; margin: 40px auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; font-family: system-ui, sans-serif;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f766e; margin: 0 0 8px 0;">Campus Facility & Lab Reservation</h2>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">Reserve project meeting rooms or high-performance computing lab stations.</p>
        <form style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Facility / Room</label>
            <select style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; background: white;">
              <option>Conference Room B (Project Discussions)</option>
              <option>AI Lab Station 04 (GPU Cluster)</option>
              <option>Robotics Testing Table</option>
              <option>Audio-Visual Seminar Hall</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Reservation Date</label>
            <input type="date" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px;" />
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Time Slot</label>
            <select style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; background: white;">
              <option>09:00 AM - 11:00 AM</option>
              <option>11:30 AM - 01:30 PM</option>
              <option>02:00 PM - 04:00 PM</option>
              <option>04:30 PM - 06:30 PM</option>
            </select>
          </div>
          <button type="submit" style="background-color: #0d9488; color: white; padding: 12px; font-size: 14px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer;">Confirm Reservation</button>
        </form>
      </div>
    `,
    css: `body { background-color: #f8fafc; font-family: system-ui, sans-serif; }`
  },
  {
    id: 'template-portfolio',
    name: 'Student Portfolio',
    description: 'Personal showcase page with about me, projects gallery, skills pills, and contact inquiry form.',
    category: 'Portfolios',
    price: 0,
    picture: makeSvgCard('%23F8FAFC', '%230284C7', 'Developer Portfolio', 'Personal project showcase', 'portfolio'),
    html: `
      <div style="max-width: 800px; margin: 40px auto; padding: 36px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; font-family: system-ui, sans-serif;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">Student Engineer Portfolio</h1>
          <p style="font-size: 16px; color: #0284c7; font-weight: 600; margin: 0 0 12px 0;">Full-Stack Web & Software Developer</p>
          <p style="font-size: 14px; color: #64748b; max-width: 500px; margin: 0 auto;">Building accessible, real-time web applications with modern TypeScript, React, and PostgreSQL.</p>
        </div>
        <div style="margin-bottom: 32px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">Core Skills</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <span style="background: #f1f5f9; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #334155;">TypeScript</span>
            <span style="background: #f1f5f9; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #334155;">React</span>
            <span style="background: #f1f5f9; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #334155;">PostgreSQL</span>
            <span style="background: #f1f5f9; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #334155;">Tailwind CSS</span>
            <span style="background: #f1f5f9; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #334155;">Node.js</span>
          </div>
        </div>
        <div>
          <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">Featured Project</h3>
          <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fafafa;">
            <h4 style="font-size: 16px; font-weight: 700; margin: 0 0 6px 0; color: #0f172a;">BuildIt Platform</h4>
            <p style="font-size: 13px; color: #64748b; margin: 0 0 12px 0;">No-code website creation engine designed for university students with real-time saving and collaboration.</p>
          </div>
        </div>
      </div>
    `,
    css: `body { background-color: #f8fafc; font-family: system-ui, sans-serif; }`
  },
  {
    id: 'template-research-showcase',
    name: 'Research Showcase',
    description: 'Academic paper and thesis summary page featuring abstract, methodology, authors, and download links.',
    category: 'Portfolios',
    price: 0,
    picture: makeSvgCard('%23FDF2F8', '%23DB2777', 'Research Thesis Paper', 'Academic research showcase', 'research'),
    html: `
      <div style="max-width: 800px; margin: 40px auto; padding: 40px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; font-family: system-ui, sans-serif;">
        <span style="display: inline-block; font-size: 12px; font-weight: 700; color: #be185d; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Department of Computer Science & Engineering</span>
        <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.3;">Adaptive Visual Web Modeling in Educational Environments</h1>
        <p style="font-size: 14px; color: #475569; font-style: italic; margin-bottom: 24px;">Authors: Naimul Hasan, Dr. A. Rahman • Port City International University</p>
        <div style="padding: 20px; background: #fdf2f8; border-left: 4px solid #db2777; border-radius: 4px; margin-bottom: 28px;">
          <h3 style="font-size: 14px; font-weight: 700; color: #9d174d; margin: 0 0 6px 0;">Abstract</h3>
          <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.6;">This paper analyzes the computational efficiency of modern client-side layout engines when integrated with transactional backend architectures for collaborative course projects.</p>
        </div>
        <div style="display: flex; gap: 12px;">
          <button type="button" style="background-color: #db2777; color: white; padding: 10px 18px; font-size: 13px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer;">Download PDF Paper</button>
          <button type="button" style="background-color: #f1f5f9; color: #334155; padding: 10px 18px; font-size: 13px; font-weight: 600; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer;">View Citation</button>
        </div>
      </div>
    `,
    css: `body { background-color: #f8fafc; font-family: system-ui, sans-serif; }`
  }
];
