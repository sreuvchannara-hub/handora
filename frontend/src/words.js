// The words to teach. The pose is only a suggestion: use any hand shape you like,
// as long as every word looks clearly different from the others.
export const DEFAULT_WORDS = [
  { label: "Hello", hint: "Open hand, fingers spread wide, palm facing the camera" },
  { label: "Thank you", hint: "Flat hand, fingers together, palm facing up" },
  { label: "Bye", hint: "Fingers curled down, like a half-closed wave" },
  { label: "Oh", hint: "Thumb and fingertips touching in an O shape" },
  { label: "Yes", hint: "Closed fist" },
  { label: "No", hint: "Index and middle finger pinching the thumb" },
  { label: "That", hint: "Index finger pointing sideways" },
  { label: "This", hint: "Index finger pointing down" },
  { label: "Should", hint: "Thumbs up" },
  { label: "Be", hint: "Peace sign (index and middle finger up)" },
  { label: "Me", hint: "Index finger pointing at yourself" },
  { label: "Rest", hint: "Relaxed, loosely curled hand. Never typed as a word, it tells the app you are not signing" },
];

// a word needs about this many recorded samples to be reliable
export const MIN_SAMPLES = 30;
