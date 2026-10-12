
import { useState } from "react";
import LiveCamera from "./components/LiveCamera.jsx";
import Teach from "./components/Teach.jsx";
import ImageUpload from "./components/ImageUpload.jsx";
import VideoUpload from "./components/VideoUpload.jsx";
import "./App.css";

const team = [
  {
    number: "01",
    name: "Sreuv Channara",
    role: "Full-Stack Developer & AI/ML Developer",
    major: "Software Development",
    initials: "SC",
    focus: "Website, backend & AI system",
    image: "/team/channara.jpg",
  },
  {
    number: "02",
    name: "Rithy Lileakhana",
    role: "AI Training lead",
    major: "Cybersecurity",
    initials: "RL",
    focus: "Teaching the AI sign phrases",
    image: "/team/lileakhana.jpg",
  },
  {
    number: "03",
    name: "Aun Vuthdyka",
    role: "Report Writer",
    major: "Law",
    initials: "AV",
    focus: "Documentation",
    image: "/team/vuthdyka.jpg",
  },
  {
    number: "04",
    name: "Vann Panhapich",
    role: "Documentation Support",
    major: "Business",
    initials: "VP",
    focus: "documentation",
    image: "/team/panhapich.jpg",
  },
];

const steps = [
  {
    number: "01",
    title: "Show a sign",
    description:
      "Use your camera or upload an image or video containing a hand sign.",
  },
  {
    number: "02",
    title: "Let AI analyze",
    description:
      "Handora processes the visual input and looks for recognizable hand signs.",
  },
  {
    number: "03",
    title: "Learn and communicate",
    description:
      "Explore the result and keep practicing to improve your sign recognition.",
  },
];

const features = [
  {
    number: "01",
    title: "Live camera",
    description:
      "Practice hand signs in real time using your device's camera.",
    icon: "◉",
  },
  {
    number: "02",
    title: "Image recognition",
    description:
      "Upload an image and explore the hand signs the model can recognize.",
    icon: "▧",
  },
  {
    number: "03",
    title: "Video recognition",
    description:
      "Test sign recognition with a supported video file.",
    icon: "▷",
  },
  {
    number: "04",
    title: "Learning mode",
    description:
      "Explore the learning area and practice recognizing signs.",
    icon: "✳",
  },
];

function App() {
  const [activeTab, setActiveTab] = useState("camera");
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);

  const closeMenu = () => setMenuOpen(false);

  const openTranslator = (tab = "camera") => {
    setActiveTab(tab);
    closeMenu();

    document.getElementById("translator")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleFeedback = (event) => {
    event.preventDefault();

    const message = feedback.trim();

    if (!message) return;

    setFeedbackList((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${previous.length}`,
        message,
      },
    ]);

    setFeedback("");
    setFeedbackSent(true);
  };

  const renderTeamPhoto = (member) => (
    <div className="sb-team-avatar">
      <img
        src={member.image}
        alt={`${member.name}`}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      <span>{member.initials}</span>
    </div>
  );

  return (
    <div className="sb-site">
      {/* NAVIGATION */}
      <header className="sb-navbar">
        <a
          className="sb-brand"
          href="#home"
          onClick={closeMenu}
          aria-label="Handora home"
        >
          <span className="sb-brand-mark">✳</span>
          <span>
            HANDORA<span className="sb-brand-dot">.</span>
          </span>
        </a>

        <button
          className="sb-menu-toggle"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={`sb-nav-links ${menuOpen ? "is-open" : ""}`}>
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
          <a href="#translator" onClick={closeMenu}>Translator</a>
          <a href="#team" onClick={closeMenu}>Our team</a>
          <a href="#feedback" onClick={closeMenu}>Feedback</a>

          <a
            className="sb-nav-cta"
            href="#translator"
            onClick={() => {
              setActiveTab("camera");
              closeMenu();
            }}
          >
            Try Handora <span>↗</span>
          </a>
        </nav>
      </header>

      <main>
        {/* HERO */}
        <section className="sb-hero" id="home">
          <div className="sb-hero-grid">
            <div className="sb-hero-copy">
              <div className="sb-eyebrow">
                <span className="sb-status-dot" />
                A STUDENT-BUILT AI PROJECT
              </div>

              <h1>
                A new way
                <br />
                to <span className="sb-gradient-text">understand</span>
                <br />
                hand signs.
              </h1>

              <p className="sb-hero-description">
                Meet Handora, a sign-recognition project exploring how
                artificial intelligence can help people learn and understand
                hand signs through technology.
              </p>

              <div className="sb-hero-actions">
                <button
                  className="sb-button sb-button-primary"
                  onClick={() => openTranslator("camera")}
                  type="button"
                >
                  Explore Handora <span>↗</span>
                </button>

                <a className="sb-text-link" href="#how-it-works">
                  Discover how it works <span>↓</span>
                </a>
              </div>

              <div className="sb-hero-note">
                <span className="sb-note-icon">✳</span>
                Built by students. Inspired by communication.
              </div>
            </div>

            <div className="sb-hero-visual" aria-label="Handora visual artwork">
              <div className="sb-orbit sb-orbit-one" />
              <div className="sb-orbit sb-orbit-two" />
              <div className="sb-orbit sb-orbit-three" />
              <div className="sb-hero-glow" />

              <div className="sb-floating-card sb-floating-card-top">
                <span className="sb-card-icon">◉</span>
                <div>
                  <strong>Computer vision</strong>
                  <small>Visual sign analysis</small>
                </div>
              </div>

              <div className="sb-hand-art">
                <img
                  className="sb-hand-image"
                  src="/handora-hand.svg"
                  alt="Open palm hand illustration"
                />
                <div className="sb-hand-spark sb-spark-one">✳</div>
                <div className="sb-hand-spark sb-spark-two">✦</div>
                <div className="sb-hand-spark sb-spark-three">·</div>
              </div>

              <div className="sb-floating-card sb-floating-card-bottom">
                <span className="sb-card-icon sb-card-icon-purple">✦</span>
                <div>
                  <strong>Handora AI</strong>
                  <small>Learning through signs</small>
                </div>
                <span className="sb-card-live">●</span>
              </div>

              <div className="sb-visual-caption">
                <span>01 /</span> TECHNOLOGY MEETS COMMUNICATION
              </div>
            </div>
          </div>

          <a className="sb-scroll-cue" href="#about">
            <span className="sb-scroll-line" />
            SCROLL TO EXPLORE
          </a>
        </section>

        {/* ABOUT */}
        <section className="sb-section sb-about" id="about">
          <div className="sb-section-label">
            <span>01</span>
            <span>ABOUT HANDORA</span>
          </div>

          <div className="sb-about-grid">
            <div>
              <h2 className="sb-section-heading">
                Communication
                <br />
                deserves <span>more ways.</span>
              </h2>
            </div>

            <div className="sb-about-copy">
              <p>
                Communication is an important part of everyday life, but
                understanding hand signs can be challenging for people who
                have not learned them.
              </p>

              <p>
                Handora is a student project that explores the use of
                artificial intelligence and computer vision to recognize
                selected hand signs. Our goal is to make sign-recognition
                technology easier to explore, practice, and understand.
              </p>

              <div className="sb-about-highlight">
                <span>✳</span>
                <p>
                  Our idea is simple: use technology to create more
                  opportunities for learning and communication.
                </p>
              </div>
            </div>
          </div>

          <div className="sb-feature-grid">
            {features.map((feature) => (
              <article className="sb-feature-card" key={feature.number}>
                <div className="sb-feature-top">
                  <span className="sb-feature-number">{feature.number}</span>
                  <span className="sb-feature-icon">{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="sb-feature-line" />
              </article>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="sb-section sb-process" id="how-it-works">
          <div className="sb-section-label">
            <span>02</span>
            <span>HOW IT WORKS</span>
          </div>

          <div className="sb-process-heading">
            <h2 className="sb-section-heading">
              Three steps.
              <br />
              <span>One learning journey.</span>
            </h2>
            <p>
              Explore how visual input and AI come together in the Handora
              experience.
            </p>
          </div>

          <div className="sb-steps">
            {steps.map((step) => (
              <article className="sb-step" key={step.number}>
                <div className="sb-step-number">{step.number}</div>
                <div className="sb-step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <span className="sb-step-arrow">↗</span>
              </article>
            ))}
          </div>

          <div className="sb-process-note">
            <span>ⓘ</span>
            Recognition depends on the signs supported by the current model.
            Handora is a student project and is not a substitute for a
            qualified sign-language interpreter.
          </div>
        </section>

        {/* TRANSLATOR */}
        <section className="sb-section sb-translator" id="translator">
          <div className="sb-section-label">
            <span>03</span>
            <span>TRY THE PROJECT</span>
          </div>

          <div className="sb-translator-heading">
            <div>
              <h2 className="sb-section-heading">
                Your turn to
                <br />
                <span>explore.</span>
              </h2>
              <p>
                Choose a tool below to try the sign-recognition features.
              </p>
            </div>

            <div className="sb-workspace-status">
              <span className="sb-status-dot" />
              INTERACTIVE WORKSPACE
            </div>
          </div>

          <div className="sb-workspace">
            <div className="sb-workspace-sidebar">
              <div className="sb-workspace-label">WORKSPACE</div>

              {[
                ["camera", "◉", "Live camera", "Recognize signs live"],
                ["image", "▧", "Upload image", "Analyze a picture"],
                ["video", "▷", "Upload video", "Test a video file"],
                ["learn", "✳", "Learning mode", "Practice and explore"],
              ].map(([tab, icon, title, description]) => (
                <button
                  key={tab}
                  type="button"
                  className={`sb-tool-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <span className="sb-tool-icon">{icon}</span>
                  <span>
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>
                  <span className="sb-tab-arrow">↗</span>
                </button>
              ))}

              <div className="sb-sidebar-bottom">
                <span className="sb-sidebar-spark">✳</span>
                <p>
                  Every sign is an opportunity to learn something new.
                </p>
              </div>
            </div>

            <div className="sb-workspace-main">
              <div className="sb-workspace-main-top">
                <div>
                  <span className="sb-workspace-overline">
                    HANDORA / TOOL
                  </span>
                  <h3>
                    {{
                      camera: "Live camera",
                      image: "Image recognition",
                      video: "Video recognition",
                      learn: "Learning mode",
                    }[activeTab]}
                  </h3>
                </div>
                <span className="sb-workspace-tag">BETA PROJECT</span>
              </div>

              <div className="sb-tool-content">
                {activeTab === "camera" && <LiveCamera />}
                {activeTab === "image" && <ImageUpload />}
                {activeTab === "video" && <VideoUpload />}
                {activeTab === "learn" && <Teach />}
              </div>

              <div className="sb-workspace-footer">
                <span>✳ HANDORA</span>
                <span>Student project · AI & computer vision</span>
              </div>
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="sb-section sb-team" id="team">
          <div className="sb-section-label">
            <span>04</span>
            <span>MEET THE TEAM</span>
          </div>

          <div className="sb-team-heading">
            <h2 className="sb-section-heading">
              Different backgrounds.
              <br />
              <span>One shared vision.</span>
            </h2>
            <p>
              We are a team of four students at the American University of Phnom Penh (AUPP), and this is our final project for the AI Fundamentals course. We shared the work between AI training, development, and documentation and presentation. Together we created a translator that turns hand signs into text and speech
            </p>
          </div>

          <div className="sb-team-list">
            {team.map((member) => (
              <article className="sb-team-row" key={member.number}>
                <span className="sb-team-number">{member.number}</span>
                {renderTeamPhoto(member)}

                <div className="sb-team-person">
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                  <span className="sb-team-major">{member.major}</span>
                </div>

                <span className="sb-team-focus">{member.focus}</span>
                <span className="sb-team-arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </section>

        {/* FEEDBACK */}
        <section className="sb-section sb-feedback" id="feedback">
          <div className="sb-feedback-card">
            <div className="sb-feedback-decoration">✳</div>

            <div className="sb-section-label">
              <span>05</span>
              <span>SHARE YOUR THOUGHTS</span>
            </div>

            <h2 className="sb-section-heading">
              Help us make
              <br />
              <span>Handora better.</span>
            </h2>

            <p>
              Have an idea, a suggestion, or something you noticed while
              exploring? We would love to hear your thoughts.
            </p>

            {feedbackSent && (
              <div className="sb-feedback-success" role="status">
                <span>✓</span>
                Thank you! Your feedback has been added below.
                <button
                  type="button"
                  onClick={() => setFeedbackSent(false)}
                >
                  Send another
                </button>
              </div>
            )}

            {!feedbackSent && (
              <form className="sb-feedback-form" onSubmit={handleFeedback}>
                <label htmlFor="sb-feedback-input">Your feedback</label>
                <textarea
                  id="sb-feedback-input"
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder="Share your thoughts with our team..."
                  rows={4}
                  required
                />
                <button
                  className="sb-button sb-button-primary"
                  type="submit"
                >
                  Submit feedback <span>↗</span>
                </button>
                <small>
                  Feedback appears on this page for the current session.
                  It is not permanently saved or shared between visitors.
                </small>
              </form>
            )}

            <div className="sb-feedback-list" aria-live="polite">
              <h3>Community feedback</h3>

              {feedbackList.length === 0 ? (
                <p className="sb-feedback-empty">
                  Be the first to share your thoughts!
                </p>
              ) : (
                feedbackList.map((item) => (
                  <article className="sb-feedback-item" key={item.id}>
                    <span className="sb-feedback-item-icon">✳</span>
                    <p>{item.message}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="sb-closing">
          <div className="sb-closing-spark sb-closing-spark-one">✳</div>
          <div className="sb-closing-spark sb-closing-spark-two">✦</div>

          <div className="sb-closing-content">
            <span className="sb-closing-eyebrow">
              SMALL SIGNS. BIG POSSIBILITIES.
            </span>
            <h2>
              Let's make
              <br />
              communication
              <br />
              <span>more accessible.</span>
            </h2>
            <button
              type="button"
              className="sb-button sb-button-light"
              onClick={() => openTranslator("camera")}
            >
              Explore Handora <span>↗</span>
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="sb-footer">
        <a className="sb-brand sb-footer-brand" href="#home">
          <span className="sb-brand-mark">✳</span>
          <span>
            HANDORA<span className="sb-brand-dot">.</span>
          </span>
        </a>

        <p>
          A student-built exploration of AI, hand signs, and communication.
        </p>

        <div className="sb-footer-links">
          <a href="#about">About</a>
          <a href="#translator">Try Handora</a>
          <a href="#team">Our team</a>
          <a href="#feedback">Feedback</a>
        </div>

        <div className="sb-footer-bottom">
          <span>© {new Date().getFullYear()} Handora Team</span>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}

export default App;

