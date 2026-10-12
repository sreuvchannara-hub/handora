
import { useState } from "react";
import "./Phrasebook.css";

const ASL_LESSONS =
  "https://www.lifeprint.com/asl101/lessons/lessons.htm";

const GREETING_VIDEO =
  "https://asl.isb.ac.th/lessons/lesson-2-greetings";

const phrases = [
  { phrase: "Hello!", group: "Greetings", context: "Start a conversation.", resource: "greetings" },
  { phrase: "How are you?", group: "Greetings", context: "Ask someone how they are doing.", resource: "greetings" },
  { phrase: "I'm good.", group: "Greetings", context: "Respond to a greeting.", resource: "greetings" },
  { phrase: "Good morning!", group: "Greetings", context: "Greet someone at the start of the day.", resource: "lessons" },
  { phrase: "Good afternoon!", group: "Greetings", context: "Greet someone during the afternoon.", resource: "lessons" },
  { phrase: "Good evening!", group: "Greetings", context: "Greet someone in the evening.", resource: "lessons" },
  { phrase: "Nice to meet you.", group: "Introductions", context: "Meet someone for the first time.", resource: "lessons" },
  { phrase: "What's your name?", group: "Introductions", context: "Ask someone their name.", resource: "lessons" },
  { phrase: "My name is…", group: "Introductions", context: "Introduce yourself. Names may be fingerspelled.", resource: "lessons" },
  { phrase: "Thank you!", group: "Polite expressions", context: "Show appreciation.", resource: "greetings" },
  { phrase: "You're welcome.", group: "Polite expressions", context: "Respond to someone's thanks.", resource: "lessons" },
  { phrase: "Please.", group: "Polite expressions", context: "Make a polite request.", resource: "lessons" },
  { phrase: "Sorry.", group: "Polite expressions", context: "Apologize to someone.", resource: "lessons" },
  { phrase: "Goodbye!", group: "Everyday conversation", context: "End a conversation.", resource: "greetings" },
  { phrase: "See you later!", group: "Everyday conversation", context: "Say goodbye when you expect to meet again.", resource: "lessons" },
  { phrase: "I don't understand.", group: "Everyday conversation", context: "Let someone know you need clarification.", resource: "lessons" },
  { phrase: "Please sign more slowly.", group: "Everyday conversation", context: "Ask someone to slow down their signing.", resource: "lessons" },
  { phrase: "Can you repeat that?", group: "Everyday conversation", context: "Ask someone to repeat their message.", resource: "lessons" },
  { phrase: "I'm learning ASL.", group: "Everyday conversation", context: "Tell someone you are learning American Sign Language.", resource: "lessons" },
  { phrase: "Welcome, everyone!", group: "Handora", context: "Welcome your audience to a presentation.", resource: "lessons" },
  { phrase: "We're Handora.", group: "Handora", context: "Introduce your team. Fingerspelling the name is appropriate when needed.", resource: "lessons" },
];

const categories = [
  "All",
  "Greetings",
  "Introductions",
  "Polite expressions",
  "Everyday conversation",
  "Handora",
];

export default function Phrasebook() {
  const [category, setCategory] = useState("All");
  const [practice, setPractice] = useState(false);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const filtered = phrases.filter(
    (item) => category === "All" || item.group === category
  );
  const current = filtered[index % filtered.length];

  function changeCategory(value) {
    setCategory(value);
    setIndex(0);
    setRevealed(false);
  }

  function nextCard() {
    setIndex((previous) => (previous + 1) % filtered.length);
    setRevealed(false);
  }

  return (
    <section className="phrasebook" id="phrasebook">
      <div className="phrasebook-heading">
        <div>
          <span className="phrasebook-eyebrow">HANDORA · LEARNING STUDIO</span>
          <h2>Learn the conversation.</h2>
          <p>
            Explore everyday expressions through ASL learning resources.
            Learn the meaning and context of a phrase—not English word-by-word
            fingerspelling.
          </p>
        </div>

        <button
          className="phrasebook-mode"
          onClick={() => {
            setPractice(!practice);
            setIndex(0);
            setRevealed(false);
          }}
        >
          {practice ? "← Browse phrases" : "Practice mode ↗"}
        </button>
      </div>

      <div className="phrasebook-filters" aria-label="Phrase categories">
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? "phrase-filter selected" : "phrase-filter"}
            onClick={() => changeCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {practice ? (
        <div className="phrase-practice">
          <span className="phrasebook-eyebrow">
            PRACTICE CARD {index + 1} / {filtered.length}
          </span>
          <h3>{revealed ? current.phrase : "What would you sign in this situation?"}</h3>
          <p>{current.context}</p>

          {revealed && (
            <p className="phrase-practice-note">
              This is the English meaning to learn toward. Open an ASL lesson
              below for signing instruction; this card does not show a
              verified ASL translation.
            </p>
          )}

          <div className="phrase-card-actions">
            <button className="phrase-action secondary" onClick={() => setRevealed(!revealed)}>
              {revealed ? "Hide phrase" : "Reveal phrase"}
            </button>
            <button className="phrase-action" onClick={nextCard}>
              Next card →
            </button>
          </div>

          <ResourceLinks resource={current.resource} />
        </div>
      ) : (
        <div className="phrase-grid">
          {filtered.map((item) => (
            <article className="phrase-card" key={item.phrase}>
              <div className="phrase-card-top">
                <span className="phrase-card-index">
                  {String(phrases.indexOf(item) + 1).padStart(2, "0")}
                </span>
                <span className="phrase-tag">{item.group}</span>
              </div>

              <h3>{item.phrase}</h3>
              <p>{item.context}</p>

              <ResourceLinks resource={item.resource} />
            </article>
          ))}
        </div>
      )}

      <div className="phrasebook-footnote">
        <span className="phrasebook-status-dot" />
        <p>
          Learning resources are external. ASL has its own grammar and regional
          variation. These cards are conversation prompts, not a claim that
          SignBridge recognizes or translates these phrases.
        </p>
      </div>
    </section>
  );
}

function ResourceLinks({ resource }) {
  const url = resource === "greetings" ? GREETING_VIDEO : ASL_LESSONS;

  return (
    <a className="phrase-resource" href={url} target="_blank" rel="noreferrer">
      Open ASL learning resource <span aria-hidden="true">↗</span>
    </a>
  );
}
