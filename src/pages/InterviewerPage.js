// src/pages/InterviewerPage.js
import { useState, useEffect } from "react";
import { QUESTIONS, SECTION_COLORS, SECTIONS, DIFF_COLOR, MAX_PTS } from "../lib/questions";
import { ANSWER_KEY } from "../lib/answerKey";
import { getSubmission, listAllSubmissions, saveScores } from "../lib/api";

const PIN = process.env.REACT_APP_INTERVIEWER_PIN || "1234";
const maxForQ = (q) => MAX_PTS[q.type];
const formatTime = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;

export default function InterviewerPage() {
  const [authed, setAuthed]         = useState(false);
  const [pin, setPin]               = useState("");
  const [tab, setTab]               = useState("list");         // list | grade | report
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState(null);          // { token, candidateName, submittedAt, totalElapsed, answers }
  const [scores, setScores]         = useState({});
  const [rubricChecks, setRubricChecks] = useState({});
  const [expandedQ, setExpandedQ]   = useState(null);
  const [notes, setNotes]           = useState("");
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState("");
  const [tokenInput, setTokenInput] = useState("");

  // Auto-score MCQs whenever a submission loads
  useEffect(() => {
    if (!selected) return;
    const init = {};
    QUESTIONS.forEach(q => {
      if (q.type === "mcq") {
        init[q.id] = selected.answers[q.id]?.value === ANSWER_KEY[q.id].correct ? 10 : 0;
      }
    });
    setScores(init);
    setRubricChecks({});
    setNotes("");
  }, [selected]);

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await listAllSubmissions();
      if (res.ok) setSubmissions(res.submissions);
    } finally { setLoading(false); }
  };

  const loadByToken = async (token) => {
    setLoading(true);
    try {
      const res = await getSubmission(token);
      if (res.ok) { setSelected(res.submission); setTab("grade"); }
      else alert("Token not found.");
    } finally { setLoading(false); }
  };

  const toggleRubric = (qId, idx, pts) => {
    setRubricChecks(prev => {
      const cur = { ...prev[qId] };
      cur[idx] = !cur[idx];
      const earned = ANSWER_KEY[qId].rubric.reduce((s, r, i) => s + (cur[i] ? r.pts : 0), 0);
      setScores(s => ({ ...s, [qId]: earned }));
      return { ...prev, [qId]: cur };
    });
  };

  const totalEarned = QUESTIONS.reduce((s, q) => s + (scores[q.id] || 0), 0);
  const totalMax    = QUESTIONS.reduce((s, q) => s + maxForQ(q), 0);
  const pct         = Math.round((totalEarned / totalMax) * 100);
  const level = pct >= 85 ? { label: "Senior / Expert",     color: "#a78bfa", hire: "Strong Yes" }
    : pct >= 70 ? { label: "Mid-Level Engineer",              color: "#34d399", hire: "Yes — with growth plan" }
    : pct >= 50 ? { label: "Junior / Developing",            color: "#fbbf24", hire: "Consider for junior role" }
    : { label: "Below Expectations",                          color: "#f87171", hire: "No at this time" };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveScores({ token: selected.token, candidateName: selected.candidateName, totalEarned, totalMax, pct, verdict: level.label, scores, notes });
      setSaveMsg("Saved to Google Sheet ✓");
      setTimeout(() => setSaveMsg(""), 3000);
    } finally { setSaving(false); }
  };

  const S = {
    page: { minHeight: "100vh", background: "#060612", color: "#e2e8f0", fontFamily: "'Outfit', sans-serif" },
    card: { background: "#0d0d1a", border: "1px solid #1e1e3a", borderRadius: 12, padding: "20px 24px", marginBottom: 16 },
    label: { fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#475569" },
    code: { fontFamily: "JetBrains Mono, monospace", fontSize: 12, background: "#070714", borderRadius: 8, padding: 16, color: "#94a3b8", whiteSpace: "pre-wrap", overflowX: "auto" },
  };

  // ── PIN GATE ──
  if (!authed) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400&display=swap'); *{box-sizing:border-box;} input{outline:none;}`}</style>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Interviewer Access</h2>
        <p style={{ color: "#475569", fontSize: 14, marginBottom: 24 }}>This panel is restricted to interviewers.</p>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (pin === PIN ? setAuthed(true) : alert("Incorrect PIN"))}
          placeholder="Enter PIN"
          style={{ width: "100%", background: "#0d0d1a", border: "1px solid #1e1e3a", borderRadius: 8, padding: "12px 16px", color: "#e2e8f0", fontSize: 18, textAlign: "center", marginBottom: 12, letterSpacing: 8, fontFamily: "monospace" }} />
        <button onClick={() => pin === PIN ? setAuthed(true) : alert("Incorrect PIN")}
          style={{ width: "100%", background: "linear-gradient(135deg,#00d4ff,#a78bfa)", border: "none", color: "#060612", fontWeight: 700, fontSize: 14, padding: "12px", borderRadius: 8, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
          Unlock →
        </button>
        <p style={{ color: "#1e1e3a", fontSize: 11, marginTop: 14 }}>Set REACT_APP_INTERVIEWER_PIN in your .env.local</p>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap'); *{box-sizing:border-box;} textarea,input{outline:none;}`}</style>

      {/* Header */}
      <div style={{ background: "#0a0a18", borderBottom: "1px solid #1e1e3a", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#475569", textTransform: "uppercase" }}>Interviewer Panel · Confidential</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {selected ? `Reviewing: ${selected.candidateName}` : "UI Automation Assessment"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["list", ...(selected ? ["grade", "report"] : [])].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? "#1e1e3a" : "transparent",
              border: `1px solid ${tab === t ? "#a78bfa" : "#1e1e3a"}`,
              color: tab === t ? "#a78bfa" : "#475569",
              padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "Outfit, sans-serif"
            }}>
              {t === "list" ? "Submissions" : t === "grade" ? "Grade" : "Report"}
            </button>
          ))}
          {selected && (
            <button onClick={handleSave} disabled={saving}
              style={{ background: saving ? "#1e1e3a" : "#34d399", border: "none", color: "#060612", padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "Outfit, sans-serif" }}>
              {saving ? "Saving…" : saveMsg || "Save to Sheet"}
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 24px" }}>

        {/* ── SUBMISSIONS LIST ── */}
        {tab === "list" && (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <input value={tokenInput} onChange={e => setTokenInput(e.target.value)}
                placeholder="Paste candidate token from email (e.g. cand_AB12CD34)"
                style={{ flex: 1, background: "#0d0d1a", border: "1px solid #1e1e3a", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "Outfit, sans-serif" }} />
              <button onClick={() => loadByToken(tokenInput.trim())} disabled={!tokenInput.trim() || loading}
                style={{ background: "#a78bfa", border: "none", color: "#060612", fontWeight: 700, padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "Outfit, sans-serif" }}>
                Load →
              </button>
              <button onClick={loadList} disabled={loading}
                style={{ background: "#1e1e3a", border: "1px solid #2e2e4e", color: "#94a3b8", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "Outfit, sans-serif" }}>
                {loading ? "Loading…" : "↻ Refresh All"}
              </button>
            </div>

            {submissions.length === 0 && (
              <div style={{ ...S.card, textAlign: "center", color: "#475569", padding: "40px 24px" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                <div>No submissions yet. Click "Refresh All" to load from Google Sheet,<br />or paste a token above to load directly.</div>
              </div>
            )}

            {submissions.map(sub => (
              <div key={sub.token} style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{sub.candidateName}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>
                    {new Date(sub.submittedAt).toLocaleString()} · {formatTime(sub.totalElapsed)}
                    {sub.scored && <span style={{ marginLeft: 12, color: "#34d399" }}>✓ Scored: {sub.pct} — {sub.verdict}</span>}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#2e2e4e", marginTop: 4 }}>{sub.token}</div>
                </div>
                <button onClick={() => loadByToken(sub.token)}
                  style={{ background: "#a78bfa", border: "none", color: "#060612", fontWeight: 700, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "Outfit, sans-serif", flexShrink: 0 }}>
                  {sub.scored ? "Re-grade" : "Grade →"}
                </button>
              </div>
            ))}
          </>
        )}

        {/* ── GRADE TAB ── */}
        {tab === "grade" && selected && QUESTIONS.map(q => {
          const ans     = selected.answers[q.id];
          const key     = ANSWER_KEY[q.id];
          const earned  = scores[q.id] ?? 0;
          const isOpen  = expandedQ === q.id;
          const correct = q.type === "mcq" && ans?.value === key.correct;
          const wrong   = q.type === "mcq" && ans !== undefined && ans.value !== key.correct;

          return (
            <div key={q.id} style={{ ...S.card, padding: 0, overflow: "hidden" }}>
              <div onClick={() => setExpandedQ(isOpen ? null : q.id)}
                style={{ padding: "14px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 10, color: SECTION_COLORS[q.sectionIdx], border: `1px solid ${SECTION_COLORS[q.sectionIdx]}35`, padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>Q{q.id}</span>
                  <span style={{ fontSize: 10, color: DIFF_COLOR[q.difficulty], flexShrink: 0 }}>{q.difficulty}</span>
                  <span style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.question.split("\n")[0].slice(0, 72)}…</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  {q.type === "mcq" && ans !== undefined && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: correct ? "#34d399" : "#f87171" }}>{correct ? "✓" : "✗"}</span>
                  )}
                  <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: earned > 0 ? "#a78bfa" : "#475569" }}>{earned}/{maxForQ(q)}</span>
                  <span style={{ color: "#475569", fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {isOpen && (
                <div style={{ borderTop: "1px solid #1e1e3a", padding: "20px 22px", background: "#080815" }}>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10, fontWeight: 600 }}>Full Question</div>
                  <pre style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "#94a3b8", whiteSpace: "pre-wrap", margin: "0 0 18px" }}>{q.question}</pre>

                  {q.type === "mcq" && (
                    <>
                      {q.options.map((opt, i) => {
                        const isCand = ans?.value === i;
                        const isAns  = i === key.correct;
                        const bg = isAns ? "#34d39912" : isCand && !isAns ? "#f8717112" : "transparent";
                        const border = isAns ? "#34d399" : isCand && !isAns ? "#f87171" : "#1e1e3a";
                        const color  = isAns ? "#34d399" : isCand && !isAns ? "#f87171" : "#475569";
                        return (
                          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 14px", borderRadius: 8, background: bg, border: `1px solid ${border}`, marginBottom: 6 }}>
                            <span style={{ fontSize: 10, color, fontWeight: 700, width: 18 }}>{isCand ? "●" : isAns ? "✓" : String.fromCharCode(65+i)}</span>
                            <span style={{ fontSize: 13, color }}>{opt}</span>
                            {isAns && <span style={{ marginLeft: "auto", fontSize: 10, color: "#34d399", letterSpacing: 1 }}>CORRECT</span>}
                            {isCand && !isAns && <span style={{ marginLeft: "auto", fontSize: 10, color: "#f87171", letterSpacing: 1 }}>CANDIDATE SELECTED</span>}
                          </div>
                        );
                      })}
                      <div style={{ marginTop: 12, background: "#0d0d1a", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                        💡 {key.explanation}
                      </div>
                    </>
                  )}

                  {(q.type === "code" || q.type === "essay") && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>Candidate Response</div>
                      <pre style={S.code}>{ans?.value || <em style={{ color: "#2e2e4e" }}>No response</em>}</pre>

                      <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: "18px 0 8px" }}>Reference Answer</div>
                      <pre style={{ ...S.code, borderLeft: "3px solid #34d39960" }}>{key.sampleAnswer}</pre>

                      <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: "18px 0 10px" }}>
                        Rubric — {maxForQ(q)} pts total (click to toggle)
                      </div>
                      {key.rubric.map((r, i) => {
                        const checked = rubricChecks[q.id]?.[i] || false;
                        return (
                          <div key={i} onClick={() => toggleRubric(q.id, i, r.pts)}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, marginBottom: 6, cursor: "pointer",
                              background: checked ? "#a78bfa12" : "#0d0d1a", border: `1px solid ${checked ? "#a78bfa50" : "#1e1e3a"}`, transition: "all 0.12s" }}>
                            <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${checked ? "#a78bfa" : "#2e2e4e"}`, background: checked ? "#a78bfa" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {checked && <span style={{ color: "#060612", fontSize: 12, fontWeight: 800 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 13, color: checked ? "#e2e8f0" : "#64748b", flex: 1 }}>{r.text}</span>
                            <span style={{ fontFamily: "monospace", fontSize: 12, color: checked ? "#a78bfa" : "#2e2e4e", fontWeight: 600 }}>+{r.pts}</span>
                          </div>
                        );
                      })}
                      <div style={{ textAlign: "right", marginTop: 8, fontSize: 13, color: "#a78bfa", fontWeight: 700 }}>{scores[q.id] || 0} / {maxForQ(q)} pts</div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* ── REPORT TAB ── */}
        {tab === "report" && selected && (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
              <div style={{ position: "relative", width: 180, height: 180 }}>
                <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="90" cy="90" r="76" fill="none" stroke="#1a1a2e" strokeWidth="13" />
                  <circle cx="90" cy="90" r="76" fill="none" stroke={level.color} strokeWidth="13"
                    strokeDasharray={`${2*Math.PI*76}`}
                    strokeDashoffset={`${2*Math.PI*76*(1 - pct/100)}`}
                    strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 40, fontWeight: 800, color: level.color, lineHeight: 1 }}>{pct}%</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{totalEarned} / {totalMax} pts</div>
                </div>
              </div>
            </div>

            <div style={{ ...S.card, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{selected.candidateName}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                Submitted {new Date(selected.submittedAt).toLocaleString()} · Time: {formatTime(selected.totalElapsed)}
              </div>
            </div>

            <div style={{ ...S.card, background: `${level.color}12`, border: `1px solid ${level.color}40`, textAlign: "center" }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: level.color, textTransform: "uppercase", marginBottom: 6 }}>Verdict</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: level.color, marginBottom: 6 }}>{level.label}</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Hire Recommendation: <strong style={{ color: level.color }}>{level.hire}</strong></div>
            </div>

            <div style={S.card}>
              <div style={{ ...S.label, marginBottom: 16 }}>Section Breakdown</div>
              {SECTIONS.map((name, si) => {
                const qs     = QUESTIONS.filter(q => q.sectionIdx === si);
                const earned = qs.reduce((s, q) => s + (scores[q.id] || 0), 0);
                const max    = qs.reduce((s, q) => s + maxForQ(q), 0);
                const c      = SECTION_COLORS[si];
                return (
                  <div key={si} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: c }}>{name}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{earned}/{max} ({Math.round(earned/max*100)}%)</span>
                    </div>
                    <div style={{ background: "#1a1a2e", borderRadius: 4, height: 8 }}>
                      <div style={{ background: c, borderRadius: 4, height: 8, width: `${Math.min(100,(earned/max)*100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={S.card}>
              <div style={{ ...S.label, marginBottom: 14 }}>Question Breakdown</div>
              {QUESTIONS.map(q => {
                const ans    = selected.answers[q.id];
                const earned = scores[q.id] ?? 0;
                const max    = maxForQ(q);
                const pctQ   = Math.round((earned/max)*100);
                let statusColor = "#475569", statusLabel = "Skipped";
                if (q.type === "mcq" && ans !== undefined) {
                  statusColor = ans.value === ANSWER_KEY[q.id].correct ? "#34d399" : "#f87171";
                  statusLabel = ans.value === ANSWER_KEY[q.id].correct ? "Correct" : "Incorrect";
                } else if ((q.type === "code" || q.type === "essay") && scores[q.id] !== undefined) {
                  statusColor = "#a78bfa"; statusLabel = "Graded";
                }
                return (
                  <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid #1e1e3a" }}>
                    <span style={{ fontSize: 10, color: SECTION_COLORS[q.sectionIdx], width: 22 }}>Q{q.id}</span>
                    <span style={{ fontSize: 9, color: DIFF_COLOR[q.difficulty], width: 38 }}>{q.difficulty}</span>
                    <span style={{ flex: 1, fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.question.split("\n")[0].slice(0,65)}</span>
                    <span style={{ fontSize: 10, color: statusColor, width: 60, textAlign: "right" }}>{statusLabel}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: pctQ >= 70 ? "#34d399" : pctQ >= 40 ? "#fbbf24" : "#f87171", width: 44, textAlign: "right" }}>{earned}/{max}</span>
                  </div>
                );
              })}
            </div>

            <div style={S.card}>
              <div style={{ ...S.label, marginBottom: 10 }}>Private Notes</div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Observations, follow-up questions, hire/no-hire reasoning..."
                style={{ width: "100%", minHeight: 110, background: "#080815", border: "1px solid #1e1e3a", borderRadius: 8, padding: 14, color: "#e2e8f0", fontSize: 13, fontFamily: "Outfit, sans-serif", lineHeight: 1.7, resize: "vertical" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ background: "#34d399", border: "none", color: "#060612", fontWeight: 700, padding: "9px 24px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "Outfit, sans-serif" }}>
                  {saving ? "Saving…" : saveMsg || "Save Report to Sheet →"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
