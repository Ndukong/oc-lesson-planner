import type { SyllabusModule, SyllabusTopic, ClassLevel } from '../types';

const generateId = () => crypto.randomUUID();

export function physicsForm5Modules(subjectId: string): SyllabusModule[] {
  return [
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 5' as ClassLevel,
      moduleNumber: 1,
      name: 'Fields: Magnetic Fields and their Effects',
      duration: '18 hours',
      familiesOfSituations: 'Magnets and magnetic effects',
      topics: createForm5Module1Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 5' as ClassLevel,
      moduleNumber: 2,
      name: 'Environmental Protection: Modern Physics',
      duration: '18 hours',
      familiesOfSituations: 'The atom and radiation',
      topics: createForm5Module2Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 5' as ClassLevel,
      moduleNumber: 3,
      name: 'Mechanics',
      duration: '24 hours',
      familiesOfSituations: 'Forces and motion',
      topics: createForm5Module3Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 5' as ClassLevel,
      moduleNumber: 4,
      name: 'Projects and Elementary Engineering',
      duration: '18 hours',
      familiesOfSituations: 'Improving on living conditions',
      topics: createForm5Module4Topics()
    }
  ];
}

function createForm5Module1Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Magnets',
      coreKnowledge: 'What is a magnet. Magnetic properties. Laws of magnetism.',
      competencies: 'Identify magnets and magnetic materials.',
      aptitudes: 'Make and care for magnets.',
      attitudes: 'Appreciate uses of magnets.',
      otherResources: 'Bar magnets, horse shoe magnet, iron filings'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Magnetic Field',
      coreKnowledge: 'Magnetic field lines and flux. Drawing flux patterns.',
      competencies: 'Understand magnetic field concept.',
      aptitudes: 'Draw magnetic flux patterns.',
      attitudes: 'Understanding navigation with compass.',
      otherResources: 'Plotting compass, magnets'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Magnetic effect of current',
      coreKnowledge: 'Magnetic field from current. Solenoids. Force on current-carrying conductor.',
      competencies: 'Understand electromagnetism.',
      aptitudes: 'Sketch magnetic flux patterns for conductors.',
      attitudes: 'Understanding electric motor principle.',
      otherResources: 'Coils, power supply, compass'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Electromagnetic Induction',
      coreKnowledge: 'Faradays law. Lenzs law. Induced EMF. Transformers.',
      competencies: 'Understand electromagnetic induction.',
      aptitudes: 'Calculate transformer ratios.',
      attitudes: 'Understanding energy transfer.',
      otherResources: 'Coils, magnets, transformer model'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Alternating Current',
      coreKnowledge: 'AC generation. RMS values. Power in AC circuits.',
      competencies: 'Understand AC principles.',
      aptitudes: 'Calculate RMS values.',
      attitudes: 'Understanding power transmission.',
      otherResources: 'AC generator model, CRO'
    }
  ];
}

function createForm5Module2Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'The Atom',
      coreKnowledge: 'Bohr model. Electron properties. Charge quantization.',
      competencies: 'Understand atomic structure.',
      aptitudes: 'Calculate charge using Q=Ne.',
      attitudes: 'Appreciate atomic scale.',
      otherResources: 'Atomic models, diagrams'
    },
    {
      id: generateId(),
      moduleId,
      name: 'The Nucleus',
      coreKnowledge: 'Nuclear model. Protons and neutrons. Nuclear notation.',
      competencies: 'Understand nuclear structure.',
      aptitudes: 'Use A=Z+N equation.',
      attitudes: 'Understanding relative sizes.',
      otherResources: 'Nuclear models, periodic table'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Radioactivity',
      coreKnowledge: 'Alpha, beta, gamma radiation. Properties and detection. Half-life.',
      competencies: 'Understand radioactive decay.',
      aptitudes: 'Balance nuclear equations.',
      attitudes: 'Safety with radiation.',
      otherResources: 'GM tube, cloud chamber diagrams'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Radioisotopes',
      coreKnowledge: 'Uses in medicine, agriculture, industry. Background radiation.',
      competencies: 'Understand isotope applications.',
      aptitudes: 'Explain medical uses.',
      attitudes: 'Radiation safety awareness.',
      otherResources: 'Diagrams, application charts'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Nuclear Energy',
      coreKnowledge: 'Fusion and fission. Energy release. Safety and hazards.',
      competencies: 'Understand nuclear energy.',
      aptitudes: 'Compare fusion and fission.',
      attitudes: 'Understanding energy sources.',
      otherResources: 'Nuclear reaction diagrams'
    }
  ];
}

function createForm5Module3Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Scalars and Vectors',
      coreKnowledge: 'Scalar and vector quantities. Vector addition and resolution.',
      competencies: 'Distinguish scalars and vectors.',
      aptitudes: 'Resolve vectors into components.',
      attitudes: 'Analytical thinking.',
      otherResources: 'Vector diagrams, graph paper'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Forces',
      coreKnowledge: 'Types of forces. Contact and non-contact forces. Free body diagrams.',
      competencies: 'Analyze forces on objects.',
      aptitudes: 'Draw free body diagrams.',
      attitudes: 'Understanding force effects.',
      otherResources: 'Spring balance, masses, pulleys'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Newtons Laws',
      coreKnowledge: 'Newtons laws of motion. Momentum. F=ma.',
      competencies: 'Apply Newtons laws.',
      aptitudes: 'Calculate force and momentum.',
      attitudes: 'Understanding real-life applications.',
      otherResources: 'Trolleys, track, timer'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Moment',
      coreKnowledge: 'Moment of a force. Couples. Equilibrium conditions.',
      competencies: 'Calculate moments.',
      aptitudes: 'Apply principle of moments.',
      attitudes: 'Understanding stability.',
      otherResources: 'Metre rule, masses, pivot'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Linear motion',
      coreKnowledge: 'Distance, displacement, speed, velocity, acceleration. Equations of motion.',
      competencies: 'Analyze linear motion.',
      aptitudes: 'Use motion equations.',
      attitudes: 'Understanding motion graphs.',
      otherResources: 'Ticker timer, trolley, track'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Conservation of momentum',
      coreKnowledge: 'Principle of conservation. Collisions. Explosions.',
      competencies: 'Apply conservation principle.',
      aptitudes: 'Calculate collision outcomes.',
      attitudes: 'Understanding real-world applications.',
      otherResources: 'Trolleys, track, masses'
    }
  ];
}

function createForm5Module4Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Maintenance of appliances',
      coreKnowledge: 'Definition of maintenance. Elements in a repair box.',
      competencies: 'Understand maintenance principles.',
      aptitudes: 'Read and exploit labels on appliances.',
      attitudes: 'Care for appliances.',
      otherResources: 'Tester, screwdrivers, soldering iron'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Dismantling and assembling',
      coreKnowledge: 'FOLI and LIFO techniques.',
      competencies: 'Apply dismantling techniques.',
      aptitudes: 'Dismantle and assemble radios, computers.',
      attitudes: 'Methodological action.',
      otherResources: 'Screwdriver, tester, old radios'
    }
  ];
}
