import type { SyllabusModule, SyllabusTopic, ClassLevel } from '../types';

const generateId = () => crypto.randomUUID();

export function physicsForm1Modules(subjectId: string): SyllabusModule[] {
  return [
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 1' as ClassLevel,
      moduleNumber: 1,
      name: 'The World of Science',
      duration: '8 hours',
      familiesOfSituations: 'Understanding what science is all about',
      topics: createForm1Module1Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 1' as ClassLevel,
      moduleNumber: 2,
      name: 'Matter: Properties and Transformation',
      duration: '12 hours',
      familiesOfSituations: 'Utilization of products and consumer goods',
      topics: createForm1Module2Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 1' as ClassLevel,
      moduleNumber: 3,
      name: 'Energy: Applications and Uses',
      duration: '16 hours',
      familiesOfSituations: 'Utilization of energy in daily life',
      topics: createForm1Module3Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 1' as ClassLevel,
      moduleNumber: 4,
      name: 'Health Education',
      duration: '4 hours',
      familiesOfSituations: 'Care of body organs: Medical devices',
      topics: createForm1Module4Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 1' as ClassLevel,
      moduleNumber: 5,
      name: 'Environmental Education',
      duration: '4 hours',
      familiesOfSituations: 'Climate change, Atmosphere, Waste disposal',
      topics: createForm1Module5Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 1' as ClassLevel,
      moduleNumber: 6,
      name: 'Technology',
      duration: '6 hours',
      familiesOfSituations: 'Malfunctioning of common tools',
      topics: createForm1Module6Topics()
    }
  ];
}

function createForm1Module1Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Introduction to science',
      coreKnowledge: 'Definition of science. Branches of science and scientists.',
      competencies: 'Explain how to observe things in the environment.',
      aptitudes: 'Be able to recognize and identify basic science equipment.',
      attitudes: 'Curiosity and sense of observation. Respect of others opinions.',
      otherResources: '30 cm rule, Metre rule, Tape, Measuring cylinder, Thermometer'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Basic laboratory equipment',
      coreKnowledge: 'Safety rules for working in a science laboratory. Basic equipment identification.',
      competencies: 'Why measurement should be done.',
      aptitudes: 'Know how to read values on measuring instruments.',
      attitudes: 'Team spirit and cooperation.',
      otherResources: 'Balance, Protractor, Stop watch, Burner, Lighter, Match'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Scientific Methods Part 1',
      coreKnowledge: 'Observing, Measuring using ruler, tape, thermometer, protractor, stop watch and balance. SI units.',
      competencies: 'Method of investigation in science.',
      aptitudes: 'Positions of measuring instruments and the eye when reading.',
      attitudes: 'Interest in scientific advancement, Open-mindedness.',
      otherResources: 'Visit to the market, Visit to the hospital, Sport'
    }
  ];
}

function createForm1Module2Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Physical state of matter',
      coreKnowledge: 'Nature of materials around us (Solid, Liquid and Gas). Properties of matter.',
      competencies: 'Characteristics of matter. Matter exists in three states.',
      aptitudes: 'Know that solids, liquids and gases have different properties.',
      attitudes: 'Curiosity, sense of observation.',
      otherResources: 'Examples of solids, liquids, gases from daily life'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Measurements',
      coreKnowledge: 'Techniques of measurement: Temperature, Volume, Mass, Weight, Density.',
      competencies: 'Determination of mass, weight, volume, temperature of a body.',
      aptitudes: 'Use of balance. Measure and calculate volume of objects.',
      attitudes: 'Precision, Methodological action.',
      otherResources: 'Balance, measuring cylinder, ruler, thermometer'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Using services wisely',
      coreKnowledge: 'Safety measures. Using information on products.',
      competencies: 'Read and respect the prescription on labels of materials/products.',
      aptitudes: 'Be able to interpret labels and safety information.',
      attitudes: 'Responsibility, Care.',
      otherResources: 'Product labels, safety signs'
    }
  ];
}

function createForm1Module3Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Energy needs',
      coreKnowledge: 'Types, sources and uses of energy.',
      competencies: 'Types of energy used by human beings.',
      aptitudes: 'Identify energy sources and uses.',
      attitudes: 'Respect of environment, Responsible attitude toward energy use.',
      otherResources: 'Radio, batteries, torch light, solar panel'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Transmission of energy',
      coreKnowledge: 'Heat: conduction, convection and radiation. Force and Motion.',
      competencies: 'Explain the transmission of energy.',
      aptitudes: 'Understand conduction, convection, radiation.',
      attitudes: 'Responsible attitude toward use of fire.',
      otherResources: 'Metal rod, candle, water, heat source'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Force',
      coreKnowledge: 'Force (cause) and Motion (effects) on objects in the environment.',
      competencies: 'Identification of mechanical action and magnetic interaction.',
      aptitudes: 'Determine effects of forces.',
      attitudes: 'Curiosity, scientific thinking.',
      otherResources: 'Magnets, springs, objects to push/pull'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Motion',
      coreKnowledge: 'Deduce simple examples of motion from effects of forces.',
      competencies: 'Define motion and describe types.',
      aptitudes: 'Identify motion in everyday situations.',
      attitudes: 'Observation, analysis.',
      otherResources: 'Toy cars, balls, inclined plane'
    }
  ];
}

function createForm1Module4Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Sound',
      coreKnowledge: 'Know how sound is produced. Characteristics of sound. Parts of the ear.',
      competencies: 'Useful noise level. Ear defects identification.',
      aptitudes: 'Responsible use of sound instruments.',
      attitudes: 'Observe rule on acoustic at home and public places.',
      otherResources: 'Clinical thermometer, lenses, guitar, tuning fork'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Thermometer',
      coreKnowledge: 'Know the normal body temperature. Reading a clinical thermometer.',
      competencies: 'Use of clinical thermometer.',
      aptitudes: 'Be able to read and interpret correctly. Give health advice.',
      attitudes: 'Care for health.',
      otherResources: 'Clinical thermometer'
    }
  ];
}

function createForm1Module5Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Radiation',
      coreKnowledge: 'Types of radiation. Radiation emitted into the atmosphere.',
      competencies: 'Understand radiation levels.',
      aptitudes: 'Identify types of radiation.',
      attitudes: 'Care for environment.',
      otherResources: 'Pictures, diagrams of radiation sources'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Global warming',
      coreKnowledge: 'Global warming concept, causes, consequences. Greenhouse effect.',
      competencies: 'Limitation of global warming.',
      aptitudes: 'Understand greenhouse effect and its consequences.',
      attitudes: 'Environmental responsibility.',
      otherResources: 'Diagrams, videos on climate change'
    }
  ];
}

function createForm1Module6Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Machine',
      coreKnowledge: 'Application of common tools. Identify point of application of effort and load.',
      competencies: 'How tools function. Appreciate distance covered by effort and load.',
      aptitudes: 'Use of screwdrivers, saws, glue, hammer, pliers.',
      attitudes: 'Resourcefulness, Creativity.',
      otherResources: 'Screwdriver, saws, glue, hammer, pliers, spirit level'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Care and maintenance',
      coreKnowledge: 'Lubrication, Cleaning.',
      competencies: 'Maintenance of simple mechanical systems.',
      aptitudes: 'Look for a fault. Repair a simple object.',
      attitudes: 'Care for tools and equipment.',
      otherResources: 'Oil, cleaning materials, simple tools'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Technical drawing',
      coreKnowledge: 'Basic technical drawing skills.',
      competencies: 'Reading and producing simple technical drawings.',
      aptitudes: 'Draw simple objects to scale.',
      attitudes: 'Precision, Patience.',
      otherResources: 'Drawing instruments, graph paper'
    }
  ];
}
