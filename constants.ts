
import { Objective, Meeting } from './types';

const INITIAL_DATE = new Date().toISOString().split('T')[0];

const JD_DEFAULT_AGENDA = "- Aprobación acta reunión JD mes anterior\n- Cierre económico mes anterior\n- Actualización estado Instalaciones/Mantenimiento\n- Altas/bajas RRHH";

// Helper to generate meetings based on user rules
const generateMeetings = (): Meeting[] => {
  const meetings: Meeting[] = [];
  
  // Specific initial dates requested
  // Jan
  meetings.push({
    id: 'm-jan-sj',
    date: '2026-01-22',
    startTime: '19:00',
    endTime: '20:30',
    title: 'Reunión SoloJunta (SJ)',
    type: 'SJ',
    agenda: 'Definición estrategia anual.'
  });
  meetings.push({
    id: 'm-jan-jd',
    date: '2026-01-29',
    startTime: '19:00',
    endTime: '21:00',
    title: 'Junta Directiva (JD)',
    type: 'JD',
    agenda: JD_DEFAULT_AGENDA
  });

  // Feb
  meetings.push({
    id: 'm-feb-sj',
    date: '2026-02-12',
    startTime: '19:00',
    endTime: '20:30',
    title: 'Reunión SoloJunta (SJ)',
    type: 'SJ',
    agenda: 'Seguimiento objetivos Q1.'
  });
  meetings.push({
    id: 'm-feb-jd',
    date: '2026-02-26',
    startTime: '19:00',
    endTime: '21:00',
    title: 'Junta Directiva (JD)',
    type: 'JD',
    agenda: JD_DEFAULT_AGENDA
  });

  // Generate March - Dec
  // Pattern: SJ on 2nd Thursday, JD on 4th (or last) Thursday roughly.
  // Logic: Iterate months 2 (March) to 11 (Dec).
  for (let month = 2; month < 12; month++) { 
    const d = new Date(2026, month, 1);
    
    // Find first Thursday
    let day = d.getDay(); // 0-6
    let diff = (4 - day + 7) % 7; // Days to add to get to Thursday
    let firstThursday = 1 + diff;
    
    let secondThursday = firstThursday + 7;
    let fourthThursday = firstThursday + 21;

    // SJ Date (2nd Thursday)
    const dateSjStr = `2026-${String(month + 1).padStart(2, '0')}-${String(secondThursday).padStart(2, '0')}`;
    meetings.push({
      id: `m-${month}-sj`,
      date: dateSjStr,
      startTime: '19:00',
      endTime: '20:30',
      title: 'Reunión SoloJunta (SJ)',
      type: 'SJ',
      agenda: ''
    });

    // JD Date (4th Thursday)
    const dateJdStr = `2026-${String(month + 1).padStart(2, '0')}-${String(fourthThursday).padStart(2, '0')}`;
    meetings.push({
      id: `m-${month}-jd`,
      date: dateJdStr,
      startTime: '19:00',
      endTime: '21:00',
      title: 'Junta Directiva (JD)',
      type: 'JD',
      agenda: JD_DEFAULT_AGENDA
    });
  }

  return meetings;
};

export const INITIAL_MEETINGS: Meeting[] = generateMeetings();

export const INITIAL_OBJECTIVES: Objective[] = [
  // BLOQUE FUNCIONAMIENTO JD
  {
    id: 1,
    category: 'Funcionamiento JD',
    title: 'Diferenciar reuniones operativas VS debate/estrategia',
    description: 'Sintesis parte operativa para optimizar el tiempo de la junta.',
    status: 'Pending',
    priority: 'High',
    deadline: '2026-03-01',
    realDate: '',
    owner: 'Secretario',
    progress: 0,
    iconKey: 'gavel',
    actions: [
      { id: 'a1', text: 'Definir agenda estándar para reuniones', isCompleted: false, deadline: '2026-01-15', comments: [], difficulty: 2, impact: 8, owner: 'Secretario' },
      { id: 'a2', text: 'Agendar sesiones trimestrales exclusivas de estrategia', isCompleted: false, deadline: '2026-02-01', comments: [], difficulty: 4, impact: 9, owner: 'Presidente' }
    ],
    impact: 9,
    effort: 3
  },
  {
    id: 2,
    category: 'Funcionamiento JD',
    title: 'Definir canal de toma de decisiones rápidas',
    description: 'Establecer protocolo para decisiones vía encuesta WhatsApp o similar.',
    status: 'In Progress',
    priority: 'Medium',
    deadline: '2026-02-15',
    realDate: '',
    owner: 'Presidente', 
    progress: 50,
    iconKey: 'zap',
    actions: [
      { id: 'a3', text: 'Crear grupo de WhatsApp exclusivo para votaciones', isCompleted: true, deadline: '2026-01-10', comments: [], difficulty: 1, impact: 7, owner: 'Presidente' },
      { id: 'a4', text: 'Redactar normativa de validez de voto digital', isCompleted: false, deadline: '2026-01-30', comments: [], difficulty: 3, impact: 8, owner: 'Secretario' }
    ],
    impact: 7,
    effort: 2
  },
  {
    id: 3,
    category: 'Funcionamiento JD',
    title: 'Duración del mandato',
    description: 'Definir y consensuar estrategia a seguir respecto a los tiempos de la JD.',
    status: 'Pending',
    priority: 'Medium',
    deadline: '2026-06-01',
    realDate: '',
    owner: 'JD',
    progress: 0,
    iconKey: 'hourglass',
    actions: [],
    impact: 6,
    effort: 5
  },
  // BLOQUE AREA SOCIAL
  {
    id: 4,
    category: 'Área Social',
    title: 'Estudiar acciones de diferenciación',
    description: 'Piscina, parking, toallas, etc. Crear valor añadido para el socio.',
    status: 'Pending',
    priority: 'Medium',
    deadline: '2026-04-01',
    realDate: '',
    owner: 'Área Social',
    progress: 0,
    iconKey: 'users',
    actions: [],
    impact: 8,
    effort: 7
  },
  {
    id: 5,
    category: 'Área Social',
    title: 'Calidad más que cantidad',
    description: 'Mejora de percepción de calidad. Evaluar necesidades y medición vía encuestas.',
    status: 'In Progress',
    priority: 'High',
    deadline: '2026-12-31',
    realDate: '',
    owner: 'Gerencia',
    progress: 20,
    iconKey: 'star',
    actions: [
      { id: 'a5', text: 'Diseñar encuesta de satisfacción anual', isCompleted: true, deadline: '2026-05-01', comments: [], difficulty: 5, impact: 9, owner: 'Área Social' }
    ],
    impact: 9,
    effort: 4
  },
  {
    id: 6,
    category: 'Área Social',
    title: 'Asamblea 2026',
    description: 'Evaluar cumplimiento peticiones Asamblea 2025. Evaluar próximo modelo de Asamblea.',
    status: 'Pending',
    priority: 'High',
    deadline: '2026-05-01',
    realDate: '',
    owner: 'JD',
    progress: 0,
    iconKey: 'users-2',
    actions: [],
    impact: 8,
    effort: 6
  },
  {
    id: 7,
    category: 'Área Social',
    title: 'Mejora comunicación',
    description: 'Nuevo modelo de Boletín informativo. Renovar web.',
    status: 'Pending',
    priority: 'Medium',
    deadline: '2026-09-01',
    realDate: '',
    owner: 'Área Social', 
    progress: 0,
    iconKey: 'megaphone',
    actions: [],
    impact: 7,
    effort: 8
  },
  // BLOQUE AREA DEPORTIVA
  {
    id: 8,
    category: 'Área Deportiva',
    title: 'Mejora cualitativa escuelas Tenis',
    description: 'Elevar el nivel técnico y servicio de la escuela.',
    status: 'Pending',
    priority: 'High',
    deadline: '2026-09-01',
    realDate: '',
    owner: 'Área Deportiva',
    progress: 0,
    iconKey: 'trophy',
    actions: [],
    impact: 10,
    effort: 8
  },
  {
    id: 9,
    category: 'Área Deportiva',
    title: 'Mejora gimnasio',
    description: 'Mejoras en instalaciones y revisión de horarios.',
    status: 'Pending',
    priority: 'Medium',
    deadline: '2026-04-01',
    realDate: '',
    owner: 'Gerencia',
    progress: 0,
    iconKey: 'dumbbell',
    actions: [],
    impact: 6,
    effort: 5
  },
  // BLOQUE MANTENIMIENTO (Gerencia)
  {
    id: 10,
    category: 'Mantenimiento',
    title: 'Más mejoras visibles',
    description: 'Salto de calidad en la infraestructura general.',
    status: 'Pending',
    priority: 'Medium',
    deadline: '2026-12-31',
    realDate: '',
    owner: 'Gerencia', 
    progress: 0,
    iconKey: 'wrench',
    actions: [],
    impact: 8,
    effort: 9
  },
  // BLOQUE AREA RRHH
  {
    id: 11,
    category: 'Área RRHH',
    title: 'Evaluar cuellos de botella internos',
    description: 'Buscar acciones correctivas para desbloquear proyectos/iniciativas.',
    status: 'In Progress',
    priority: 'High',
    deadline: '2026-03-30',
    realDate: '',
    owner: 'Área RRHH',
    progress: 30,
    iconKey: 'network',
    actions: [],
    impact: 8,
    effort: 4
  },
  {
    id: 12,
    category: 'Área RRHH',
    title: 'Estudiar sistema de pagos con incentivos',
    description: 'Implementar variables por objetivos para el personal.',
    status: 'Pending',
    priority: 'High',
    deadline: '2026-01-30',
    realDate: '',
    owner: 'Área Financiera', 
    progress: 0,
    iconKey: 'banknote',
    actions: [],
    impact: 9,
    effort: 7
  },
  // BLOQUE AREA FINANCIERA
  {
    id: 13,
    category: 'Área Financiera',
    title: 'Presupuesto base anual realista',
    description: 'Establecimiento de un presupuesto ajustado a la realidad actual.',
    status: 'Completed',
    priority: 'High',
    deadline: '2025-12-15',
    realDate: '2025-12-20',
    owner: 'Área Financiera',
    progress: 100,
    iconKey: 'wallet',
    actions: [],
    impact: 10,
    effort: 6
  },
  {
    id: 14,
    category: 'Área Financiera',
    title: 'Análisis rentabilidad Prahna Holistico',
    description: 'Revisión de cuentas y retorno del servicio Prahna.',
    status: 'Pending',
    priority: 'Low',
    deadline: '2026-06-30',
    realDate: '',
    owner: 'Gerencia',
    progress: 0,
    iconKey: 'bar-chart-3',
    actions: [],
    impact: 4,
    effort: 3
  },
  {
    id: 15,
    category: 'Área Financiera',
    title: 'Mejora sistemas informáticos financieros',
    description: 'Mejorar la información financiera disponible mediante software.',
    status: 'Delayed',
    priority: 'Medium',
    deadline: '2026-02-01',
    realDate: '',
    owner: 'Gerencia', 
    progress: 10,
    iconKey: 'laptop',
    actions: [],
    impact: 7,
    effort: 6
  }
];

export const CATEGORIES = [
  'Funcionamiento JD',
  'Área Social',
  'Área Deportiva',
  'Mantenimiento',
  'Área RRHH',
  'Área Financiera'
];

export const STATUS_COLORS = {
  'Pending': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700',
  'Delayed': 'bg-red-100 text-red-700'
};

export const PRIORITY_COLORS = {
  'Low': 'bg-slate-100 text-slate-600',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'High': 'bg-orange-100 text-orange-700'
};
