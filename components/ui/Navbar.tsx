"use client";
import Brand from "./Brand";
import TabBar from "./TabBar";
export default function Navbar() {
  return (
    <aside className="sidebar">
      <Brand />
      <p className="sidebar-caption">A little room to find your voice.</p>
      <p className="eyebrow sidebar-label">Your workspace</p>
      <TabBar />
      <div className="sidebar-bottom">
        <p className="serif sidebar-quote">
          “Start with something
          <br />
          only you noticed.”
        </p>
        <p className="sidebar-credit">
          An independent project by
          <br />
          <a
            href="https://github.com/mosesfawole"
            target="_blank"
            rel="noreferrer"
          >
            Moses Fawole ↗
          </a>
        </p>
      </div>
    </aside>
  );
}
