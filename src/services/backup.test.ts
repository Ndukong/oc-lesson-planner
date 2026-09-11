import { describe, expect, it } from "vitest";
import {
  applyBackup,
  stripApiKeys,
  validateBackup,
  reviveBackupRecords,
  BACKUP_KIND,
  type BackupFile
} from "@/services/backup";
import type { AISettings } from "@/types";

function validBackup(overrides: Partial<BackupFile> = {}): BackupFile {
  return {
    kind: BACKUP_KIND,
    appVersion: "1.0.0",
    exportedAt: "2026-08-28T10:00:00.000Z",
    subjects: [{ id: "physics", name: "Physics" }],
    syllabusModules: [],
    progressionEntries: [],
    schoolCalendars: [],
    lessonPlans: [{ id: "lp-1", topic: "Light" }],
    aiSettings: [{ id: "default", preferredProvider: "gemini" }],
    teacherProfile: [],
    ...overrides
  };
}

describe("validateBackup", () => {
  it("accepts a well-formed backup and summarises it", () => {
    const res = validateBackup(validBackup());
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.summary.counts.subjects).toBe(1);
    expect(res.summary.counts.lessonPlans).toBe(1);
    expect(res.summary.includesApiKeys).toBe(false);
    expect(res.summary.exportedAt).toBe("2026-08-28T10:00:00.000Z");
  });

  it("detects included API keys", () => {
    const res = validateBackup(
      validBackup({
        aiSettings: [{ id: "default", preferredProvider: "gemini", geminiApiKey: "AIza-secret" }]
      })
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.summary.includesApiKeys).toBe(true);
  });

  it("rejects non-objects and wrong kinds", () => {
    expect(validateBackup("nope").ok).toBe(false);
    expect(validateBackup(42).ok).toBe(false);
    expect(validateBackup({ kind: "something-else", subjects: [] }).ok).toBe(false);
  });

  it("rejects files missing the subjects table", () => {
    const legacy = validBackup();
    delete (legacy as { subjects?: unknown }).subjects;
    expect(validateBackup(legacy).ok).toBe(false);
  });

  it("rejects malformed tables", () => {
    expect(
      validateBackup(validBackup({ lessonPlans: "not-an-array" })).ok
    ).toBe(false);
  });

  it("accepts legacy exports without a kind field", () => {
    const legacy = validBackup();
    delete (legacy as { kind?: string }).kind;
    expect(validateBackup(legacy).ok).toBe(true);
  });
});

describe("reviveBackupRecords", () => {
  it("revives ISO timestamp strings into Date objects", () => {
    const [cal] = reviveBackupRecords<{ startDate: unknown; holidays: unknown[] }>([
      {
        id: "default-calendar",
        startDate: "2025-09-01T00:00:00.000Z",
        holidays: [{ name: "Christmas", startWeek: 13, startDate: "2025-11-24T00:00:00.000Z" }]
      }
    ]);
    expect(cal.startDate).toBeInstanceOf(Date);
    expect((cal.holidays[0] as { startDate: unknown }).startDate).toBeInstanceOf(Date);
  });

  it("leaves plain date strings (YYYY-MM-DD) alone", () => {
    const [plan] = reviveBackupRecords<{ date: unknown; createdAt: unknown }>([
      { id: "lp-1", date: "2026-01-15", createdAt: "2026-01-10T08:30:00.000Z" }
    ]);
    expect(plan.date).toBe("2026-01-15");
    expect(plan.createdAt).toBeInstanceOf(Date);
  });

  it("passes through non-record input", () => {
    expect(reviveBackupRecords([])).toEqual([]);
    expect(reviveBackupRecords([null])).toEqual([null]);
  });
});

describe("applyBackup validation", () => {
  it("throws on invalid backups without touching the db", async () => {
    await expect(applyBackup({ subjects: "nope" })).rejects.toThrow();
    await expect(applyBackup("garbage")).rejects.toThrow();
  });
});

describe("stripApiKeys", () => {
  it("removes keys but keeps the rest of the settings", () => {
    const settings: AISettings[] = [
      {
        id: "default",
        preferredProvider: "openrouter",
        groqApiKey: "gsk-secret",
        geminiApiKey: "AIza-secret",
        openrouterApiKey: "sk-or-secret",
        mistralApiKey: "mistral-secret",
        modelPreference: "openrouter/free",
        autoGenerate: true
      }
    ];
    const [out] = stripApiKeys(settings);
    expect(out.geminiApiKey).toBeUndefined();
    expect(out.groqApiKey).toBeUndefined();
    expect(out.openrouterApiKey).toBeUndefined();
    expect(out.mistralApiKey).toBeUndefined();
    expect(out.preferredProvider).toBe("openrouter");
    expect(out.modelPreference).toBe("openrouter/free");
    expect(out.autoGenerate).toBe(true);
  });
});