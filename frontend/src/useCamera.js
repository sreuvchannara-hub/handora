import { useCallback, useEffect, useRef, useState } from "react";

// Opens the visitor's own camera and can take a still picture from it.
export default function useCamera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (mountedRef.current) setRunning(false);
  }, []);

  const start = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setRunning(true);
    } catch (err) {
      setError("Could not open the camera. Allow camera access in the browser and close other apps that use it.");
    }
  }, []);

  const grabBlob = useCallback(
    () =>
      new Promise((resolve) => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !video.videoWidth) return resolve(null);
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
      }),
    []
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [stop]);

  return { videoRef, canvasRef, running, error, start, stop, grabBlob };
}
