// src/lib/api.js
const SCRIPT_URL = process.env.REACT_APP_APPS_SCRIPT_URL;

export async function submitAssessment({ candidateName, answers, totalElapsed }) {
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'submit', candidateName, answers, totalElapsed }),
  });
  return res.json();
}

export async function getSubmission(token) {
  const url = `${SCRIPT_URL}?action=getSubmission&token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  return res.json();
}

export async function listAllSubmissions() {
  const url = `${SCRIPT_URL}?action=listAll`;
  const res = await fetch(url);
  return res.json();
}

export async function saveScores({ token, candidateName, totalEarned, totalMax, pct, verdict, scores, notes }) {
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'saveScores', token, candidateName, totalEarned, totalMax, pct, verdict, scores, notes }),
  });
  return res.json();
}
