import type { SyllabusModule, SyllabusTopic, ClassLevel } from '../types';

const generateId = () => crypto.randomUUID();

export function physicsForm2Modules(subjectId: string): SyllabusModule[] {
  return [
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 2' as ClassLevel,
      moduleNumber: 1,
      name: 'The World of Science',
      duration: '8 hours',
      familiesOfSituations: 'Investigating science',
      topics: createForm2Module1Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 2' as ClassLevel,
      moduleNumber: 2,
      name: 'Matter: Properties and Transformation',
      duration: '12 hours',
      familiesOfSituations: 'Commonly consumed and used products',
      topics: createForm2Module2Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 2' as ClassLevel,
      moduleNumber: 3,
      name: 'Energy: Applications and Uses',
      duration: '16 hours',
      familiesOfSituations: 'Everyday use of energy',
      topics: createForm2Module3Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 2' as ClassLevel,
      moduleNumber: 4,
      name: 'Health Education',
      duration: '4 hours',
      familiesOfSituations: 'Healthy Living',
      topics: createForm2Module4Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 2' as ClassLevel,
      moduleNumber: 5,
      name: 'Environmental Education',
      duration: '4 hours',
      familiesOfSituations: 'Climate change',
      topics: createForm2Module5Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 2' as ClassLevel,
      moduleNumber: 6,
      name: 'Technology',
      duration: '6 hours',
      familiesOfSituations: 'Amelioration of living condition',
      topics: createForm2Module6Topics()
    }
  ];
}

function createForm2Module1Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Scientific Method Part 2',
      coreKnowledge: 'Collecting data, interpreting and concluding. Predicting and evaluating.',
      competencies: 'Practice of scientific methods.',
      aptitudes: 'Be able to collect, analyse, interpret data.',
      attitudes: 'Decision making and critical spirit.',
      otherResources: 'Data collection sheets, graphs, charts'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Simple application of measurements',
      coreKnowledge: 'Density of household things. Speed of movement.',
      competencies: 'Application of measurements in real life.',
      aptitudes: 'Understand why oil floats in water.',
      attitudes: 'Methodological action, Problem solving.',
      otherResources: 'Oil, water, measuring cylinder, stopwatch'
    }
  ];
}

function createForm2Module2Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Temperature',
      coreKnowledge: 'Temperature measurement. Melting point, boiling point.',
      competencies: 'Thermal and electrical insulation.',
      aptitudes: 'Determine physical properties of objects.',
      attitudes: 'Precision, Scientific thinking.',
      otherResources: 'Thermometer, ice, water, heat source'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Change of state',
      coreKnowledge: 'Vaporization, condensation, liquefaction, sublimation.',
      competencies: 'Transformation of matter.',
      aptitudes: 'Show that temperature of melting ice is constant.',
      attitudes: 'Curiosity, observation.',
      otherResources: 'Ice, water, beaker, heat source, thermometer'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Thermal and electrical insulation',
      coreKnowledge: 'Usefulness of thermal and electrical insulation.',
      competencies: 'Application of insulation in daily life.',
      aptitudes: 'Understand insulation properties.',
      attitudes: 'Safety consciousness.',
      otherResources: 'Insulating materials, wires, batteries'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Action of heat on materials',
      coreKnowledge: 'Three states of matter. Keeping bodies cold in warm areas.',
      competencies: 'Explaining electricity and lightning effect on materials.',
      aptitudes: 'Understand thermal expansion.',
      attitudes: 'Curiosity, Scientific thinking.',
      otherResources: 'Various materials, heat source'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Action of electricity on materials',
      coreKnowledge: 'Electric current and its effects on different materials.',
      competencies: 'Understanding electrical conductivity.',
      aptitudes: 'Identify conductors and insulators.',
      attitudes: 'Safety with electricity.',
      otherResources: 'Batteries, wires, various materials to test'
    }
  ];
}

function createForm2Module3Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Energy needs',
      coreKnowledge: 'Types, sources and usage of energy.',
      competencies: 'Use of electrical, solar, chemical energy.',
      aptitudes: 'Identify energy sources and uses.',
      attitudes: 'Responsible attitude toward use of fire.',
      otherResources: 'Radio, batteries, torch, solar panel'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Renewable energy',
      coreKnowledge: 'Solar panel for heating. Other renewable sources.',
      competencies: 'Understanding renewable vs non-renewable energy.',
      aptitudes: 'Use of solar panel/oven.',
      attitudes: 'Environmental responsibility.',
      otherResources: 'Solar panel samples, diagrams'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Electricity',
      coreKnowledge: 'Electricity for the home. Simple electric circuit.',
      competencies: 'Feed a radio with a battery. Light an electrical lamp.',
      aptitudes: 'Protection from risks connected with electricity.',
      attitudes: 'Safety with electricity.',
      otherResources: 'Batteries, wires, bulbs, switches'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Light',
      coreKnowledge: 'Sources of light. Types of light receivers. Beams and shadows.',
      competencies: 'Understand light propagation.',
      aptitudes: 'Explain shadow formation.',
      attitudes: 'Curiosity, observation.',
      otherResources: 'Flashlight, torch, various objects for shadows'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Motion',
      coreKnowledge: 'Distance, time and speed.',
      competencies: 'Average velocity.',
      aptitudes: 'Calculate speed and velocity.',
      attitudes: 'Analytical thinking.',
      otherResources: 'Stopwatch, tape measure, toy cars'
    }
  ];
}

function createForm2Module4Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Pressure in liquids',
      coreKnowledge: 'Blood pressure. Average blood pressure.',
      competencies: 'Understand pressure in liquids.',
      aptitudes: 'Know that over 80% of the body is fluid.',
      attitudes: 'Health awareness.',
      otherResources: 'Blood pressure diagrams, hydraulic models'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Muscle stress',
      coreKnowledge: 'Sports and physical education. Body posture.',
      competencies: 'Understand muscle function.',
      aptitudes: 'Appreciate good posture.',
      attitudes: 'Health consciousness.',
      otherResources: 'Diagrams of muscles, sports equipment'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Lenses and applications',
      coreKnowledge: 'The eye as an imaging device. Use of lenses for vision defects.',
      competencies: 'Identifying type of eye defects.',
      aptitudes: 'Select appropriate lens for eye condition.',
      attitudes: 'Respect medical prescription.',
      otherResources: 'Converging and diverging lenses, eye diagrams'
    }
  ];
}

function createForm2Module5Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Radiation from the sun',
      coreKnowledge: 'Effect of cosmic radiation. Destruction of the ionosphere.',
      competencies: 'Radiation emitted into the atmosphere.',
      aptitudes: 'Understand radiation effects.',
      attitudes: 'Environmental awareness.',
      otherResources: 'Diagrams, solar radiation charts'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Greenhouse effect',
      coreKnowledge: 'Variation of rainfall in Cameroon. Greenhouse effect and climate change.',
      competencies: 'Understand greenhouse effect.',
      aptitudes: 'Explain causes and consequences.',
      attitudes: 'Environmental responsibility.',
      otherResources: 'Climate diagrams, rainfall data'
    }
  ];
}

function createForm2Module6Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Project',
      coreKnowledge: 'Definition of a project. Identification, conception, feasibility.',
      competencies: 'Realization of a technical project.',
      aptitudes: 'Choose suitable materials and tools.',
      attitudes: 'Rigour, Interest, Curiosity.',
      otherResources: 'Drawing kits, construction sheets, tools'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Care and Maintenance',
      coreKnowledge: 'Lubrication, Cleaning.',
      competencies: 'Preventive maintenance.',
      aptitudes: 'Maintain simple objects.',
      attitudes: 'Care for equipment.',
      otherResources: 'Oil, cleaning materials'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Repairs',
      coreKnowledge: 'Repairs of simple objects.',
      competencies: 'FOLI and LIFO techniques.',
      aptitudes: 'Repair simple devices.',
      attitudes: 'Resourcefulness.',
      otherResources: 'Simple tools, broken devices'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Technical drawing',
      coreKnowledge: 'Cross-section of an object. Reading of technical drawing.',
      competencies: 'Realize model-plan.',
      aptitudes: 'Read a plan or construction sheet.',
      attitudes: 'Precision, Patience.',
      otherResources: 'Drawing instruments, technical drawings'
    }
  ];
}
