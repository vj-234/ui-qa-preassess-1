// src/pages/CandidatePage.js
// ⚠️  This file must NEVER import from ../lib/answerKey.js
import { useState, useEffect, useRef } from "react";
import { QUESTIONS, SECTIONS, SECTION_COLORS, SECTION_TIME, DIFF_COLOR } from "../lib/questions";
import { submitAssessment } from "../lib/api";

const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function Timer({ seconds }) {
  const color = seconds < 30 ? "#f87171" : seconds < 60 ? "#fbbf24" : "#34d399";
  return (
    <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color, letterSpacing: 2, background: "#0d0d1a", padding: "5px 16px", borderRadius: 8, border: `1px solid ${color}33` }}>
      {formatTime(seconds)}
    </div>
  );
}

export default function CandidatePage() {
  const [phase, setPhase] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [candidateName, setCandidateName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const timerRef = useRef(null);
  const totalRef = useRef(null);

  const q = QUESTIONS[currentQ];

  useEffect(() => {
    if (phase !== "test") return;
    setTimeLeft(q.time);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQ, phase]);

  useEffect(() => {
    if (phase !== "test") return;
    totalRef.current = setInterval(() => setTotalElapsed(t => t + 1), 1000);
    return () => clearInterval(totalRef.current);
  }, [phase]);

  const handleAnswer = (value) => setAnswers(a => ({ ...a, [q.id]: { ...a[q.id], value } }));

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    clearInterval(totalRef.current);
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      await submitAssessment({ candidateName, answers, totalElapsed });
      setPhase("done");
    } catch (e) {
      setSubmitError("Submission failed. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  const S = {
    page: { minHeight: "100vh", background: "#070714", color: "#e2e8f0", fontFamily: "'Outfit', sans-serif" },
    center: { display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  };

  // ── INTRO ──
  if (phase === "intro") return (
    <div style={{ ...S.page, ...S.center }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap'); *{box-sizing:border-box;} input,textarea{outline:none;}`}</style>
      <div style={{ maxWidth: 600, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: "#64748b", textTransform: "uppercase", marginBottom: 12 }}>Technical Interview</div>
        <h1 style={{ fontSize: 42, fontWeight: 800, margin: "0 0 12px", background: "linear-gradient(135deg,#00d4ff,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          UI Automation Assessment
        </h1>
        <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
          This assessment covers Python, Selenium, and JavaScript testing. Answer all questions to the best of your ability.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 32, textAlign: "left" }}>
          {SECTIONS.map((name, i) => (
            <div key={i} style={{ background: "#0d0d1a", border: `1px solid ${SECTION_COLORS[i]}25`, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: SECTION_COLORS[i], marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: SECTION_COLORS[i] }}>{name}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{SECTION_TIME[i]} min · {QUESTIONS.filter(q => q.sectionIdx === i).length} questions</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#0d0d1a", border: "1px solid #1e1e3a", borderRadius: 10, padding: "18px 22px", marginBottom: 20, textAlign: "left" }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Your full name</div>
          <input value={candidateName} onChange={e => setCandidateName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            style={{ width: "100%", background: "#070714", border: "1px solid #1e1e3a", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "Outfit, sans-serif" }} />
        </div>

        <div style={{ background: "#0d0d1a", border: "1px solid #1e1e3a", borderRadius: 10, padding: "14px 22px", marginBottom: 28, textAlign: "left", fontSize: 13, color: "#64748b", lineHeight: 1.8 }}>
          <strong style={{ color: "#94a3b8" }}>Guidelines</strong><br />
          • 18 questions · ~60 minutes total<br />
          • MCQ: select the single best answer<br />
          • Coding: write your solution in the text area<br />
          • Essay: describe your approach clearly<br />
          • You can go back to previous questions at any time
        </div>

        <button onClick={() => candidateName.trim() && setPhase("test")} disabled={!candidateName.trim()}
          style={{ background: candidateName.trim() ? "linear-gradient(135deg,#00d4ff,#a78bfa)" : "#1e1e3a", border: "none", color: candidateName.trim() ? "#070714" : "#475569", fontWeight: 700, fontSize: 15, padding: "14px 44px", borderRadius: 10, cursor: candidateName.trim() ? "pointer" : "not-allowed" }}>
          Begin Assessment →
        </button>
      </div>
    </div>
  );

  // ── DONE ──
  if (phase === "done") return (
    <div style={{ ...S.page, ...S.center, textAlign: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800&display=swap'); *{box-sizing:border-box;}`}</style>
      <div style={{ maxWidth: 440 }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 12px" }}>Assessment Submitted</h2>
        <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7 }}>
          Thank you, <strong style={{ color: "#e2e8f0" }}>{candidateName}</strong>.<br />Your answers have been recorded.
        </p>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 16 }}>Time taken: <strong style={{ color: "#94a3b8" }}>{formatTime(totalElapsed)}</strong></p>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 24 }}>The interviewer will review your responses and be in touch shortly.</p>
      </div>
    </div>
  );

  // ── TEST ──
  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap'); *{box-sizing:border-box;} textarea{resize:vertical;outline:none;}`}</style>

      <div style={{ background: "#0d0d1a", borderBottom: "1px solid #1e1e3a", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: SECTION_COLORS[q.sectionIdx] }}>{q.section}</div>
          <div style={{ fontSize: 12, color: "#475569" }}>Q{currentQ + 1} / {QUESTIONS.length}</div>
        </div>
        <Timer seconds={timeLeft} />
        <div style={{ fontSize: 12, color: "#475569" }}>{formatTime(totalElapsed)}</div>
      </div>

      <div style={{ background: "#0d0d1a", borderBottom: "1px solid #1e1e3a", padding: "8px 24px" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {QUESTIONS.map((qq, i) => (
            <div key={i} onClick={() => setCurrentQ(i)} style={{ flex: 1, height: 3, borderRadius: 2, cursor: "pointer",
              background: answers[qq.id] ? SECTION_COLORS[qq.sectionIdx] : i === currentQ ? SECTION_COLORS[qq.sectionIdx] + "60" : "#1e1e3a" }} />
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: SECTION_COLORS[q.sectionIdx], textTransform: "uppercase", border: `1px solid ${SECTION_COLORS[q.sectionIdx]}35`, padding: "3px 10px", borderRadius: 20 }}>{q.type}</span>
          <span style={{ fontSize: 11, color: DIFF_COLOR[q.difficulty] }}>{q.difficulty}</span>
          <span style={{ fontSize: 11, color: "#475569" }}>~{Math.ceil(q.time / 60)} min suggested</span>
        </div>

        <pre style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, lineHeight: 1.75, color: "#e2e8f0", whiteSpace: "pre-wrap", margin: "0 0 28px", fontWeight: 400 }}>
          {q.question}
        </pre>

        {q.type === "mcq" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, i) => {
              const sel = answers[q.id]?.value === i;
              return (
                <button key={i} onClick={() => handleAnswer(i)} style={{
                  background: sel ? `${SECTION_COLORS[q.sectionIdx]}18` : "#0d0d1a",
                  border: `1px solid ${sel ? SECTION_COLORS[q.sectionIdx] : "#1e1e3a"}`,
                  borderRadius: 10, padding: "13px 18px", cursor: "pointer",
                  color: sel ? SECTION_COLORS[q.sectionIdx] : "#94a3b8",
                  fontSize: 14, textAlign: "left", transition: "all 0.12s",
                  display: "flex", alignItems: "flex-start", gap: 14
                }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${sel ? SECTION_COLORS[q.sectionIdx] : "#2e2e4e"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, color: sel ? SECTION_COLORS[q.sectionIdx] : "#2e2e4e", fontWeight: 700 }}>
                    {sel ? "✓" : String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ lineHeight: 1.5 }}>{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {(q.type === "code" || q.type === "essay") && (
          <textarea
            placeholder={q.placeholder}
            value={answers[q.id]?.value || ""}
            onChange={e => handleAnswer(e.target.value)}
            style={{
              width: "100%", minHeight: q.type === "code" ? 260 : 180,
              background: "#0d0d1a", border: "1px solid #1e1e3a", borderRadius: 10,
              padding: 18, color: "#e2e8f0",
              fontFamily: q.type === "code" ? "JetBrains Mono, monospace" : "'Outfit', sans-serif",
              fontSize: q.type === "code" ? 13 : 14, lineHeight: 1.7
            }}
          />
        )}

        {submitError && <div style={{ marginTop: 16, color: "#f87171", fontSize: 13 }}>{submitError}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          <button onClick={() => setCurrentQ(c => Math.max(0, c - 1))} disabled={currentQ === 0}
            style={{ background: "transparent", border: "1px solid #1e1e3a", color: "#475569", padding: "10px 20px", borderRadius: 8, cursor: currentQ === 0 ? "not-allowed" : "pointer", fontSize: 13 }}>
            ← Back
          </button>
          <button onClick={handleNext} disabled={submitting}
            style={{ background: `linear-gradient(135deg,${SECTION_COLORS[q.sectionIdx]},${SECTION_COLORS[(q.sectionIdx + 1) % 4]})`, border: "none", color: "#070714", fontWeight: 700, padding: "10px 28px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
            {submitting ? "Submitting…" : currentQ === QUESTIONS.length - 1 ? "Submit Assessment →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
