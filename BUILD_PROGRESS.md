# Build Progress Tracker

| Part | Status | Description | Notes / What could not be tested |
|------|--------|-------------|-----------------------------------|
| 1D | Done | Save and Reopen (with 3 repairs) | Verified in browser: saving, reopening, 60s autosave, leave confirmation, single-step undo/redo, clean white left panel. |
| 2A | Done | User Profile & Public Profile | Verified: Profile edit, name, bio (<=300 chars), picture upload (<=2MB JPG/PNG/WebP stored in DB), social links (<=5), public profile (/u/:userId) stripping email/hash (Req 29.2), unit tests passed. |
| 2B | Done | Version History | Verified: Snapshots created on manual Save, skipped on autosave, up to 20 retained (FIFO), preview snapshot, restore with automatic rollback backup and canvas reloading. |
| 2C | Done | Templates, Live Preview and Clone | Verified: 7 student templates seeded in DB with SVG cards, Template gallery (/templates), Live preview with disclaimer banner, Use template / clone copies template into new project. |
| 2D | Done | Google Sign-In | Verified: GIS client integration, POST /api/auth/google verification with google-auth-library, automatic account creation/linking, friendly notification when GOOGLE_CLIENT_ID missing. |
| H1 | Done | Home page with 3D hero, template ring, showcase, team and university sections | Checked in a test browser at desktop and phone size. Not run against the real packages in this sandbox, so the first Render build is the first real run. |
| H2 | Done | Showcase: 7 demo sites, one for each template, owned by the 4 team accounts | The accounts and sites are created on server start. The accounts cannot log in. Forms in the demos do nothing on purpose. |
| H3 | Partly | `/p/ADDRESS` public pages (part of 4A) | Works for the 7 demos and for any project that is published and public in the database. No Publish button yet. Forms on these pages send nothing yet. |
| H4 | Done | v2.1: the top of the home page fits laptop screens, the Templates page opens at once without waiting for the server, `.npmrc` for the npm version conflict | Checked at 54 screen sizes in a test browser. The Templates page was tested against a server that never answers. |
| 3A | Not Built | Teams and Roles | Next to build: Teams creation, host handover, member invitations up to 10, editor/viewer roles, project sharing. |
| 3B | Not Built | Real-Time Live Editing | Multi-user live editing on canvas, cursors, presence awareness, max 5 editors. |
| 3C | Not Built | Chat, DMs & Notifications | In-editor project chat, direct messaging, notification bell with auto-refresh, 20 msg/min limit. |
| 4A | Not Built | Publish, Unpublish & Code Export | `/p/NAME` path routing, visibility (Private/Team/Public), sanitize-html server-side, ZIP code export. |
| 4B | Not Built | Forms and Responses | Form submissions on published pages, thank-you messages, 10 sub/min limit, responses table, CSV export. |
| 5A | Not Built | AI Assistant | Gemini API server-side, text/layout suggestions, 30 req/day limit reset at 00:00 Asia/Dhaka. |
| 5C | Not Built | Ratings and Reviews | 1-5 stars & comments, average rating display, owner notifications. |
| 5E | Not Built | Administrator Panel | Admin dashboard, user suspension, project takedown, audit log, ADMIN_EMAIL provisioning. |
| 5B | Not Built | Paid Templates (Sandbox Payments) | SSLCommerz sandbox payments, IPN verification, purchase history, 100 BDT test template. |
| 4C | Not Built | Form Automation (Confirmation Email) | Confirmation email on form submit via HTTP API (Brevo), owner notification. |
| 5D | Not Built | PDF Tools (Client-Side) | Merge, split, convert (images to PDF / PDF to images) in browser via pdf-lib. |
| 6A | Not Built | Security, Privacy, Reliability & Delete Account | CHECK_REPORT.md testing table, "Delete my account" flow with host check. |
| 6B-7 | Not Built | Usability, Availability, README & .env.example | Performance measurements, README.md, .env.example. |
