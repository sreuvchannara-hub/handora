
import { useRef, useState } from "react";
import { predictImage, STATUS_MESSAGES } from "../api.js";

export default function ImageUpload() {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  async function processFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setPreview((oldPreview) => {
      if (oldPreview) URL.revokeObjectURL(oldPreview);
      return URL.createObjectURL(file);
    });

    setResult(null);
    setError("");
    setBusy(true);

    try {
      const prediction = await predictImage(file);
      setResult(prediction);
    } catch {
      setError("Could not reach the backend. Is python app.py running?");
    } finally {
      setBusy(false);
    }
  }

  function onFile(event) {
    const file = event.target.files?.[0];
    if (file) processFile(file);
    event.target.value = "";
  }

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="handora-upload">
      <div className="upload-heading">
        <div className="upload-heading-icon">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <circle cx="8.5" cy="9" r="1.5" />
            <path d="m4 17 5-5 4 4 3-3 4 4" />
          </svg>
        </div>

        <div>
          <h3>Image translator</h3>
          <p>Upload a hand sign and let Handora recognize it.</p>
        </div>
      </div>

      <input
        ref={inputRef}
        className="upload-hidden-input"
        type="file"
        accept="image/*"
        onChange={onFile}
      />

      {!preview ? (
        <div
          className={`upload-dropzone ${dragging ? "is-dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className="upload-cloud-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 16V4m-4 4 4-4 4 4" />
              <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
            </svg>
          </div>

          <h4>Drop your image here</h4>
          <p>or browse your device</p>

          <button
            type="button"
            className="upload-choose-button"
            onClick={() => inputRef.current?.click()}
          >
            Choose image
          </button>

          <span className="upload-hint">
            JPG, PNG, or another supported image format
          </span>
        </div>
      ) : (
        <div className="upload-preview-card">
          <div className="upload-preview-top">
            <span className="upload-preview-label">YOUR IMAGE</span>
            <button
              type="button"
              className="upload-change-button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              Change image
            </button>
          </div>

          <img className="preview" src={preview} alt="Selected hand sign" />

          {busy && (
            <div className="upload-analyzing">
              <span className="upload-spinner" />
              <div>
                <strong>Analyzing your sign...</strong>
                <p>Handora is checking your image.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="upload-message upload-error" role="alert">
          {error}
        </div>
      )}

      {result && (
        <div className="upload-result" aria-live="polite">
          {result.status === "ok" ? (
            <>
              <span className="upload-result-label">RECOGNITION RESULT</span>
              <h3>
                {result.ignore ? "Resting pose" : result.prediction}
              </h3>
              <div className="upload-confidence-track">
                <div
                  className="upload-confidence-fill"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, Number(result.confidence) * 100)
                    )}%`,
                  }}
                />
              </div>
              <p>
                Confidence{" "}
                {Number.isFinite(Number(result.confidence))
                  ? `${(Number(result.confidence) * 100).toFixed(0)}%`
                  : "Unavailable"}
              </p>
            </>
          ) : (
            <p className="upload-result-status">
              {STATUS_MESSAGES[result.status] || "Something went wrong."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
