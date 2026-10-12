
import { useEffect, useRef, useState } from "react";
import useCamera from "../useCamera.js";
import CameraView from "./CameraView.jsx";
import { predictImage } from "../api.js";

const INTERVAL_MS = 300;
const STABLE_FRAMES = 3;
const GAP_FRAMES = 3;

function say(text) {
  if (!("speechSynthesis" in window) || !text.trim()) return;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export default function LiveCamera() {
  const cam = useCamera();

  const busyRef = useRef(false);
  const tickRef = useRef(null);
  const thresholdRef = useRef(0.6);
  const autoSpeakRef = useRef(true);
  const candidateRef = useRef({ label: "", count: 0 });
  const gapRef = useRef(0);
  const lastAcceptedRef = useRef("");

  const [current, setCurrent] = useState({
    text: "Waiting for camera",
    conf: null,
  });
  const [words, setWords] = useState([]);
  const [threshold, setThreshold] = useState(0.6);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
  }, [autoSpeak]);

  function markIdle(text) {
    setCurrent({ text, conf: null });
    candidateRef.current = { label: "", count: 0 };
    gapRef.current += 1;

    if (gapRef.current >= GAP_FRAMES) {
      lastAcceptedRef.current = "";
    }
  }

  function handleResult(data) {
    if (data.status === "no_gestures") {
      setNotice(
        "No gestures have been taught yet. Open Teach to record your signs."
      );
      markIdle("No gestures taught");
      return;
    }

    setNotice("");

    if (data.status === "no_hand") {
      markIdle("No hand detected");
      return;
    }

    if (data.status === "unsure") {
      markIdle("Sign unclear");
      return;
    }

    if (data.ignore) {
      markIdle("Resting");
      return;
    }

    if (data.confidence < thresholdRef.current) {
      markIdle("Low confidence");
      return;
    }

    gapRef.current = 0;
    setCurrent({
      text: data.prediction,
      conf: data.confidence,
    });

    const previous = candidateRef.current;

    candidateRef.current =
      previous.label === data.prediction
        ? {
            label: previous.label,
            count: previous.count + 1,
          }
        : {
            label: data.prediction,
            count: 1,
          };

    if (
      candidateRef.current.count >= STABLE_FRAMES &&
      data.prediction !== lastAcceptedRef.current
    ) {
      lastAcceptedRef.current = data.prediction;
      setWords((list) => [...list, data.prediction]);

      if (autoSpeakRef.current) {
        say(data.prediction);
      }
    }
  }

  tickRef.current = async () => {
    if (busyRef.current) return;

    busyRef.current = true;

    try {
      const blob = await cam.grabBlob();
      if (!blob) return;

      const result = await predictImage(blob);
      handleResult(result);
      setError("");
    } catch {
      setError(
        "Cannot reach the AI backend. Check that python app.py is running."
      );
    } finally {
      busyRef.current = false;
    }
  };

  useEffect(() => {
    if (!cam.running) return undefined;

    const id = setInterval(() => {
      tickRef.current();
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [cam.running]);

  function undoLastWord() {
    setWords((list) => list.slice(0, -1));
  }

  function clearWords() {
    setWords([]);
    lastAcceptedRef.current = "";
    candidateRef.current = { label: "", count: 0 };
    gapRef.current = 0;
  }

  const statusText = error
    ? "Connection issue"
    : cam.error
      ? "Camera unavailable"
      : cam.running
        ? "Camera active"
        : "Camera stopped";

  return (
    <div className="translator-console">
      <div className="translator-topline">
        <div>
          <span className="translator-eyebrow">LIVE TRANSLATOR / 01</span>
          <h3>Sign recognition</h3>
          <p className="translator-subtitle">
            Hold a taught gesture in view and let SignBridge recognise it.
          </p>
        </div>

        <div
          className={`translator-status ${
            cam.running && !error ? "is-live" : ""
          }`}
        >
          <span className="translator-status-dot" />
          {statusText}
        </div>
      </div>

      <div className="translator-workspace">
        <section className="translator-camera-panel">
          <div className="translator-panel-heading">
            <span>CAMERA FEED</span>
            <span>{cam.running ? "● LIVE" : "○ STANDBY"}</span>
          </div>

          <div className="translator-camera-frame">
            <CameraView cam={cam} />

            {!cam.running && (
              <div className="translator-camera-overlay">
                <div className="translator-camera-symbol">⌁</div>
                <p>Your camera is on standby</p>
                <span>Start the camera to begin recognition.</span>
              </div>
            )}
          </div>

          <div className="translator-camera-footer">
            <span>Recognition updates automatically</span>
            <span>Threshold: {(threshold * 100).toFixed(0)}%</span>
          </div>

          <div className="translator-camera-actions">
            {!cam.running ? (
              <button
                className="translator-button translator-button-primary"
                onClick={cam.start}
              >
                <span>▶</span> Start camera
              </button>
            ) : (
              <button
                className="translator-button"
                onClick={cam.stop}
              >
                <span>■</span> Stop camera
              </button>
            )}

            <label className="translator-toggle">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(event) => setAutoSpeak(event.target.checked)}
              />
              <span className="translator-toggle-track" />
              <span>Auto-speak</span>
            </label>
          </div>
        </section>

        <section className="translator-output-panel">
          <div className="translator-panel-heading">
            <span>RECOGNITION OUTPUT</span>
            <span>01 / RESULT</span>
          </div>

          <div className="translator-current-result">
            <span className="translator-label">CURRENT SIGN</span>

            <div
              className={`translator-prediction ${
                current.conf !== null ? "has-prediction" : ""
              }`}
              aria-live="polite"
            >
              {current.text}
            </div>

            <div className="translator-confidence">
              <div className="translator-confidence-label">
                <span>Confidence</span>
                <strong>
                  {current.conf === null
                    ? "—"
                    : `${(current.conf * 100).toFixed(0)}%`}
                </strong>
              </div>

              <div
                className="translator-confidence-track"
                role="progressbar"
                aria-label="Recognition confidence"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={
                  current.conf === null
                    ? 0
                    : Math.round(current.conf * 100)
                }
              >
                <span
                  style={{
                    width: `${
                      current.conf === null
                        ? 0
                        : Math.max(
                            0,
                            Math.min(100, current.conf * 100)
                          )
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="translator-sentence">
            <div className="translator-sentence-heading">
              <div>
                <span className="translator-label">YOUR TRANSLATION</span>
                <h4>Built word by word</h4>
              </div>

              <span className="translator-word-count">
                {words.length.toString().padStart(2, "0")} WORDS
              </span>
            </div>

            <div className="translator-sentence-content" aria-live="polite">
              {words.length ? (
                words.map((word, index) => (
                  <span className="translator-word" key={`${index}-${word}`}>
                    {word}
                  </span>
                ))
              ) : (
                <p>
                  Recognised words will appear here as you make your signs.
                </p>
              )}
            </div>

            <div className="translator-sentence-actions">
              <button
                className="translator-text-button"
                onClick={undoLastWord}
                disabled={!words.length}
              >
                ↶ Undo
              </button>

              <button
                className="translator-text-button"
                onClick={clearWords}
                disabled={!words.length}
              >
                Clear
              </button>

              <button
                className="translator-button translator-button-primary translator-speak-button"
                onClick={() => say(words.join(" "))}
                disabled={!words.length}
              >
                ▶ Speak sentence
              </button>
            </div>
          </div>

          <div className="translator-settings">
            <div className="translator-settings-heading">
              <span className="translator-label">RECOGNITION SETTINGS</span>
              <strong>{(threshold * 100).toFixed(0)}%</strong>
            </div>

            <label htmlFor="translator-threshold">
              Minimum confidence to accept a word
            </label>

            <input
              id="translator-threshold"
              type="range"
              min="0.3"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={(event) =>
                setThreshold(parseFloat(event.target.value))
              }
            />

            <p>
              Raise this value to make recognition more selective. Lower it if
              valid gestures are often missed.
            </p>
          </div>
        </section>
      </div>

      {(cam.error || error || notice) && (
        <div
          className={`translator-message ${
            error || cam.error ? "translator-message-error" : ""
          }`}
          role="status"
        >
          <span>{error || cam.error || notice}</span>
        </div>
      )}

      <div className="translator-disclaimer">
        <span>ⓘ</span>
        <p>
          SignBridge recognises gestures taught to its model. Its output is
          not a complete or verified sign-language translation.
        </p>
      </div>
    </div>
  );
}
