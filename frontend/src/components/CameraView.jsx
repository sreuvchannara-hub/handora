
export default function CameraView({ cam, overlay }) {
  return (
    <div className="camera">
      <video
        ref={cam.videoRef}
        playsInline
        autoPlay
        muted
        className="camera-preview"
      />

      {!cam.running && (
        <div className="camera-msg">Camera is off</div>
      )}

      {overlay && (
        <div className="camera-overlay">
          <div className="overlay-small">{overlay.title}</div>
          <div className="overlay-big">{overlay.value}</div>
        </div>
      )}

      <canvas ref={cam.canvasRef} hidden />
    </div>
  );
}

