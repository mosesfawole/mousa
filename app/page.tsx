import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Check,
  Feather,
  PencilLine,
  ShieldCheck,
} from "lucide-react";
import Brand from "@/components/ui/Brand";
import Footer from "@/components/ui/Footer";
export default function HomePage() {
  return (
    <>
      <nav className="landing-nav" aria-label="Main navigation">
        <Brand />
        <div className="landing-links">
          <a href="#how-it-works">How it works</a>
          <a
            href="https://github.com/mosesfawole/mousa"
            target="_blank"
            rel="noreferrer"
          >
            Behind the build{" "}
            <ArrowUpRight size={12} style={{ display: "inline" }} />
          </a>
          <Link href="/dashboard" className="btn btn-primary">
            Open the studio <ArrowUpRight size={14} />
          </Link>
        </div>
      </nav>
      <main id="main">
        <section className="landing-hero">
          <div>
            <div
              className="eyebrow"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: "#8b9977",
                  borderRadius: "50%",
                }}
              />{" "}
              A writing room for independent minds
            </div>
            <h1 className="serif hero-title">
              Less blank page.
              <br />
              <em>More you.</em>
            </h1>
            <p className="hero-description">
              Turn what you know into something worth sharing. Find an angle,
              shape a draft, and give it a thoughtful second look.
            </p>
            <div className="hero-actions">
              <Link href="/dashboard" className="btn btn-primary">
                Find your next idea <ArrowRight size={15} />
              </Link>
              <a href="#how-it-works" className="btn btn-quiet">
                Take a look around <ArrowUpRight size={14} />
              </a>
            </div>
            <p className="hero-note">
              <Check size={12} /> Explore the sample studio. No account needed.
            </p>
          </div>
          <div
            className="hero-art"
            aria-label="An illustrative preview of the Mousa writing studio"
          >
            <div className="preview-sheet">
              <div className="sheet-top">
                <span className="eyebrow">Inside the studio</span>
                <Feather size={17} color="var(--violet)" />
              </div>
              <h2 className="serif sheet-heading">Something worth saying.</h2>
              <p>
                You don’t need to sound like everyone else.
                <br />
                Start with something only you noticed.
              </p>
              <div className="sheet-prompt">
                <Sparkles size={13} /> A few angles for your next post
              </div>
              <div className="sheet-idea">
                <span>01</span>
                <p>The small decision that made your last project better.</p>
              </div>
              <div className="sheet-idea">
                <span>02</span>
                <p>A lesson you wish someone had told you sooner.</p>
              </div>
              <div className="sheet-idea">
                <span>03</span>
                <p>Something you changed your mind about—and why.</p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 18,
                }}
              >
                <span className="eyebrow" style={{ fontSize: 9 }}>
                  Illustrative sample
                </span>
                <span style={{ fontSize: 11, color: "var(--violet)" }}>
                  Make it a draft ↗
                </span>
              </div>
            </div>
            <div className="sticky-note">
              <PencilLine size={17} style={{ marginBottom: 8 }} />
              <p className="serif">
                A starting point.
                <br />
                Not a script.
              </p>
            </div>
          </div>
        </section>
        <div className="landing-divider">
          <span>
            <Feather size={13} /> Your voice, always
          </span>
          <span>
            <ShieldCheck size={13} /> You decide what to post
          </span>
          <span>
            <PencilLine size={13} /> Room to make it yours
          </span>
        </div>
        <section id="how-it-works" className="process">
          <div className="process-head">
            <div>
              <p className="eyebrow">From a thought to a thoughtful post</p>
              <h2 className="serif">A little help. A lot of you.</h2>
            </div>
            <Link href="/dashboard" className="text-button">
              Step into the studio <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="process-grid">
            {[
              [
                "01",
                "Find your angle",
                "Tell Mousa who you’re writing for and what’s on your mind. Explore a few different ways into the conversation.",
              ],
              [
                "02",
                "Make it your own",
                "Turn an idea into a draft. Edit every word, watch the length, and save the version that sounds like you.",
              ],
              [
                "03",
                "Give it a second look",
                "Review clarity and structure, then consider an alternative. Keep what helps. Leave what doesn’t.",
              ],
            ].map(([number, title, description]) => (
              <div className="process-step" key={number}>
                <span className="eyebrow">{number}</span>
                <h3 className="serif">{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
