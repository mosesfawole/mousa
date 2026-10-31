export async function postContent<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
  });
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The service couldn’t respond. Your work is still here—please try again.",
    );
  }
  if (!response.ok)
    throw new Error(
      data &&
        typeof data === "object" &&
        "error" in data &&
        typeof data.error === "string"
        ? data.error
        : "Something went wrong. Please try again.",
    );
  return data as T;
}
export function errorMessage(error: unknown) {
  if (
    error instanceof Error &&
    ["TimeoutError", "AbortError"].includes(error.name)
  )
    return "This is taking longer than expected. Your work is still here—please try again.";
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}
export function composePost(
  tweet: string,
  hashtags: string[],
  includeTags: boolean,
) {
  return (
    tweet.trim() +
    (includeTags && hashtags.length
      ? "\n\n" + hashtags.map((tag) => "#" + tag.replace(/^#+/, "")).join(" ")
      : "")
  );
}
