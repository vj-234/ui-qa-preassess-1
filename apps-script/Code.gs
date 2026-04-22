// ============================================================
//  UI Interview Assessment — Google Apps Script Backend
//  Deploy as: Web App → Execute as: Me → Access: Anyone
// ============================================================

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';   // ← Replace with your Sheet ID
const INTERVIEWER_EMAIL = 'interviewer@yourcompany.com'; // ← Replace with your email
const SHEET_ANSWERS_TAB = 'Submissions';
const SHEET_SCORES_TAB  = 'Scores';

// ── CORS helper ──────────────────────────────────────────────
function setCORSHeaders(output) {
  return output
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ── Main router ──────────────────────────────────────────────
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action  = payload.action;

    if (action === 'submit')     return handleSubmit(payload);
    if (action === 'saveScores') return handleSaveScores(payload);

    return respond({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'getSubmission') return handleGetSubmission(e.parameter.token);
    if (action === 'listAll')       return handleListAll();
    return respond({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

// ── Submit candidate answers ──────────────────────────────────
function handleSubmit(payload) {
  const ss     = SpreadsheetApp.openById(SHEET_ID);
  const sheet  = getOrCreateSheet(ss, SHEET_ANSWERS_TAB);
  const token  = generateToken();
  const now    = new Date().toISOString();

  // Write header row if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Token', 'Candidate Name', 'Submitted At', 'Time Taken (s)', 'Answers JSON'
    ]);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#1a1a2e').setFontColor('#ffffff');
  }

  sheet.appendRow([
    token,
    payload.candidateName,
    now,
    payload.totalElapsed,
    JSON.stringify(payload.answers)
  ]);

  // Send email notification
  sendNotificationEmail(payload.candidateName, token, now, payload.totalElapsed);

  return respond({ ok: true, token });
}

// ── Save interviewer scores ───────────────────────────────────
function handleSaveScores(payload) {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = getOrCreateSheet(ss, SHEET_SCORES_TAB);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Token', 'Candidate Name', 'Scored At', 'Total Score', 'Max Score', 'Pct', 'Verdict', 'Scores JSON', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#1a1a2e').setFontColor('#ffffff');
  }

  // Check if token already has a score row — update it
  const data  = sheet.getDataRange().getValues();
  const rowIdx = data.findIndex(r => r[0] === payload.token);

  const row = [
    payload.token,
    payload.candidateName,
    new Date().toISOString(),
    payload.totalEarned,
    payload.totalMax,
    payload.pct + '%',
    payload.verdict,
    JSON.stringify(payload.scores),
    payload.notes || ''
  ];

  if (rowIdx > 0) {
    sheet.getRange(rowIdx + 1, 1, 1, 9).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return respond({ ok: true });
}

// ── Get single submission by token ───────────────────────────
function handleGetSubmission(token) {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = getOrCreateSheet(ss, SHEET_ANSWERS_TAB);
  const data  = sheet.getDataRange().getValues();

  const row = data.find(r => r[0] === token);
  if (!row) return respond({ ok: false, error: 'Submission not found' });

  return respond({
    ok: true,
    submission: {
      token:          row[0],
      candidateName:  row[1],
      submittedAt:    row[2],
      totalElapsed:   row[3],
      answers:        JSON.parse(row[4] || '{}')
    }
  });
}

// ── List all submissions (interviewer dashboard) ──────────────
function handleListAll() {
  const ss      = SpreadsheetApp.openById(SHEET_ID);
  const answers = getOrCreateSheet(ss, SHEET_ANSWERS_TAB).getDataRange().getValues();
  const scores  = getOrCreateSheet(ss, SHEET_SCORES_TAB).getDataRange().getValues();

  const scoreMap = {};
  scores.slice(1).forEach(r => { scoreMap[r[0]] = { pct: r[5], verdict: r[6] }; });

  const submissions = answers.slice(1).map(r => ({
    token:         r[0],
    candidateName: r[1],
    submittedAt:   r[2],
    totalElapsed:  r[3],
    scored:        !!scoreMap[r[0]],
    pct:           scoreMap[r[0]]?.pct || '—',
    verdict:       scoreMap[r[0]]?.verdict || '—',
  }));

  return respond({ ok: true, submissions });
}

// ── Email notification ────────────────────────────────────────
function sendNotificationEmail(name, token, submittedAt, elapsed) {
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const subject = `[Interview] New submission from ${name}`;
  const body = `
A candidate has completed the UI Automation Assessment.

Candidate:    ${name}
Submitted:    ${submittedAt}
Time taken:   ${mins}m ${secs}s

Open the Interviewer Panel and enter this token to review and grade:

  TOKEN: ${token}

Interviewer Panel URL:
  https://YOUR-APP.vercel.app/interviewer

──────────────────────────────────
This is an automated message from the UI Interview Assessment system.
  `.trim();

  MailApp.sendEmail({
    to:      INTERVIEWER_EMAIL,
    subject: subject,
    body:    body
  });
}

// ── Helpers ───────────────────────────────────────────────────
function generateToken() {
  return 'cand_' + Math.random().toString(36).slice(2, 10).toUpperCase();
}

function getOrCreateSheet(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
