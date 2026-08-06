import { useCallback, useEffect, useRef, useState } from "react";

interface AutoSaveResult {
  saving: boolean;
  savedAt: Date | null;
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

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setSaving(true);
    const t = setTimeout(async () => {
      try {
        await onSave(value);
        setSavedAt(new Date());
      } finally {
        setSaving(false);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const flush = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(value);
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  }, [value, onSave]);

  return { saving, savedAt, flush };
}
