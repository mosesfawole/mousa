"use client";
export default function ScoreRing({ score }: { score: number }) {
  const value = Number.isFinite(score) ? Math.min(10, Math.max(1, score)) : 1;
  const circumference = 2 * Math.PI * 34;
  return (
    <div
      className="score"
      role="meter"
      aria-label="Writing score"
      aria-valuemin={1}
      aria-valuemax={10}
      aria-valuenow={value}
    >
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          stroke="#e9e6ee"
          strokeWidth="4"
        />
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          stroke="var(--violet)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 10)}
        />
      </svg>
      <span className="score-number">
        {value}
        <small>/10</small>
      </span>
    </div>
  );
}
