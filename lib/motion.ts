// Read on each interaction so a preference change takes effect without a reload.
export function preferredScrollBehavior(): ScrollBehavior {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";
}

export function revealDraft() {
  requestAnimationFrame(() => {
    document.getElementById("draft-text")?.focus({ preventScroll: true });
    document.getElementById("draft-panel")?.scrollIntoView({
      behavior: preferredScrollBehavior(),
      block: "nearest",
    });
  });
}
