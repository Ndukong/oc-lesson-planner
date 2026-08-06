import { db } from './database';
import type { Subject, SchoolCalendar } from '../types';
import { physicsForm1Modules } from './seed-form1';
import { physicsForm2Modules } from './seed-form2';
import { physicsForm3Modules } from './seed-form3';
import { physicsForm4Modules } from './seed-form4';
import { physicsForm5Modules } from './seed-form5';
import { physicsProgression } from './seed-progression';

const generateId = () => crypto.randomUUID();

export async function initializeDatabase() {
  const subjectCount = await db.subjects.count();
  if (subjectCount === 0) {
    await seedPhysicsData();
  }
}

async function seedPhysicsData() {
  const physicsSubject: Subject = {
    id: generateId(),
    name: 'Physics',
    classLevels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'],
    periodsPerWeek: {
      'Form 1': 2,
      'Form 2': 2,
      'Form 3': 3,
      'Form 4': 3,
      'Form 5': 3,
      'Lower Sixth': 6,
      'Upper Sixth': 6
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.subjects.add(physicsSubject);

  const form1Modules = physicsForm1Modules(physicsSubject.id);
  const form2Modules = physicsForm2Modules(physicsSubject.id);
  const form3Modules = physicsForm3Modules(physicsSubject.id);
  const form4Modules = physicsForm4Modules(physicsSubject.id);
  const form5Modules = physicsForm5Modules(physicsSubject.id);

  await db.syllabusModules.bulkAdd([
    ...form1Modules,
    ...form2Modules,
    ...form3Modules,
    ...form4Modules,
    ...form5Modules
  ]);

  const progressionEntries = physicsProgression(physicsSubject.id);
  await db.progressionEntries.bulkAdd(progressionEntries);

  const calendar = createSchoolCalendar();
  await db.schoolCalendars.add(calendar);
}

function createSchoolCalendar(): SchoolCalendar {
  return {
    id: generateId(),
    academicYear: '2025/2026',
    startDate: new Date(2025, 8, 1),
    endDate: new Date(2026, 4, 31),
    holidays: [
      { name: 'Christmas Break', startWeek: 12, endWeek: 13 },
      { name: 'Easter Break', startWeek: 24, endWeek: 25 }
    ],
    sequences: [
      { number: 1, startWeek: 1, endWeek: 6, evaluationWeek: 6 },
      { number: 2, startWeek: 7, endWeek: 12, evaluationWeek: 12 },
      { number: 3, startWeek: 13, endWeek: 18, evaluationWeek: 18 },
      { number: 4, startWeek: 19, endWeek: 24, evaluationWeek: 24 },
      { number: 5, startWeek: 25, endWeek: 30, evaluationWeek: 30 },
      { number: 6, startWeek: 31, endWeek: 36, evaluationWeek: 36 }
    ]
  };
}
