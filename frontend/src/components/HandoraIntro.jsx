
import { useEffect, useRef, useState } from "react";
import { predictImage } from "../api.js";

const TARGET = "HANDORA";
const INTERVAL_MS = 400;
const STABLE_FRAMES = 3;
const GAP_FRAMES = 2;
const MIN_CONFIDENCE = 0.65;

export default function HandoraIntro() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const busyRef = useRef(false);

  const lastLabelRef = useRef("");
  const streakRef = useRef(0);
  const noHandRef = useRef(0);
  const lastAcceptedRef = useRef("");
  const lettersRef = useRef("");
  const completeRef = useRef(false);

  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState("-");
  const [letters, setLetters] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  function stop() {
    clearInterval(timerRef.current);
    timerRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setRunning(false);
  }

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function start() {
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is unavailable. Use localhost or HTTPS.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setRunning(true);
      timerRef.current = setInterval(tick, INTERVAL_MS);
    } catch {
      setError(
        "Could not open the camera. Allow camera access in your browser."
      );
      stop();
    }
  }

  function handleResult(label, conf) {
    setCurrent(label);
    setConfidence(conf);

    if (label === "No Hand Detected") {
      noHandRef.current += 1;
      streakRef.current = 0;
      lastLabelRef.current = "";

      if (noHandRef.current >= GAP_FRAMES) {
        lastAcceptedRef.current = "";
      }
      return;
    }

    noHandRef.current = 0;

    if (conf < MIN_CONFIDENCE || !/^[A-Z]$/.test(label)) {
      streakRef.current = 0;
      lastLabelRef.current = "";
      return;
    }

    if (label === lastLabelRef.current) {
      streakRef.current += 1;
    } else {
      lastLabelRef.current = label;
      streakRef.current = 1;
    }

    if (
      streakRef.current >= STABLE_FRAMES &&
      label !== lastAcceptedRef.current &&
      !completeRef.current
    ) {
      lastAcceptedRef.current = label;

      const next = lettersRef.current + label;
      lettersRef.current = next;
      setLetters(next);

      if (next === TARGET) {
        completeRef.current = true;
        setComplete(true);
      }
    }
  }

  async function tick() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      !video ||
      !canvas ||
      busyRef.current ||
      video.videoWidth === 0 ||
      completeRef.current
    ) {
      return;
    }

    busyRef.current = true;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        try {
          if (!blob) return;

          const data = await predictImage(blob);
          handleResult(
            String(data.prediction ?? "").trim().toUpperCase(),
            Number(data.confidence ?? 0)
          );
          setError("");
        } catch {
          setError("Backend connection lost. Check that python app.py is running.");
        } finally {
          busyRef.current = false;
        }
      },
      "image/jpeg",
      0.8
    );
  }

  function reset() {
    lettersRef.current = "";
    completeRef.current = false;
    lastAcceptedRef.current = "";
    lastLabelRef.current = "";
    streakRef.current = 0;
    noHandRef.current = 0;

    setLetters("");
    setComplete(false);
    setError("");
  }

  function introduceTeam() {
    const message =
      "Hello, everyone! We are Handora, the team behind SignBridge. " +
      "Our project explores how artificial intelligence can recognize " +
      "supported hand signs and help make communication more accessible. " +
      "Today, we are excited to show you how our project works!";

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(
        new SpeechSynthesisUtterance(message)
      );
    }
  }

  return (
    <div className="handora-shell">
      <div className="handora-camera">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="mirror"
        />
        {!running && (
          <div className="camera-off">Your camera is off</div>
        )}
        <canvas ref={canvasRef} hidden />
      </div>

      <div className="handora-controls">
        {!running ? (
          <button className="btn primary" onClick={start}>
            Start Handora Mode
          </button>
        ) : (
          <button className="btn" onClick={stop}>
            Stop Camera
          </button>
        )}

        <button className="btn" onClick={reset}>
          Start Over
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="handora-result">
        <span className="muted">Current prediction</span>
        <div className="handora-current">{current}</div>
        {current !== "-" && current !== "No Hand Detected" && (
          <span className="muted">
            Confidence: {(confidence * 100).toFixed(0)}%
          </span>
        )}

        <span className="muted">Spell your team name</span>
        <div className="handora-letters">
          {TARGET.split("").map((letter, index) => (
            <span
              key={letter + index}
              className={
                index < letters.length ? "handora-letter done" : "handora-letter"
              }
            >
              {index < letters.length ? letters[index] : letter}
            </span>
          ))}
        </div>

        <p className="muted">
          Hold each letter steady. Briefly move your hand out of view
          between letters so the same letter can be recognized again.
        </p>
      </div>

      {complete && (
        <div className="handora-success">
          <h3>Welcome, everyone!</h3>
          <h2>We are HANDORA.</h2>
          <p>
            The team behind SignBridge — exploring how AI can help
            recognize supported hand signs and make communication
            more accessible.
          </p>
          <button
            className="btn primary"
            onClick={introduceTeam}
          >
            🔊 Introduce Our Team
          </button>
        </div>
      )}
    </div>
  );
}
