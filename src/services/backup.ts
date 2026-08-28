import { db } from "@/db/database";
import { APP_VERSION } from "@/types";
import type {
  AISettings,
  LessonPlan,
  ProgressionEntry,
  SchoolCalendar,
  Subject,
  SyllabusModule,
  TeacherProfile
} from "@/types";
import { downloadText } from "@/utils/format";

export const BACKUP_KIND = "lesson-planner-backup";

const BACKUP_TABLES = [
  "subjects",
  "syllabusModules",
  "progressionEntries",
  "schoolCalendars",
  "lessonPlans",
  "aiSettings",
  "teacherProfile"
] as const;

export type BackupTableName = (typeof BACKUP_TABLES)[number];

export interface BackupFile {
  kind?: string;
  appVersion?: string;
  exportedAt?: string;
  subjects?: unknown;
  syllabusModules?: unknown;
  progressionEntries?: unknown;
  schoolCalendars?: unknown;
  lessonPlans?: unknown;
  aiSettings?: unknown;
  teacherProfile?: unknown;
}

export interface BackupSummary {
  counts: Record<BackupTableName, number>;
  includesApiKeys: boolean;
  exportedAt: string | null;
  appVersion: string | null;
}

/** Strip API keys from AI settings for backups that may leave the device. */
export function stripApiKeys(settings: AISettings[]): AISettings[] {
  return settings.map((s) => ({
    ...s,
    geminiApiKey: undefined,
    groqApiKey: undefined
  }));
}

export async function buildBackup(includeApiKeys: boolean): Promise<BackupFile> {
  const [
    subjects,
    syllabusModules,
    progressionEntries,
    schoolCalendars,
    lessonPlans,
    aiSettingsRaw,
    teacherProfile
  ] = await Promise.all([
    db.subjects.toArray(),
    db.syllabusModules.toArray(),
    db.progressionEntries.toArray(),
    db.schoolCalendars.toArray(),
    db.lessonPlans.toArray(),
    db.aiSettings.toArray(),
    db.teacherProfile.toArray()
  ]);

  return {
    kind: BACKUP_KIND,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    subjects,
    syllabusModules,
    progressionEntries,
    schoolCalendars,
    lessonPlans,
    aiSettings: includeApiKeys ? aiSettingsRaw : stripApiKeys(aiSettingsRaw),
    teacherProfile
  };
}

export function downloadBackup(backup: BackupFile): void {
  downloadText(
    JSON.stringify(backup, null, 2),
    `lesson-planner-backup-${new Date().toISOString().slice(0, 10)}.json`
  );
  markBackupDone();
}

const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function reviveDatesInObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string" && ISO_DATETIME_RE.test(value)) {
      out[key] = new Date(value);
    } else if (isPlainObject(value)) {
      out[key] = reviveDatesInObject(value);
    } else if (Array.isArray(value)) {
      out[key] = value.map((el) =>
        isPlainObject(el) ? reviveDatesInObject(el) : el
      );
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * JSON backups turn Date objects into ISO strings — but calendar math calls
 * methods like .getFullYear() on them. Revive known timestamp strings back
 * into Dates (recursively into nested objects/arrays like calendar holidays).
 */
export function reviveBackupRecords<T>(records: unknown[]): T[] {
  return records.map((rec) =>
    isPlainObject(rec) ? (reviveDatesInObject(rec) as T) : (rec as T)
  );
}

export function validateBackup(json: unknown):
  | { ok: true; summary: BackupSummary; data: BackupFile }
  | { ok: false; error: string } {
  if (!isPlainObject(json)) {
    return { ok: false, error: "This file is not a lesson planner backup." };
  }
  const data = json as BackupFile;
  // Accept both current backups (kind field) and legacy exports (subjects array).
  if (data.kind !== undefined && data.kind !== BACKUP_KIND) {
    return { ok: false, error: "This file is not a lesson planner backup." };
  }
  if (!Array.isArray(data.subjects)) {
    return {
      ok: false,
      error: "This file is missing the subjects table — not a valid backup."
    };
  }
  for (const table of BACKUP_TABLES) {
    const v = data[table];
    if (v !== undefined && !Array.isArray(v)) {
      return { ok: false, error: `Backup table "${table}" is malformed.` };
    }
  }
  const includesApiKeys = ((data.aiSettings ?? []) as AISettings[]).some(
    (s) =>
      (typeof s.geminiApiKey === "string" && s.geminiApiKey.length > 0) ||
      (typeof s.groqApiKey === "string" && s.groqApiKey.length > 0)
  );
  const counts = {} as Record<BackupTableName, number>;
  for (const table of BACKUP_TABLES) {
    counts[table] = (data[table] as unknown[] | undefined)?.length ?? 0;
  }
  return {
    ok: true,
    data,
    summary: {
      counts,
      includesApiKeys,
      exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : null,
      appVersion: typeof data.appVersion === "string" ? data.appVersion : null
    }
  };
}

/** Replace ALL local data with the backup contents (dates revived). */
export async function applyBackup(json: unknown): Promise<BackupSummary> {
  const result = validateBackup(json);
  if (!result.ok) throw new Error(result.error);
  const data = result.data;
  const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

  const revived = {
    subjects: reviveBackupRecords<Subject>(asArray(data.subjects)),
    syllabusModules: reviveBackupRecords<SyllabusModule>(asArray(data.syllabusModules)),
    progressionEntries: reviveBackupRecords<ProgressionEntry>(asArray(data.progressionEntries)),
    schoolCalendars: reviveBackupRecords<SchoolCalendar>(asArray(data.schoolCalendars)),
    lessonPlans: reviveBackupRecords<LessonPlan>(asArray(data.lessonPlans)),
    aiSettings: reviveBackupRecords<AISettings>(asArray(data.aiSettings)),
    teacherProfile: reviveBackupRecords<TeacherProfile>(asArray(data.teacherProfile))
  };

  await db.transaction(
    "rw",
    [
      db.subjects,
      db.syllabusModules,
      db.progressionEntries,
      db.schoolCalendars,
      db.lessonPlans,
      db.aiSettings,
      db.teacherProfile
    ],
    async () => {
      await Promise.all([
        db.subjects.clear(),
        db.syllabusModules.clear(),
        db.progressionEntries.clear(),
        db.schoolCalendars.clear(),
        db.lessonPlans.clear(),
        db.aiSettings.clear(),
        db.teacherProfile.clear()
      ]);
      await Promise.all([
        db.subjects.bulkPut(revived.subjects),
        db.syllabusModules.bulkPut(revived.syllabusModules),
        db.progressionEntries.bulkPut(revived.progressionEntries),
        db.schoolCalendars.bulkPut(revived.schoolCalendars),
        db.lessonPlans.bulkPut(revived.lessonPlans),
        db.aiSettings.bulkPut(revived.aiSettings),
        db.teacherProfile.bulkPut(revived.teacherProfile)
      ]);
    }
  );

  return result.summary;
}

/* ------------------------------------------------------------------ */
/* Reminder tracking (per-device, localStorage)                        */
/* ------------------------------------------------------------------ */

const LAST_BACKUP_KEY = "lesson-planner:lastBackupAt";
const SNOOZE_KEY = "lesson-planner:backupSnoozeUntil";
const REMIND_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

export function markBackupDone(): void {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, Date.now().toString());
  } catch {
    // storage may be unavailable (private mode) — reminder is best-effort
  }
}

export function snoozeBackupReminder(days = 7): void {
  try {
    localStorage.setItem(SNOOZE_KEY, (Date.now() + days * 86400000).toString());
  } catch {
    // ignore
  }
}

export function shouldRemindBackup(hasLessonPlans: boolean): boolean {
  if (!hasLessonPlans) return false;
  try {
    const snoozeUntil = Number(localStorage.getItem(SNOOZE_KEY) ?? 0);
    if (Date.now() < snoozeUntil) return false;
    const last = Number(localStorage.getItem(LAST_BACKUP_KEY) ?? 0);
    return last === 0 || Date.now() - last > REMIND_AFTER_MS;
  } catch {
    return false;
  }
}