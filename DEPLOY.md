# Putting BuildIt online for free (GitHub + Render + Neon)

Everything here is free. No card is needed. If any site asks for a card, stop.

## What you need
- The Neon database you already made (it gives you a connection string, also called DATABASE_URL).
- A free GitHub account (github.com).
- A free Render account (render.com). Sign up with the "GitHub" button.

## Step 1. Put the code on GitHub
1. On GitHub click **New repository**. Name it `buildit`. Choose **Public**. Click **Create repository**.
2. On the empty repository page click **uploading an existing file**.
3. Open the folder of this project on your computer. Select everything inside it (all files and folders) and drag it into the GitHub page. Do not upload a `node_modules` folder (there is none in the ZIP).
4. Wait until all files are listed, then click **Commit changes**.

Later, when you get a new ZIP from me, repeat steps 2 to 4 with the new files. Files with the same name are replaced. Render updates the site by itself a few minutes after each commit.

## Step 2. Make the web service on Render
1. In Render click **New** then **Web Service**.
2. Choose **Build and deploy from a Git repository** and pick your `buildit` repository.
3. Fill the form:
   - **Name:** buildit (this becomes part of your web address)
   - **Region:** Singapore
   - **Branch:** main
   - **Runtime / Language:** Node
   - **Build Command:** `npm install --include=dev && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** **Free**
4. Open **Environment Variables** and add these (type the values here, never in a chat):

| Name | Value |
|------|-------|
| `DATABASE_URL` | the connection string from Neon |
| `JWT_SECRET` | any long random text of 40 or more characters |
| `PAYMENT_MODE` | `sandbox` |
| `NODE_VERSION` | `22` |

   Optional now: `ADMIN_EMAIL` (your own email). Leave the Google, SSLCommerz and email variables out for now.
5. Open **Advanced**, set **Health Check Path** to `/healthz`.
6. Click **Create Web Service**. The first build takes 5 to 10 minutes.

## Step 3. Check that it works
- Open your address, it looks like `https://buildit-xxxx.onrender.com`.
- Open `https://buildit-xxxx.onrender.com/api/health`. You should see `"status":"ok"` and `"templates":7`.
- On the home page, scroll to the showcase. You should see 7 demo sites. Open one of them. Open `https://buildit-xxxx.onrender.com/p/student-portal-signup` too, it shows the public page of the first demo.
- If it says the database failed: in Neon copy the connection string again, and if it ends with `&channel_binding=require`, delete that part, then save it in Render (Environment) and let it redeploy.

## Step 4. Add the team photos
1. In your GitHub repository open the folder `public`, then `team`.
2. Click **Add file**, then **Upload files**. Drop four photos named `naimul.jpg`, `tohidul.jpg`, `chirananda.jpg` and `saifulla.jpg`.
3. Click **Commit changes**. Render updates the site in a few minutes.
4. Your own passion lines are in `src/lib/siteData.ts` (the `TEAM` list). Open the file on GitHub, click the pencil, change the `passion` text of each member and commit.

## Good to know
- If you register on the site, do not choose a user name that starts with `team_`. Those belong to the four team accounts, which cannot log in.
- A free Render service goes to sleep after 15 minutes without visitors. The next visit takes about a minute to wake it. Open the site once before a demo or a presentation.
- Google sign-in needs `GOOGLE_CLIENT_ID`. Create a Web application client in Google Cloud (Google Auth Platform), add your Render address under **Authorized JavaScript origins**, then put the Client ID into Render as `GOOGLE_CLIENT_ID`.
- Never put passwords, keys or the DATABASE_URL in GitHub files or in chat messages.
