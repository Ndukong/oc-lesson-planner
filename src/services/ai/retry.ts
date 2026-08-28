/** True when the error is an AbortController cancellation. */
export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

/**
 * Race a promise against an AbortSignal. The underlying work is not stopped
 * (the Gemini SDK has no abort support), but the caller's await is released
 * immediately with an AbortError.
 */
export function abortable<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  return new Promise<T>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const onAbort = () => reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (err) => {
        signal.removeEventListener("abort", onAbort);
        reject(err);
      }
    );
  });
}

const MAX_ATTEMPTS = 2;

/**
 * Run an async AI call, retrying once on failure (truncated/malformed JSON
 * and transient network errors). Abort cancellations are never retried.
 */
export async function attemptWithRetry<T>(
  fn: () => Promise<T>,
  signal?: AbortSignal
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      return await fn();
    } catch (err) {
      if (isAbortError(err)) throw err;
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      lastError = err;
      if (attempt < MAX_ATTEMPTS) {
        console.warn("[LessonPlanner] AI attempt failed, retrying once:", err);
      }
    }
  }
  throw lastError;
}