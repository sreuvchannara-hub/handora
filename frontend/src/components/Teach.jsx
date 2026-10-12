
import { useCallback, useEffect, useRef, useState } from "react";
import useCamera from "../useCamera.js";
import CameraView from "./CameraView.jsx";
import {
  addSample,
  listGestures,
  predictImage,
  saveGestures,
} from "../api.js";
import { DEFAULT_WORDS, MIN_SAMPLES } from "../words.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readPrediction(data) {
  const label =
    data?.label ??
    data?.prediction ??
    data?.word ??
    data?.result?.label ??
    data?.result?.prediction ??
    (typeof data?.prediction === "string" ? data.prediction : null);

  const confidence = Number(
    data?.confidence ?? data?.result?.confidence ?? 0
  );

  return {
    label: typeof label === "string" ? label : "",
    confidence: Number.isFinite(confidence) ? confidence : 0,
    status: data?.status ?? data?.message ?? "",
  };
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function Teach() {
  const cam = useCamera();
  const aliveRef = useRef(true);
  const stopRef = useRef(false);
  const busyRef = useRef(false);

  const [counts, setCounts] = useState({});
  const [mode, setMode] = useState("learn");
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [overlay, setOverlay] = useState(null);
  const [progress, setProgress] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [quizTarget, setQuizTarget] = useState("");
  const [quizScore, setQuizScore] = useState(0);
  const [quizPlayed, setQuizPlayed] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await listGestures();
      if (!aliveRef.current) return;

      const next = {};
      (data.gestures || []).forEach((gesture) => {
        next[gesture.label] = gesture.count;
      });

      setCounts(next);
      setError("");
    } catch {
      if (aliveRef.current) {
        setError("Can't reach the backend. Check that python app.py is running.");
      }
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    refresh();

    return () => {
      aliveRef.current = false;
      stopRef.current = true;
    };
  }, [refresh]);

  const customWords = Object.keys(counts)
    .filter((label) => !DEFAULT_WORDS.some((word) => word.label === label))
    .map((label) => ({ label, hint: "Your custom hand shape" }));

  const words = [...DEFAULT_WORDS, ...customWords];
  const readyWords = words.filter(
    (word) => (counts[word.label] || 0) >= MIN_SAMPLES
  );
  const totalSamples = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0
  );
  const readyCount = readyWords.length;
  const level = Math.floor(readyCount / 3) + 1;
  const levelProgress = (readyCount % 3) / 3 * 100;

  useEffect(() => {
    if (!selected && words.length) setSelected(words[0].label);
    if (selected && !words.some((word) => word.label === selected)) {
      setSelected(words[0]?.label || "");
    }
  }, [selected, counts]);

  const selectedWord =
    words.find((word) => word.label === selected) || words[0];

  function chooseMode(nextMode) {
    setMode(nextMode);
    setFeedback("");
    setPrediction(null);
    setError("");
  }

  function startQuiz() {
    const pool = readyWords.length ? readyWords : words;
    if (!pool.length) {
      setFeedback("Teach a sign first to start a challenge.");
      return;
    }

    const choices = pool.filter((word) => word.label !== quizTarget);
    const next =
      choices[Math.floor(Math.random() * choices.length)] || pool[0];

    setQuizTarget(next.label);
    setSelected(next.label);
    setQuizAnswered(false);
    setPrediction(null);
    setFeedback("");
    setMode("quiz");
  }

  async function recognize() {
    if (busyRef.current) return;

    if (!cam.running) {
      setFeedback("Start the camera first.");
      return;
    }

    busyRef.current = true;
    setBusy(true);
    setFeedback("");
    setError("");
    setPrediction(null);

    try {
      const blob = await cam.grabBlob();
      if (!blob) {
        setFeedback("Couldn't capture a frame. Check the camera and try again.");
        return;
      }

      const data = await predictImage(blob);
      const result = readPrediction(data);

      if (!result.label) {
        setFeedback(
          "No clear prediction was returned. Check your backend response and try again."
        );
        return;
      }

      setPrediction(result);

      if (result.label.toLowerCase() === "no_hand") {
        setFeedback("No hand detected. Move your whole hand into view.");
        return;
      }

      if (result.label.toLowerCase() === "unsure") {
        setFeedback("Handora isn't sure. Try better lighting or another hand position.");
        return;
      }

      if (result.label.toLowerCase() === "no_gestures") {
        setFeedback("There are no trained gestures available yet.");
        return;
      }

      if (mode === "quiz") {
        if (quizAnswered) return;

        const correct =
          result.label.toLowerCase() === quizTarget.toLowerCase();

        setQuizAnswered(true);
        setQuizPlayed((value) => value + 1);

        if (correct) {
          setQuizScore((value) => value + 1);
          setFeedback(`Nice work! Handora recognized "${quizTarget}". +1 point`);
        } else {
          setFeedback(
            `Handora recognized "${result.label}", not "${quizTarget}". Try another round!`
          );
        }
      } else {
        const matches =
          selectedWord &&
          result.label.toLowerCase() === selectedWord.label.toLowerCase();

        setFeedback(
          matches
            ? `Match! Handora recognized "${result.label}".`
            : `Handora recognized "${result.label}". Your target is "${selectedWord?.label}". Try adjusting your hand shape.`
        );
      }
    } catch {
      setError("Recognition failed. Check that the Flask backend is running.");
    } finally {
      busyRef.current = false;
      if (aliveRef.current) setBusy(false);
    }
  }

  async function recordMore() {
    if (busyRef.current) return;

    if (!selectedWord) {
      setFeedback("Choose a sign first.");
      return;
    }

    if (!cam.running) {
      setFeedback("Start the camera before recording samples.");
      return;
    }

    busyRef.current = true;
    stopRef.current = false;
    setBusy(true);
    setProgress(0);
    setFeedback(`Get ready to record "${selectedWord.label}"...`);
    setError("");

    let saved = 0;

    try {
      for (let i = 3; i > 0; i--) {
        if (stopRef.current || !aliveRef.current) break;
        setOverlay({ title: selectedWord.label, value: String(i) });
        await sleep(1000);
      }

      for (let i = 0; i < 40; i++) {
        if (stopRef.current || !aliveRef.current) break;

        setOverlay({ title: selectedWord.label, value: "Hold it..." });
        setProgress((i + 1) / 40);

        const blob = await cam.grabBlob();

        if (blob) {
          const result = await addSample(blob, selectedWord.label);
          if (result.ok) saved++;
        }

        await sleep(100);
      }

      await saveGestures();
      await refresh();

      if (aliveRef.current) {
        setFeedback(
          stopRef.current
            ? `Stopped. Saved ${saved} new samples.`
            : `Recording complete! Saved ${saved} new samples for "${selectedWord.label}".`
        );
      }
    } catch {
      if (aliveRef.current) {
        setError("Couldn't save samples. Check the backend connection.");
      }
    } finally {
      stopRef.current = true;
      busyRef.current = false;
      if (aliveRef.current) {
        setBusy(false);
        setOverlay(null);
        setProgress(0);
      }
    }
  }

  function addCustomWord(event) {
    event.preventDefault();
    const label = custom.trim();

    if (!label) return;

    if (words.some((word) => word.label.toLowerCase() === label.toLowerCase())) {
      setFeedback("That label already exists. Choose it from your sign cards.");
      return;
    }

    setCounts((current) => ({ ...current, [label]: 0 }));
    setSelected(label);
    setCustom("");
    setFeedback(`Created "${label}". Start the camera and record its hand shape.`);
    setMode("practice");
  }

  const visibleWords = words.filter((word) =>
    `${word.label} ${word.hint}`.toLowerCase().includes(search.toLowerCase())
  );

  const quizChoices = quizTarget
    ? shuffle([
        quizTarget,
        ...shuffle(words.filter((word) => word.label !== quizTarget))
          .slice(0, Math.min(3, Math.max(0, words.length - 1)))
          .map((word) => word.label),
      ])
    : [];

  return (
    <div className="learn-game">
      <header className="learn-hero">
        <div className="learn-hero-copy">
          <span className="learn-kicker">HANDORA · LEARNING QUEST</span>
          <h2>Learn a sign.<br /><span>Level up.</span></h2>
          <p>Explore your sign library, practice with the camera, and challenge your recognition skills.</p>
          <div className="learn-hero-actions">
            <button className="learn-button learn-button-main" onClick={() => chooseMode("learn")}>
              Explore signs <span>→</span>
            </button>
            <button className="learn-button learn-button-ghost" onClick={startQuiz}>
              Start a quest ✦
            </button>
          </div>
        </div>

        <div className="learn-level-card">
          <div className="learn-level-orbit">✦</div>
          <span className="learn-kicker">YOUR JOURNEY</span>
          <div className="learn-level-number">LVL {level}</div>
          <div className="learn-level-track">
            <span style={{ width: `${levelProgress}%` }} />
          </div>
          <p>{readyCount} signs mastered</p>
          <div className="learn-level-stats">
            <div><strong>{words.length}</strong><small>Sign labels</small></div>
            <div><strong>{totalSamples}</strong><small>Samples saved</small></div>
          </div>
        </div>
      </header>

      <nav className="learn-mode-tabs" aria-label="Learning modes">
        {[
          ["learn", "01", "Learn", "Explore sign cards"],
          ["practice", "02", "Practice", "Try the camera"],
          ["quiz", "03", "Quiz quest", "Earn points"],
        ].map(([value, number, title, subtitle]) => (
          <button
            key={value}
            type="button"
            className={`learn-mode-tab ${mode === value ? "is-active" : ""}`}
            onClick={() => chooseMode(value)}
          >
            <span className="learn-tab-number">{number}</span>
            <span className="learn-tab-text"><strong>{title}</strong><small>{subtitle}</small></span>
            <span className="learn-tab-arrow">↗</span>
          </button>
        ))}
      </nav>

      {(error || feedback || cam.error) && (
        <div className={`learn-feedback ${error || cam.error ? "is-error" : ""}`} role="status">
          <span>{error || cam.error ? "!" : "✦"}</span>
          {error || cam.error || feedback}
        </div>
      )}

      {mode === "learn" && (
        <section className="learn-section">
          <div className="learn-section-heading">
            <div>
              <span className="learn-kicker">YOUR COLLECTION</span>
              <h3>Choose your next sign</h3>
              <p>Study the hand-shape hint, then practice it in front of the camera.</p>
            </div>
            <span className="learn-count-pill">{visibleWords.length} signs</span>
          </div>

          <label className="learn-search">
            <span>⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a sign..." />
          </label>

          <div className="learn-sign-grid">
            {visibleWords.map((word, index) => {
              const count = counts[word.label] || 0;
              const ready = count >= MIN_SAMPLES;

              return (
                <button
                  type="button"
                  key={word.label}
                  className={`learn-sign-card ${selected === word.label ? "is-selected" : ""}`}
                  onClick={() => {
                    setSelected(word.label);
                    setFeedback("");
                    setPrediction(null);
                  }}
                >
                  <div className="learn-sign-card-top">
                    <span className="learn-card-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className={`learn-mini-status ${ready ? "is-ready" : ""}`}>
                      {ready ? "✓ Ready" : count ? "Learning" : "New"}
                    </span>
                  </div>
                  <div className="learn-card-symbol">{word.label.charAt(0).toUpperCase()}</div>
                  <h4>{word.label}</h4>
                  <p>{word.hint}</p>
                  <div className="learn-card-footer">
                    <span>{count} samples</span>
                    <span>{selected === word.label ? "Selected ✓" : "Study →"}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <form className="learn-custom-form" onSubmit={addCustomWord}>
            <div>
              <span className="learn-kicker">CREATE YOUR OWN</span>
              <h3>Add a custom sign label</h3>
              <p>Create a label here, then record examples in Practice mode.</p>
            </div>
            <div className="learn-custom-fields">
              <input value={custom} maxLength={40} onChange={(event) => setCustom(event.target.value)} placeholder="e.g. Please" aria-label="New sign label" />
              <button className="learn-button learn-button-main" type="submit" disabled={!custom.trim()}>Add sign +</button>
            </div>
          </form>
        </section>
      )}

      {(mode === "practice" || mode === "quiz") && (
        <section className="learn-section">
          <div className="learn-section-heading">
            <div>
              <span className="learn-kicker">{mode === "quiz" ? "CHALLENGE MODE" : "CAMERA LAB"}</span>
              <h3>{mode === "quiz" ? "Guess the hand shape" : "Practice your sign"}</h3>
              <p>
                {mode === "quiz"
                  ? "A target appears. Make its trained hand shape and let Handora check the result."
                  : "Choose a target, show the hand shape, and check what Handora recognizes."}
              </p>
            </div>
          </div>

          <div className="learn-practice-layout">
            <div className="learn-target-panel">
              <span className="learn-kicker">{mode === "quiz" ? "YOUR QUEST TARGET" : "CURRENT SIGN"}</span>
              <div className="learn-target-symbol">{(mode === "quiz" ? quizTarget : selectedWord?.label || "?").charAt(0).toUpperCase()}</div>
              <h3>{mode === "quiz" ? (quizTarget || "Start a quest") : (selectedWord?.label || "Choose a sign")}</h3>
              <p>
                {mode === "quiz"
                  ? "Copy the hand shape you learned for this label."
                  : selectedWord?.hint || "Select a sign in Learn mode."}
              </p>

              {mode === "practice" && (
                <label className="learn-select-label">
                  Choose a sign
                  <select value={selected} onChange={(event) => { setSelected(event.target.value); setFeedback(""); setPrediction(null); }}>
                    {words.map((word) => <option key={word.label} value={word.label}>{word.label}</option>)}
                  </select>
                </label>
              )}

              {mode === "quiz" && (
                <div className="learn-quiz-score">
                  <span>QUEST SCORE</span>
                  <strong>{quizScore} pts</strong>
                  <small>{quizPlayed} attempts</small>
                </div>
              )}
            </div>

            <div className="learn-camera-panel">
              <div className="learn-camera-panel-head">
                <div><strong>Live practice</strong><small>Keep your whole hand in view</small></div>
                <span className={`learn-camera-dot ${cam.running ? "is-on" : ""}`}>{cam.running ? "LIVE" : "OFFLINE"}</span>
              </div>

              <div className="learn-camera-box">
                <CameraView cam={cam} overlay={overlay} />
                {!cam.running && (
                  <div className="learn-camera-overlay">
                    <span>◎</span><strong>Camera is off</strong><small>Start it to practice your signs.</small>
                  </div>
                )}
              </div>

              <div className="learn-camera-controls">
                {!cam.running ? (
                  <button className="learn-button learn-button-main" type="button" onClick={cam.start}>◎ Start camera</button>
                ) : (
                  <button className="learn-button learn-button-ghost" type="button" onClick={cam.stop} disabled={busy}>Stop camera</button>
                )}
                <button className="learn-button learn-button-main" type="button" onClick={recognize} disabled={busy || !cam.running || (mode === "quiz" && (!quizTarget || quizAnswered))}>
                  {busy ? "Checking..." : mode === "quiz" ? "Check my sign ✦" : "Recognize sign →"}
                </button>
              </div>

              {prediction && (
                <div className="learn-prediction">
                  <span>HANDORA RECOGNIZED</span>
                  <strong>{prediction.label}</strong>
                  {prediction.confidence > 0 && <small>{Math.round(prediction.confidence * 100)}% confidence</small>}
                </div>
              )}

              {busy && mode === "practice" && (
                <div className="learn-record-progress">
                  <span>Recording samples · {Math.round(progress * 100)}%</span>
                  <div><span style={{ width: `${progress * 100}%` }} /></div>
                  <button className="learn-button learn-button-ghost" type="button" onClick={() => { stopRef.current = true; }}>Stop recording</button>
                </div>
              )}
            </div>
          </div>

          {mode === "practice" && (
            <div className="learn-improve-card">
              <div><span className="learn-kicker">TRAIN YOUR MODEL</span><h3>Improve this sign</h3><p>Record up to 40 more camera frames for the selected label.</p></div>
              <button className="learn-button learn-button-main" type="button" onClick={recordMore} disabled={busy || !cam.running || !selectedWord}>＋ Record more samples</button>
            </div>
          )}

          {mode === "quiz" && (
            <div className="learn-quiz-bottom">
              <div><span className="learn-kicker">KEEP GOING</span><h3>{quizAnswered ? "Round complete!" : "Ready for your next round?"}</h3><p>{quizAnswered ? "Try another target to keep building your score." : "Make the target hand shape, then check your answer."}</p></div>
              <button className="learn-button learn-button-main" type="button" onClick={startQuiz}>{quizAnswered ? "Next round →" : "New target ↻"}</button>
            </div>
          )}
        </section>
      )}

      <aside className="learn-disclaimer">
        <span>✦</span>
        <p><strong>Learning tip:</strong> These labels and hand-shape hints are training aids, not a verified ASL dictionary. The current model recognizes static shapes and may make mistakes; it does not yet verify sign-language meaning or movement.</p>
      </aside>
    </div>
  );
}
