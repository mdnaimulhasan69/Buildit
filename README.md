# BuildIt: Collaborative No-Code Web Application Builder

BuildIt is a web application for building small websites and forms without writing code. A student picks one of seven starter templates (sign-up, survey, event registration, attendance log, booking, portfolio, research page), changes it in a drag-and-drop editor, saves versions of it and comes back to it later. Teams, live editing, chat, a Publish button with form answers, the AI helper and the admin panel are planned but not built yet. `BUILD_PROGRESS.md` lists what is done and what is not.

This is the project of team BuildIt (4 students) for the course CSE-322 Software Engineering Sessional at Port City International University, Bangladesh.

---

## Environment Settings

The application reads its settings from environment variables:

1. **`JWT_SECRET`**:
   The secret key used to sign and verify 7-day user authentication tokens.
   - If not set, the server automatically generates a temporary random key on startup with a log warning.
   - For production hosts (e.g., Render), set this to a secure random string so user logins remain valid across server restarts.

2. **`DATABASE_URL`**:
   PostgreSQL connection string (e.g., from Neon or Render):
   `postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - When provided, BuildIt connects directly with SSL enabled and automatically creates all required tables (`users`, `templates`, `login_attempts`, `projects`, `snapshots`) and seeds the 7 starter templates on startup.
   - When omitted in AI Studio, BuildIt connects via the platform's `SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, and `SQL_DB_NAME` proxy variables.

3. **`PORT`**:
   The network port for the HTTP server (defaults to `3000`).

---

## How to Run in Development

1. Install dependencies:
   ```bash
   npm install
   ```
   The file `.npmrc` (`legacy-peer-deps=true`) is part of the project. It stops npm from failing on a version conflict between Vite and its plugins. If you install without that file, run `npm install --legacy-peer-deps`.

2. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## How to Start in Production

BuildIt runs on any standard Node.js hosting platform (such as Render) with a PostgreSQL database (such as Neon):

1. Build the frontend client:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

The server listens on `0.0.0.0` at the port specified in `PORT` (or 3000), serving both `/api` endpoints and the frontend single-page application with client-side routing.

---

## Hosting for free

See `DEPLOY.md` for the step-by-step guide to put BuildIt online with GitHub, Render (free web service) and Neon (free PostgreSQL). The health check path for the host is `/healthz`, and `/api/health` shows whether the database answers.

---

## Home page, showcase, team and university

- `/` is the home page: a 3D animated hero, how it works, the template ring, the showcase, the team and Port City International University.
- `/showcase` shows 7 demo sites, one for each template. `/showcase/<name>` opens one of them full size. Buttons and forms inside a demo do nothing and invite the visitor to register.
- `/p/<address>` is the public page of a published project. The 7 demo sites work there. Any project that is marked published and public in the database works too. There is no Publish button in the editor yet. Forms on these pages do not send anything yet.
- On every start the server creates 4 team accounts (`team_naimul`, `team_tohidul`, `team_chirananda`, `team_saifulla`) and the 7 demo sites. Nothing is duplicated when the server restarts. These 4 accounts cannot be used to log in. Their profile pages are `/u/team_naimul` and so on.

### Where to change things

| What | Where |
|------|-------|
| Team names, student IDs, roles, passion lines | `TEAM` in `src/lib/siteData.ts` |
| Team photos | `public/team/<naimul, tohidul, chirananda, saifulla>.jpg` (see `public/team/README.txt`) |
| University text and facts | `PCIU` in `src/lib/siteData.ts` |
| University photos | `public/pciu/campus.jpg`, `cse.jpg`, `logo.png` (see `public/pciu/README.txt`) |
| Demo site titles and descriptions | `DEMO_CONFIG` in `src/lib/siteData.ts` |
| Home page look | `src/landing/landing.css` and `src/pages/HomePage.tsx` |

