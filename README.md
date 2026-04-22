# UI Automation Assessment — Deploy Guide

Two URLs, completely separate experiences:
- **Candidate:** `https://your-org.github.io/ui-interview-assessment/#/candidate`
- **Interviewer:** `https://your-org.github.io/ui-interview-assessment/#/interviewer` *(PIN-protected)*

Answers post to Google Sheets. Interviewer gets an email on every submission.

---

## What You Need (all free)

- Google Workspace account ✓
- GitHub account ✓
- That's it.

---

## How It Works

```
YOUR LAPTOP
    │
    │  git push origin main
    ▼
GITHUB REPO
    │
    │  GitHub Actions runs automatically (~2 min)
    │  builds React app → publishes to gh-pages branch
    ▼
GITHUB PAGES              ← candidate visits /#/candidate
(your-org.github.io)      ← you visit /#/interviewer
    │
    │  HTTP POST on submit (browser → Apps Script directly)
    ▼
APPS SCRIPT (Google)
    │
    ├──► GOOGLE SHEET  (stores all answers + scores)
    └──► YOUR EMAIL    (notifies you with token)
```

---

## Step 1 — Create the Google Sheet

1. Go to **sheets.google.com** → create a new blank sheet
2. Name it: `UI Interview Submissions`
3. Copy the Sheet ID from the URL bar:
   ```
   https://docs.google.com/spreadsheets/d/  ██COPY THIS PART██  /edit
   ```

---

## Step 2 — Set Up Apps Script (your backend)

1. In your Google Sheet → **Extensions → Apps Script**
2. Delete the default code, paste the full contents of `apps-script/Code.gs`
3. Fill in the two constants at the top:
   ```javascript
   const SHEET_ID          = 'your-sheet-id-here';
   const INTERVIEWER_EMAIL = 'you@yourcompany.com';
   ```
4. **Save** (Ctrl+S)
5. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
6. Authorise when prompted (it's your own script on your own account)
7. Copy the **Web app URL** — looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
   Save this — you'll need it in Step 4.

---

## Step 3 — Create the GitHub Repo and Push Code

```bash
# Create a new repo on github.com first, then:
git clone https://github.com/YOUR-ORG/ui-interview-assessment.git
cd ui-interview-assessment

# Copy all project files into this folder, then:
git add .
git commit -m "Initial commit"
git push origin main
```

---

## Step 4 — Add Secrets to GitHub

Your Apps Script URL and PIN must never be committed to the repo.
GitHub injects them at build time as environment variables.

1. Go to your repo on github.com
2. Click **Settings → Secrets and variables → Actions**
3. Click **New repository secret** and add both:

   | Secret name | Value |
   |---|---|
   | `REACT_APP_APPS_SCRIPT_URL` | The Web app URL from Step 2 |
   | `REACT_APP_INTERVIEWER_PIN` | Your chosen PIN e.g. `8472` |

---

## Step 5 — Enable GitHub Pages

1. In your repo → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** · folder: **/ (root)**
4. Click **Save**

> The `gh-pages` branch is created automatically the first time Actions runs.
> If it doesn't exist yet, push to main once and wait ~2 minutes, then come back here.

---

## Step 6 — Trigger the First Deploy

Go to **Actions tab → Deploy to GitHub Pages → Run workflow → Run workflow**.

GitHub Actions will:
1. Install dependencies
2. Build the React app with your secrets baked in
3. Push built files to the `gh-pages` branch
4. GitHub Pages serves that branch live

Green tick in the Actions tab = deployed.

---

## Step 7 — Update the Email Link in Apps Script

Go back to Apps Script, find `sendNotificationEmail()`, update the URL:

```javascript
// Replace this placeholder:
https://YOUR-APP.vercel.app/interviewer

// With your real GitHub Pages URL:
https://your-org.github.io/ui-interview-assessment/#/interviewer
```

Then: **Deploy → Manage deployments → pencil icon → new version → Deploy**.

---

## Your Live URLs

```
Candidate:   https://your-org.github.io/ui-interview-assessment/#/candidate
Interviewer: https://your-org.github.io/ui-interview-assessment/#/interviewer
```

Replace `your-org` with your actual GitHub organisation or username.

---

## Running an Interview

**Before the interview:**
- Send candidate the `/candidate` link
- Keep the `/interviewer` link to yourself

**After candidate submits:**
1. You receive an email with their name + a token (e.g. `cand_AB12CD34`)
2. Open Interviewer Panel → enter PIN
3. Paste the token → **Load** (or **Refresh All** to see all submissions)
4. Click **Grade →**
   - MCQs are auto-scored
   - Coding/Essay: read response alongside the reference answer, tick rubric checkboxes
5. Switch to **Report** tab → add private notes → **Save Report to Sheet**

**Google Sheet tabs:**
- `Submissions` — raw answers, one row per candidate
- `Scores` — graded results with verdict and notes

---

## Making Changes (questions, rubrics, PIN)

```bash
# Edit src/lib/questions.js   (candidate-visible content)
# Edit src/lib/answerKey.js   (interviewer-only answers + rubrics)

git add .
git commit -m "Update questions"
git push origin main
# GitHub Actions redeploys automatically in ~2 minutes
```

To change the PIN: **GitHub → Settings → Secrets → update REACT_APP_INTERVIEWER_PIN**
→ re-run the workflow manually from the Actions tab.

> ⚠️ Never import `answerKey.js` inside `CandidatePage.js`.
> Anything imported on the candidate route is bundled into the page
> and readable in the browser's source — even if not displayed on screen.

---

## Project Structure

```
ui-interview-assessment/
├── .github/
│   └── workflows/
│       └── deploy.yml           ← Auto-deploys on every git push to main
├── apps-script/
│   └── Code.gs                  ← Paste into Google Apps Script editor
├── public/
│   └── index.html
├── src/
│   ├── lib/
│   │   ├── questions.js         ← Questions only — candidate-safe
│   │   ├── answerKey.js         ← Answers + rubrics — INTERVIEWER ONLY
│   │   └── api.js               ← Google Sheets API calls
│   ├── pages/
│   │   ├── CandidatePage.js     ← /#/candidate
│   │   └── InterviewerPage.js   ← /#/interviewer
│   ├── App.js                   ← HashRouter (required for GitHub Pages)
│   └── index.js
├── .env.example                 ← Copy to .env.local for local dev
├── .gitignore
└── package.json
```

---

## Local Development

```bash
cp .env.example .env.local
# Fill in both values

npm install
npm start

# Candidate:   http://localhost:3000/#/candidate
# Interviewer: http://localhost:3000/#/interviewer
```
