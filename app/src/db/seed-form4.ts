import type { SyllabusModule, SyllabusTopic, ClassLevel } from '../types';

const generateId = () => crypto.randomUUID();

export function physicsForm4Modules(subjectId: string): SyllabusModule[] {
  return [
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 4' as ClassLevel,
      moduleNumber: 1,
      name: 'Energy: Application and Uses',
      duration: '21 hours',
      familiesOfSituations: 'Everyday use of energy',
      topics: createForm4Module1Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 4' as ClassLevel,
      moduleNumber: 2,
      name: 'Waves',
      duration: '18 hours',
      familiesOfSituations: 'Wave phenomena',
      topics: createForm4Module2Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 4' as ClassLevel,
      moduleNumber: 3,
      name: 'Electrical Energy',
      duration: '24 hours',
      familiesOfSituations: 'Electrical energy',
      topics: createForm4Module3Topics()
    },
    {
      id: generateId(),
      subjectId,
      classLevel: 'Form 4' as ClassLevel,
      moduleNumber: 4,
      name: 'Projects and Elementary Engineering',
      duration: '18 hours',
      familiesOfSituations: 'Improving on living conditions',
      topics: createForm4Module4Topics()
    }
  ];
}

function createForm4Module1Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Heat and thermometry',
      coreKnowledge: 'Concept of heat and temperature. Measurement of temperature.',
      competencies: 'Understand heat and temperature distinction.',
      aptitudes: 'Use various thermometers.',
      attitudes: 'Precision in measurement.',
      otherResources: 'Thermometers, heat source, various substances'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Calorimetry',
      coreKnowledge: 'Heat capacity and specific heat capacity. Q=mc delta theta.',
      competencies: 'Measure specific heat capacity.',
      aptitudes: 'Calculate heat energy.',
      attitudes: 'Analytical thinking.',
      otherResources: 'Calorimeter, thermometer, heater'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Latent heat',
      coreKnowledge: 'Latent heat and specific latent heat. Cooling effect.',
      competencies: 'Understand phase changes.',
      aptitudes: 'Measure latent heat.',
      attitudes: 'Scientific inquiry.',
      otherResources: 'Ice, steam, calorimeter'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Heat transfer',
      coreKnowledge: 'Conduction, convection, radiation. Applications.',
      competencies: 'Explain heat transfer mechanisms.',
      aptitudes: 'Demonstrate all three methods.',
      attitudes: 'Understanding thermal processes.',
      otherResources: 'Metal rods, water, heater, Leslie cube'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Thermal expansion',
      coreKnowledge: 'Thermal expansion. Bimetallic strip. Applications.',
      competencies: 'Understand expansion consequences.',
      aptitudes: 'Explain practical applications.',
      attitudes: 'Understanding engineering applications.',
      otherResources: 'Bimetallic strip, ball and ring'
    }
  ];
}

function createForm4Module2Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Properties of waves',
      coreKnowledge: 'Definition and classification. Reflection, refraction, diffraction, interference.',
      competencies: 'Analyze wave behavior.',
      aptitudes: 'Calculate wave properties.',
      attitudes: 'Analytical thinking.',
      otherResources: 'Ripple tank, slinky, laser'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Stationary waves',
      coreKnowledge: 'Stationary wave formation. Harmonics and overtones.',
      competencies: 'Understand stationary waves.',
      aptitudes: 'Measure wavelength from nodes.',
      attitudes: 'Scientific observation.',
      otherResources: 'Sonometer, string, oscillator'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Sound waves',
      coreKnowledge: 'Production and transmission. Characteristics. Speed measurement.',
      competencies: 'Measure speed of sound.',
      aptitudes: 'Explain sound phenomena.',
      attitudes: 'Understanding acoustics.',
      otherResources: 'Tuning forks, resonance tube, oscilloscope'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Vibration in strings',
      coreKnowledge: 'Factors affecting frequency: length, mass, tension.',
      competencies: 'Investigate vibrating strings.',
      aptitudes: 'Build simple string instrument.',
      attitudes: 'Creativity.',
      otherResources: 'String, sonometer, guitar'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Resonance',
      coreKnowledge: 'Forced vibration. Resonance importance and applications.',
      competencies: 'Demonstrate resonance.',
      aptitudes: 'Apply resonance in measurements.',
      attitudes: 'Understanding natural phenomena.',
      otherResources: 'Tuning forks, resonance tube, pendulums'
    }
  ];
}

function createForm4Module3Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Electrostatics',
      coreKnowledge: 'Types of charge. Coulombs law. Electric field. Applications.',
      competencies: 'Understand electrostatics.',
      aptitudes: 'Calculate forces between charges.',
      attitudes: 'Safety awareness.',
      otherResources: 'Electroscope, Van de Graaff, rods'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Current electricity',
      coreKnowledge: 'Electric current. EMF and PD. Sources of EMF.',
      competencies: 'Understand current flow conditions.',
      aptitudes: 'Build simple circuits.',
      attitudes: 'Electrical safety.',
      otherResources: 'Cells, wires, bulbs, meters'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Electric circuits',
      coreKnowledge: 'Resistance. Ohms law. Series and parallel. Circuit calculations.',
      competencies: 'Analyze complex circuits.',
      aptitudes: 'Calculate equivalent resistance.',
      attitudes: 'Problem-solving.',
      otherResources: 'Resistors, multimeter, circuit boards'
    },
    {
      id: generateId(),
      moduleId,
      name: 'DC and AC',
      coreKnowledge: 'Direct and alternating current. Power dissipation. Energy consumption.',
      competencies: 'Understand AC and DC differences.',
      aptitudes: 'Calculate power and KWH.',
      attitudes: 'Energy conservation.',
      otherResources: 'Power supply, CRO, appliances'
    },
    {
      id: generateId(),
      moduleId,
      name: 'House wiring',
      coreKnowledge: 'House wiring. Fuses. Ring circuit. Safety precautions.',
      competencies: 'Understand home electrical systems.',
      aptitudes: 'Wire simple circuits safely.',
      attitudes: 'Electrical safety.',
      otherResources: 'Fuse samples, wiring diagrams'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Cathode Ray Oscilloscope',
      coreKnowledge: 'Structure and functions of the CRO. Reading voltage.',
      competencies: 'Use CRO for measurements.',
      aptitudes: 'Detect and display signals.',
      attitudes: 'Understanding modern instruments.',
      otherResources: 'CRO, signal generator'
    }
  ];
}

function createForm4Module4Topics(): SyllabusTopic[] {
  const moduleId = generateId();
  return [
    {
      id: generateId(),
      moduleId,
      name: 'Technical drawing',
      coreKnowledge: 'Reading technical drawings. Cross-sections. Building plans.',
      competencies: 'Read and produce technical drawings.',
      aptitudes: 'Draw to scale with dimensions.',
      attitudes: 'Precision, patience.',
      otherResources: 'Drawing instruments, sample plans'
    },
    {
      id: generateId(),
      moduleId,
      name: 'Realization of a technical project',
      coreKnowledge: 'Planning and executing a technical project.',
      competencies: 'Complete a technical project.',
      aptitudes: 'Apply theoretical knowledge practically.',
      attitudes: 'Perseverance, managerial skills.',
      otherResources: 'Drawing kits, tools, materials'
    }
  ];
}
