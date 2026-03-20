import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="py-6 text-center text-xs"
      style={{
        color: "rgba(255,255,255,0.2)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      © 2026 Mousa — Made by{" "}
      <Link
        href="https://github.com/mosesfawole"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#c084fc" }}
      >
        noname
      </Link>
    </footer>
  );
}
