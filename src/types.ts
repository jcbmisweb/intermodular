export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';
export type ProjectPriority = 'low' | 'medium' | 'high';
export type UserRole = 'admin' | 'profesor' | 'alumno' | 'pending';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole; // Mantenido para compatibilidad
  roles: UserRole[]; // Añadido
  avatarUrl: string; // we can use a cute SVG avatar placeholder or preset
  initials: string;
  color: string; // background color class
  classroom?: string; // Aula asignada
  joinedAt: string;
  password?: string; // Código de seguridad o contraseña
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  initials: string;
  color: string; // Tailwind class name or hex for background
}

export interface AssessmentTask {
  id: string;
  title: string;
  criterionIds: string[]; // IDs of the RACriterion it covers
  weight?: number;
}

export interface StudentGrade {
  studentId: string;
  taskId: string;
  score: number; // 0 to 10
  isDelivered?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  category: string;
  budget: number;
  spent: number;
  startDate: string;
  dueDate: string;
  progress: number; // calculated or manual
  team: string[]; // TeamMember IDs
  tasks: Task[];
  lastUpdated: string;
  classroom?: string; // Aula asignada
  gastronomicState?: any;
}

export interface ProjectCategory {
  name: string;
  color: string;
}

export interface IndividualOralGrade {
  studentId: string;
  teamGrade: number;         // Nota Resultado de equipo: 0 to 10
  expositionGrade: number;   // Nota Exposición del proyecto: 0 to 10
  coevalItem1: 'positive' | 'negative' | 'neutral'; // Implicación y esfuerzo (+0.5, -0.5, 0)
  coevalItem2: 'positive' | 'negative' | 'neutral'; // Colaboración y actitud (+0.5, -0.5, 0)
  justification: string;     // Justificación del profesor
  presented: boolean;        // ¿Se ha presentado? (Sino, No Presentado / Suspenso)
}

export interface Announcement {
  id: string;
  text: string;
  date: string;
  author: string;
  readByStudentIds?: string[];
}

export interface RegistrationCode {
  id: string; // El código en mayúsculas (clave única, ej: JCB-2HCA o PROF-ADMIN)
  role: UserRole;
  classroom: string;
  createdAt: string;
}


