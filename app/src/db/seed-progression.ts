import type { ProgressionEntry, ClassLevel, Term, Sequence } from '../types';

const generateId = () => crypto.randomUUID();

export function physicsProgression(subjectId: string): ProgressionEntry[] {
  return [
    ...createForm1Progression(subjectId),
    ...createForm2Progression(subjectId),
    ...createForm3Progression(subjectId),
    ...createForm4Progression(subjectId),
    ...createForm5Progression(subjectId)
  ];
}

function createForm2Progression(subjectId: string): ProgressionEntry[] {
  const data = [
    { week: 1, term: 1, seq: 1, module: 'The World of Science', chapter: 'Scientific Method', lesson: 'First contact', duration: 1 },
    { week: 2, term: 1, seq: 1, module: 'The World of Science', chapter: 'Scientific Method Part 2', lesson: 'Collecting data', duration: 2 },
    { week: 3, term: 1, seq: 1, module: 'The World of Science', chapter: 'Scientific Method Part 2', lesson: 'Interpreting data', duration: 2 },
    { week: 4, term: 1, seq: 1, module: 'The World of Science', chapter: 'Simple application of measurements', lesson: 'Predicting and evaluating', duration: 2 },
    { week: 5, term: 1, seq: 1, module: 'The World of Science', chapter: 'Simple application of measurements', lesson: 'Measurement of speed and density', duration: 3 },
    { week: 6, term: 1, seq: 1, module: 'Evaluation', chapter: '', lesson: 'FIRST EVALUATION', duration: 2, isEval: true },
    { week: 7, term: 1, seq: 2, module: 'Matter: Properties and Transformation', chapter: 'Change of state', lesson: 'Physical state of matter', duration: 2 },
    { week: 8, term: 1, seq: 2, module: 'Matter: Properties and Transformation', chapter: 'Temperature', lesson: 'Temperature measurement', duration: 2 },
    { week: 9, term: 1, seq: 2, module: 'Matter: Properties and Transformation', chapter: 'Insulation', lesson: 'Thermal and electrical insulation', duration: 2 },
    { week: 10, term: 1, seq: 2, module: 'Matter: Properties and Transformation', chapter: 'Action of heat', lesson: 'Use of candle', duration: 2 },
    { week: 11, term: 1, seq: 2, module: 'Evaluation', chapter: '', lesson: 'INTEGRATION AND EVALUATION', duration: 2, isEval: true },
    { week: 12, term: 1, seq: 2, module: 'HOLIDAY', chapter: '', lesson: 'CHRISTMAS BREAK', duration: 0, isHoliday: true },
    { week: 13, term: 2, seq: 3, module: 'Matter: Properties and Transformation', chapter: 'Action of electricity', lesson: 'Use of a bulb in simple circuit', duration: 2 },
    { week: 14, term: 2, seq: 3, module: 'Energy: Applications and Uses', chapter: 'Energy needs', lesson: 'Sources and uses of energy', duration: 2 },
    { week: 15, term: 2, seq: 3, module: 'Energy: Applications and Uses', chapter: 'Renewable energy', lesson: 'Solar panel for heating', duration: 2 },
    { week: 16, term: 2, seq: 3, module: 'Energy: Applications and Uses', chapter: 'Electricity', lesson: 'Electricity for the home', duration: 2 },
    { week: 17, term: 2, seq: 3, module: 'Energy: Applications and Uses', chapter: 'Light', lesson: 'Sources of Light', duration: 2 },
    { week: 18, term: 2, seq: 3, module: 'Evaluation', chapter: '', lesson: 'INTEGRATION AND EVALUATION', duration: 2, isEval: true },
    { week: 19, term: 2, seq: 4, module: 'Energy: Applications and Uses', chapter: 'Light', lesson: 'Types of light receivers', duration: 2 },
    { week: 20, term: 2, seq: 4, module: 'Energy: Applications and Uses', chapter: 'Energy exchange', lesson: 'Linking energy forms', duration: 2 },
    { week: 21, term: 2, seq: 4, module: 'Energy: Applications and Uses', chapter: 'Motion', lesson: 'Distance, time and speed', duration: 2 },
    { week: 22, term: 2, seq: 4, module: 'Health Education', chapter: 'Pressure', lesson: 'Pressure in liquids', duration: 2 },
    { week: 23, term: 2, seq: 4, module: 'Evaluation', chapter: '', lesson: 'INTEGRATION AND EVALUATION', duration: 2, isEval: true },
    { week: 24, term: 2, seq: 4, module: 'HOLIDAY', chapter: '', lesson: 'EASTER HOLIDAY', duration: 0, isHoliday: true },
    { week: 25, term: 3, seq: 5, module: 'Health Education', chapter: 'Muscle stress', lesson: 'Sports and physical education', duration: 2 },
    { week: 26, term: 3, seq: 5, module: 'Health Education', chapter: 'Lenses', lesson: 'Types of lenses and their uses', duration: 3 },
    { week: 27, term: 3, seq: 5, module: 'Environmental Education', chapter: 'Radiation', lesson: 'Radiation from the sun', duration: 2 },
    { week: 28, term: 3, seq: 5, module: 'Environmental Education', chapter: 'Weather', lesson: 'Global warming and climate change', duration: 2 },
    { week: 29, term: 3, seq: 5, module: 'Technology', chapter: 'Project', lesson: 'Definition and planning steps', duration: 3 },
    { week: 30, term: 3, seq: 5, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 2, isEval: true },
    { week: 31, term: 3, seq: 6, module: 'Technology', chapter: 'Project', lesson: 'Feasibility studies', duration: 3 },
    { week: 32, term: 3, seq: 6, module: 'Technology', chapter: 'Project', lesson: 'Technical diagram', duration: 3 },
    { week: 33, term: 3, seq: 6, module: 'Technology', chapter: 'Project', lesson: 'Realization of a project', duration: 3 },
    { week: 34, term: 3, seq: 6, module: 'Technology', chapter: 'Project', lesson: 'Observing colours of light', duration: 3 },
    { week: 35, term: 3, seq: 6, module: 'Technology', chapter: 'Project', lesson: 'Project completion', duration: 3 },
    { week: 36, term: 3, seq: 6, module: 'Evaluation', chapter: '', lesson: 'END OF YEAR EXAMINATION', duration: 2, isEval: true }
  ];

  return data.map(d => ({
    id: generateId(),
    subjectId,
    classLevel: 'Form 2' as ClassLevel,
    term: d.term as Term,
    weekNumber: d.week,
    sequence: d.seq as Sequence,
    moduleName: d.module,
    chapter: d.chapter,
    lessonTitle: d.lesson,
    duration: d.duration,
    isEvaluation: d.isEval || false,
    isHoliday: d.isHoliday || false
  }));
}

function createForm3Progression(subjectId: string): ProgressionEntry[] {
  const data = [
    { week: 1, term: 1, seq: 1, module: 'Heat', chapter: 'Introduction', lesson: 'Concept of heat and temperature', duration: 3 },
    { week: 2, term: 1, seq: 1, module: 'Heat', chapter: 'Thermometry', lesson: 'Thermometric properties', duration: 3 },
    { week: 3, term: 1, seq: 1, module: 'Heat', chapter: 'Calorimetry', lesson: 'Heat capacity and specific heat', duration: 3 },
    { week: 4, term: 1, seq: 1, module: 'Heat', chapter: 'Latent heat', lesson: 'Latent heat and cooling effect', duration: 3 },
    { week: 5, term: 1, seq: 1, module: 'Heat', chapter: 'Heat transfer', lesson: 'Conduction, convection, radiation', duration: 3 },
    { week: 6, term: 1, seq: 1, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 3, isEval: true },
    { week: 7, term: 1, seq: 2, module: 'Waves', chapter: 'Properties of waves', lesson: 'Definition and classification', duration: 3 },
    { week: 8, term: 1, seq: 2, module: 'Waves', chapter: 'Properties of waves', lesson: 'Reflection, refraction, diffraction', duration: 3 },
    { week: 9, term: 1, seq: 2, module: 'Waves', chapter: 'Sound waves', lesson: 'Production and transmission of sound', duration: 3 },
    { week: 10, term: 1, seq: 2, module: 'Waves', chapter: 'Sound waves', lesson: 'Characteristics and speed measurement', duration: 3 },
    { week: 11, term: 1, seq: 2, module: 'Waves', chapter: 'Vibration', lesson: 'Vibration in strings. Resonance', duration: 3 },
    { week: 12, term: 1, seq: 2, module: 'HOLIDAY', chapter: '', lesson: 'CHRISTMAS BREAK', duration: 0, isHoliday: true },
    { week: 13, term: 2, seq: 3, module: 'Electrical Energy', chapter: 'Electrostatics', lesson: 'Types of charge', duration: 3 },
    { week: 14, term: 2, seq: 3, module: 'Electrical Energy', chapter: 'Electrostatics', lesson: 'Coulombs law', duration: 3 },
    { week: 15, term: 2, seq: 3, module: 'Electrical Energy', chapter: 'Current electricity', lesson: 'Electric current. EMF and PD', duration: 3 },
    { week: 16, term: 2, seq: 3, module: 'Electrical Energy', chapter: 'Electric circuits', lesson: 'Resistance. Ohms law', duration: 3 },
    { week: 17, term: 2, seq: 3, module: 'Electrical Energy', chapter: 'Electric circuits', lesson: 'Series and parallel circuits', duration: 3 },
    { week: 18, term: 2, seq: 3, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 3, isEval: true },
    { week: 19, term: 2, seq: 4, module: 'Electrical Energy', chapter: 'DC and AC', lesson: 'Direct and alternating current', duration: 3 },
    { week: 20, term: 2, seq: 4, module: 'Electrical Energy', chapter: 'DC and AC', lesson: 'Power and energy consumption', duration: 3 },
    { week: 21, term: 2, seq: 4, module: 'Electrical Energy', chapter: 'House wiring', lesson: 'House wiring basics', duration: 3 },
    { week: 22, term: 2, seq: 4, module: 'Electrical Energy', chapter: 'House wiring', lesson: 'Safety precautions', duration: 3 },
    { week: 23, term: 2, seq: 4, module: 'Electrical Energy', chapter: 'CRO', lesson: 'Cathode ray oscilloscope', duration: 3 },
    { week: 24, term: 2, seq: 4, module: 'HOLIDAY', chapter: '', lesson: 'EASTER HOLIDAY', duration: 0, isHoliday: true },
    { week: 25, term: 3, seq: 5, module: 'Projects', chapter: 'Technical drawing', lesson: 'Reading technical drawings', duration: 3 },
    { week: 26, term: 3, seq: 5, module: 'Projects', chapter: 'Technical drawing', lesson: 'Cross-sections and plans', duration: 3 },
    { week: 27, term: 3, seq: 5, module: 'Projects', chapter: 'Construction', lesson: 'Construction of devices', duration: 3 },
    { week: 28, term: 3, seq: 5, module: 'Projects', chapter: 'Experiments', lesson: 'Heat conduction experiments', duration: 3 },
    { week: 29, term: 3, seq: 5, module: 'Projects', chapter: 'Experiments', lesson: 'Electrical energy consumption', duration: 3 },
    { week: 30, term: 3, seq: 5, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 3, isEval: true },
    { week: 31, term: 3, seq: 6, module: 'Projects', chapter: 'Projects', lesson: 'Project work', duration: 3 },
    { week: 32, term: 3, seq: 6, module: 'Projects', chapter: 'Projects', lesson: 'Project completion', duration: 3 },
    { week: 33, term: 3, seq: 6, module: 'Projects', chapter: 'Projects', lesson: 'Project presentation', duration: 3 },
    { week: 34, term: 3, seq: 6, module: 'Projects', chapter: 'Projects', lesson: 'Project evaluation', duration: 3 },
    { week: 35, term: 3, seq: 6, module: 'Revision', chapter: '', lesson: 'General revision', duration: 3 },
    { week: 36, term: 3, seq: 6, module: 'Evaluation', chapter: '', lesson: 'END OF YEAR EXAMINATION', duration: 3, isEval: true }
  ];

  return data.map(d => ({
    id: generateId(),
    subjectId,
    classLevel: 'Form 3' as ClassLevel,
    term: d.term as Term,
    weekNumber: d.week,
    sequence: d.seq as Sequence,
    moduleName: d.module,
    chapter: d.chapter,
    lessonTitle: d.lesson,
    duration: d.duration,
    isEvaluation: d.isEval || false,
    isHoliday: d.isHoliday || false
  }));
}

function createForm4Progression(subjectId: string): ProgressionEntry[] {
  const data = [
    { week: 1, term: 1, seq: 1, module: 'Energy', chapter: 'Heat', lesson: 'Concept of heat and temperature', duration: 3 },
    { week: 2, term: 1, seq: 1, module: 'Energy', chapter: 'Thermometry', lesson: 'Thermometry and calibration', duration: 3 },
    { week: 3, term: 1, seq: 1, module: 'Energy', chapter: 'Calorimetry', lesson: 'Heat capacity and specific heat', duration: 3 },
    { week: 4, term: 1, seq: 1, module: 'Energy', chapter: 'Latent heat', lesson: 'Latent heat and cooling effect', duration: 3 },
    { week: 5, term: 1, seq: 1, module: 'Energy', chapter: 'Heat transfer', lesson: 'Conduction, convection, radiation', duration: 3 },
    { week: 6, term: 1, seq: 1, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 3, isEval: true },
    { week: 7, term: 1, seq: 2, module: 'Waves', chapter: 'Properties', lesson: 'Definition and wave equation', duration: 3 },
    { week: 8, term: 1, seq: 2, module: 'Waves', chapter: 'Stationary waves', lesson: 'Stationary waves and harmonics', duration: 3 },
    { week: 9, term: 1, seq: 2, module: 'Waves', chapter: 'Sound', lesson: 'Production and characteristics', duration: 3 },
    { week: 10, term: 1, seq: 2, module: 'Waves', chapter: 'Sound', lesson: 'Speed of sound measurement', duration: 3 },
    { week: 11, term: 1, seq: 2, module: 'Waves', chapter: 'Vibration', lesson: 'Vibrating strings and resonance', duration: 3 },
    { week: 12, term: 1, seq: 2, module: 'HOLIDAY', chapter: '', lesson: 'CHRISTMAS BREAK', duration: 0, isHoliday: true },
    { week: 13, term: 2, seq: 3, module: 'Electrical Energy', chapter: 'Electrostatics', lesson: 'Types of charge, Coulombs law', duration: 3 },
    { week: 14, term: 2, seq: 3, module: 'Electrical Energy', chapter: 'Electrostatics', lesson: 'Electric field, applications', duration: 3 },
    { week: 15, term: 2, seq: 3, module: 'Electrical Energy', chapter: 'Current', lesson: 'Electric current, EMF, PD', duration: 3 },
    { week: 16, term: 2, seq: 3, module: 'Electrical Energy', chapter: 'Circuits', lesson: 'Resistance, Ohms law', duration: 3 },
    { week: 17, term: 2, seq: 3, module: 'Electrical Energy', chapter: 'Circuits', lesson: 'Series and parallel circuits', duration: 3 },
    { week: 18, term: 2, seq: 3, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 3, isEval: true },
    { week: 19, term: 2, seq: 4, module: 'Electrical Energy', chapter: 'DC and AC', lesson: 'DC and AC, power calculations', duration: 3 },
    { week: 20, term: 2, seq: 4, module: 'Electrical Energy', chapter: 'Energy', lesson: 'Energy consumption, KWH', duration: 3 },
    { week: 21, term: 2, seq: 4, module: 'Electrical Energy', chapter: 'Wiring', lesson: 'House wiring, fuses', duration: 3 },
    { week: 22, term: 2, seq: 4, module: 'Electrical Energy', chapter: 'Wiring', lesson: 'Safety precautions', duration: 3 },
    { week: 23, term: 2, seq: 4, module: 'Electrical Energy', chapter: 'CRO', lesson: 'Cathode ray oscilloscope', duration: 3 },
    { week: 24, term: 2, seq: 4, module: 'HOLIDAY', chapter: '', lesson: 'EASTER HOLIDAY', duration: 0, isHoliday: true },
    { week: 25, term: 3, seq: 5, module: 'Projects', chapter: 'Drawing', lesson: 'Technical drawing', duration: 3 },
    { week: 26, term: 3, seq: 5, module: 'Projects', chapter: 'Drawing', lesson: 'Cross-sections and plans', duration: 3 },
    { week: 27, term: 3, seq: 5, module: 'Projects', chapter: 'Project', lesson: 'Project planning', duration: 3 },
    { week: 28, term: 3, seq: 5, module: 'Projects', chapter: 'Project', lesson: 'Project work', duration: 3 },
    { week: 29, term: 3, seq: 5, module: 'Projects', chapter: 'Project', lesson: 'Project completion', duration: 3 },
    { week: 30, term: 3, seq: 5, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 3, isEval: true },
    { week: 31, term: 3, seq: 6, module: 'Projects', chapter: 'Project', lesson: 'Project presentation', duration: 3 },
    { week: 32, term: 3, seq: 6, module: 'Projects', chapter: 'Project', lesson: 'Project evaluation', duration: 3 },
    { week: 33, term: 3, seq: 6, module: 'Revision', chapter: '', lesson: 'General revision', duration: 3 },
    { week: 34, term: 3, seq: 6, module: 'Revision', chapter: '', lesson: 'General revision', duration: 3 },
    { week: 35, term: 3, seq: 6, module: 'Revision', chapter: '', lesson: 'General revision', duration: 3 },
    { week: 36, term: 3, seq: 6, module: 'Evaluation', chapter: '', lesson: 'END OF YEAR EXAMINATION', duration: 3, isEval: true }
  ];

  return data.map(d => ({
    id: generateId(),
    subjectId,
    classLevel: 'Form 4' as ClassLevel,
    term: d.term as Term,
    weekNumber: d.week,
    sequence: d.seq as Sequence,
    moduleName: d.module,
    chapter: d.chapter,
    lessonTitle: d.lesson,
    duration: d.duration,
    isEvaluation: d.isEval || false,
    isHoliday: d.isHoliday || false
  }));
}

function createForm5Progression(subjectId: string): ProgressionEntry[] {
  const data = [
    { week: 1, term: 1, seq: 1, module: 'Fields', chapter: 'Magnets', lesson: 'Introduction to magnetism', duration: 3 },
    { week: 2, term: 1, seq: 1, module: 'Fields', chapter: 'Magnets', lesson: 'Magnetic properties and laws', duration: 3 },
    { week: 3, term: 1, seq: 1, module: 'Fields', chapter: 'Magnetic Field', lesson: 'Magnetic field lines and flux', duration: 3 },
    { week: 4, term: 1, seq: 1, module: 'Fields', chapter: 'Magnetic effect of current', lesson: 'Magnetic field from current', duration: 3 },
    { week: 5, term: 1, seq: 1, module: 'Fields', chapter: 'Magnetic effect of current', lesson: 'Force on current-carrying conductor', duration: 3 },
    { week: 6, term: 1, seq: 1, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 3, isEval: true },
    { week: 7, term: 1, seq: 2, module: 'Fields', chapter: 'Electromagnetic Induction', lesson: 'Faradays and Lenzs laws', duration: 3 },
    { week: 8, term: 1, seq: 2, module: 'Fields', chapter: 'Electromagnetic Induction', lesson: 'Transformers', duration: 3 },
    { week: 9, term: 1, seq: 2, module: 'Fields', chapter: 'Alternating Current', lesson: 'AC generation and RMS values', duration: 3 },
    { week: 10, term: 1, seq: 2, module: 'Fields', chapter: 'Alternating Current', lesson: 'Power in AC circuits', duration: 3 },
    { week: 11, term: 1, seq: 2, module: 'Evaluation', chapter: '', lesson: 'INTEGRATION AND EVALUATION', duration: 3, isEval: true },
    { week: 12, term: 1, seq: 2, module: 'HOLIDAY', chapter: '', lesson: 'CHRISTMAS BREAK', duration: 0, isHoliday: true },
    { week: 13, term: 2, seq: 3, module: 'Modern Physics', chapter: 'The Atom', lesson: 'Bohr model and electron properties', duration: 3 },
    { week: 14, term: 2, seq: 3, module: 'Modern Physics', chapter: 'The Nucleus', lesson: 'Nuclear model and notation', duration: 3 },
    { week: 15, term: 2, seq: 3, module: 'Modern Physics', chapter: 'Radioactivity', lesson: 'Alpha, beta, gamma radiation', duration: 3 },
    { week: 16, term: 2, seq: 3, module: 'Modern Physics', chapter: 'Radioactivity', lesson: 'Half-life and nuclear equations', duration: 3 },
    { week: 17, term: 2, seq: 3, module: 'Modern Physics', chapter: 'Radioisotopes', lesson: 'Uses of radioisotopes', duration: 3 },
    { week: 18, term: 2, seq: 3, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 3, isEval: true },
    { week: 19, term: 2, seq: 4, module: 'Modern Physics', chapter: 'Nuclear Energy', lesson: 'Fusion and fission', duration: 3 },
    { week: 20, term: 2, seq: 4, module: 'Mechanics', chapter: 'Scalars and Vectors', lesson: 'Vector addition and resolution', duration: 3 },
    { week: 21, term: 2, seq: 4, module: 'Mechanics', chapter: 'Forces', lesson: 'Types of forces. Free body diagrams', duration: 3 },
    { week: 22, term: 2, seq: 4, module: 'Mechanics', chapter: 'Newtons Laws', lesson: 'Newtons laws of motion', duration: 3 },
    { week: 23, term: 2, seq: 4, module: 'Mechanics', chapter: 'Newtons Laws', lesson: 'Momentum and F=ma', duration: 3 },
    { week: 24, term: 2, seq: 4, module: 'HOLIDAY', chapter: '', lesson: 'EASTER HOLIDAY', duration: 0, isHoliday: true },
    { week: 25, term: 3, seq: 5, module: 'Mechanics', chapter: 'Moment', lesson: 'Moment of a force. Couples', duration: 3 },
    { week: 26, term: 3, seq: 5, module: 'Mechanics', chapter: 'Linear motion', lesson: 'Distance, speed, velocity, acceleration', duration: 3 },
    { week: 27, term: 3, seq: 5, module: 'Mechanics', chapter: 'Linear motion', lesson: 'Equations of motion', duration: 3 },
    { week: 28, term: 3, seq: 5, module: 'Mechanics', chapter: 'Conservation of momentum', lesson: 'Principle and applications', duration: 3 },
    { week: 29, term: 3, seq: 5, module: 'Mechanics', chapter: 'Conservation of momentum', lesson: 'Collisions and explosions', duration: 3 },
    { week: 30, term: 3, seq: 5, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 3, isEval: true },
    { week: 31, term: 3, seq: 6, module: 'Projects', chapter: 'Maintenance', lesson: 'Elements in a repair box', duration: 3 },
    { week: 32, term: 3, seq: 6, module: 'Projects', chapter: 'Dismantling', lesson: 'FOLI and LIFO techniques', duration: 3 },
    { week: 33, term: 3, seq: 6, module: 'Projects', chapter: 'Project', lesson: 'Project work', duration: 3 },
    { week: 34, term: 3, seq: 6, module: 'Projects', chapter: 'Project', lesson: 'Project completion', duration: 3 },
    { week: 35, term: 3, seq: 6, module: 'Revision', chapter: '', lesson: 'General revision', duration: 3 },
    { week: 36, term: 3, seq: 6, module: 'Evaluation', chapter: '', lesson: 'END OF YEAR EXAMINATION', duration: 3, isEval: true }
  ];

  return data.map(d => ({
    id: generateId(),
    subjectId,
    classLevel: 'Form 5' as ClassLevel,
    term: d.term as Term,
    weekNumber: d.week,
    sequence: d.seq as Sequence,
    moduleName: d.module,
    chapter: d.chapter,
    lessonTitle: d.lesson,
    duration: d.duration,
    isEvaluation: d.isEval || false,
    isHoliday: d.isHoliday || false
  }));
}

function createForm1Progression(subjectId: string): ProgressionEntry[] {
  const data = [
    { week: 1, term: 1, seq: 1, module: 'The World of Science', chapter: 'Introduction', lesson: 'First contact with students', duration: 2 },
    { week: 2, term: 1, seq: 1, module: 'The World of Science', chapter: 'Introduction', lesson: 'Definition and branches of science', duration: 2 },
    { week: 3, term: 1, seq: 1, module: 'The World of Science', chapter: 'Introduction to Physics', lesson: 'Definition of physics', duration: 2 },
    { week: 4, term: 1, seq: 1, module: 'The World of Science', chapter: 'Laboratory', lesson: 'Basic equipment in the laboratory', duration: 2 },
    { week: 5, term: 1, seq: 1, module: 'The World of Science', chapter: 'Measurement', lesson: 'Simple measurements', duration: 2 },
    { week: 6, term: 1, seq: 1, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 2, isEval: true },
    { week: 7, term: 1, seq: 2, module: 'Matter: Properties and Transformation', chapter: 'States of matter', lesson: 'Physical state of matter', duration: 2 },
    { week: 8, term: 1, seq: 2, module: 'Matter: Properties and Transformation', chapter: 'Measurement of length', lesson: 'Define length and SI units', duration: 2 },
    { week: 9, term: 1, seq: 2, module: 'Matter: Properties and Transformation', chapter: 'Measurement of mass', lesson: 'Define mass and SI units', duration: 2 },
    { week: 10, term: 1, seq: 2, module: 'Matter: Properties and Transformation', chapter: 'Measurement of weight', lesson: 'Difference between mass and weight', duration: 2 },
    { week: 11, term: 1, seq: 2, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 2, isEval: true },
    { week: 12, term: 1, seq: 2, module: 'HOLIDAY', chapter: '', lesson: 'CHRISTMAS BREAK', duration: 0, isHoliday: true },
    { week: 13, term: 2, seq: 3, module: 'Matter: Properties and Transformation', chapter: 'Measurement of volume', lesson: 'Measure volumes', duration: 3 },
    { week: 14, term: 2, seq: 3, module: 'Matter: Properties and Transformation', chapter: 'Measurement of density', lesson: 'Define density', duration: 2 },
    { week: 15, term: 2, seq: 3, module: 'Matter: Properties and Transformation', chapter: 'Measurement of temperature', lesson: 'Define temperature', duration: 2 },
    { week: 16, term: 2, seq: 3, module: 'Energy: Applications and Uses', chapter: 'Forms of energy', lesson: 'Forms and sources of energy', duration: 2 },
    { week: 17, term: 2, seq: 3, module: 'Energy: Applications and Uses', chapter: 'Energy needs', lesson: 'Daily applications of energy', duration: 2 },
    { week: 18, term: 2, seq: 3, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 2, isEval: true },
    { week: 19, term: 2, seq: 4, module: 'Energy: Applications and Uses', chapter: 'Solar energy', lesson: 'Components and uses', duration: 2 },
    { week: 20, term: 2, seq: 4, module: 'Energy: Applications and Uses', chapter: 'Transmission of energy', lesson: 'Conduction, convection, radiation', duration: 2 },
    { week: 21, term: 2, seq: 4, module: 'Energy: Applications and Uses', chapter: 'Forces and motion', lesson: 'Definition and effects of forces', duration: 2 },
    { week: 22, term: 2, seq: 4, module: 'Energy: Applications and Uses', chapter: 'Motion', lesson: 'Definition and types of motion', duration: 2 },
    { week: 23, term: 2, seq: 4, module: 'Energy: Applications and Uses', chapter: 'Safety', lesson: 'Safety rules', duration: 2 },
    { week: 24, term: 2, seq: 4, module: 'HOLIDAY', chapter: '', lesson: 'EASTER HOLIDAY', duration: 0, isHoliday: true },
    { week: 25, term: 3, seq: 5, module: 'Health Education', chapter: 'Sound', lesson: 'Definition and production of sound', duration: 2 },
    { week: 26, term: 3, seq: 5, module: 'Health Education', chapter: 'Sound', lesson: 'The ear and sound perception', duration: 2 },
    { week: 27, term: 3, seq: 5, module: 'Health Education', chapter: 'Temperature', lesson: 'Measurement of body temperature', duration: 2 },
    { week: 28, term: 3, seq: 5, module: 'Health Education', chapter: 'Sports', lesson: 'Sports and physics', duration: 2 },
    { week: 29, term: 3, seq: 5, module: 'Environmental Education', chapter: 'Radiations', lesson: 'Harmful waste and radiation', duration: 2 },
    { week: 30, term: 3, seq: 5, module: 'Evaluation', chapter: '', lesson: 'EVALUATION', duration: 2, isEval: true },
    { week: 31, term: 3, seq: 6, module: 'Environmental Education', chapter: 'Climate change', lesson: 'Global warming', duration: 2 },
    { week: 32, term: 3, seq: 6, module: 'Environmental Education', chapter: 'Climate change', lesson: 'Greenhouse effect', duration: 2 },
    { week: 33, term: 3, seq: 6, module: 'Technology', chapter: 'Common tools', lesson: 'Machines: identification and uses', duration: 2 },
    { week: 34, term: 3, seq: 6, module: 'Technology', chapter: 'Maintenance', lesson: 'Lubrication, cleaning and repairs', duration: 2 },
    { week: 35, term: 3, seq: 6, module: 'Technology', chapter: 'Technical drawing', lesson: 'Instruments and sample drawings', duration: 2 },
    { week: 36, term: 3, seq: 6, module: 'Evaluation', chapter: '', lesson: 'END OF YEAR EVALUATION', duration: 2, isEval: true }
  ];

  return data.map(d => ({
    id: generateId(),
    subjectId,
    classLevel: 'Form 1' as ClassLevel,
    term: d.term as Term,
    weekNumber: d.week,
    sequence: d.seq as Sequence,
    moduleName: d.module,
    chapter: d.chapter,
    lessonTitle: d.lesson,
    duration: d.duration,
    isEvaluation: d.isEval || false,
    isHoliday: d.isHoliday || false
  }));
}
