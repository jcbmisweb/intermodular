import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  Briefcase, 
  CheckSquare, 
  Plus, 
  BookOpen, 
  LogOut,
  Calendar,
  AlertCircle,
  TrendingUp,
  MessageSquarePlus,
  Send,
  Sparkles,
  ChefHat,
  ShieldCheck,
  DollarSign,
  Globe,
  Activity,
  Award,
  FileText,
  Check,
  Trash2,
  Scale,
  Lock,
  Target,
  LineChart,
  ChevronDown,
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import { AppUser, Project, Task, AssessmentTask, StudentGrade, IndividualOralGrade, Announcement } from '../types';
import RATab from './RATab';
import StudentTrackingTab from './StudentTrackingTab';
import StudentDossierModal from './StudentDossierModal';
import { LEARNING_OUTCOMES } from '../data/ra';

interface ProfesorDashboardProps {
  currentUser: AppUser;
  projects: Project[];
  allUsers: AppUser[];
  onLogoutToAdmin: () => void;
  onToggleTask: (projectId: string, taskId: string) => void;
  iesName?: string;
  iesLogo?: string;
  maxCoevaluationImpact: number;
  assessmentTasks: AssessmentTask[];
  studentGrades: StudentGrade[];
  onUpdateGrade: (studentId: string, taskId: string, score: number) => void;
  onToggleDelivery: (studentId: string, taskId: string, isDelivered: boolean) => void;
  onAddAssessmentTask: () => void;
  individualOralGrades: IndividualOralGrade[];
  onUpdateIndividualOralGrade: (studentId: string, updated: Partial<IndividualOralGrade>) => void;
  maxTeamScore: number;
  maxExpositionScore: number;
  maxCoevalAdjustment: number;
  onUpdateOralGradeConfig: (maxTeam: number, maxExposition: number, maxCoeval: number) => void;
  announcements: Announcement[];
  onPublishAnnouncement: (text: string, authorName: string) => void;
  activeRole?: string;
  onChangeActiveRole?: (role: any) => void;
  onUpdateUserProfile: (userId: string, newName: string, newAvatarUrl: string) => void;
  onUpdateProjectGastronomicState: (projectId: string, gastronomicState: any) => void;
}

const DEFAULT_GASTRONOMIC_STATE = {
  id: '6BIQOX',
  teamName: 'Los Cocedores del Arenal',
  isOpen: false,
  modoEdicion: true,
  restaurantName: 'Arenal Ecocuisine',
  locationArea: 'Zona Histórica y Comercial - Proximidad a Mercados Locales',
  conceptDescription: 'Un bistró de alta cocina sostenible que fusiona técnicas tradicionales con ingredientes de temporada de Km 0. Minimizamos el desperdicio y conectamos directamente con pequeños agricultores locales.',
  marketStudy: 'Análisis de demanda indica alta valoración de propuestas saludables y ecológicas en el segmento de profesionales de 25-50 años. Competencia directa limitada en menús de proximidad.',
  roles: {
    chef: 'Alejandro Martínez (Chef Ejecutivo - Gestión de Menú y Desperdicio Cero)',
    subchef: 'Isabel García (Sous Chef - Calidad y Control Nutricional ODS 3)',
    costController: 'Carlos Ruiz (Controlador de Costes - Food Cost y Viabilidad)',
    sustainabilityOfficer: 'Marta Pérez (Responsable de Sostenibilidad - Auditoría de Km 0 y ODS 12)'
  },
  swot: {
    fortalezas: 'Ingredientes 100% de temporada; huella de carbono auditada; red consolidada de productores de proximidad.',
    debilidades: 'Costes de adquisición iniciales elevados; alta dependencia del clima estacional para el menú.',
    oportunidades: 'Subvenciones europeas para transición ecológica; crecimiento del turismo gastronómico sostenible.',
    amenazas: 'Inestabilidad de precios de materias primas; regulaciones de etiquetado de alérgenos más estrictas.'
  },
  dishes: [
    {
      id: 'd1',
      name: 'Tartar de Tomate Rosa y Aguacate Km 0',
      category: 'entrante',
      costPrice: 2.20,
      salePrice: 12.00,
      allergens: ['frutos_secos'],
      odsImpact: ['ODS 12', 'ODS 3'],
      sustainabilityJustification: 'Tomates procedentes de la huerta del Arenal (a menos de 10km) y aguacates ecológicos de cultivo de secano para reducir el impacto hídrico.'
    },
    {
      id: 'd2',
      name: 'Lubina Salvaje con emulsión de Hinojo y algas',
      category: 'principal',
      costPrice: 4.80,
      salePrice: 21.50,
      allergens: ['pescado'],
      odsImpact: ['ODS 14', 'ODS 12'],
      sustainabilityJustification: 'Lubina pescada de manera artesanal y sostenible con anzuelo, respetando los tamaños mínimos y periodos de veda.'
    },
    {
      id: 'd3',
      name: 'Texturas de Manzana de Temporada y Helado de Yogur de Cabra',
      category: 'postre',
      costPrice: 1.10,
      salePrice: 7.50,
      allergens: ['lacteos'],
      odsImpact: ['ODS 3', 'ODS 12'],
      sustainabilityJustification: 'Manzanas de variedades locales recuperadas con mermas mínimas (aprovechamos pieles para infusión en el almíbar).'
    }
  ],
  prototypes: [
    { id: 'p1', title: 'Emplatado del Tartar Rosa', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', notes: 'Presentado en aro biodegradable. El aliño resalta los aromas frescos del cilantro local.' },
    { id: 'p2', title: 'Cocción de Lubina Sostenible', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', notes: 'Punto de cocción exacto a baja temperatura para preservar jugosidad y nutrientes.' }
  ],
  intermediateNotes: 'Se ha completado satisfactoriamente el estudio de mercado y el diseño preliminar del menú. Se observa un excelente alineamiento con los ODS 3 y ODS 12. Pendiente de revisión final del presupuesto de cocina por el tutor.',
  viability: {
    fixedCosts: 4500,
    variableCostPercent: 28,
    expectedCustomers: 650,
    averageTicket: 35
  },
  zeroWasteChecklist: [
    { id: 'zw1', text: 'Separación selectiva y pesaje de mermas orgánicas diario.', checked: true },
    { id: 'zw2', text: 'Uso de compostadora para residuos vegetales del huerto del IES.', checked: true },
    { id: 'zw3', text: 'Acuerdos de donación de excedentes alimentarios aptos con comedores sociales.', checked: false },
    { id: 'zw4', text: 'Control de raciones mediante fichas técnicas milimetradas.', checked: true },
    { id: 'zw5', text: 'Eliminación del 100% de plásticos de un solo uso en cocina y sala.', checked: true }
  ],
  task9: {
    reviews: {}
  },
  peerReviews: [
    { name: 'Alejandro Martínez', role: 'Chef Ejecutivo', score: 9.5, comment: 'Liderazgo excelente y riguroso control del orden de la cocina.' },
    { name: 'Isabel García', role: 'Sous Chef', score: 9.0, comment: 'Gran apoyo en la estandarización de las recetas y fichas técnicas.' },
    { name: 'Carlos Ruiz', role: 'Cost Controller', score: 8.5, comment: 'Control exhaustivo pero necesita agilizar las compras con proveedores.' },
    { name: 'Marta Pérez', role: 'Sustainability Officer', score: 10, comment: 'Involucración brillante en la justificación de cada ingrediente Km 0.' }
  ],
  finalNotes: 'El proyecto Arenal Ecocuisine demuestra alta viabilidad técnica y excelente compromiso con la Agenda 2030. Un modelo replicable y altamente educativo para el alumnado del IES.',
  isSubmitted: false,
  evaluation: {
    status: 'Aprobado Provisional - Pendiente de Memoria Final',
    score: 8.5,
    ra1Score: 9.0,
    ra2Score: 8.0,
    ra3Score: 8.5,
    feedback: 'Excelente enfoque en el aprovechamiento de mermas locales en el Tartar Rosa. Se sugiere revisar con mayor profundidad los costes fijos de personal en el apartado de viabilidad financiera.'
  }
};

export default function ProfesorDashboard({ 
  currentUser, 
  projects, 
  allUsers, 
  onLogoutToAdmin,
  onToggleTask,
  iesName,
  iesLogo,
  maxCoevaluationImpact,
  assessmentTasks,
  studentGrades,
  onUpdateGrade,
  onToggleDelivery,
  onAddAssessmentTask,
  individualOralGrades,
  onUpdateIndividualOralGrade,
  maxTeamScore,
  maxExpositionScore,
  maxCoevalAdjustment,
  onUpdateOralGradeConfig,
  announcements,
  onPublishAnnouncement,
  activeRole,
  onChangeActiveRole,
  onUpdateUserProfile,
  onUpdateProjectGastronomicState
}: ProfesorDashboardProps) {
  // Navigation tabs: classroom (Aula e Indicadores), ra (Gestión de RA), tracking (Seguimiento), task-grading (Calificación por Tarea)
  const [activeTab, setActiveTab] = useState<string>('classroom');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [collapsedPhases, setCollapsedPhases] = useState<string[]>([]);
  const [taskSearchTerm, setTaskSearchTerm] = useState('');

  // Student dossier selection state
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<AppUser | null>(null);

  // Local state to display success banner on save
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Load simulated gastronomy state from localStorage or fallback
  const [gastState, setGastState] = useState(() => {
    const saved = localStorage.getItem('studio_gast_project_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_GASTRONOMIC_STATE;
      }
    }
    return DEFAULT_GASTRONOMIC_STATE;
  });

  // Keep grades inputs synchronized with loaded state
  const [evalStatus, setEvalStatus] = useState(gastState.evaluation?.status || 'Aprobado Provisional - Pendiente de Memoria Final');
  const [evalScore, setEvalScore] = useState(gastState.evaluation?.score ?? 8.5);
  const [evalRa1, setEvalRa1] = useState(gastState.evaluation?.ra1Score ?? 9.0);
  const [evalRa2, setEvalRa2] = useState(gastState.evaluation?.ra2Score ?? 8.0);
  const [evalRa3, setEvalRa3] = useState(gastState.evaluation?.ra3Score ?? 8.5);
  const [evalFeedback, setEvalFeedback] = useState(gastState.evaluation?.feedback || 'Excelente enfoque en el aprovechamiento de mermas locales en el Tartar Rosa. Se sugiere revisar con mayor profundidad los costes fijos de personal en el apartado de viabilidad financiera.');

  const handleSaveGrades = () => {
    const updatedState = {
      ...gastState,
      evaluation: {
        status: evalStatus,
        score: Number(evalScore),
        ra1Score: Number(evalRa1),
        ra2Score: Number(evalRa2),
        ra3Score: Number(evalRa3),
        feedback: evalFeedback
      }
    };
    setGastState(updatedState);
    localStorage.setItem('studio_gast_project_v2', JSON.stringify(updatedState));
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const [newAnnouncement, setNewAnnouncement] = useState('');

  // Classroom assigned to the professor
  const assignedClassroom = currentUser.classroom || 'Aula de Desarrollo Web';

  // Alumnos assigned to this classroom
  const classroomStudents = allUsers.filter(u => u.role === 'alumno' && u.classroom === assignedClassroom);

  // Projects assigned to this classroom
  const classroomProjects = projects.filter(p => p.classroom === assignedClassroom);

  // Local state for Quick Project Generator
  const [numProjectsToCreate, setNumProjectsToCreate] = useState<number>(5);
  const [creationCategory, setCreationCategory] = useState<string>('Gastronomía Sostenible');
  const [creationDueDate, setCreationDueDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  // Automatically sync default number of projects to the number of students
  React.useEffect(() => {
    if (classroomStudents.length > 0) {
      setNumProjectsToCreate(classroomStudents.length);
    }
  }, [classroomStudents.length]);

  const handleGenerateGenericProjects = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numProjectsToCreate < 1) return;
    setIsGenerating(true);
    setGenerationSuccess(false);

    try {
      const initialTasks = assessmentTasks.map(at => ({
        id: at.id,
        title: at.title,
        completed: false
      }));

      for (let i = 1; i <= numProjectsToCreate; i++) {
        const projectId = `proj_${assignedClassroom.replace(/\s+/g, '_')}_${Date.now()}_${i}`;
        const projectName = `Proyecto Intermodular Nº ${i}`;
        
        const initialGastState = {
          restaurantName: projectName,
          projectName: projectName,
          conceptDescription: 'Proyecto genérico creado por el tutor. Únete a este proyecto con tus compañeros y cámbiale el nombre.',
          isOpen: true,
          modoEdicion: true,
          roles: {
            projectManager: '',
            marketingDirector: '',
            operationsManager: '',
            financialOfficer: '',
            chef: ''
          },
          dishes: [],
          swot: { fortalezas: '', debilidades: '', oportunidades: '', amenazas: '' },
          viability: { fixedCosts: 3000, variableCostPercent: 30, expectedCustomers: 500, averageTicket: 25 },
          zeroWasteChecklist: [
            { id: 'zw1', text: 'Separación selectiva y pesaje de mermas orgánicas diario.', checked: false },
            { id: 'zw2', text: 'Uso de compostadora para residuos vegetales del huerto del IES.', checked: false },
            { id: 'zw3', text: 'Acuerdos de donación de excedentes alimentarios.', checked: false }
          ],
          prototypes: [],
          dishesEvaluations: {},
          finalNotes: '',
          isSubmitted: false
        };

        const newProject = {
          id: projectId,
          name: projectName,
          description: 'Proyecto genérico creado por el tutor. Únete a este proyecto con tus compañeros y cámbiale el nombre.',
          status: 'planning',
          priority: 'medium',
          category: creationCategory,
          budget: 0,
          spent: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: creationDueDate,
          progress: 0,
          team: [],
          tasks: initialTasks,
          lastUpdated: new Date().toISOString(),
          classroom: assignedClassroom,
          gastronomicState: initialGastState
        };

        await setDoc(doc(db, 'projects', projectId), newProject);
      }

      setGenerationSuccess(true);
      setTimeout(() => setGenerationSuccess(false), 5000);
    } catch (error) {
      console.error("Error generating projects:", error);
      alert("Hubo un error al generar los proyectos.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearClassroomProjects = async () => {
    const confirmClear = window.confirm(`¿Estás seguro de que deseas eliminar TODOS los proyectos de la clase "${assignedClassroom}"? Esta acción no se puede deshacer.`);
    if (!confirmClear) return;

    try {
      setIsGenerating(true);
      for (const p of classroomProjects) {
        await deleteDoc(doc(db, 'projects', p.id));
      }
      alert("Todos los proyectos de esta aula han sido eliminados correctamente.");
    } catch (error) {
      console.error("Error clearing classroom projects:", error);
      alert("Hubo un error al vaciar los proyectos.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    onPublishAnnouncement(newAnnouncement, currentUser.name);
    setNewAnnouncement('');
  };

  // Stats calculation
  const totalStudents = classroomStudents.length;
  const activeProjectsCount = classroomProjects.length;
  const pendingTasksCount = classroomProjects.reduce((acc, p) => acc + p.tasks.filter(t => !t.completed).length, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased" id="profesor-dashboard-root">
      
      {/* Sidebar for Profesor */}
      <aside className="w-full md:w-64 bg-zinc-900 text-white flex flex-col shrink-0 z-30 border-r border-zinc-800">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white overflow-hidden shadow-xs shrink-0">
              {iesLogo ? (
                <img src={iesLogo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <GraduationCap className="h-4.5 w-4.5" />
              )}
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block">Portal Profesor</span>
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block truncate max-w-[130px]" title={iesName}>
                {iesName || 'IES Sostenible'}
              </span>
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/40">
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest block px-2 mb-2">
            Aula Asignada
          </span>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-xl">
            <Building2 className="h-4 w-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold text-zinc-200 truncate">{assignedClassroom}</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest block px-3 mb-2">
            Vistas del Profesor
          </span>
          <button 
            type="button"
            onClick={() => {
              setActiveTab('classroom');
              setSelectedTaskId(null);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'classroom'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Mi Aula e Indicadores</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              setActiveTab('ra');
              setSelectedTaskId(null);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'ra'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>Gestión de RA</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              setActiveTab('tracking');
              setSelectedTaskId(null);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'tracking'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <LineChart className="h-4 w-4" />
            <span>Progreso de RAs (General)</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              setActiveTab('defensa-oral');
              setSelectedTaskId(null);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'defensa-oral'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Defensa Oral y Nota Módulo</span>
          </button>

          {/* Collapsible Fase 3: Tareas */}
          <div className="pt-2 space-y-1">
            <button 
              type="button"
              onClick={() => setCollapsedPhases(prev => prev.includes('fase3') ? prev.filter(p => p !== 'fase3') : [...prev, 'fase3'])}
              className="w-full px-3 flex items-center justify-between py-1.5 hover:bg-zinc-800/30 rounded-lg transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-500">
                  Fase 3: Tareas
                </span>
              </div>
              {collapsedPhases.includes('fase3') ? (
                <ChevronRight className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300" />
              ) : (
                <ChevronDown className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300" />
              )}
            </button>
            
            {!collapsedPhases.includes('fase3') && (
              <div className="space-y-1 pl-1">
                {assessmentTasks.map((task) => {
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => {
                        setActiveTab('task-grading');
                        setSelectedTaskId(task.id);
                        setTaskSearchTerm('');
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'task-grading' && selectedTaskId === task.id
                          ? 'bg-zinc-800 text-white font-bold border-l-2 border-amber-500'
                          : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <CheckSquare className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate text-left">{task.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Return / Logout button */}
        <div className="p-4 border-t border-zinc-850">
          <button
            onClick={onLogoutToAdmin}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Volver a Vista Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Stage */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header */}
        <header className="bg-white border-b border-zinc-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky top-0 z-20 shadow-xs/10">
          <div>
            <h1 className="text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <span>¡Hola, Prof. {currentUser.name}!</span>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-extrabold border border-indigo-100">
                Rol Profesor
              </span>
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Gestionando el <strong className="text-zinc-700 font-bold">{assignedClassroom}</strong> con proyectos escolares activos.
            </p>
          </div>

          {/* Role Switcher Buttons */}
          {currentUser && currentUser.roles && currentUser.roles.length > 1 && (
            <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-2xl border border-zinc-200 shadow-xs">
              {currentUser.roles.map((r) => {
                const isActive = activeRole === r;
                const label = r === 'admin' ? 'Administrador' : r === 'profesor' ? 'Profesor' : r === 'alumno' ? 'Alumno' : r;
                const activeBg = r === 'admin' ? 'bg-emerald-600 text-white shadow-xs' : r === 'profesor' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-teal-600 text-white shadow-xs';
                return (
                  <button
                    key={r}
                    onClick={() => onChangeActiveRole && onChangeActiveRole(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? `${activeBg} font-extrabold scale-102` 
                        : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          <div 
            onClick={() => setIsEditingProfile(true)}
            className="flex items-center gap-3 cursor-pointer group hover:bg-zinc-100 p-1.5 rounded-xl transition-all"
            title="Editar Perfil"
          >
            <img 
              src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.name)}`} 
              alt={currentUser.name} 
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border border-zinc-200 shadow-xs shrink-0 group-hover:border-indigo-400"
            />
            <div className="text-left hidden sm:block">
              <span className="font-extrabold text-xs text-zinc-900 group-hover:text-indigo-600 transition-colors block leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-zinc-400 block font-mono">{currentUser.email}</span>
            </div>
          </div>
        </header>

        {/* Workspace content */}
        <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Statistics row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Stat 1: Students */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Users className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Alumnos Inscritos</span>
                <span className="text-2xl font-extrabold text-indigo-600 font-mono">{totalStudents}</span>
              </div>
            </div>

            {/* Stat 2: Active Projects */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Briefcase className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Proyectos Activos</span>
                <span className="text-2xl font-extrabold text-emerald-600 font-mono">{activeProjectsCount}</span>
              </div>
            </div>

            {/* Stat 3: Pending Tasks */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <CheckSquare className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Tareas Pendientes</span>
                <span className="text-2xl font-extrabold text-amber-600 font-mono">{pendingTasksCount}</span>
              </div>
            </div>

          </div>

          {activeTab === 'defensa-oral' && (
            <div className="space-y-6">
              {/* Main Banner */}
              <div className="p-6 bg-zinc-950 text-white rounded-3xl relative overflow-hidden shadow-sm">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-500/30 border border-indigo-500/40 rounded-md text-[9px] font-black uppercase tracking-wider text-indigo-300">Fase 4: Evaluación Final</span>
                    <span className="text-zinc-500 text-xs font-semibold">•</span>
                    <span className="text-zinc-400 text-xs font-semibold">{currentUser.classroom || 'Aula de Desarrollo Web'}</span>
                  </div>
                  <h2 className="text-xl font-extrabold tracking-tight">Defensa Oral y Calificación del Módulo</h2>
                  <p className="text-[11px] text-zinc-400 max-w-2xl leading-relaxed">
                    Evalúa la contribución individual de cada alumno/a y el resultado de equipo en la exposición oral ante el equipo docente. Las calificaciones son modificables en tiempo real y se reflejan automáticamente en el perfil del estudiante.
                  </p>
                </div>
              </div>

              {/* Configuration Panel */}
              <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-3xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-indigo-600" />
                      Configuración de Ponderaciones y Máximos (Admin)
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-semibold">
                      Define los puntos máximos asignados a cada fase de la evaluación para este curso académico.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {Math.abs((maxTeamScore + maxExpositionScore + maxCoevalAdjustment) - 10.0) < 0.01 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-150">
                        <Check className="h-3 w-3" />
                        Suma 10.0 Puntos (Perfecto)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-150 animate-pulse">
                        ⚠️ Total: {(maxTeamScore + maxExpositionScore + maxCoevalAdjustment).toFixed(1)} ptos (se recomienda 10.0)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Team score max */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                      Fase 1: Máximo Resultado de Equipo
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={maxTeamScore}
                        onChange={(e) => onUpdateOralGradeConfig(parseFloat(e.target.value), maxExpositionScore, maxCoevalAdjustment)}
                        className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={maxTeamScore}
                        onChange={(e) => onUpdateOralGradeConfig(Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)), maxExpositionScore, maxCoevalAdjustment)}
                        className="w-16 px-2 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-center text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Coeval score max */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                      Fase 2: Máximo Coevaluación Diabólica
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={0.1}
                        value={maxCoevalAdjustment}
                        onChange={(e) => onUpdateOralGradeConfig(maxTeamScore, maxExpositionScore, parseFloat(e.target.value))}
                        className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        value={maxCoevalAdjustment}
                        onChange={(e) => onUpdateOralGradeConfig(maxTeamScore, maxExpositionScore, Math.min(5, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="w-16 px-2 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-center text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Exposition score max */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                      Fase 3: Máximo Defensa Individual
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={maxExpositionScore}
                        onChange={(e) => onUpdateOralGradeConfig(maxTeamScore, parseFloat(e.target.value), maxCoevalAdjustment)}
                        className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={maxExpositionScore}
                        onChange={(e) => onUpdateOralGradeConfig(maxTeamScore, Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)), maxCoevalAdjustment)}
                        className="w-16 px-2 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-center text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Student grading cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest">Alumnos Evaluables</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[9px] font-black uppercase tracking-wider">Auto-Guardado Activo</span>
                </div>

                {(() => {
                  const assignedClassroom = currentUser.classroom || 'Aula de Desarrollo Web';
                  const students = allUsers.filter(u => u.role === 'alumno' && (u.classroom === assignedClassroom || !u.classroom));
                  
                  if (students.length === 0) {
                    return (
                      <div className="text-center py-12 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
                        <Users className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-zinc-500">No hay alumnos registrados en este aula.</p>
                      </div>
                    );
                  }

                  return students.map(student => {
                    const oralRecord = individualOralGrades.find(g => g.studentId === student.id) || {
                      studentId: student.id,
                      teamGrade: 5.0,
                      expositionGrade: 5.0,
                      coevalItem1: 'neutral' as const,
                      coevalItem2: 'neutral' as const,
                      justification: '',
                      presented: true
                    };

                    const isPresented = oralRecord.presented !== false;
                    
                    // Calculate Team Grade dynamically from task grades and task weights
                    let teamGrade = 0;
                    assessmentTasks.forEach(task => {
                      let weight = task.weight;
                      if (weight === undefined) {
                        if (task.id === 'step-11') weight = 0.0;
                        else if (task.id === 'step-12') weight = 2.0;
                        else if (task.id === 'step-13') weight = 3.0;
                        else if (task.id === 'step-14') weight = 1.0;
                        else if (task.id === 'step-15') weight = 2.0;
                        else if (task.id === 'step-16') weight = 0.0;
                        else if (task.id === 'step-17') weight = 2.0;
                        else weight = 0.0;
                      }
                      const gradeRecord = studentGrades.find(g => g.studentId === student.id && g.taskId === task.id);
                      const score = gradeRecord ? gradeRecord.score : 0;
                      teamGrade += (score / 10) * weight;
                    });
                    teamGrade = Math.min(10, Math.max(0, teamGrade));

                    const expositionGrade = oralRecord.expositionGrade !== undefined ? oralRecord.expositionGrade : 5.0;

                    let coevalAdjustment = 0;
                    const singleCoevalImpact = maxCoevalAdjustment / 2;
                    if (oralRecord.coevalItem1 === 'positive') coevalAdjustment += singleCoevalImpact;
                    if (oralRecord.coevalItem1 === 'negative') coevalAdjustment -= singleCoevalImpact;
                    if (oralRecord.coevalItem2 === 'positive') coevalAdjustment += singleCoevalImpact;
                    if (oralRecord.coevalItem2 === 'negative') coevalAdjustment -= singleCoevalImpact;

                    const calculatedTeamPoints = (teamGrade / 10) * maxTeamScore;
                    const calculatedExpositionPoints = (expositionGrade / 10) * maxExpositionScore;
                    const preliminaryScore = calculatedTeamPoints + calculatedExpositionPoints + coevalAdjustment;

                    let finalComputedScore = Math.min(10, Math.max(0, preliminaryScore));
                    
                    const hasMinimumInAllParts = teamGrade >= 5.0 && expositionGrade >= 5.0;
                    const isPassed = isPresented && hasMinimumInAllParts && finalComputedScore >= 5.0;

                    if (isPresented && !hasMinimumInAllParts) {
                      finalComputedScore = Math.min(4.0, finalComputedScore);
                    }

                    return (
                      <div key={student.id} className={`bg-white border transition-all rounded-2xl p-5 md:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start shadow-2xs ${
                        !isPresented ? 'border-zinc-200 opacity-75 bg-zinc-50/50' : isPassed ? 'border-zinc-200 hover:border-indigo-200' : 'border-rose-200 hover:border-rose-300'
                      }`}>
                        
                        {/* Student Bio & Presented Toggle */}
                        <div className="xl:col-span-3 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {student.avatarUrl ? (
                                <img src={student.avatarUrl} alt={student.name} referrerPolicy="no-referrer" className="w-11 h-11 rounded-xl object-cover border border-zinc-150" />
                              ) : (
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${student.color || 'bg-indigo-600 text-white'}`}>
                                  {student.initials || 'A'}
                                </div>
                              )}
                              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isPresented ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-extrabold text-zinc-900 truncate">{student.name}</h4>
                              <p className="text-[10px] text-zinc-400 font-medium truncate max-w-[150px]">{student.email}</p>
                              <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">
                                <Users className="h-2.5 w-2.5" />
                                Equipo Activo
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-150 rounded-xl">
                            <span className="text-[10px] font-bold text-zinc-600">¿Presentado/a?</span>
                            <button
                              type="button"
                              onClick={() => onUpdateIndividualOralGrade(student.id, { presented: !isPresented })}
                              className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isPresented ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                            >
                              <span className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${isPresented ? 'translate-x-4.5' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        </div>

                        {/* Scores Entry */}
                        <div className="xl:col-span-6 space-y-4">
                          {isPresented ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Fase 1: Nota Equipo (Autocalculada) */}
                              <div className="space-y-2 p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl">
                                <div className="flex justify-between text-[10px] font-bold text-indigo-900 uppercase tracking-wide">
                                  <span className="flex items-center gap-1 font-extrabold text-indigo-700">
                                    <Sparkles className="h-3 w-3 text-indigo-600 animate-pulse shrink-0" />
                                    Fase 1: Nota Equipo (Cálculo Automático)
                                  </span>
                                  <span className={`font-black ${teamGrade >= 5.0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {teamGrade.toFixed(1)}/10.0
                                  </span>
                                </div>
                                
                                {/* Progress bar */}
                                <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${teamGrade >= 5.0 ? 'bg-indigo-600' : 'bg-rose-500'}`} style={{ width: `${(teamGrade / 10) * 100}%` }} />
                                </div>

                                <div className="space-y-1 pt-1 border-t border-indigo-100/50">
                                  <span className="text-[8px] uppercase tracking-wider text-indigo-500 font-extrabold block">Desglose de Tareas:</span>
                                  <div className="max-h-[110px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                                    {assessmentTasks.map(task => {
                                      let weight = task.weight;
                                      if (weight === undefined) {
                                        if (task.id === 'step-11') weight = 0.0;
                                        else if (task.id === 'step-12') weight = 2.0;
                                        else if (task.id === 'step-13') weight = 3.0;
                                        else if (task.id === 'step-14') weight = 1.0;
                                        else if (task.id === 'step-15') weight = 2.0;
                                        else if (task.id === 'step-16') weight = 0.0;
                                        else if (task.id === 'step-17') weight = 2.0;
                                        else weight = 0.0;
                                      }
                                      const gradeRecord = studentGrades.find(g => g.studentId === student.id && g.taskId === task.id);
                                      const score = gradeRecord ? gradeRecord.score : 0;
                                      const pointsContributed = (score / 10) * weight;

                                      return (
                                        <div key={task.id} className="flex justify-between items-center text-[9px] bg-white border border-indigo-50 px-1.5 py-0.5 rounded-md">
                                          <span className="text-zinc-600 font-medium truncate max-w-[120px]">{task.title.replace(/^\d+\.\s*/, '')}</span>
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="font-mono text-[10px] font-bold text-zinc-500">Nota: {score.toFixed(1)}</span>
                                            <span className="font-mono text-[9px] text-indigo-600 font-black bg-indigo-50/55 px-1 rounded-sm">
                                              +{pointsContributed.toFixed(2)} ptos ({weight.toFixed(1)})
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="flex justify-between text-[9px] font-bold text-indigo-800 pt-1 border-t border-indigo-100/50">
                                  <span>Puntos Finales Fase 1:</span>
                                  <span className="font-mono font-black">{calculatedTeamPoints.toFixed(2)} / {maxTeamScore.toFixed(1)} ptos</span>
                                </div>
                              </div>

                              {/* Fase 3 Input */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
                                  <span className="flex items-center gap-1 font-extrabold">Fase 3: Defensa Indiv. (Escala 0-10)</span>
                                  <span className={`font-black ${expositionGrade >= 5.0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {expositionGrade.toFixed(1)}/10.0 ({expositionGrade >= 5.0 ? 'Aprobado' : 'Suspenso'})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    step={0.1}
                                    value={expositionGrade}
                                    onChange={(e) => onUpdateIndividualOralGrade(student.id, { expositionGrade: parseFloat(e.target.value) })}
                                    className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                  />
                                  <input
                                    type="number"
                                    min={0}
                                    max={10}
                                    step={0.1}
                                    value={expositionGrade}
                                    onChange={(e) => onUpdateIndividualOralGrade(student.id, { expositionGrade: Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)) })}
                                    className="w-14 px-1.5 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] font-bold text-center text-zinc-800"
                                  />
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                                  <span>Equivale a:</span>
                                  <span className="font-mono text-zinc-600 font-extrabold">{calculatedExpositionPoints.toFixed(2)} / {maxExpositionScore.toFixed(1)} ptos máx.</span>
                                </div>
                              </div>

                              {/* Fase 2: Coevaluación Diabólica */}
                              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-zinc-150 pt-3">
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-wide block">Fase 2.1 Implicación y esfuerzo (±{singleCoevalImpact.toFixed(2)})</span>
                                  <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-xl">
                                    {(['positive', 'neutral', 'negative'] as const).map((type) => {
                                      const isSelected = oralRecord.coevalItem1 === type;
                                      let label = 'Neutro';
                                      let colorClass = isSelected ? 'bg-white text-zinc-700 border-zinc-200 shadow-2xs' : 'text-zinc-500 hover:text-zinc-700';
                                      if (type === 'positive') {
                                        label = `+${singleCoevalImpact.toFixed(1)}`;
                                        if (isSelected) colorClass = 'bg-emerald-500 text-white shadow-2xs';
                                      } else if (type === 'negative') {
                                        label = `-${singleCoevalImpact.toFixed(1)}`;
                                        if (isSelected) colorClass = 'bg-rose-500 text-white shadow-2xs';
                                      }
                                      return (
                                        <button
                                          key={type}
                                          type="button"
                                          onClick={() => onUpdateIndividualOralGrade(student.id, { coevalItem1: type })}
                                          className={`py-1 rounded-lg text-[9px] font-black text-center transition-all cursor-pointer border ${colorClass} ${!isSelected ? 'border-transparent' : ''}`}
                                        >
                                          {label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-wide block">Fase 2.2 Colaboración y actitud (±{singleCoevalImpact.toFixed(2)})</span>
                                  <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-xl">
                                    {(['positive', 'neutral', 'negative'] as const).map((type) => {
                                      const isSelected = oralRecord.coevalItem2 === type;
                                      let label = 'Neutro';
                                      let colorClass = isSelected ? 'bg-white text-zinc-700 border-zinc-200 shadow-2xs' : 'text-zinc-500 hover:text-zinc-700';
                                      if (type === 'positive') {
                                        label = `+${singleCoevalImpact.toFixed(1)}`;
                                        if (isSelected) colorClass = 'bg-emerald-500 text-white shadow-2xs';
                                      } else if (type === 'negative') {
                                        label = `-${singleCoevalImpact.toFixed(1)}`;
                                        if (isSelected) colorClass = 'bg-rose-500 text-white shadow-2xs';
                                      }
                                      return (
                                        <button
                                          key={type}
                                          type="button"
                                          onClick={() => onUpdateIndividualOralGrade(student.id, { coevalItem2: type })}
                                          className={`py-1 rounded-lg text-[9px] font-black text-center transition-all cursor-pointer border ${colorClass} ${!isSelected ? 'border-transparent' : ''}`}
                                        >
                                          {label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="py-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                              <AlertCircle className="h-6 w-6 text-zinc-400 mx-auto mb-1.5" />
                              <p className="text-[11px] font-bold text-zinc-500">Alumno/a marcado/a como No Presentado.</p>
                              <p className="text-[9px] text-zinc-400 font-semibold">Las notas y coevaluación están desactivadas. Su nota final del módulo será N.P. (0.0).</p>
                            </div>
                          )}
                        </div>

                        {/* Textarea & Final Result */}
                        <div className="xl:col-span-3 space-y-4 flex flex-col justify-between h-full min-h-[160px]">
                          {/* Justification Textarea */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide block">Justificación y Feedback</span>
                            <textarea
                              rows={2}
                              value={oralRecord.justification || ''}
                              onChange={(e) => onUpdateIndividualOralGrade(student.id, { justification: e.target.value })}
                              placeholder="Escribe la justificación del profesor sobre las notas de exposición y ajuste..."
                              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 font-medium resize-none transition-all leading-normal"
                            />
                          </div>

                          {/* Computed Score */}
                          {!isPresented ? (
                            <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-500 text-center">
                              <span className="text-[8px] font-black uppercase tracking-wider block">Nota Final Módulo</span>
                              <span className="text-xl font-black font-mono block">N.P.</span>
                              <span className="text-[8px] font-bold uppercase text-zinc-400 block mt-0.5">No Presentado</span>
                            </div>
                          ) : (
                            <div className={`p-3.5 rounded-xl border transition-all ${
                              isPassed 
                                ? finalComputedScore >= 9 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-950' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-950'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-950'
                            }`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[8px] font-black uppercase tracking-wider block">Nota Final</span>
                                  <span className="text-[8px] font-bold opacity-85 block">Escala de 0 a 10</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-black font-mono leading-none block">
                                    {finalComputedScore.toFixed(1)}
                                  </span>
                                  <span className={`text-[8px] font-black uppercase tracking-wide block mt-1 px-1.5 py-0.5 rounded-md text-center ${
                                    isPassed 
                                      ? finalComputedScore >= 9 ? 'bg-emerald-500/20 text-emerald-700' : 'bg-indigo-500/20 text-indigo-700'
                                      : 'bg-rose-500/20 text-rose-700'
                                  }`}>
                                    {isPassed ? (finalComputedScore >= 9 ? 'Sobresaliente' : finalComputedScore >= 7 ? 'Notable' : 'Aprobado') : 'Suspenso'}
                                  </span>
                                </div>
                              </div>
                              
                              {!hasMinimumInAllParts && (
                                <p className="text-[8px] font-bold text-rose-600 mt-2 text-center leading-normal">
                                  ⚠️ Requiere mínimo de 5.0 en Fase 1 y Fase 3 para aprobar el módulo.
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
              <StudentTrackingTab 
                students={allUsers}
                assessmentTasks={assessmentTasks}
                grades={studentGrades}
                onUpdateGrade={onUpdateGrade}
                onToggleDelivery={onToggleDelivery}
                onAddTask={onAddAssessmentTask}
                projects={projects}
                individualOralGrades={individualOralGrades}
                maxTeamScore={maxTeamScore}
                maxExpositionScore={maxExpositionScore}
                maxCoevalAdjustment={maxCoevalAdjustment}
              />
            </div>
          )}

          {activeTab === 'task-grading' && selectedTaskId && (() => {
            const task = assessmentTasks.find(t => t.id === selectedTaskId);
            if (!task) return null;

            const filteredStudents = classroomStudents
              .filter(s => s.name.toLowerCase().includes(taskSearchTerm.toLowerCase()))
              .sort((a, b) => {
                const surnameA = a.name.split(' ').slice(-1)[0] || '';
                const surnameB = b.name.split(' ').slice(-1)[0] || '';
                return surnameA.localeCompare(surnameB);
              });

            return (
              <div className="space-y-6">
                {/* Header card */}
                <div className="bg-zinc-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-xs shrink-0 mt-1">
                        <CheckSquare className="h-6 w-6 text-amber-500" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 block">Fase 3: Calificación de Tarea</span>
                        <h2 className="text-xl font-black tracking-tight">{task.title}</h2>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-xs text-zinc-400 font-medium">Criterios de Evaluación:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {task.criterionIds.map(cid => {
                              let description = '';
                              for (const ra of LEARNING_OUTCOMES) {
                                const crit = ra.criteria.find(c => c.id === cid);
                                if (crit) {
                                  description = crit.description;
                                  break;
                                }
                              }
                              return (
                                <div key={cid} className="group relative">
                                  <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md uppercase tracking-tighter cursor-help border border-indigo-500/20">
                                    {cid}
                                  </span>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-zinc-950 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case font-medium border border-zinc-800 shadow-2xl text-left">
                                    <div className="font-bold text-indigo-400 mb-0.5 uppercase tracking-wider text-[8px]">Criterio {cid}</div>
                                    {description}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative w-full md:w-64 shrink-0">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input 
                        type="text"
                        placeholder="Buscar estudiante..."
                        value={taskSearchTerm}
                        onChange={(e) => setTaskSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-zinc-800/80 border border-zinc-700/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Students list */}
                <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                  {filteredStudents.length === 0 ? (
                    <div className="p-12 text-center text-zinc-400">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">No se encontraron estudiantes en esta aula.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200">
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-zinc-400 tracking-wider">Estudiante</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black uppercase text-zinc-400 tracking-wider">Estado de Entrega</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black uppercase text-zinc-400 tracking-wider">Nota (0 - 10)</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-zinc-400 tracking-wider">Estado de Calificación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150">
                          {filteredStudents.map(student => {
                            const gradeRecord = studentGrades.find(g => g.studentId === student.id && g.taskId === task.id);
                            const isDelivered = gradeRecord?.isDelivered ?? false;
                            const score = gradeRecord?.score ?? '';

                            return (
                              <tr key={student.id} className="hover:bg-zinc-50/50 transition-all">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full ${student.color || 'bg-indigo-100 text-indigo-700'} flex items-center justify-center text-xs font-black shadow-sm`}>
                                      {student.initials || student.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-zinc-950">{student.name}</div>
                                      <div className="text-[10px] font-medium text-zinc-400 font-mono">{student.email}</div>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-6 py-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => onToggleDelivery(student.id, task.id, !isDelivered)}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer select-none ${
                                      isDelivered 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70' 
                                        : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-500'
                                    }`}
                                  >
                                    <div className={`w-1.5 h-1.5 rounded-full ${isDelivered ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                                    <span>{isDelivered ? 'Entregado' : 'Pendiente'}</span>
                                  </button>
                                </td>

                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <input 
                                      type="number"
                                      min="0"
                                      max="10"
                                      step="0.1"
                                      value={score}
                                      disabled={!isDelivered}
                                      onChange={(e) => onUpdateGrade(student.id, task.id, Number(e.target.value))}
                                      placeholder="-"
                                      className={`w-20 px-3 py-1.5 rounded-xl text-center text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500 border transition-all ${
                                        isDelivered 
                                          ? 'bg-zinc-50 border-zinc-200 text-zinc-950 focus:bg-white' 
                                          : 'bg-zinc-100 border-zinc-150 text-zinc-300 cursor-not-allowed opacity-50'
                                      }`}
                                    />
                                  </div>
                                </td>

                                <td className="px-6 py-4 text-right">
                                  {!isDelivered ? (
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50 border border-zinc-150 px-2.5 py-1 rounded-lg">
                                      Sin entrega
                                    </span>
                                  ) : score === '' || score === undefined || score === null ? (
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 border border-amber-150 px-2.5 py-1 rounded-lg">
                                      Pendiente Nota
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-lg">
                                      Calificado ({score})
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {activeTab === 'ra' && (
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
              <RATab readOnly={true} />
            </div>
          )}

          {activeTab === 'classroom' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Col: Projects & Assignments */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* ESPACIO DE CREADOR DE PROYECTOS */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-150 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h2 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
                        <span>Espacio del Creador de Proyectos</span>
                      </h2>
                      <p className="text-[11px] text-zinc-600 leading-relaxed font-medium">
                        Genera automáticamente proyectos genéricos en lote para que los alumnos de esta aula puedan seleccionarlos, unirse en equipo, y renombrarlos a su gusto posteriormente.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[9px] font-black uppercase tracking-wider">
                      Herramienta Docente
                    </span>
                  </div>

                  <form onSubmit={handleGenerateGenericProjects} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-white border border-indigo-100 rounded-xl p-4 shadow-2xs">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        Nº de Proyectos a Crear
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="40"
                          value={numProjectsToCreate}
                          onChange={(e) => setNumProjectsToCreate(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                          required
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-400">
                          alumnos: {classroomStudents.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        Categoría Inicial
                      </label>
                      <select
                        value={creationCategory}
                        onChange={(e) => setCreationCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="Gastronomía Sostenible">🍳 Gastronomía Sostenible</option>
                        <option value="Servicio y Sumillería">🍷 Servicio y Sumillería</option>
                        <option value="Cocina Km 0">🌱 Cocina Km 0</option>
                        <option value="Intermodular">📚 Intermodular</option>
                        <option value="Gestión de Eventos">🎉 Gestión de Eventos</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        Fecha Límite Entrega
                      </label>
                      <input
                        type="date"
                        value={creationDueDate}
                        onChange={(e) => setCreationDueDate(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-center justify-between gap-3 pt-2 border-t border-zinc-100">
                      <p className="text-[10px] text-zinc-400 font-medium italic">
                        * Se generarán con nombres como "Proyecto Intermodular Nº 1", etc.
                      </p>
                      
                      <div className="flex items-center gap-2">
                        {classroomProjects.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearClassroomProjects}
                            className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Vaciar Aula</span>
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isGenerating}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md"
                        >
                          <Plus className="h-4 w-4" />
                          <span>{isGenerating ? 'Creando...' : 'Generar Proyectos'}</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {generationSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] px-4 py-2 rounded-xl font-bold flex items-center gap-2 animate-bounce">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>¡Los proyectos se han creado exitosamente! Los alumnos ya los tienen disponibles en su panel.</span>
                    </div>
                  )}
                </div>

                {/* Classroom Projects Card */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-extrabold text-zinc-900 tracking-tight">Proyectos del Aula ({classroomProjects.length})</h2>
                      <p className="text-[11px] text-zinc-400 font-medium">Modelado y avance en tiempo real de todos los equipos del aula.</p>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-700">
                      Sincronizado
                    </span>
                  </div>

                  {classroomProjects.length === 0 ? (
                    <p className="text-xs text-zinc-400 text-center py-6">No hay proyectos específicos para esta categoría.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {classroomProjects.map(project => {
                        const isDelayed = project.progress < 50;
                        const projectTeam = allUsers.filter(u => project.team.includes(u.id));

                        return (
                          <div 
                            key={project.id} 
                            className="p-4 border border-zinc-150 rounded-xl space-y-3 hover:border-indigo-200 hover:shadow-2xs transition-all bg-zinc-50/10 flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                                  {project.category}
                                </span>
                                {isDelayed ? (
                                  <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-150 rounded text-[8px] font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                    <span>PROGRESO LENTO</span>
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded text-[8px] font-bold">
                                    A BUEN RITMO
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xs font-black text-zinc-900 line-clamp-1">{project.name}</h3>
                              
                              <div className="text-[10px] font-mono text-zinc-500 font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-zinc-400" />
                                <span>Límite: {project.dueDate}</span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-bold text-zinc-500">
                                <span>Avance Global</span>
                                <span className="font-mono text-zinc-900">{project.progress}%</span>
                              </div>
                              <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-500 ${isDelayed ? 'bg-amber-500' : 'bg-indigo-600'}`}
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Team initials */}
                            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                              <span className="text-[9px] font-black text-zinc-400 uppercase">Integrantes:</span>
                              <div className="flex -space-x-1.5">
                                {projectTeam.map(member => (
                                  <div 
                                    key={member.id} 
                                    className={`w-5 h-5 rounded-full ${member.color || 'bg-indigo-600 text-white'} border border-white flex items-center justify-center text-[7px] font-black cursor-help`}
                                    title={member.name}
                                  >
                                    {member.initials}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Tasks completed / pending summary */}
                            <div className="pt-2 border-t border-zinc-100">
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block mb-1">
                                Tareas del Proyecto:
                              </span>
                              <div className="flex justify-between items-center text-[10px] font-medium text-zinc-600">
                                <span>{project.tasks.filter(t => t.completed).length} de {project.tasks.length} completadas</span>
                                <span className="font-mono text-[9px] text-zinc-400">
                                  {project.tasks.filter(t => !t.completed).length} pendientes
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Roster list */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-extrabold text-zinc-900 tracking-tight">Estudiantes Inscritos en tu Aula ({classroomStudents.length})</h2>
                      <p className="text-[11px] text-zinc-400">Haz clic en cualquier alumno para consultar su ficha académica completa (RA, CE, Tareas, Defensa Oral, etc).</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {classroomStudents.length === 0 ? (
                      <div className="col-span-2 text-center py-6 space-y-2 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                        <p className="text-xs text-zinc-400 font-medium">Aún no hay alumnos asignados a esta aula.</p>
                        <p className="text-[10px] text-zinc-400">Puedes registrar o asignar alumnos en el Panel del Administrador.</p>
                      </div>
                    ) : (
                      classroomStudents.map(student => (
                        <div 
                          key={student.id} 
                          onClick={() => setSelectedStudentForDossier(student)}
                          className="p-3 border border-zinc-150 hover:border-indigo-300 hover:bg-indigo-50/5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9.5 h-9.5 rounded-xl ${student.color || 'bg-indigo-600 text-white'} flex items-center justify-center text-[11px] font-black shadow-2xs`}>
                              {student.initials}
                            </div>
                            <div>
                              <span className="font-extrabold text-xs text-zinc-800 block group-hover:text-indigo-600 transition-colors">{student.name}</span>
                              <span className="text-[9px] text-zinc-400 font-mono block">{student.email}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-extrabold border border-indigo-100 rounded-md uppercase tracking-tight group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                            VER FICHA
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Right Col: Teacher Announcements Bulletin */}
              <div className="space-y-6">
                
                {/* Bulletin card */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight flex items-center gap-1.5">
                    <Plus className="h-4 w-4 text-indigo-500" />
                    <span>Publicar Anuncio al Aula</span>
                  </h3>

                  <form onSubmit={handlePostAnnouncement} className="space-y-3">
                    <textarea
                      rows={3}
                      placeholder="Escribe un mensaje para tus alumnos..."
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publicar en Tablón</span>
                    </button>
                  </form>

                  <div className="border-t border-zinc-100 pt-4 space-y-3">
                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">
                      Historial de Avisos:
                    </span>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {announcements.map(ann => (
                        <div key={ann.id} className="p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-xl space-y-1">
                          <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                            {ann.text}
                          </p>
                          <div className="flex justify-between text-[9px] font-semibold text-indigo-500">
                            <span>Por {ann.author}</span>
                            <span className="font-mono">{ann.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tips block */}
                <div className="p-5 bg-gradient-to-tr from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl space-y-3 shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-indigo-950">Espacio de Simulación Completa</h4>
                  <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                    Este panel de Profesor está sincronizado en tiempo real con la base de datos de Alumnos de la derecha. Si marcas una tarea como completada, se actualizará al instante para los Alumnos en su respectiva cuenta.
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

      {/* Render Dossier Modal */}
      {selectedStudentForDossier && (
        <StudentDossierModal
          student={selectedStudentForDossier}
          assessmentTasks={assessmentTasks}
          grades={studentGrades}
          individualOralGrades={individualOralGrades}
          projects={projects}
          maxTeamScore={maxTeamScore}
          maxExpositionScore={maxExpositionScore}
          maxCoevalAdjustment={maxCoevalAdjustment}
          onClose={() => setSelectedStudentForDossier(null)}
        />
      )}

      {/* Professor Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="px-6 py-5 border-b border-zinc-150 bg-zinc-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Editar Perfil del Profesor</h3>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const avatarUrl = formData.get('avatarUrl') as string;
                if (name.trim()) {
                  await onUpdateUserProfile(currentUser.id, name.trim(), avatarUrl.trim());
                  setIsEditingProfile(false);
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Nombre de Profesor</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={currentUser.name}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-250 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white shadow-xs"
                  placeholder="Ej. Carmen Santos"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5">URL de Foto (Avatar)</label>
                <input 
                  type="url" 
                  name="avatarUrl" 
                  defaultValue={currentUser.avatarUrl || ''}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-250 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white shadow-xs"
                  placeholder="https://ejemplo.com/foto.jpg"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">Deja vacío para usar una ilustración por defecto.</span>
              </div>
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
