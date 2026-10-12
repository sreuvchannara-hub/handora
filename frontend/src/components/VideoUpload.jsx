
import { useRef, useState, useEffect } from "react";
import { predictVideo } from "../api.js";

export default function VideoUpload() {
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  async function processFile(file) {
    if (!file) return;

    const allowedExtensions = /\.(mp4|avi|mov|mkv|webm)$/i;

    if (!allowedExtensions.test(file.name)) {
      setError("Please choose an MP4, AVI, MOV, MKV, or WEBM video.");
      return;
    }

    setFileUrl((oldUrl) => {
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      return URL.createObjectURL(file);
    });

    setFileName(file.name);
    setText("");
    setDone(false);
    setError("");
    setBusy(true);

    try {
      const data = await predictVideo(file);
      setText(data.prediction || "");
      setDone(true);
    } catch {
      setError(
        "Could not process the video. Check that the backend is running and the video format is supported."
      );
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
    <div className="handora-upload handora-video">
      <div className="upload-heading">
        <div className="upload-heading-icon">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="13" height="14" rx="3" />
            <path d="m16 10 5-3v10l-5-3" />
          </svg>
        </div>

        <div>
          <h3>Video translator</h3>
          <p>Upload a signing video and let Handora find the signs.</p>
        </div>
      </div>

      <input
        ref={inputRef}
        className="upload-hidden-input"
        type="file"
        accept="video/mp4,video/x-msvideo,video/quicktime,video/x-matroska,video/webm"
        onChange={onFile}
      />

      {!fileUrl ? (
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
              <rect x="3" y="5" width="13" height="14" rx="3" />
              <path d="m16 10 5-3v10l-5-3" />
            </svg>
          </div>

          <h4>Drop your video here</h4>
          <p>or browse your device</p>

          <button
            type="button"
            className="upload-choose-button"
            onClick={() => inputRef.current?.click()}
          >
            Choose video
          </button>

          <span className="upload-hint">
            MP4, AVI, MOV, MKV, or WEBM
          </span>
        </div>
      ) : (
        <div className="upload-preview-card">
          <div className="upload-preview-top">
            <span className="upload-preview-label">YOUR VIDEO</span>

            <button
              type="button"
              className="upload-change-button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              Change video
            </button>
          </div>

          <video
            className="preview handora-video-preview"
            src={fileUrl}
            controls
            playsInline
          />

          <div className="video-file-info">
            <span className="video-file-icon">▶</span>
            <div className="video-file-name">
              <strong>{fileName}</strong>
              <span>Ready for translation</span>
            </div>
          </div>

          {busy && (
            <div className="upload-analyzing">
              <span className="upload-spinner" />
              <div>
                <strong>Analyzing your video...</strong>
                <p>Handora is checking for recognized signs.</p>
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

      {done && (
        <div className="upload-result" aria-live="polite">
          <span className="upload-result-label">TRANSLATION RESULT</span>

          <h3 className="video-translation">
            {text || "No taught words found in the video"}
          </h3>

          <p>
            {text
              ? "This is what Handora recognized in your video."
              : "Try recording a clearer video with signs your model has learned."}
          </p>
        </div>
      )}
    </div>
  );
}
