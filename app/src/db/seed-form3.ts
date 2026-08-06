import type { SyllabusModule, SyllabusTopic, ClassLevel } from '../types';

const generateId = () => crypto.randomUUID();

export function physicsForm3Modules(subjectId: string): SyllabusModule[] {
  return [
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 3' as ClassLevel,
      moduleNumber: 1,
      name: 'Heat',
      duration: '18 hours',
      familiesOfSituations: 'Everyday use of heat',
      topics: createForm3Module1Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 3' as ClassLevel,
      moduleNumber: 2,
      name: 'Waves',
      duration: '18 hours',
      familiesOfSituations: 'Wave phenomena',
      topics: createForm3Module2Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 3' as ClassLevel,
      moduleNumber: 3,
      name: 'Electrical Energy',
      duration: '18 hours',
      familiesOfSituations: 'Electrical energy',
      topics: createForm3Module3Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 3' as ClassLevel,
      moduleNumber: 4,
      name: 'Projects and Elementary Engineering',
      duration: '18 hours',
      familiesOfSituations: 'Improving on Life-style',
      topics: createForm3Module4Topics()
    }
  ];
}

function createForm3Module1Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Concept of heat and temperature',
      coreKnowledge: 'Heat and temperature distinction. Measurement of temperature.',
      competencies: 'Understand thermal equilibrium.',
      aptitudes: 'Use thermometers correctly.',
      attitudes: 'Precision in measurement.',
      otherResources: 'Thermometers, heat source, various substances'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Thermometry',
      coreKnowledge: 'Thermometric properties. Temperature scales. Calibration.',
      competencies: 'Calibrate a thermometer.',
      aptitudes: 'Read and interpret thermometers.',
      attitudes: 'Accuracy in measurement.',
      otherResources: 'Thermometers, ice, boiling water'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Calorimetry',
      coreKnowledge: 'Heat capacity and specific heat capacity. Q=mc delta theta.',
      competencies: 'Measure specific heat capacity.',
      aptitudes: 'Calculate heat transfer.',
      attitudes: 'Analytical thinking.',
      otherResources: 'Calorimeter, thermometer, heat source'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Latent heat',
      coreKnowledge: 'Latent heat and specific latent heat. Cooling effect.',
      competencies: 'Understand phase changes.',
      aptitudes: 'Measure latent heat.',
      attitudes: 'Scientific inquiry.',
      otherResources: 'Ice, calorimeter, thermometer'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Heat transfer',
      coreKnowledge: 'Conduction, convection and radiation.',
      competencies: 'Explain heat transfer mechanisms.',
      aptitudes: 'Demonstrate conduction, convection, radiation.',
      attitudes: 'Understanding thermal processes.',
      otherResources: 'Metal rods, water, candle, radiation sources'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Thermal expansion',
      coreKnowledge: 'Bimetallic strip. Expansion in solids, liquids, gases.',
      competencies: 'Understand expansion effects.',
      aptitudes: 'Demonstrate bimetallic strip.',
      attitudes: 'Understanding practical applications.',
      otherResources: 'Bimetallic strip, ball and ring apparatus'
    }
  ];
}

function createForm3Module2Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Properties of waves',
      coreKnowledge: 'Definition and classification. Reflection, refraction, diffraction, interference.',
      competencies: 'Understand wave behavior.',
      aptitudes: 'Use equation v=f lambda for calculations.',
      attitudes: 'Analytical thinking.',
      otherResources: 'Ripple tank, slinky, tuning fork'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Stationary waves',
      coreKnowledge: 'Production of stationary waves. Harmonics and overtones.',
      competencies: 'Understand stationary wave formation.',
      aptitudes: 'Measure wavelength using nodes.',
      attitudes: 'Scientific observation.',
      otherResources: 'String, sonometer, tuning fork'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Sound waves',
      coreKnowledge: 'Production and transmission of sound. Characteristics. Speed of sound.',
      competencies: 'Measure speed of sound.',
      aptitudes: 'Demonstrate sound properties.',
      attitudes: 'Understanding acoustics.',
      otherResources: 'Tuning forks, resonance tube, stopwatch'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Vibration in strings',
      coreKnowledge: 'Relationship between frequency, length, mass, tension.',
      competencies: 'Investigate string vibration.',
      aptitudes: 'Construct simple musical instrument.',
      attitudes: 'Creativity, appreciation of music.',
      otherResources: 'String, guitar, sonometer'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Resonance',
      coreKnowledge: 'Forced vibration. Resonance and its applications.',
      competencies: 'Understand resonance phenomenon.',
      aptitudes: 'Demonstrate resonance.',
      attitudes: 'Understanding natural phenomena.',
      otherResources: 'Tuning forks, resonance tube'
    }
  ];
}

function createForm3Module3Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Electrostatics',
      coreKnowledge: 'Types of charge. Charging by friction, contact, induction. Coulombs law.',
      competencies: 'Understand electrostatic phenomena.',
      aptitudes: 'Demonstrate charging methods.',
      attitudes: 'Safety with static electricity.',
      otherResources: 'Electroscope, rods, cloth, Van de Graaff'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Current electricity',
      coreKnowledge: 'Electric current. EMF and potential difference.',
      competencies: 'Set up simple circuits.',
      aptitudes: 'Use ammeters and voltmeters.',
      attitudes: 'Safety with electricity.',
      otherResources: 'Cells, wires, bulbs, ammeter, voltmeter'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Electric circuits',
      coreKnowledge: 'Components of a circuit. Resistance. Ohms law. Series and parallel circuits.',
      competencies: 'Build and analyze circuits.',
      aptitudes: 'Calculate resistance, current, voltage.',
      attitudes: 'Problem-solving.',
      otherResources: 'Resistors, wires, multimeter, circuit board'
    },
    {
      id: generateId(),
      moduleId,
      name: 'DC and AC',
      coreKnowledge: 'Direct and alternating current. Power in circuits.',
      competencies: 'Understand AC and DC differences.',
      aptitudes: 'Calculate power and energy consumption.',
      attitudes: 'Energy conservation.',
      otherResources: 'Power supply, CRO, bulbs'
    },
    {
      id: generateId(),
      moduleId,
      name: 'House wiring',
      coreKnowledge: 'House wiring basics. Fuses. Safety precautions.',
      competencies: 'Understand home electrical systems.',
      aptitudes: 'Select appropriate fuses.',
      attitudes: 'Electrical safety.',
      otherResources: 'Fuse samples, wiring diagrams, plug'
    }
  ];
}

function createForm3Module4Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Technical drawing',
      coreKnowledge: 'Reading technical drawings. Cross-sections. Building plans.',
      competencies: 'Read and produce technical drawings.',
      aptitudes: 'Draw to scale.',
      attitudes: 'Precision, patience.',
      otherResources: 'Drawing instruments, graph paper, sample plans'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Construction of devices',
      coreKnowledge: 'Constructing a thermometer, sound instrument.',
      competencies: 'Build simple devices.',
      aptitudes: 'Apply physics principles in construction.',
      attitudes: 'Creativity, resourcefulness.',
      otherResources: 'Straws, bottles, string, bamboo, tuning fork'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Heat conduction experiments',
      coreKnowledge: 'Conduction in metals and liquids. Rate of heat flow.',
      competencies: 'Investigate thermal conductivity.',
      aptitudes: 'Measure heat flow rate.',
      attitudes: 'Scientific inquiry.',
      otherResources: 'Metal rods, candle, wax, plastic bag, water'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Electrical energy consumption',
      coreKnowledge: 'Understanding appliance components. Repair and maintenance.',
      competencies: 'Maintain electrical devices.',
      aptitudes: 'Identify appliance parts.',
      attitudes: 'Responsible use of technology.',
      otherResources: 'Old radio, screwdriver, tester'
    }
  ];
}
