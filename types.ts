
export type Status = 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
export type Priority = 'Low' | 'Medium' | 'High';

export interface ActionItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Objective {
  id: number;
  category: string; // The "Bloque"
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  deadline: string; // YYYY-MM-DD (Fecha Estimada)
  realDate?: string; // YYYY-MM-DD (Fecha Real de cumplimiento)
  owner: string;
  progress: number; // 0-100 derived from actions if available, or manual
  imageUrl?: string; // URL for the representative image
  actions: ActionItem[];
  comments: Comment[];
  // Evaluation Metrics (1-10)
  ease: number;    // Facilidad (10 = Very Easy, 1 = Very Hard)
  impact: number;  // Impacto (10 = High Impact)
  cost: number;    // Coste (10 = High Cost)
  risk: number;    // Riesgo (10 = High Risk)
}

export interface CategoryStats {
  name: string;
  total: number;
  completed: number;
  progress: number;
}
