const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

async function request(path, options) {
  const res = await fetch(`${API}${path}`, options);
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json();
}

function fileForm(file, extra = {}) {
  const form = new FormData();
  form.append("file", file, file.name || "frame.jpg");
  Object.entries(extra).forEach(([key, value]) => form.append(key, value));
  return form;
}

export const predictImage = (file) =>
  request("/predict_image", { method: "POST", body: fileForm(file) });

export const predictVideo = (file) =>
  request("/predict_video", { method: "POST", body: fileForm(file) });

export const addSample = (blob, label) =>
  request("/api/sample", { method: "POST", body: fileForm(blob, { label }) });

export const listGestures = () => request("/api/gestures");

export const deleteGesture = (label) =>
  request(`/api/gestures/${encodeURIComponent(label)}`, { method: "DELETE" });

export const saveGestures = () => request("/api/save", { method: "POST" });

export const STATUS_MESSAGES = {
  no_hand: "No hand found in the picture. Make sure your whole hand is visible and well lit.",
  unsure: "Not sure. This hand shape does not match any word you taught.",
  no_gestures: "No words taught yet. Open the Teach tab first.",
};
