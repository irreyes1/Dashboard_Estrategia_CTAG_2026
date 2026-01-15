
export type Status = 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
export type Priority = 'Low' | 'Medium' | 'High';
export type MeetingType = 'SJ' | 'JD' | 'Other';

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface ActionItem {
  id: string;
  text: string;
  isCompleted: boolean;
  deadline?: string; // Fecha estimada de ejecución de la acción
  comments: Comment[]; // Comentarios asociados a la acción específica
  // New Metrics for the Matrix
  difficulty: number; // 0-10 (0 easy, 10 hard)
  impact: number;     // 0-10 (0 low, 10 high)
  owner?: string;     // Responsable específico de la acción
}

export interface Objective {
  id: number;
  category: string; // The "Bloque"
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  deadline: string; // YYYY-MM-DD (Fecha Estimada del Objetivo)
  realDate?: string; // YYYY-MM-DD (Fecha Real de cumplimiento)
  owner: string;
  progress: number; // 0-100 derived from actions if available, or manual
  iconKey: string; // Key for the Lucide Icon (users, trophy, wallet, etc.)
  actions: ActionItem[];
  // Legacy fields kept for compatibility or summary, but Matrix now uses Actions
  impact: number;  
  effort: number;  
}

export interface Meeting {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  title: string;
  type: MeetingType;
  agenda: string;
}

export interface Document {
  id: string;
  name: string;
  date: string;
  size: string;
  type: string;
  content?: string; // Base64 data string
}

export interface CategoryStats {
  name: string;
  total: number;
  completed: number;
  progress: number;
}
