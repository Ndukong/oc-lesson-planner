import { describe, expect, it, vi } from "vitest";
import {
  abortable,
  attemptWithRetry,
  isAbortError
} from "@/services/ai/retry";

function abortErr(): Error {
  return new DOMException("Aborted", "AbortError");
}

describe("isAbortError", () => {
  it("recognises DOMException aborts", () => {
    expect(isAbortError(abortErr())).toBe(true);
  });

  it("recognises plain Errors named AbortError", () => {
    const e = new Error("cancelled");
    e.name = "AbortError";
    expect(isAbortError(e)).toBe(true);
  });

  it("rejects other errors", () => {
    expect(isAbortError(new Error("network down"))).toBe(false);
    expect(isAbortError("weird")).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
  });
});

describe("abortable", () => {
  it("resolves with the underlying value when not aborted", async () => {
    const c = new AbortController();
    await expect(abortable(Promise.resolve(42), c.signal)).resolves.toBe(42);
  });

  it("rejects immediately when the signal is already aborted", async () => {
    const c = new AbortController();
    c.abort();
    await expect(abortable(Promise.resolve(1), c.signal)).rejects.toThrow(abortErr());
  });

  it("rejects when the signal fires while pending", async () => {
    const c = new AbortController();
    const never = new Promise(() => undefined);
    const raced = abortable(never, c.signal);
    setTimeout(() => c.abort(), 5);
    await expect(raced).rejects.toThrow(abortErr());
  });
});

describe("attemptWithRetry", () => {
  it("returns the value when the first attempt succeeds", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    await expect(attemptWithRetry(fn)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries once after a failure and then succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("AI response could not be parsed as JSON."))
      .mockResolvedValueOnce({ ok: true });
    await expect(attemptWithRetry(fn)).resolves.toEqual({ ok: true });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws the last error after exhausting attempts", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("still broken"));
    await expect(attemptWithRetry(fn)).rejects.toThrow("still broken");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("never retries an abort error", async () => {
    const fn = vi.fn().mockRejectedValue(abortErr());
    await expect(attemptWithRetry(fn)).rejects.toThrow(abortErr());
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not call fn when the signal is already aborted", async () => {
    const fn = vi.fn().mockResolvedValue("never");
    const c = new AbortController();
    c.abort();
    await expect(attemptWithRetry(fn, c.signal)).rejects.toThrow(abortErr());
    expect(fn).not.toHaveBeenCalled();
  });
});