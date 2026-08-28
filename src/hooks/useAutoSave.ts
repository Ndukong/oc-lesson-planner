import { useCallback, useEffect, useRef, useState } from "react";

interface AutoSaveResult {
  saving: boolean;
  savedAt: Date | null;
  /** Save immediately, cancelling any pending debounced save. */
  flush: () => Promise<void>;
}

export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => Promise<void> | void,
  delay = 1500
): AutoSaveResult {
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const firstRun = useRef(true);

  const valueRef = useRef(value);
  valueRef.current = value;
  const savedRef = useRef<T>(value); // last successfully persisted snapshot
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);

  const doSave = useCallback(async (): Promise<void> => {
    const current = valueRef.current;
    if (current === savedRef.current || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await onSaveRef.current(current);
      savedRef.current = current;
      setSavedAt(new Date());
    } catch (err) {
      console.error("[AutoSave] save failed:", err);
      throw err;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      savedRef.current = value;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void doSave();
    }, delay);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, delay, doSave]);

  // Flush pending changes when the component unmounts (e.g. navigating away
  // from the editor) so the last keystrokes are never lost to the debounce.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (valueRef.current !== savedRef.current && !savingRef.current) {
        void Promise.resolve(onSaveRef.current(valueRef.current)).catch(
          (err) => console.error("[AutoSave] save on unmount failed:", err)
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Best-effort save when the tab/window is closed mid-edit.
  useEffect(() => {
    const handler = () => {
      if (valueRef.current !== savedRef.current && !savingRef.current) {
        void onSaveRef.current(valueRef.current);
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const flush = useCallback(async (): Promise<void> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await doSave();
  }, [doSave]);

  return { saving, savedAt, flush };
}