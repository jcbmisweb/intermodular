import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Building2, 
  Calendar, 
  CheckSquare, 
  BookOpen, 
  Users, 
  Sparkles, 
  LogOut,
  Bell,
  MessageSquare,
  School,
  Activity,
  Heart,
  Utensils,
  ChefHat,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  HelpCircle,
  Info,
  Rocket,
  Award,
  TrendingUp,
  FileText,
  Search,
  Lock,
  Unlock,
  Copy,
  Plus,
  Trash2,
  Check,
  DollarSign,
  Briefcase,
  Layers,
  Compass,
  Smile,
  Globe,
  Flame,
  Scale,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Download,
  Printer,
  X,
  ArrowLeft,
  Lightbulb,
  Save,
  Image as ImageIcon,
  Leaf,
  ClipboardList,
  Palette,
  Monitor,
  PenTool,
  Link,
  Upload,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { GASTRONOMIC_ZONES } from '../data/gastronomicZones';
import { AppUser, Project, AssessmentTask, StudentGrade, IndividualOralGrade, Announcement } from '../types';
import { LEARNING_OUTCOMES } from '../data/ra';

const TAREAS_INVESTIGACION = [
  {
    id: 1,
    title: 'Mapeo de la Competencia',
    desc: 'Identificar qué otros restaurantes operan en la zona elegida y analizar su oferta.',
    guia: 'Buscar al menos 5 establecimientos cercanos (radio de X km o mismo municipio). Clasificarlos por tipo (pizzería, tradicional, alta cocina, bar de tapas, etc.). Identificar si alguno destaca por oferta verde, ecológica o sostenible.',
    entregable: 'Un mapa visual (p. ej. Google My Maps) o una lista con la ubicación y concepto de cada local.'
  },
  {
    id: 2,
    title: 'Análisis de Cartas y Pruebas',
    desc: 'Estudiar a fondo la oferta gastronómica y precios de los 3 competidores más directos.',
    guia: 'Revisar sus cartas digitales o físicas y anotar los platos estrella. Analizar el rango de precios (entrantes, principales, postres) para entender el ticket medio. Detectar huecos (¿faltan opciones vegetarianas?, ¿falta producto local?, ¿abuso de congelados?).',
    entregable: 'Tabla comparativa con precios y conclusión sobre los huecos de mercado a aprovechar.'
  },
  {
    id: 3,
    title: 'Reseñas y Reputación Online',
    desc: 'Investigar qué opina la gente en internet sobre los restaurantes de la zona.',
    guia: 'Entrar en Google Maps o TripAdvisor de los competidores analizados. Buscar palabras clave: calidad, precio, producto local, servicio, lento, caro. Identificar quejas comunes para evitarlas y elogios para replicarlos.',
    entregable: 'Un breve informe con los SÍ (lo que el cliente premia) y los NO (lo que el cliente penaliza).'
  },
  {
    id: 4,
    title: 'Perfil del Cliente Local',
    desc: 'Dibujar el perfil de las personas que viven en esa zona de Murcia todo el año.',
    guia: 'Perfil demográfico (familias, gente mayor, estudiantes, trabajadores). Costumbres gastronómicas (menú del día, tapeo fin de semana, salidas familiares). Sensibilidad ambiental vs búsqueda de cantidad/precio.',
    entregable: 'Ficha de Cliente Ideal (Buyer Persona) que represente al habitante de la zona.'
  },
  {
    id: 5,
    title: 'Perfil del Turista / Visitante',
    desc: 'Analizar el flujo de personas de fuera que visitan la zona.',
    guia: 'Temporalidad (verano, fin de semana, religioso, extranjero invierno). Expectativas (gastronomía típica, opciones internacionales, comida rápida). Disposición al gasto en comparación con el cliente local.',
    entregable: 'Resumen de la estacionalidad del turismo y las demandas del visitante.'
  },
  {
    id: 6,
    title: 'Catálogo de Producto',
    desc: 'Crear la despensa base del restaurante basada en la temporalidad de la Región de Murcia.',
    guia: 'Investigar frutas, verduras y pescados de temporada en cada estación. Productos destacados: chato murciano, michirones, arroz Calasparra, pimentón, hortalizas de la huerta. Definir cómo condicionará el diseño de la carta según la época.',
    entregable: 'Calendario de temporada de alimentos esenciales para el proyecto.'
  },
  {
    id: 7,
    title: 'Mapa de Proveedores Km0',
    desc: 'Localizar productores reales de la Región de Murcia a los que comprar directamente.',
    guia: 'Cooperativas, cofradías de pescadores, bodegas (Jumilla, Bullas), queserías artesanales. Anotar distancia en km desde el productor hasta el restaurante (debe ser < 100km). Verificar capacidad de suministro y tipo de producto.',
    entregable: 'Directorio de proveedores locales con datos de contacto y productos que suministran.'
  },
  {
    id: 8,
    title: 'Auditoría Sostenible',
    desc: 'Plantear las medidas ecológicas que el restaurante aplicará más allá de la comida.',
    guia: 'Gestión de residuos (compostaje, reciclaje, evitar Food Waste). Ahorro de agua y energía (clave en región con escasez hídrica como Murcia). Materiales (reciclados, eliminación de plásticos, uniformes orgánicos).',
    entregable: 'Listado de políticas sostenibles obligatorias para el funcionamiento del restaurante.'
  },
  {
    id: 9,
    title: 'Benchmarking Innovación',
    desc: 'Buscar inspiración en restaurantes sostenibles referentes para replicar buenas ideas.',
    guia: 'Investigar restaurantes con proyectos de restauración circular. Analizar técnicas originales: aprovechamiento total, conservación ancestral, sin huella de carbono. Adaptar 3 ideas innovadoras detectadas al proyecto local.',
    entregable: 'Documento con 3 ideas innovadoras adaptadas al proyecto.'
  },
  {
    id: 10,
    title: 'Tendencias Visuales',
    desc: 'Definir la estética visual de la carta y el marketing del restaurante.',
    guia: 'Colores y texturas (tonos tierra, verdes huerta, azules mar) y soportes (papel reciclado, digital). Estrategia de comunicación: contar la historia de productores locales en redes sociales. Boceto del estilo gráfico de la carta.',
    entregable: 'Moodboard visual de inspiración y boceto del estilo de la carta.'
  }
];

const INGREDIENT_UNITS = [
  { id: 'kg', label: 'Kilogramos (kg)', type: 'mass', base: 'kg', factor: 1 },
  { id: 'g', label: 'Gramos (g)', type: 'mass', base: 'kg', factor: 0.001 },
  { id: 'l', label: 'Litros (L)', type: 'volume', base: 'l', factor: 1 },
  { id: 'dl', label: 'Decilitros (dl)', type: 'volume', base: 'l', factor: 0.1 },
  { id: 'ml', label: 'Mililitros (ml)', type: 'volume', base: 'l', factor: 0.001 },
  { id: 'ud', label: 'Unidades (ud)', type: 'unit', base: 'ud', factor: 1 }
];

const ALLERGENS = [
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'crustaceos', label: 'Crustáceos', icon: '🦀' },
  { id: 'huevos', label: 'Huevos', icon: '🥚' },
  { id: 'pescado', label: 'Pescado', icon: '🐟' },
  { id: 'cacahuetes', label: 'Cacahuetes', icon: '🥜' },
  { id: 'soja', label: 'Soja', icon: '🌱' },
  { id: 'lacteos', label: 'Lácteos', icon: '🥛' },
  { id: 'frutos_cascara', label: 'Frutos de Cáscara', icon: '🌰' },
  { id: 'apio', label: 'Apio', icon: '🥬' },
  { id: 'mostaza', label: 'Mostaza', icon: '🌭' },
  { id: 'sesamo', label: 'Sésamo', icon: '🥯' },
  { id: 'sulfitos', label: 'Sulfitos', icon: '🍷' },
  { id: 'altramuces', label: 'Altramuces', icon: '🌸' },
  { id: 'moluscos', label: 'Moluscos', icon: '🐙' },
];


interface AlumnoDashboardProps {
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
  onToggleDelivery: (studentId: string, taskId: string, isDelivered: boolean) => void;
  individualOralGrades: IndividualOralGrade[];
  maxTeamScore: number;
  maxExpositionScore: number;
  maxCoevalAdjustment: number;
  announcements: Announcement[];
  onToggleReadAnnouncement: (announcementId: string) => void;
  onUpdateStudentName: (studentId: string, newName: string) => void;
}

// Default initial state for local gastronomy project simulation
const INITIAL_GASTRONOMIC_STATE = {
  id: '6BIQOX',
  teamName: 'Los Cocedores del Arenal',
  isOpen: false,
  modoEdicion: true,
  
  // 1. Equipo y Zona
  restaurantName: 'Arenal Ecocuisine',
  selectedZone: '1',
  researchTexts: {} as Record<number, string>,
  decisionGrupal: {
    logo: '',
    slogan: '',
    publicoObjetivo: '',
    valores: [] as string[]
  },
  locationArea: 'Zona Histórica y Comercial - Proximidad a Mercados Locales',
  conceptDescription: 'Un bistró de alta cocina sostenible que fusiona técnicas tradicionales con ingredientes de temporada de Km 0. Minimizamos el desperdicio y conectamos directamente con pequeños agricultores locales.',
  marketStudy: 'Análisis de demanda indica alta valoración de propuestas saludables y ecológicas en el segmento de profesionales de 25-50 años. Competencia directa limitada en menús certificados Km 0.',

  // 2. Reparto Global
  roles: {
    projectManager: '',
    fbDirector: '',
    sustainabilityManager: '',
    marketingDirector: '',
    financialDirector: ''
  },

  // 3. Análisis
  swot: {
    fortalezas: 'Ingredientes 100% de temporada; huella de carbono auditada; red consolidada de productores de proximidad.',
    debilidades: 'Costes de adquisición iniciales elevados; alta dependencia del clima estacional para el menú.',
    oportunidades: 'Subvenciones europeas para transición ecológica; crecimiento del turismo gastronómico sostenible.',
    amenazas: 'Inestabilidad de precios de materias primas; regulaciones de etiquetado de alérgenos más estrictas.'
  },

  // 4. Diseño de Carta
  seasonalAnalysis: {} as Record<string, { products: string, sustainability: string, sources: string }>,
  dishes: [] as Array<{
    id: string;
    userId: string;
    name: string;
    type: 'aperitivo' | 'entrante' | 'principal' | 'postre';
    portions: number;
    description: string;
    image: string;
    ingredients: Array<{ name: string, quantity: string, unit: string, unitPrice?: number, priceUnit?: string, netWeight?: number, grossWeight?: number }>;
    elaboration: string;
    sustainabilityJustification: string;
    allergens: string[];
    pvp?: number;
  }>,

  // 5. Prototipos (Tarea 4)
  task4: {
    visualIdentity: 'Nuestro restaurante se basa en colores tierra y verdes profundos, utilizando materiales reciclados como el corcho y papel artesanal de semillas para la carta física.',
    digitalLink: '',
    qrImage: '',
    physicalImage: '',
    physicalDescription: '',
    activeTab: 'instrucciones' as 'instrucciones' | 'prototipo' | 'dossier'
  },

  // 6. Memoria Intermedia
  task5: {
    activeTab: 'redactar' as 'redactar' | 'pdf',
    contextAndJustification: '',
    researchSynthesis: '',
    restaurantObjectives: '',
    valueProposition: '',
    gastronomicExplanation: '',
    workMethodology: '',
    timePlanning: '',
    odsRelationship: '',
    finalValuation: '',
    bibliography: ''
  },

  // 7. Viabilidad
  viability: {
    fixedCosts: 4500, // Alquiler, nóminas básicas, suministros
    variableCostPercent: 28, // % de materias primas
    expectedCustomers: 650, // Clientes estimados al mes
    averageTicket: 35 // Ticket medio por persona
  },

  // 8. Producción Final
  task8: {
    activeTab: 'instrucciones',
    presentations: [] as Array<{ studentId: string, url: string }>,
    prototypePhotoUrl: '',
    missions: {
      designers: [] as string[],
      artisans: [] as string[],
      editors: [] as string[]
    }
  },
  zeroWasteChecklist: [
    { id: 'zw1', text: 'Separación selectiva y pesaje de mermas orgánicas diario.', checked: true },
    { id: 'zw2', text: 'Uso de compostadora para residuos vegetales del huerto del IES.', checked: true },
    { id: 'zw3', text: 'Acuerdos de donación de excedentes alimentarios aptos con comedores sociales.', checked: false },
    { id: 'zw4', text: 'Control de raciones mediante fichas técnicas milimetradas.', checked: true },
    { id: 'zw5', text: 'Eliminación del 100% de plásticos de un solo uso en cocina y sala.', checked: true }
  ],

  // 9. Coevaluación
  task9: {
    maxCoevaluationImpact: 1.0, // Decidido por el administrador (+/- puntos)
    reviews: {} as Record<string, Record<string, {
      participacion: number,
      responsabilidad: number,
      colaboracion: number,
      contribucion: number,
      comment: string
    }>>
  },
  peerReviews: [
    { name: 'Alejandro Martínez', role: 'Chef Ejecutivo', score: 9.5, comment: 'Liderazgo excelente y riguroso control del orden de la cocina.' },
    { name: 'Isabel García', role: 'Sous Chef', score: 9.0, comment: 'Gran apoyo en la estandarización de las recetas y fichas técnicas.' },
    { name: 'Carlos Ruiz', role: 'Cost Controller', score: 8.5, comment: 'Control exhaustivo pero necesita agilizar las compras con proveedores.' },
    { name: 'Marta Pérez', role: 'Sustainability Officer', score: 10, comment: 'Involucración brillante en la justificación de cada ingrediente Km 0.' }
  ],

  // 10. Memoria Final
  finalNotes: 'El proyecto Arenal Ecocuisine demuestra alta viabilidad técnica y excelente compromiso con la Agenda 2030. Un modelo replicable y altamente educativo para el alumnado del IES.',
  isSubmitted: false,

  // Evaluación Docente (actualizable en tiempo real por el profesor)
  evaluation: {
    status: 'Aprobado Provisional - Pendiente de Memoria Final',
    score: 8.5,
    ra1Score: 9.0,
    ra2Score: 8.0,
    ra3Score: 8.5,
    feedback: 'Excelente enfoque en el aprovechamiento de mermas locales en el Tartar Rosa. Se sugiere revisar con mayor profundidad los costes fijos de personal en el apartado de viabilidad financiera.'
  }
};

export default function AlumnoDashboard({ 
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
  onToggleDelivery,
  individualOralGrades,
  maxTeamScore,
  maxExpositionScore,
  maxCoevalAdjustment,
  announcements,
  onToggleReadAnnouncement,
  onUpdateStudentName
}: AlumnoDashboardProps) {
  // Current active sub-tab/view inside the simulator
  const [activeMenu, setActiveMenu] = useState<string>('panel-principal');
  const [collapsedPhases, setCollapsedPhases] = useState<string[]>([]);
  
  // Student name edit state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(currentUser.name);

  useEffect(() => {
    setEditNameValue(currentUser.name);
  }, [currentUser.name]);
  const [activeStep3Tab, setActiveStep3Tab] = useState<'instrucciones' | 'investigacion' | 'decision'>('instrucciones');
  const [activeStep4Tab, setActiveStep4Tab] = useState<'instrucciones' | 'temporada' | 'mis-platos' | 'carta-completa'>('instrucciones');
  const [taskAssignments, setTaskAssignments] = useState<Record<number, string>>({});

  const [showDocType, setShowDocType] = useState<'none' | 'tarea1' | 'tarea2' | 'tarea3' | 'coevaluacion' | 'memoria-final'>('none');

  const tasksPerUser = allUsers.reduce((acc, user) => {
    acc[user.id] = Object.values(taskAssignments).filter(assignedUserId => assignedUserId === user.id).length;
    return acc;
  }, {} as Record<string, number>);

  const handlePrint = () => {
    window.print();
  };

  const renderIESHeader = (title: string, subtitle: string) => (
    <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-6 mb-10">
      <div className="space-y-1">
        <p className="text-sm font-black uppercase tracking-tighter text-zinc-400">
          {subtitle}
        </p>
        <h1 className="text-2xl font-black text-zinc-900">{title}</h1>
        <div className="flex items-center gap-4 text-xs font-bold text-zinc-600 mt-2">
          <span className="bg-zinc-100 px-2 py-1 rounded">CURSO: 2025/2026</span>
          <span className="bg-zinc-100 px-2 py-1 rounded uppercase">IES: {iesName || 'CENTRO EDUCATIVO'}</span>
        </div>
      </div>
      <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-200 p-2">
        {iesLogo ? (
          <img src={iesLogo} alt="Logo IES" className="w-full h-full object-contain" />
        ) : (
          <School className="h-8 w-8 text-zinc-400" />
        )}
      </div>
    </div>
  );

  // Local Gastronomic project state loaded from localStorage or initialized with defaults
  const [gastState, setGastState] = useState(() => {
    const saved = localStorage.getItem('studio_gast_project_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_GASTRONOMIC_STATE,
          ...parsed,
          decisionGrupal: {
            ...INITIAL_GASTRONOMIC_STATE.decisionGrupal,
            ...(parsed.decisionGrupal || {})
          },
          researchTexts: {
            ...INITIAL_GASTRONOMIC_STATE.researchTexts,
            ...(parsed.researchTexts || {})
          },
          seasonalAnalysis: {
            ...INITIAL_GASTRONOMIC_STATE.seasonalAnalysis,
            ...(parsed.seasonalAnalysis || {})
          },
          dishes: Array.isArray(parsed.dishes) ? parsed.dishes : INITIAL_GASTRONOMIC_STATE.dishes,
          task4: {
            ...INITIAL_GASTRONOMIC_STATE.task4,
            ...(parsed.task4 || {})
          },
          task5: {
            ...INITIAL_GASTRONOMIC_STATE.task5,
            ...(parsed.task5 || {})
          },
          task8: {
            ...INITIAL_GASTRONOMIC_STATE.task8,
            ...(parsed.task8 || {})
          },
          task9: {
            ...INITIAL_GASTRONOMIC_STATE.task9,
            ...(parsed.task9 || {})
          }
        };
      } catch (e) {
        return INITIAL_GASTRONOMIC_STATE;
      }
    }
    return INITIAL_GASTRONOMIC_STATE;
  });

  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  // Keep state synced with local storage
  useEffect(() => {
    localStorage.setItem('studio_gast_project_v1', JSON.stringify(gastState));
  }, [gastState]);

  // Helper to get grade record for a student and task
  const getGradeRecord = (studentId: string, taskId: string) => {
    return studentGrades.find(g => g.studentId === studentId && g.taskId === taskId);
  };

  // Helper to calculate progress for a criterion
  const calculateCriterionProgress = (studentId: string, criterionId: string) => {
    const tasksCovering = assessmentTasks.filter(t => t.criterionIds.includes(criterionId));
    if (tasksCovering.length === 0) return 0;

    const deliveredGrades = tasksCovering
      .map(t => getGradeRecord(studentId, t.id))
      .filter((g): g is StudentGrade => g !== undefined && g.isDelivered === true);

    if (deliveredGrades.length === 0) return 0;
    
    const avgGrade = deliveredGrades.reduce((sum, g) => sum + g.score, 0) / deliveredGrades.length;
    
    let weight = 0;
    for (const ra of LEARNING_OUTCOMES) {
      const crit = ra.criteria.find(c => c.id === criterionId);
      if (crit) {
        weight = crit.weight;
        break;
      }
    }
    return (avgGrade / 10) * weight;
  };

  const calculateRAProgress = (studentId: string, raId: number) => {
    const ra = LEARNING_OUTCOMES.find(r => r.id === raId);
    if (!ra) return 0;
    
    return ra.criteria.reduce((sum, crit) => {
      return sum + calculateCriterionProgress(studentId, crit.id);
    }, 0);
  };

  const renderGradeBadge = (taskId: string) => {
    const gradeRecord = studentGrades.find(g => g.studentId === currentUser.id && g.taskId === taskId);
    
    if (!gradeRecord?.isDelivered) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-lg inline-flex">
          <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Pendiente de Entrega</span>
        </div>
      );
    }

    const grade = gradeRecord.score;
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg inline-flex">
        <Award className="h-3.5 w-3.5 text-indigo-600" />
        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-tighter">Calificación: {grade.toFixed(1)} / 10</span>
      </div>
    );
  };

  const renderDeliveryStatus = (taskId: string) => {
    const gradeRecord = studentGrades.find(g => g.studentId === currentUser.id && g.taskId === taskId);
    const isDelivered = gradeRecord?.isDelivered ?? false;

    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
        isDelivered 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
          : 'bg-amber-50 border-amber-100 text-amber-700'
      }`}>
        {isDelivered ? (
          <CheckSquare className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <span className="text-[10px] font-black uppercase tracking-widest">
          {isDelivered ? 'Entregado' : 'Pendiente de Entrega'}
        </span>
      </div>
    );
  };

  // Toast status
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const isCoordinator = gastState.roles.projectManager === currentUser.id;
  const isCreative = gastState.roles.marketingDirector === currentUser.id;
  const canEditTask4 = isCoordinator || isCreative || !gastState.roles.projectManager;

  // Helper to update fields
  const updateField = (section: string, value: any) => {
    if (!gastState.modoEdicion) {
      triggerToast('⚠️ Activa el MODO EDICIÓN en el menú izquierdo para modificar los campos.');
      return;
    }
    setGastState((prev: any) => ({
      ...prev,
      [section]: value
    }));
  };

  const updateNestedField = (section: string, field: string, value: any) => {
    if (!gastState.modoEdicion) {
      triggerToast('⚠️ Activa el MODO EDICIÓN en el menú izquierdo para modificar los campos.');
      return;
    }
    setGastState((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Add a new dish to Menu Design
  const [newDish, setNewDish] = useState({
    name: '',
    category: 'entrante' as 'entrante' | 'principal' | 'postre',
    costPrice: 0,
    salePrice: 0,
    allergens: [] as string[],
    odsImpact: [] as string[],
    sustainabilityJustification: ''
  });

  const handleAddDish = () => {
    if (!gastState.modoEdicion) {
      triggerToast('⚠️ El MODO EDICIÓN está apagado.');
      return;
    }
    if (!newDish.name.trim()) {
      triggerToast('⚠️ Introduce el nombre de la elaboración.');
      return;
    }
    const createdDish = {
      ...newDish,
      id: 'dish-' + Date.now(),
      costPrice: Number(newDish.costPrice) || 0,
      salePrice: Number(newDish.salePrice) || 0
    };
    updateField('dishes', [...gastState.dishes, createdDish]);
    setNewDish({
      name: '',
      category: 'entrante',
      costPrice: 0,
      salePrice: 0,
      allergens: [],
      odsImpact: [],
      sustainabilityJustification: ''
    });
    triggerToast('🍽️ Plato añadido con éxito a la carta.');
  };

  const handleDeleteDish = (id: string) => {
    if (!gastState.modoEdicion) {
      triggerToast('⚠️ El MODO EDICIÓN está apagado.');
      return;
    }
    const filtered = gastState.dishes.filter((d: any) => d.id !== id);
    updateField('dishes', filtered);
    triggerToast('🗑️ Elaboración eliminada.');
  };

  // Handle Academic Guide Sub-Tabs
  const [guideSubTab, setGuideSubTab] = useState<'ra' | 'ods'>('ra');

  // Copy Project Code helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(gastState.id);
    triggerToast('📋 ¡Código de proyecto copiado al portapapeles!');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row antialiased text-zinc-800" id="alumno-dashboard-root">
      
      {/* SIDEBAR - Styled exactly as requested in the mockup */}
      <aside className="w-full md:w-66 bg-zinc-900 text-zinc-300 flex flex-col shrink-0 border-r border-zinc-800 select-none">
        
        {/* Back Button to Admin Panel */}
        <div className="p-4 border-b border-zinc-800">
          <button
            onClick={onLogoutToAdmin}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-100 rounded-xl text-xs font-bold transition-all cursor-pointer border border-zinc-700/50"
          >
            <LogOut className="h-3.5 w-3.5 transform rotate-180" />
            <span>Volver al Panel Admin</span>
          </button>
        </div>

        {/* Interactive MODO EDICIÓN Switch */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/20">
          <div className="bg-emerald-950/40 border border-emerald-900/55 p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Modo Edición
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !gastState.modoEdicion;
                  setGastState((prev: any) => ({ ...prev, modoEdicion: nextVal }));
                  triggerToast(nextVal ? '⚡ Modo Edición Activado' : '🔒 Modo Lectura Activado');
                }}
                className="focus:outline-none cursor-pointer text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {gastState.modoEdicion ? (
                  <ToggleRight className="h-7 w-7 text-emerald-400" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-zinc-500" />
                )}
              </button>
            </div>
            <p className="text-[9px] text-emerald-500/90 leading-normal mt-1.5 font-medium">
              {gastState.modoEdicion 
                ? 'Tienes superpoderes: puedes editar cualquier campo sin restricciones.' 
                : 'Solo lectura. Haz clic en el switch para activar la edición.'}
            </p>
          </div>
        </div>

        {/* Sidebar Nav Tree */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5 custom-scrollbar">
          
          {/* Main sections */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveMenu('panel-principal')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMenu === 'panel-principal'
                  ? 'bg-white text-zinc-900 shadow-sm font-extrabold'
                  : 'hover:bg-zinc-800 hover:text-white text-zinc-400'
              }`}
            >
              <LayoutIcon active={activeMenu === 'panel-principal'} />
              <span>Panel Principal</span>
            </button>

            <button
              onClick={() => setActiveMenu('guia-academica')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMenu === 'guia-academica'
                  ? 'bg-white text-zinc-900 shadow-sm font-extrabold'
                  : 'hover:bg-zinc-800 hover:text-white text-zinc-400'
              }`}
            >
              <GraduationCap className={`h-4 w-4 ${activeMenu === 'guia-academica' ? 'text-zinc-900' : 'text-zinc-500'}`} />
              <span>Guía Académica</span>
            </button>

            <button
              onClick={() => setActiveMenu('evaluacion-docente')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMenu === 'evaluacion-docente'
                  ? 'bg-white text-zinc-900 shadow-sm font-extrabold'
                  : 'hover:bg-zinc-800 hover:text-white text-zinc-400'
              }`}
            >
              <ShieldCheck className={`h-4 w-4 ${activeMenu === 'evaluacion-docente' ? 'text-zinc-900' : 'text-zinc-500'}`} />
              <span>Evaluación Docente</span>
            </button>
          </div>

          {/* FASE 1: CONFIGURACIÓN */}
          <div className="space-y-1">
            <button 
              onClick={() => setCollapsedPhases(prev => prev.includes('fase1') ? prev.filter(p => p !== 'fase1') : [...prev, 'fase1'])}
              className="w-full px-3 flex items-center justify-between py-1 hover:bg-zinc-800/30 rounded-lg transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] uppercase font-black tracking-widest text-blue-500">
                  Fase 1: Configuración
                </span>
              </div>
              {collapsedPhases.includes('fase1') ? (
                <ChevronRight className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300" />
              ) : (
                <ChevronDown className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300" />
              )}
            </button>
            
            {!collapsedPhases.includes('fase1') && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
              >
                <button
                  onClick={() => setActiveMenu('step-1')}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeMenu === 'step-1'
                      ? 'bg-zinc-800 text-white font-bold border-l-2 border-blue-500'
                      : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Users className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">1. Equipo y Zona</span>
                </button>

                <button
                  onClick={() => setActiveMenu('step-2')}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeMenu === 'step-2'
                      ? 'bg-zinc-800 text-white font-bold border-l-2 border-blue-500'
                      : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">2. Panel de Reparto Global</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* FASE 2: EJECUCIÓN */}
          <div className="space-y-1">
            <button 
              onClick={() => setCollapsedPhases(prev => prev.includes('fase2') ? prev.filter(p => p !== 'fase2') : [...prev, 'fase2'])}
              className="w-full px-3 flex items-center justify-between py-1 hover:bg-zinc-800/30 rounded-lg transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500">
                  Fase 2: Ejecución
                </span>
              </div>
              {collapsedPhases.includes('fase2') ? (
                <ChevronRight className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300" />
              ) : (
                <ChevronDown className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300" />
              )}
            </button>

            {!collapsedPhases.includes('fase2') && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
              >
                {[
                  { id: 'step-3', icon: Activity, text: '3. Análisis' },
                  { id: 'step-4', icon: Utensils, text: '4. Diseño de Carta' },
                  { id: 'step-5', icon: ChefHat, text: '5. Prototipos' },
                  { id: 'step-6', icon: FileText, text: '6. Memoria Intermedia' },
                  { id: 'step-7', icon: TrendingUp, text: '7. Viabilidad' },
                  { id: 'step-8', icon: Flame, text: '8. Producción Final' },
                  { id: 'step-9', icon: Scale, text: '9. Coevaluación' },
                  { id: 'step-10', icon: Award, text: '10. Memoria Final' }
                ].map((step) => {
                  const IconComp = step.icon;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveMenu(step.id)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeMenu === step.id
                          ? 'bg-zinc-800 text-white font-bold border-l-2 border-emerald-500'
                          : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <IconComp className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate text-left">{step.text}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* FASE 3: TAREAS */}
          <div className="space-y-1">
            <button 
              onClick={() => setCollapsedPhases(prev => prev.includes('fase3') ? prev.filter(p => p !== 'fase3') : [...prev, 'fase3'])}
              className="w-full px-3 flex items-center justify-between py-1 hover:bg-zinc-800/30 rounded-lg transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
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
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
              >
                {[
                  { id: 'step-11', text: '1. Entregable Tarea 1' },
                  { id: 'step-12', text: '2. Entregable Tarea 2' },
                  { id: 'step-13', text: '3. Entregable Tarea 3' },
                  { id: 'step-14', text: '4. Entregable Tarea 4' },
                  { id: 'step-15', text: '5. Entregable Tarea 5' },
                  { id: 'step-16', text: '6. Informe Coevaluación' },
                  { id: 'step-17', text: '7. Memoria Final del Proyecto' }
                ].map((step) => {
                  const isDelivered = studentGrades.find(g => g.studentId === currentUser.id && g.taskId === step.id)?.isDelivered;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveMenu(step.id)}
                      className={`w-full flex items-center justify-between gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeMenu === step.id
                          ? 'bg-zinc-800 text-white font-bold border-l-2 border-amber-500'
                          : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckSquare className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate text-left">{step.text}</span>
                      </div>
                      {isDelivered && (
                        <div className="bg-emerald-500/20 p-0.5 rounded shadow-sm">
                          <Check className="h-2.5 w-2.5 text-emerald-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>


        </div>

        {/* Sidebar Footer Widget - Matches first screenshot exactly */}
        <div className="p-4 border-t border-zinc-800/90 bg-zinc-950/40">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Proyecto</span>
              <button 
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[10px] font-bold font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-900/60 px-1.5 py-0.5 rounded cursor-pointer hover:bg-emerald-900 hover:text-white transition-colors"
              >
                <span>#{gastState.id}</span>
                <Copy className="h-2.5 w-2.5" />
              </button>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500 text-[11px]">Equipo:</span>
                <span className="font-bold text-zinc-200 truncate max-w-[110px]" title={gastState.teamName}>
                  {gastState.teamName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 text-[11px]">Estado:</span>
                <span className={`font-bold uppercase text-[10px] ${gastState.isOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {gastState.isOpen ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 text-[11px]">Carta:</span>
                <span className="font-bold text-zinc-200 font-mono">
                  {gastState.dishes.length}/4 platos
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                const nextOpen = !gastState.isOpen;
                updateField('isOpen', nextOpen);
                triggerToast(nextOpen ? '🔓 Equipo Abierto para Colaboración' : '🔒 Equipo Cerrado de forma provisional');
              }}
              className={`w-full py-2 rounded-lg text-center font-bold text-[11px] transition-all cursor-pointer ${
                gastState.isOpen 
                  ? 'bg-rose-950/50 border border-rose-900/60 text-rose-300 hover:bg-rose-900 hover:text-white'
                  : 'bg-emerald-950/50 border border-emerald-900/60 text-emerald-300 hover:bg-emerald-900 hover:text-white'
              }`}
            >
              {gastState.isOpen ? '🔒 Cerrar Equipo' : '🔓 Abrir Equipo'}
            </button>
          </div>
        </div>

      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Toast Notification Container */}
        <AnimatePresence>
          {showToast && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-5 right-5 z-50 bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-zinc-750 text-xs font-semibold"
            >
              <Sparkles className="h-4 w-4 text-emerald-400 animate-bounce" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Warning: MODO EDICIÓN ACTIVE BANNER */}
        {gastState.modoEdicion && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2 flex items-center justify-between text-emerald-800 text-[11px] font-bold">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span><strong>MODO EDICIÓN ACTIVO:</strong> Puedes modificar los datos de tu restaurante, SWOT y recetas gastronómicas.</span>
            </div>
            <span className="text-[9px] uppercase font-black bg-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded">Superpoderes</span>
          </div>
        )}

        {/* Header bar */}
        <header className="bg-white border-b border-zinc-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky top-0 z-20 shadow-xs/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white overflow-hidden shadow-xs shrink-0">
              {iesLogo ? (
                <img src={iesLogo} alt="Logo Centro" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <School className="h-4.5 w-4.5 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-zinc-950 tracking-tight leading-none">
                Manager pro Sostenible
              </h1>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mt-1">
                {iesName || 'IES Sostenible'} • Portal de Aprendizaje Gastronómico
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-zinc-100 rounded-lg border border-zinc-200 text-center text-[10px] font-bold text-zinc-600 font-mono">
              ESTUDIANTE: {currentUser.name}
            </div>
            <img 
              src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.name)}`} 
              alt={currentUser.name} 
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-zinc-200 bg-zinc-100"
            />
          </div>
        </header>

        {/* Dynamic View Area based on sidebar navigation */}
        <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto space-y-8">
          
          {/* PANEL PRINCIPAL */}
          {activeMenu === 'panel-principal' && (
            <div className="space-y-6">
              
              {/* Profile Greeting & Name Modifier Banner */}
              <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-emerald-950 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full translate-x-12 -translate-y-12" />
                <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-white/5 rounded-full translate-y-12" />

                <div className="space-y-3 relative z-10 text-center md:text-left w-full md:w-auto flex-1">
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/30 inline-block">
                    Espacio Personal de Aprendizaje
                  </span>
                  
                  {isEditingName ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2 max-w-md">
                      <input 
                        type="text"
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                        placeholder="Escribe tu nombre..."
                        required
                      />
                      <div className="flex gap-1.5 shrink-0 w-full sm:w-auto">
                        <button 
                          onClick={() => {
                            if (editNameValue.trim()) {
                              onUpdateStudentName(currentUser.id, editNameValue.trim());
                              setIsEditingName(false);
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors w-full sm:w-auto"
                        >
                          Guardar
                        </button>
                        <button 
                          onClick={() => {
                            setEditNameValue(currentUser.name);
                            setIsEditingName(false);
                          }}
                          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg text-[10px] font-bold cursor-pointer transition-colors w-full sm:w-auto"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                      <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                        ¡Hola, {currentUser.name}! 👋
                      </h2>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="px-2 py-0.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded text-[9px] font-extrabold text-zinc-300 hover:text-white cursor-pointer transition-all inline-flex items-center gap-1 self-center"
                        title="Modificar nombre"
                      >
                        <PenTool className="h-2.5 w-2.5" />
                        <span>Editar Nombre</span>
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-zinc-300 font-medium max-w-xl leading-relaxed">
                    Aquí tienes el estado en tiempo real de tu proyecto del restaurante <strong className="text-white font-extrabold">{gastState.restaurantName}</strong>, tus tareas evaluables, progreso en los Resultados de Aprendizaje y avisos urgentes del profesor.
                  </p>
                </div>

                {/* Quick Indicators */}
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-center shrink-0 w-full md:w-auto relative z-10">
                  <div className="flex-1 px-4">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 block">Tu Aula</span>
                    <span className="text-xs font-extrabold text-white block mt-0.5 truncate max-w-[120px]">
                      {currentUser.classroom || 'Desarrollo Web'}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex-1 px-4">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 block">Avance ODS</span>
                    <span className="text-xs font-extrabold text-emerald-400 block mt-0.5">Completado</span>
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Main Indicators vs Sidebar Messages */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Learning Outcomes & Deliverables (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Part 1: Deliverables Checklist (Saber por dónde va) */}
                  <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <div>
                        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest flex items-center gap-1.5">
                          <CheckSquare className="h-4 w-4 text-emerald-600" />
                          <span>Estado de tus Entregas y Trabajos</span>
                        </h3>
                        <p className="text-[11px] text-zinc-400 font-medium">Control individualizado de tareas requeridas para el módulo.</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-150 rounded">
                        {assessmentTasks.filter(t => {
                          const record = studentGrades.find(g => g.studentId === currentUser.id && g.taskId === t.id);
                          return record?.isDelivered;
                        }).length} de {assessmentTasks.length} Entregados
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {assessmentTasks.map(task => {
                        const gradeRecord = studentGrades.find(g => g.studentId === currentUser.id && g.taskId === task.id);
                        const isDelivered = gradeRecord?.isDelivered ?? false;
                        const score = gradeRecord?.score;

                        return (
                          <div 
                            key={task.id} 
                            className="p-3 border border-zinc-150 rounded-xl hover:bg-zinc-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/20"
                          >
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-zinc-400 uppercase">Fase Académica</span>
                              <h4 className="text-xs font-bold text-zinc-800">{task.title}</h4>
                              <div className="flex gap-1">
                                {task.criterionIds.map(cid => (
                                  <span key={cid} className="px-1.5 py-0.5 bg-zinc-200 text-zinc-500 rounded text-[8px] font-extrabold uppercase">
                                    {cid}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              {/* Delivery Toggle (allow students to deliver/undeliver to simulate work flow!) */}
                              <button 
                                onClick={() => onToggleDelivery(currentUser.id, task.id, !isDelivered)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black border transition-all cursor-pointer ${
                                  isDelivered 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-150 hover:bg-emerald-100' 
                                    : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
                                }`}
                              >
                                {isDelivered ? '✓ ENTREGADO' : 'SUBIR TRABAJO'}
                              </button>

                              {/* Grade display */}
                              {isDelivered && score !== undefined ? (
                                <span className={`px-2 py-1 font-mono font-black rounded-lg text-[10px] ${
                                  score >= 5.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  Nota: {score.toFixed(1)}/10
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-400 italic font-bold">Sin Nota</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Part 2: Learning Outcomes Progress (Métricas de RA) */}
                  <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-indigo-600" />
                        <span>Métricas de tus Resultados de Aprendizaje (RA)</span>
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-medium">Progreso porcentual obtenido sobre los pesos oficiales de cada RA.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {LEARNING_OUTCOMES.map(ra => {
                        const progress = calculateRAProgress(currentUser.id, ra.id);
                        const percentage = (progress / ra.weight) * 100;

                        return (
                          <div key={ra.id} className="p-3 border border-zinc-150 rounded-xl space-y-2 bg-white">
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                RA.{ra.id} (Peso: {ra.weight}%)
                              </span>
                              <span className="text-xs font-mono font-black text-zinc-900">
                                {progress.toFixed(1)}% <span className="text-[9px] text-zinc-400">/ {ra.weight}%</span>
                              </span>
                            </div>
                            <h4 className="text-[10px] font-bold text-zinc-700 line-clamp-1">{ra.title}</h4>
                            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  percentage >= 100 ? 'bg-emerald-500' :
                                  percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, percentage)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right Column: Classroom Message Panel & Bulletin (1/3) */}
                <div className="space-y-6">
                  
                  {/* Messages Bulletin Card */}
                  <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-indigo-600" />
                        <span>Tablón de Mensajes del Profesor</span>
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-medium">Anuncios oficiales y avisos del docente.</p>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {announcements.length === 0 ? (
                        <div className="p-5 border border-dashed border-zinc-200 rounded-xl text-center">
                          <p className="text-xs text-zinc-400 font-semibold">No hay avisos todavía.</p>
                        </div>
                      ) : (
                        announcements.map(ann => {
                          const isRead = ann.readByStudentIds?.includes(currentUser.id);

                          return (
                            <div 
                              key={ann.id} 
                              className={`p-4 border rounded-2xl space-y-2.5 transition-all relative ${
                                isRead 
                                  ? 'bg-zinc-50/50 border-zinc-150' 
                                  : 'bg-rose-50/30 border-rose-200/50 shadow-2xs'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] text-zinc-500 font-black block">{ann.author}</span>
                                  <span className="text-[8px] text-zinc-400 block font-mono font-medium">{ann.date}</span>
                                </div>
                                
                                {/* Verification Badge Toggle */}
                                <button
                                  onClick={() => onToggleReadAnnouncement(ann.id)}
                                  className={`px-2 py-0.5 rounded-md text-[8px] font-black border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                                    isRead 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-150 hover:bg-emerald-100' 
                                      : 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 animate-pulse'
                                  }`}
                                  title={isRead ? "Marcar como no leído" : "Click para marcar como leído"}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isRead ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                  <span>{isRead ? 'LEÍDO' : 'REVISAR'}</span>
                                </button>
                              </div>

                              <p className="text-[11px] text-zinc-700 leading-relaxed font-semibold">
                                {ann.text}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="p-5 bg-gradient-to-tr from-emerald-50 to-indigo-50 border border-emerald-100 rounded-2xl space-y-3 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-zinc-950">Espacio Académico</h4>
                    <p className="text-[11px] text-zinc-600 leading-relaxed font-medium">
                      Tu proyecto se vincula directamente a la Agenda 2030. Puedes revisar la sección "Guía Académica y Normativa" para comprender el impacto de los ODS en tu nota técnica.
                    </p>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* GUÍA ACADÉMICA Y NORMATIVA - Recreated exactly as screenshot 2 */}
          {activeMenu === 'guia-academica' && (
            <div className="space-y-6" id="guia-academica-view">
              
              {/* View Header with Sub-tabs exactly as screenshot 2 */}
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-extrabold text-zinc-950 tracking-tight flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-zinc-800" />
                  <span>Guía Académica y Normativa</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Referencia oficial de los Resultados de Aprendizaje (RA) y la Agenda 2030 (ODS) que guían este proyecto.
                </p>
              </div>

              {/* Sub-tabs buttons */}
              <div className="flex border-b border-zinc-200">
                <button
                  onClick={() => setGuideSubTab('ra')}
                  className={`px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                    guideSubTab === 'ra'
                      ? 'border-zinc-900 text-zinc-950 font-black'
                      : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Resultados de Aprendizaje (RA)</span>
                </button>
                <button
                  onClick={() => setGuideSubTab('ods')}
                  className={`px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                    guideSubTab === 'ods'
                      ? 'border-zinc-900 text-zinc-950 font-black'
                      : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <span>Agenda 2030 (ODS)</span>
                </button>
              </div>

              {/* Guide Contents */}
              {guideSubTab === 'ra' ? (
                <div className="space-y-6">
                  
                  {/* General RAs Section Header */}
                  <div>
                    <h3 className="text-sm font-black text-zinc-850">RAs Generales del Proyecto</h3>
                    <p className="text-[11px] text-zinc-400 font-medium font-mono mt-0.5">
                      Fuente: BOLETÍN OFICIAL DEL ESTADO. Núm. 129, Martes 28 de mayo de 2024.
                    </p>
                  </div>

                  {/* RA1 Card */}
                  <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg shrink-0">
                        RA1
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 leading-relaxed">
                        Analizar y caracterizar las empresas del sector según su estructura organizativa y la naturaleza de sus productos o servicios.
                      </h4>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block">Criterios de Evaluación:</span>
                      <ul className="text-[11px] text-zinc-600 space-y-1.5 list-disc pl-4 font-medium">
                        <li>a) Se han identificado los modelos empresariales más representativos del sector.</li>
                        <li>b) Se ha descrito la estructura organizativa típica de estas empresas.</li>
                        <li>c) Se han definido las funciones y características de los principales departamentos.</li>
                        <li>d) Se ha especificado el rol y las responsabilidades de cada área funcional.</li>
                        <li>e) Se ha evaluado el volumen de negocio en función de las demandas y necesidades del cliente.</li>
                        <li>f) Se ha diseñado una estrategia adecuada para responder a dichas demandas.</li>
                        <li>g) Se ha valorado la dotación necesaria de recursos humanos y materiales.</li>
                        <li>h) Se ha implementado un sistema de seguimiento de resultados acorde con la estrategia definida.</li>
                        <li>i) Se ha establecido la relación entre los productos/servicios ofrecidos y su posible aporte a los Objetivos de Desarrollo Sostenible (ODS).</li>
                      </ul>
                    </div>
                  </div>

                  {/* RA2 Card */}
                  <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg shrink-0">
                        RA2
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 leading-relaxed">
                        Proponer soluciones viables a las necesidades del sector, considerando costes y desarrollando un proyecto básico.
                      </h4>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block">Criterios de Evaluación:</span>
                      <ul className="text-[11px] text-zinc-600 space-y-1.5 list-disc pl-4 font-medium">
                        <li>a) Se han detectado y priorizado las necesidades del sector.</li>
                        <li>b) Se han generado, en equipo, propuestas de solución.</li>
                        <li>c) Se ha recopilado información relevante sobre las soluciones planteadas.</li>
                        <li>d) Se han incorporado elementos innovadores con potencial de aplicación práctica.</li>
                        <li>e) Se ha realizado un análisis de viabilidad técnica de las propuestas.</li>
                        <li>f) Se han definido las partes esenciales que componen el proyecto.</li>
                        <li>g) Se ha estimado la dotación de recursos humanos y materiales requeridos.</li>
                        <li>h) Se ha elaborado un presupuesto económico detallado.</li>
                        <li>i) Se ha redactado la documentación técnica necesaria para el diseño del proyecto.</li>
                        <li>j) Se han considerado los aspectos de calidad inherentes al proyecto.</li>
                        <li>k) Se ha presentado públicamente el contenido más relevante del proyecto propuesto.</li>
                      </ul>
                    </div>
                  </div>

                  {/* RA3 Card */}
                  <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg shrink-0">
                        RA3
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 leading-relaxed">
                        Planificar la ejecución de las actividades derivadas de la solución propuesta, definiendo un plan de intervención y su documentación asociada.
                      </h4>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block">Criterios de Evaluación:</span>
                      <ul className="text-[11px] text-zinc-600 space-y-1.5 list-disc pl-4 font-medium">
                        <li>a) Se ha establecido una cronología detallada para cada actividad.</li>
                        <li>b) Se han asignado los recursos y la logística necesarios para cada fase.</li>
                        <li>c) Se han identificado los permisos o autorizaciones obligatorios, en caso de requerirse.</li>
                        <li>d) Se han detectado las actividades con riesgos potenciales durante su ejecución.</li>
                        <li>e) Se ha integrado el plan de prevención de riesgos laborales y se han previsto los equipos de protección necesarios.</li>
                        <li>f) Se han asignado recursos humanos y materiales específicos a cada tarea.</li>
                        <li>g) Se han contemplado posibles contingencias o imprevistos.</li>
                        <li>h) Se ha diseñado medidas correctivas para hacer frente a dichos imprevistos.</li>
                        <li>i) Se ha elaborado toda la documentación técnica y administrativa requerida.</li>
                      </ul>
                    </div>
                  </div>

                  {/* RA4 Card */}
                  <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg shrink-0">
                        RA4
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 leading-relaxed">
                        Supervisar la ejecución de las actividades, asegurando el cumplimiento del plan establecido.
                      </h4>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block">Criterios de Evaluación:</span>
                      <ul className="text-[11px] text-zinc-600 space-y-1.5 list-disc pl-4 font-medium">
                        <li>a) Se ha definido un procedimiento claro para el seguimiento de las actividades.</li>
                        <li>b) Se ha verificado que los resultados obtenidos cumplen con los estándares de calidad esperados.</li>
                        <li>c) Se han detectado desviaciones respecto al plan inicial o a los resultados previstos.</li>
                        <li>d) Se ha comunicado oportunamente cualquier desviación relevante a los responsables.</li>
                        <li>e) Se han implementado y documentado las acciones correctivas necesarias.</li>
                        <li>f) Se ha generado la documentación final para la evaluación integral de las actividades y del proyecto global.</li>
                      </ul>
                    </div>
                  </div>

                  {/* RA5 Card */}
                  <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg shrink-0">
                        RA5
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 leading-relaxed">
                        Comunicar información de forma clara, ordenada y estructurada, tanto interna como externamente.
                      </h4>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block">Criterios de Evaluación:</span>
                      <ul className="text-[11px] text-zinc-600 space-y-1.5 list-disc pl-4 font-medium">
                        <li>a) Se ha mantenido una actitud metódica y organizada en la transmisión de la información.</li>
                        <li>b) Se ha facilitado comunicación verbal efectiva, tanto en horizontal (entre pares) como en vertical (con superiores o subordinados).</li>
                        <li>c) Se ha utilizado herramientas informáticas para la comunicación interna en el equipo.</li>
                        <li>d) Se ha adquirido familiaridad con la terminología técnica del sector en otros idiomas de uso internacional.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Specific Module RAs section exactly like screenshot 2 footer */}
                  <div className="border-t border-zinc-200 pt-6 space-y-4">
                    <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-widest block">RAs Específicos por Módulo</h3>
                    <p className="text-xs text-zinc-500">Criterios aplicados desde Productos Culinarios, Postres en Restauración y Ofertas Gastronómicas.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      <div className="bg-white border border-zinc-200/80 rounded-xl p-4 space-y-3">
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase block w-max">
                          Productos Culinarios (0048)
                        </span>
                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 font-mono block">RA1</span>
                            <p className="text-[11px] text-zinc-700 leading-relaxed">
                              Organiza los procesos productivos y de servicio en cocina, interpretando información oral o escrita.
                            </p>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 font-mono block">RA3</span>
                            <p className="text-[11px] text-zinc-700 leading-relaxed">
                              Elabora productos culinarios a partir de un conjunto de materias primas, evaluando alternativas creativas y funcionales.
                            </p>
                            <p className="text-[10px] text-zinc-400 italic mt-1">b) Aprovechamiento integral, mermas mínimas y combinación equilibrada de ingredientes.</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-zinc-200/80 rounded-xl p-4 space-y-3">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase block w-max">
                          Postres en Restauración (0028)
                        </span>
                        <div>
                          <span className="text-[9px] font-bold text-zinc-400 font-mono block">RA7</span>
                          <p className="text-[11px] text-zinc-700 leading-relaxed">
                            Presenta postres emplatados a partir de elaboraciones de pastelería y repostería, integrando criterios estéticos y funcionales.
                          </p>
                          <p className="text-[10px] text-zinc-400 italic mt-1.5">c) Técnicas de presentación y decoración que garanticen equilibrio visual, textural y conceptual.</p>
                        </div>
                      </div>

                      <div className="bg-white border border-zinc-200/80 rounded-xl p-4 space-y-3">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase block w-max">
                          Ofertas Gastronómicas (0045)
                        </span>
                        <div>
                          <span className="text-[9px] font-bold text-zinc-400 font-mono block">RA4</span>
                          <p className="text-[11px] text-zinc-700 leading-relaxed">
                            Calcula el coste global de la oferta gastronómica, analizando y ponderando todas las variables que lo componen.
                          </p>
                          <p className="text-[10px] text-zinc-400 italic mt-1.5">d) Valoración de costes (food cost, mano de obra, mermas, suministros) para garantizar la viabilidad del proyecto.</p>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              ) : (
                <div className="space-y-6">
                  
                  <div>
                    <h3 className="text-sm font-black text-zinc-850">Alineación con la Agenda 2030 de la ONU</h3>
                    <p className="text-xs text-zinc-500">
                      Cómo tus decisiones de negocio e ingredientes de cocina impactan positivamente en el medio ambiente y la sociedad civil.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-sm">
                          12
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900">ODS 12: Producción y Consumo Responsable</h4>
                          <span className="text-[9px] text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded">Prioritario</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-relaxed pt-2">
                        Exige el uso de productos de "Km 0" (proximidad), de comercio justo o de temporada en tus menús para minimizar la huella ecológica de transporte. Fomenta el aprovechamiento integral reduciendo desperdicios (Zero Waste).
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-sm">
                          3
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900">ODS 3: Salud y Bienestar</h4>
                          <span className="text-[9px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">Prioritario</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-relaxed pt-2">
                        Promueve el diseño de menús nutricionalmente equilibrados, control riguroso de alérgenos culinarios y uso de ingredientes frescos libres de ultraprocesados en el simulador gastronómico.
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-sm">
                          13
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900">ODS 13: Acción por el Clima</h4>
                          <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Relevante</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-relaxed pt-2">
                        Reducción drástica de emisiones de gases contaminantes optimizando el uso de energía y electrodomésticos eficientes de inducción o control térmico en la cocina.
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-black text-sm">
                          14
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900">ODS 14: Vida Submarina</h4>
                          <span className="text-[9px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Relevante</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-relaxed pt-2">
                        Compromiso de adquirir pescados y mariscos con etiquetas certificadas de pesca sostenible (como MSC), evitando la sobreexplotación de especies sensibles o en veda culinaria.
                      </p>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* EVALUACIÓN DOCENTE */}
          {activeMenu === 'evaluacion-docente' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-900">Evaluación Docente y Rúbricas</h3>
                  <p className="text-[11px] text-zinc-400">Calificaciones emitidas por el profesorado según los Resultados de Aprendizaje.</p>
                </div>
                <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold rounded-lg font-mono">
                  Curso: 2026
                </span>
              </div>

              {(() => {
                const raScores = LEARNING_OUTCOMES.map(ra => {
                  const progress = calculateRAProgress(currentUser.id, ra.id);
                  const score = (progress / ra.weight) * 10;
                  return {
                    id: ra.id,
                    title: ra.title,
                    score: isNaN(score) ? 0 : score,
                    weight: ra.weight
                  };
                });
                
                const globalScore = raScores.reduce((sum, r) => sum + (r.score * r.weight / 100), 0);

                const evalData = gastState.evaluation || {
                  status: globalScore >= 5 ? 'Aprobado' : 'Pendiente',
                  feedback: 'El progreso se calcula automáticamente basado en las notas de las tareas de la Fase 3.'
                };
                
                return (
                  <div className="space-y-6">
                    <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider block">Nota Global (Ponderada)</span>
                        <span className="text-xs font-bold text-emerald-800">{evalData.status}</span>
                      </div>
                      <span className="text-lg font-black text-emerald-700 font-mono bg-white border border-emerald-200 px-3 py-1 rounded-xl">
                        {globalScore.toFixed(1)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-widest block">Progreso por Resultado de Aprendizaje</h4>
                      <div className="grid gap-3">
                        {raScores.map(ra => (
                          <div key={ra.id} className="p-3 border border-zinc-150 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs font-medium">
                              <span className="text-zinc-700 max-w-[200px] truncate">RA{ra.id}: {ra.title}</span>
                              <span className="font-black text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">{ra.score.toFixed(1)} / 10</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  ra.score >= 9 ? 'bg-emerald-500' : 
                                  ra.score >= 5 ? 'bg-indigo-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${ra.score * 10}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-widest block">Notas de Tareas Fase 3</h4>
                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-200">
                        {assessmentTasks.map(task => {
                          const gradeRecord = getGradeRecord(currentUser.id, task.id);
                          const isDelivered = gradeRecord?.isDelivered ?? false;
                          const grade = gradeRecord?.score;
                          
                          return (
                            <div key={task.id} className="p-3 flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-2">
                                {isDelivered ? (
                                  <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <AlertCircle className="h-3.5 w-3.5 text-zinc-300" />
                                )}
                                <span className={`font-bold ${isDelivered ? 'text-zinc-700' : 'text-zinc-400'}`}>{task.title}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {isDelivered ? (
                                  <span className="font-black font-mono text-indigo-600">
                                    {grade !== undefined ? grade.toFixed(1) : 'Sin nota'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">No entregado</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Defensa Oral y Nota Módulo Panel */}
                    {(() => {
                      const oralRecord = (individualOralGrades || []).find(g => g.studentId === currentUser.id) || {
                        studentId: currentUser.id,
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
                        const gradeRecord = studentGrades.find(g => g.studentId === currentUser.id && g.taskId === task.id);
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
                        <div className="space-y-4 pt-4 border-t border-zinc-150">
                          <h4 className="text-xs font-black text-zinc-800 uppercase tracking-widest block flex items-center gap-1.5">
                            <Scale className="h-4 w-4 text-indigo-600" />
                            Defensa Oral y Nota Final del Módulo
                          </h4>
                          
                          {!isPresented ? (
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-center space-y-2">
                              <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
                              <h5 className="text-xs font-black uppercase text-rose-800">Estado: No Presentado (N.P.)</h5>
                              <p className="text-[11px] text-rose-700 font-semibold max-w-lg mx-auto leading-relaxed">
                                Has sido marcado/a como no presentado a la defensa oral. Para poder aprobar el módulo es de carácter obligatorio haberse presentado a la exposición individual y grupal.
                              </p>
                            </div>
                          ) : (
                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 md:p-5 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  {/* Fase 1 */}
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                                      <span>Fase 1: Resultado de Equipo (Nota: {teamGrade.toFixed(1)}/10)</span>
                                      <span className={`font-mono font-black ${teamGrade >= 5.0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {calculatedTeamPoints.toFixed(2)} / {maxTeamScore.toFixed(1)} ptos
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${teamGrade >= 5.0 ? 'bg-indigo-600' : 'bg-rose-500'}`} style={{ width: `${(teamGrade / 10) * 100}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[9px] font-bold">
                                      <span className="text-zinc-400">Puntuación mínima exigida: 5.0</span>
                                      <span className={teamGrade >= 5.0 ? 'text-emerald-600' : 'text-rose-600'}>
                                        {teamGrade >= 5.0 ? '✓ Superado' : '⚠️ No superado'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Fase 3 */}
                                  <div className="space-y-1.5 pt-1.5 border-t border-zinc-200/55">
                                    <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                                      <span>Fase 3: Defensa Individual (Nota: {expositionGrade.toFixed(1)}/10)</span>
                                      <span className={`font-mono font-black ${expositionGrade >= 5.0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {calculatedExpositionPoints.toFixed(2)} / {maxExpositionScore.toFixed(1)} ptos
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${expositionGrade >= 5.0 ? 'bg-indigo-600' : 'bg-rose-500'}`} style={{ width: `${(expositionGrade / 10) * 100}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[9px] font-bold">
                                      <span className="text-zinc-400">Puntuación mínima exigida: 5.0</span>
                                      <span className={expositionGrade >= 5.0 ? 'text-emerald-600' : 'text-rose-600'}>
                                        {expositionGrade >= 5.0 ? '✓ Superado' : '⚠️ No superado'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Fase 2 */}
                                <div className="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-2.5 flex flex-col justify-between">
                                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wide">
                                    <span className="text-zinc-500 font-extrabold">Fase 2: Coevaluación Diabólica</span>
                                    <span className={`px-2 py-0.5 rounded-md font-mono ${
                                      coevalAdjustment > 0 ? 'bg-emerald-55/10 text-emerald-700 border border-emerald-100' :
                                      coevalAdjustment < 0 ? 'bg-rose-55/10 text-rose-700 border border-rose-100' :
                                      'bg-zinc-50 text-zinc-600 border border-zinc-150'
                                    }`}>
                                      {coevalAdjustment >= 0 ? '+' : ''}{coevalAdjustment.toFixed(2)} Ptos
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 gap-1 text-[9px] text-zinc-600 font-semibold leading-relaxed">
                                    <div className="flex justify-between">
                                      <span>• Implicación y esfuerzo continuo (±{singleCoevalImpact.toFixed(1)}):</span>
                                      <span className="font-bold">{oralRecord.coevalItem1 === 'positive' ? `+${singleCoevalImpact.toFixed(1)}` : oralRecord.coevalItem1 === 'negative' ? `-${singleCoevalImpact.toFixed(1)}` : '0.0'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• Colaboración y actitud activa (±{singleCoevalImpact.toFixed(1)}):</span>
                                      <span className="font-bold">{oralRecord.coevalItem2 === 'positive' ? `+${singleCoevalImpact.toFixed(1)}` : oralRecord.coevalItem2 === 'negative' ? `-${singleCoevalImpact.toFixed(1)}` : '0.0'}</span>
                                    </div>
                                  </div>
                                  <p className="text-[8px] text-zinc-400 italic">
                                    Puntuaciones asignadas por compañeros y validadas por el profesor tutor.
                                  </p>
                                </div>
                              </div>

                              {oralRecord.justification && (
                                <div className="p-3 bg-indigo-55/10 border border-indigo-100/50 rounded-xl space-y-1">
                                  <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-wider block">Justificación del Tutor:</span>
                                  <p className="text-[10px] text-indigo-950 font-medium leading-relaxed italic">
                                    "{oralRecord.justification}"
                                  </p>
                                </div>
                              )}

                              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                                isPassed
                                  ? finalComputedScore >= 9 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-950' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-950'
                                  : 'bg-rose-500/10 border-rose-500/20 text-rose-950'
                              }`}>
                                <div className="text-center sm:text-left">
                                  <span className="text-[10px] font-black uppercase tracking-wider block">Calificación Final del Módulo</span>
                                  <span className="text-[9px] font-bold opacity-80 block">Resultado ponderado del proyecto y defensa oral</span>
                                </div>
                                <div className="text-center sm:text-right">
                                  <span className="text-xl font-black font-mono block">
                                    {finalComputedScore.toFixed(1)} / 10.0
                                  </span>
                                  <span className={`inline-block text-[9px] font-extrabold opacity-90 uppercase px-2 py-0.5 rounded ${
                                    isPassed 
                                      ? 'bg-zinc-900/10 text-zinc-800' 
                                      : 'bg-rose-600 text-white animate-pulse'
                                  }`}>
                                    {isPassed ? (finalComputedScore >= 9 ? 'Sobresaliente' : finalComputedScore >= 7 ? 'Notable' : 'Aprobado') : 'Suspenso'}
                                  </span>
                                </div>
                              </div>

                              {!hasMinimumInAllParts && (
                                <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl flex items-start gap-2 text-[10px] text-rose-800 font-bold">
                                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                  <p className="leading-normal">
                                    ⚠️ No has alcanzado el mínimo requerido de 5.0 (sobre 10) en alguna de las partes obligatorias (Fase 1: Resultado de Equipo y Fase 3: Defensa Individual). Por normativa académica, la calificación final queda limitada a un máximo de 4.0 (Suspenso).
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div className="p-4 bg-zinc-50 rounded-xl space-y-1">
                      <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block">Feedback General:</span>
                      <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                        "{evalData.feedback}"
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* STEP 1: EQUIPO Y ZONA */}
          {activeMenu === 'step-1' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900">1. Equipo y Zona del Establecimiento</h3>
                <p className="text-[11px] text-zinc-400">Fase de configuración inicial donde describes el concepto de negocio y justificas su ubicación.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Nombre Comercial del Restaurante</label>
                  <input
                    type="text"
                    value={gastState.restaurantName}
                    disabled={!gastState.modoEdicion}
                    onChange={(e) => updateField('restaurantName', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-950 text-zinc-800 disabled:opacity-75 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Zona Seleccionada (Ubicación y Mercado)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {GASTRONOMIC_ZONES.map((zone) => (
                      <button
                        key={zone.id}
                        type="button"
                        disabled={!gastState.modoEdicion}
                        onClick={() => updateField('locationArea', zone.name)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          gastState.locationArea === zone.name
                            ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                            : 'bg-white border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <h4 className="text-xs font-black text-zinc-900">{zone.name}</h4>
                        <p className="text-[10px] font-bold text-indigo-600 mb-2">{zone.concept}</p>
                        <p className="text-[10px] text-zinc-600 mb-2 leading-relaxed">{zone.description}</p>
                        <p className="text-[9px] text-zinc-500 italic">Típico: {zone.typical}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Concepto Gastronómico y Enfoque Sostenible (ODS)</label>
                  <textarea
                    rows={3}
                    value={gastState.conceptDescription}
                    disabled={!gastState.modoEdicion}
                    onChange={(e) => updateField('conceptDescription', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-950 text-zinc-800 disabled:opacity-75 transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Estudio de Mercado Simplificado</label>
                  <textarea
                    rows={3}
                    value={gastState.marketStudy}
                    disabled={!gastState.modoEdicion}
                    onChange={(e) => updateField('marketStudy', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-950 text-zinc-800 disabled:opacity-75 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: REPARTO GLOBAL */}
          {activeMenu === 'step-2' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900">Panel de Reparto Global de Tareas</h3>
                <p className="text-[11px] text-zinc-400">Para asegurar el éxito del proyecto, es fundamental que cada miembro sepa de qué parte es responsable. Asignad las 10 micro-tareas de investigación que se desarrollarán en la siguiente fase.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {allUsers.map((user) => (
                  <div key={user.id} className={`p-4 border rounded-2xl ${tasksPerUser[user.id] > 0 ? 'bg-amber-50 border-amber-200' : 'bg-zinc-50 border-zinc-200'}`}>
                    <p className="text-xs font-bold text-zinc-900">{user.name}</p>
                    <p className="text-[10px] text-zinc-500">{tasksPerUser[user.id] || 0} tareas asignadas</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {TAREAS_INVESTIGACION.map((tarea) => (
                  <div key={tarea.id} className="border border-zinc-100 rounded-xl bg-white hover:border-zinc-300 transition-colors">
                    <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedTaskId(expandedTaskId === tarea.id ? null : tarea.id)}>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-zinc-400 font-mono w-6">{tarea.id}</span>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">{tarea.title}</p>
                          <p className="text-[10px] text-zinc-500">{tarea.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <select 
                          className="text-[11px] border border-zinc-200 rounded-lg px-2 py-1" 
                          onClick={(e) => e.stopPropagation()}
                          value={taskAssignments[tarea.id] || ''}
                          onChange={(e) => setTaskAssignments(prev => ({ ...prev, [tarea.id]: e.target.value }))}
                        >
                          <option value="">-- Seleccionar miembro --</option>
                          {allUsers.map((user) => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>
                        {expandedTaskId === tarea.id ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                      </div>
                    </div>
                    {expandedTaskId === tarea.id && (
                      <div className="px-4 pb-4 pt-0 text-[11px] text-zinc-600 space-y-2 border-t border-zinc-100 pt-4">
                         <p><span className="font-bold text-zinc-800">¿QUÉ DEBEN HACER?</span><br />{tarea.desc}</p>
                         <div className="grid grid-cols-2 gap-4 mt-2">
                           <div className="p-3 bg-zinc-50 rounded-lg">
                             <p className="font-bold text-zinc-800 mb-1">Guía:</p>
                             <p>{tarea.guia}</p>
                           </div>
                           <div className="p-3 bg-zinc-50 rounded-lg">
                             <p className="font-bold text-zinc-800 mb-1">Entregable Esperado:</p>
                             <p>{tarea.entregable}</p>
                           </div>
                         </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 11: ENTREGABLE TAREA 1 */}
          {activeMenu === 'step-11' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-extrabold text-zinc-900">Entregable Tarea 1</h3>
                  <div className="flex items-center gap-3">
                    {renderDeliveryStatus('step-11')}
                    {renderGradeBadge('step-11')}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-600">Este documento resume las decisiones fundacionales de vuestro proyecto.</p>
                <button
                    onClick={() => setShowDocType('tarea1')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
                >
                    <Printer className="h-4 w-4" />
                    Generar Acta de Constitución (Vista Previa)
                </button>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2 text-[11px] text-zinc-600">
                    <p className="font-bold">Estructura del Acta:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Cabecera Oficial (IES, curso, logo)</li>
                        <li>Identidad del Equipo (Nombre, componentes, coordinador, foto)</li>
                        <li>Selección de Zona (Comarca, municipios, justificación)</li>
                        <li>Reparto Global de Tareas</li>
                        <li>Pie de página (Fecha, marca del proyecto)</li>
                    </ul>
                </div>
              </div>
            </div>
          )}

          {/* STEP 12: ENTREGABLE TAREA 2 */}
          {activeMenu === 'step-12' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-extrabold text-zinc-900">Entregable Tarea 2</h3>
                  <div className="flex items-center gap-3">
                    {renderDeliveryStatus('step-12')}
                    {renderGradeBadge('step-12')}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-600">Este documento recopila la investigación de mercado y el estudio de competencia.</p>
                <button
                    onClick={() => setShowDocType('tarea2')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
                >
                    <Printer className="h-4 w-4" />
                    Generar Estudio de Mercado (Vista Previa)
                </button>
              </div>
            </div>
          )}

          {/* STEP 13: ENTREGABLE TAREA 3 */}
          {activeMenu === 'step-13' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-extrabold text-zinc-900">Diseño de Carta</h3>
                  <div className="flex items-center gap-3">
                    {renderDeliveryStatus('step-13')}
                    {renderGradeBadge('step-13')}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-600">Este documento recopila todas las fichas técnicas diseñadas por el equipo, justificando su sostenibilidad.</p>
                <button
                    onClick={() => setShowDocType('tarea3')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
                >
                    <Printer className="h-4 w-4" />
                    Generar Dossier de Carta (Vista Previa)
                </button>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2 text-[11px] text-zinc-600">
                    <p className="font-bold">Estructura del Dossier:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Portada del Proyecto Gastronómico</li>
                        <li>Análisis de Productos de Temporada (por alumno)</li>
                        <li>Fichas Técnicas Detalladas (4 platos por alumno)</li>
                        <li>Justificación Sostenible Global de la Propuesta</li>
                    </ul>
                </div>
              </div>
            </div>
          )}

          {/* STEP 14: ENTREGABLE TAREA 4 */}
          {activeMenu === 'step-14' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Dossier Tarea 4 auto-compilado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {renderDeliveryStatus('step-14')}
                    {renderGradeBadge('step-14')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    title="Recuerda activar 'Encabezados y pies de página' y 'A4' en el diálogo de impresión para ver la numeración."
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Imprimir / Descargar PDF
                  </button>
                </div>
              </div>

              {/* Document container */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-10 max-w-4xl mx-auto print:max-w-none print:w-full print:border-none print:shadow-none print:p-0" id="dossier-imprimible">
                {renderIESHeader('Prototipos y Soportes (Tarea 4)', 'Dossier Gastronómico')}
                {/* Header */}
                <div className="text-center space-y-4 border-b border-zinc-100 pb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                    <Leaf className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">PROYECTO GASTRONÓMICO INTEGRAL SOSTENIBLE</span>
                  </div>
                  
                  <div className="space-y-1">
                    <h1 className="text-3xl font-black text-zinc-950 tracking-tight uppercase">
                      {gastState.restaurantName || 'Arenal Ecocuisine'}
                    </h1>
                    {gastState.decisionGrupal.slogan && (
                      <p className="text-xs font-bold text-zinc-500 italic">
                        "{gastState.decisionGrupal.slogan}"
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-left max-w-2xl mx-auto border-t border-zinc-50 text-[10px]">
                    <div>
                      <span className="block text-zinc-400 font-bold uppercase tracking-wider">Equipo:</span>
                      <span className="font-extrabold text-zinc-700">{gastState.teamName || 'Los Cocedores del Arenal'}</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400 font-bold uppercase tracking-wider">Zona Gastronómica:</span>
                      <span className="font-extrabold text-zinc-700">
                        {GASTRONOMIC_ZONES.find(z => z.id === gastState.selectedZone)?.name || 'Zona Costa'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-zinc-400 font-bold uppercase tracking-wider">Ubicación:</span>
                      <span className="font-extrabold text-zinc-700 line-clamp-1">{gastState.locationArea || 'Costa local'}</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400 font-bold uppercase tracking-wider">Público Objetivo:</span>
                      <span className="font-extrabold text-zinc-700 line-clamp-1">{gastState.decisionGrupal.publicoObjetivo || 'Profesionales de 25-50 años'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 1: Concept & Visual Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                    <span className="text-xs font-black text-zinc-400">01 /</span>
                    <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest">FILOSOFÍA, CONCEPTO E IDENTIDAD VISUAL</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] leading-relaxed">
                    <div className="space-y-2">
                      <h4 className="font-black text-zinc-800 uppercase">Concepto Gastronómico</h4>
                      <p className="text-zinc-600 font-semibold">{gastState.conceptDescription || 'Bistró de alta cocina sostenible que fusiona técnicas tradicionales con ingredientes de temporada de Km 0.'}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-zinc-800 uppercase">Identidad Visual de la Carta</h4>
                      <p className="text-zinc-600 font-semibold">{gastState.task4.visualIdentity || 'Por rellenar.'}</p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Prototipos */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                    <span className="text-xs font-black text-zinc-400">02 /</span>
                    <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest">SOPORTES DE ACCESO DE LA CARTA (MISIONES 4.A & 4.B)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px]">
                    {/* Digital Access */}
                    <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-150 space-y-4 flex flex-col items-center text-center">
                      <h4 className="font-black text-zinc-800 uppercase tracking-tight flex items-center gap-1.5 self-start">
                        <Monitor className="h-3.5 w-3.5 text-indigo-500" />
                        Soporte Digital (Misión 4.A)
                      </h4>
                      
                      {gastState.task4.qrImage ? (
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-100 w-28 h-28 flex items-center justify-center">
                          <img src={gastState.task4.qrImage} className="w-full h-full object-contain" alt="QR Canva" />
                        </div>
                      ) : gastState.task4.digitalLink ? (
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-100 w-28 h-28 flex items-center justify-center">
                          <QRCodeSVG value={gastState.task4.digitalLink} size={100} level="H" />
                        </div>
                      ) : (
                        <div className="w-28 h-28 border border-dashed border-zinc-200 rounded-xl flex items-center justify-center text-zinc-300">
                          <QrCode className="h-8 w-8" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Enlace a la Carta Virtual:</span>
                        {gastState.task4.digitalLink ? (
                          <a href={gastState.task4.digitalLink} target="_blank" rel="noreferrer" className="text-indigo-600 font-extrabold hover:underline break-all block max-w-xs text-[10px]">
                            {gastState.task4.digitalLink}
                          </a>
                        ) : (
                          <span className="text-zinc-400 italic font-semibold">No se ha cargado un enlace aún</span>
                        )}
                      </div>
                    </div>

                    {/* Physical Access */}
                    <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-150 space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h4 className="font-black text-zinc-800 uppercase tracking-tight flex items-center gap-1.5">
                          <PenTool className="h-3.5 w-3.5 text-emerald-500" />
                          Soporte Físico (Misión 4.B)
                        </h4>
                        <p className="text-zinc-600 font-semibold leading-relaxed">
                          {gastState.task4.physicalDescription || 'Especificaciones de materiales ecológicos, formatos y texturas aplicados al soporte físico.'}
                        </p>
                      </div>
                      {gastState.task4.physicalImage && (
                        <div className="w-full h-24 rounded-xl overflow-hidden border border-zinc-200">
                          <img src={gastState.task4.physicalImage} className="w-full h-full object-cover" alt="Maqueta Física" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Oferta Gastronómica Completa */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                    <span className="text-xs font-black text-zinc-400">03 /</span>
                    <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest">OFERTA GASTRONÓMICA E INGREDIENTES (TAREA 3)</h3>
                  </div>

                  {gastState.dishes.length === 0 ? (
                    <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-zinc-150 text-xs text-zinc-400 italic font-semibold">
                      No hay platos cargados en el menú aún. Vuelve a la Tarea 3 ("Diseño de Carta") para crearlos y verlos auto-compilados aquí de inmediato.
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {['aperitivo', 'entrante', 'principal', 'postre'].map((category) => {
                        const filteredDishes = gastState.dishes.filter((d: any) => d.type === category);
                        if (filteredDishes.length === 0) return null;

                        return (
                          <div key={category} className="space-y-4">
                            <h4 className="text-[10px] font-black text-zinc-800 uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-lg w-max">
                              {category === 'aperitivo' && '🍢 Aperitivos'}
                              {category === 'entrante' && '🥗 Entrantes'}
                              {category === 'principal' && '🍲 Platos Principales'}
                              {category === 'postre' && '🍰 Postres'}
                            </h4>

                            <div className="grid grid-cols-1 gap-4">
                              {filteredDishes.map((dish: any) => {
                                const creator = allUsers.find(u => u.id === dish.userId);
                                return (
                                  <div key={dish.id} className="border border-zinc-200 rounded-2xl p-5 bg-white space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                                      <div className="space-y-1">
                                        <h5 className="text-xs font-black text-zinc-900 uppercase tracking-tight">{dish.name}</h5>
                                        <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">{dish.description}</p>
                                      </div>
                                      {dish.image && (
                                        <img src={dish.image} className="w-14 h-14 rounded-xl object-cover border border-zinc-200 flex-shrink-0" alt={dish.name} />
                                      )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 text-[10px]">
                                      <div className="space-y-2">
                                        <span className="block font-black text-zinc-400 uppercase tracking-wider">Ingredientes ({dish.portions || 1} raciones):</span>
                                        <ul className="space-y-1 pl-4 list-disc text-zinc-600 font-semibold">
                                          {dish.ingredients && dish.ingredients.length > 0 ? (
                                            dish.ingredients.map((ing: any, idx: number) => (
                                              <li key={idx}>
                                                {ing.name} {ing.quantity ? `(${ing.quantity} ${ing.unit})` : ''}
                                              </li>
                                            ))
                                          ) : (
                                            <li className="italic text-zinc-400 list-none">Sin ingredientes asignados</li>
                                          )}
                                        </ul>
                                      </div>
                                      <div className="space-y-2">
                                        <span className="block font-black text-zinc-400 uppercase tracking-wider">Paso a Paso / Elaboración:</span>
                                        <p className="text-zinc-600 font-semibold whitespace-pre-wrap leading-relaxed">
                                          {dish.elaboration || 'Sin pasos declarados.'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 text-[10px]">
                                      <div className="space-y-1">
                                        <span className="block font-black text-zinc-400 uppercase tracking-wider">Justificación Sostenible:</span>
                                        <p className="text-emerald-700 font-semibold leading-relaxed bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/30">
                                          {dish.sustainabilityJustification || 'Sin justificación declarada.'}
                                        </p>
                                      </div>
                                      <div className="flex flex-col justify-between">
                                        <div className="space-y-1">
                                          <span className="block font-black text-zinc-400 uppercase tracking-wider">Alérgenos Declarados:</span>
                                          <div className="flex flex-wrap gap-1">
                                            {dish.allergens && dish.allergens.length > 0 ? (
                                              dish.allergens.map((allId: string) => {
                                                const allergen = ALLERGENS.find(a => a.id === allId);
                                                return allergen ? (
                                                  <span key={allId} title={allergen.label} className="inline-flex items-center gap-0.5 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100 font-bold text-[8px] text-zinc-600">
                                                    <span>{allergen.icon}</span>
                                                    <span>{allergen.label}</span>
                                                  </span>
                                                ) : null;
                                              })
                                            ) : (
                                              <span className="text-zinc-400 font-bold italic text-[9px]">Sin alérgenos declarados</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="pt-2 flex items-center gap-1.5 text-zinc-400">
                                          <span className="font-bold">Elaborado por Chef:</span>
                                          <span className="font-extrabold text-zinc-600 uppercase">{creator?.name || 'Miembro del equipo'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Signatures */}
                <div className="pt-10 border-t border-zinc-100 grid grid-cols-2 gap-8 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest print:pt-16">
                  <div>
                    <span className="block border-b border-zinc-200 pb-8 mb-2 mx-auto max-w-[160px]" />
                    <span>Firma del Coordinador</span>
                  </div>
                  <div>
                    <span className="block border-b border-zinc-200 pb-8 mb-2 mx-auto max-w-[160px]" />
                    <span>Firma del Docente / Tutor</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 15: ENTREGABLE TAREA 5 */}
          {activeMenu === 'step-15' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Documento Listo para Entregar</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {renderDeliveryStatus('step-15')}
                    {renderGradeBadge('step-15')}
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  title="Recuerda activar 'Encabezados y pies de página' y 'A4' en el diálogo de impresión para ver la numeración."
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimir / Descargar PDF
                </button>
              </div>

              <div className="bg-white border border-zinc-200 rounded-sm p-12 md:p-16 shadow-lg max-w-4xl mx-auto print:max-w-none print:w-full print:border-none print:shadow-none print:p-0 font-serif" id="memoria-imprimible-15">
                {renderIESHeader('Memoria Intermedia (Tarea 5)', 'Proyecto Gastronómico Sostenible')}
                {/* PORTADA */}
                <div className="min-h-[700px] flex flex-col items-center justify-center text-center space-y-12 border-b-2 border-zinc-900 pb-24 print:min-h-[220mm] print:border-none print:justify-center">
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-zinc-100 rounded-full mx-auto flex items-center justify-center border border-zinc-200 mb-6">
                      {gastState.decisionGrupal.logo ? (
                        <img src={gastState.decisionGrupal.logo} className="w-16 h-16 object-contain" alt="Logo" />
                      ) : (
                        <Leaf className="w-10 h-10 text-zinc-400" />
                      )}
                    </div>
                    <h3 className="text-sm font-black text-zinc-500 tracking-[0.2em] uppercase">Memoria Intermedia de Proyecto</h3>
                    <h1 className="text-5xl font-black text-zinc-900 tracking-tight uppercase leading-tight max-w-3xl">
                      {gastState.restaurantName || 'Arenal Ecocuisine'}
                    </h1>
                    <p className="text-xl font-bold text-zinc-600 italic mt-4">
                      Proyecto Gastronómico Integral Sostenible
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-12 text-left pt-12 border-t border-zinc-200 w-full max-w-xl">
                    <div>
                      <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Equipo</span>
                      <span className="text-sm font-bold text-zinc-800">{gastState.teamName || 'Los Cocedores del Arenal'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Zona Gastronómica</span>
                      <span className="text-sm font-bold text-zinc-800">
                        {GASTRONOMIC_ZONES.find(z => z.id === gastState.selectedZone)?.name || 'Zona Costa'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Público Objetivo</span>
                      <span className="text-sm font-bold text-zinc-800">{gastState.decisionGrupal.publicoObjetivo || 'Profesionales de 25-50 años'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Fecha</span>
                      <span className="text-sm font-bold text-zinc-800">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-16 pt-16 print:break-before-page">
                  {/* 1. Identidad y Equipo */}
                  <section className="space-y-6 print:break-inside-avoid">
                    <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">1. Identidad y Equipo</h2>
                    <div className="prose prose-sm prose-zinc max-w-none">
                      <p><strong>Restaurante:</strong> {gastState.restaurantName || 'Arenal Ecocuisine'}</p>
                      <p><strong>Ubicación Geográfica:</strong> {gastState.locationArea || 'Costa local'}</p>
                      <p><strong>Equipo de Trabajo:</strong> {gastState.teamName || 'Los Cocedores del Arenal'}</p>
                      <div className="mt-4 p-4 bg-zinc-50 border border-zinc-100 rounded-lg">
                        <p className="font-bold mb-2 text-sm uppercase tracking-wider text-zinc-500">Reparto de Roles Oficial</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {gastState.roles.projectManager && <li><strong>Coordinador:</strong> {allUsers.find(u => u.id === gastState.roles.projectManager)?.name || 'Asignado'}</li>}
                          {gastState.roles.fbDirector && <li><strong>Director de F&B:</strong> {allUsers.find(u => u.id === gastState.roles.fbDirector)?.name || 'Asignado'}</li>}
                          {gastState.roles.sustainabilityManager && <li><strong>Responsable de Sostenibilidad:</strong> {allUsers.find(u => u.id === gastState.roles.sustainabilityManager)?.name || 'Asignado'}</li>}
                          {gastState.roles.marketingDirector && <li><strong>Director de Marketing:</strong> {allUsers.find(u => u.id === gastState.roles.marketingDirector)?.name || 'Asignado'}</li>}
                          {gastState.roles.financialDirector && <li><strong>Director Financiero:</strong> {allUsers.find(u => u.id === gastState.roles.financialDirector)?.name || 'Asignado'}</li>}
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* 2. Análisis del Entorno */}
                  <section className="space-y-6 print:break-inside-avoid">
                    <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">2. Análisis del Entorno</h2>
                    <div className="space-y-4 prose prose-sm prose-zinc max-w-none">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800">2.1 Contexto y Justificación</h3>
                        <p className="whitespace-pre-wrap">{gastState.task5?.contextAndJustification || 'No se ha redactado este apartado.'}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800">2.2 Síntesis de Investigación</h3>
                        <p className="whitespace-pre-wrap">{gastState.task5?.researchSynthesis || 'No se ha redactado este apartado.'}</p>
                      </div>
                    </div>
                  </section>

                  {/* 3. Conceptualización */}
                  <section className="space-y-6 print:break-inside-avoid">
                    <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">3. Conceptualización</h2>
                    <div className="space-y-4 prose prose-sm prose-zinc max-w-none">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800">3.1 Objetivos del Restaurante</h3>
                        <p className="whitespace-pre-wrap">{gastState.task5?.restaurantObjectives || 'No se ha redactado este apartado.'}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800">3.2 Propuesta de Valor</h3>
                        <p className="whitespace-pre-wrap">{gastState.task5?.valueProposition || 'No se ha redactado este apartado.'}</p>
                      </div>
                    </div>
                  </section>

                  {/* 4. Oferta Gastronómica */}
                  <section className="space-y-6 print:break-before-page">
                    <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">4. Oferta Gastronómica</h2>
                    <div className="space-y-4 prose prose-sm prose-zinc max-w-none">
                      <p className="whitespace-pre-wrap">{gastState.task5?.gastronomicExplanation || 'Explicación general pendiente de redacción.'}</p>
                      
                      <h3 className="text-lg font-bold text-zinc-800 mt-6">4.1 Catálogo de Platos Seleccionados</h3>
                      {gastState.dishes && gastState.dishes.length > 0 ? (
                        <div className="space-y-4">
                          {gastState.dishes.map((dish: any, i: number) => (
                            <div key={dish.id} className="border border-zinc-200 p-4 rounded-lg bg-zinc-50 break-inside-avoid">
                              <h4 className="font-bold text-zinc-900 uppercase text-sm mb-1">{dish.name} <span className="text-xs text-zinc-500 font-normal ml-2">({dish.type})</span></h4>
                              <p className="text-xs text-zinc-600 mb-2">{dish.description}</p>
                              <div className="text-xs">
                                <p><strong>Justificación Sostenible:</strong> {dish.sustainabilityJustification || 'No indicada'}</p>
                                <p><strong>Elaborado por:</strong> {allUsers.find(u => u.id === dish.userId)?.name || 'Anónimo'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-400 italic">No hay platos registrados en el sistema para inyectar.</p>
                      )}
                    </div>
                  </section>

                  {/* 5. Desarrollo y Prototipo */}
                  <section className="space-y-6 print:break-inside-avoid">
                    <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">5. Desarrollo y Prototipo</h2>
                    <div className="space-y-4 prose prose-sm prose-zinc max-w-none">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800">5.1 Metodología de Trabajo</h3>
                        <p className="whitespace-pre-wrap">{gastState.task5?.workMethodology || 'No se ha redactado este apartado.'}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800">5.2 Planificación Temporal</h3>
                        <p className="whitespace-pre-wrap">{gastState.task5?.timePlanning || 'No se ha redactado este apartado.'}</p>
                      </div>
                    </div>
                  </section>

                  {/* 6. Conclusiones y ODS */}
                  <section className="space-y-6 print:break-inside-avoid">
                    <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">6. Conclusiones y ODS</h2>
                    <div className="space-y-4 prose prose-sm prose-zinc max-w-none">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800">6.1 Relación con ODS</h3>
                        <p className="whitespace-pre-wrap">{gastState.task5?.odsRelationship || 'No se ha redactado este apartado.'}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800">6.2 Valoración Final</h3>
                        <p className="whitespace-pre-wrap">{gastState.task5?.finalValuation || 'No se ha redactado este apartado.'}</p>
                      </div>
                    </div>
                  </section>

                  {/* 7. Bibliografía */}
                  <section className="space-y-6 print:break-inside-avoid">
                    <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">7. Bibliografía y Fuentes</h2>
                    <div className="prose prose-sm prose-zinc max-w-none">
                      <p className="whitespace-pre-wrap">{gastState.task5?.bibliography || 'No se ha añadido bibliografía.'}</p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}

          {/* STEP 16: INFORME COEVALUACIÓN */}
          {activeMenu === 'step-16' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                      <Scale className="h-4 w-4 text-indigo-600" />
                      6. Informe Coevaluación del Grupo
                    </h3>
                    <p className="text-[11px] text-zinc-400">Genera el informe confidencial con las valoraciones de tus compañeros.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {renderDeliveryStatus('step-16')}
                    {renderGradeBadge('step-16')}
                  </div>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl text-right shrink-0">
                  <span className="text-[8px] text-indigo-400 font-extrabold uppercase block text-center">Impacto Máximo</span>
                  <span className="text-xs font-black text-indigo-700 font-mono text-center block">+/- {maxCoevaluationImpact.toFixed(1)}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 leading-relaxed font-medium">
                <p><strong>🔒 Confidencialidad Estricta:</strong> Este documento es exclusivamente para el tutor y afecta a la nota final según el desempeño cooperativo. Tus compañeros no verán estas notas.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allUsers.filter(u => u.id !== currentUser.id && u.classroom === currentUser.classroom && u.role === 'alumno').map(teammate => {
                  const review = gastState.task9?.reviews?.[currentUser.id]?.[teammate.id] || {
                    participacion: 0,
                    responsabilidad: 0,
                    colaboracion: 0,
                    contribucion: 0,
                    comment: ''
                  };
                  const isComplete = review.comment.length > 5;

                  return (
                    <div key={teammate.id} className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/30 flex items-center justify-between gap-3">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center font-bold text-zinc-400 text-[10px]">
                            {teammate.initials}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-800">{teammate.name}</p>
                            <p className="text-[9px] text-zinc-400 font-bold uppercase">{teammate.email}</p>
                          </div>
                       </div>
                       <div>
                          {isComplete ? (
                            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase font-black">Completado</span>
                          ) : (
                            <span className="text-[9px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded uppercase font-black">Pendiente</span>
                          )}
                       </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-zinc-100 flex flex-col items-center space-y-4">
                <div className="text-center max-w-sm">
                  <h4 className="text-sm font-black text-zinc-900">Finalizar Coevaluación</h4>
                  <p className="text-[11px] text-zinc-500 font-medium">Una vez revisadas todas las valoraciones, genera el informe final para el profesor.</p>
                </div>
                <button 
                  onClick={() => {
                    setShowDocType('coevaluacion');
                    triggerToast('📑 Generando informe confidencial para el profesor...');
                  }}
                  className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-4 rounded-2xl text-xs font-black transition-all shadow-xl active:scale-95"
                >
                  <FileText className="h-5 w-5" />
                  Generar Informe PDF para el Profesor
                </button>
              </div>
            </div>
          )}
          {activeMenu === 'step-3' && (
            <div className="space-y-6">
              {/* Header with Title and Tabs */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight">Análisis</h2>
                  <p className="text-xs font-bold text-zinc-400">Fase 1 - Inmersión | Entrega: Finales Octubre</p>
                </div>
                
                <div className="flex bg-zinc-100 p-1 rounded-xl self-start">
                  {[
                    { id: 'instrucciones', label: '1. Instrucciones', icon: BookOpen },
                    { id: 'investigacion', label: '2. Investigación', icon: Search },
                    { id: 'decision', label: '3. Decisión', icon: Users },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveStep3Tab(tab.id as any)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        activeStep3Tab === tab.id 
                          ? 'bg-white text-indigo-600 shadow-sm' 
                          : 'text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TAB CONTENT: INSTRUCCIONES */}
              {activeStep3Tab === 'instrucciones' && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-zinc-900">Guía de Micro-tareas para los Alumnos</h3>
                    
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Compass className="h-24 w-24 text-indigo-600" />
                      </div>
                      <div className="relative z-10 space-y-3">
                        <h4 className="text-sm font-black text-indigo-900">Objetivo del Proyecto</h4>
                        <p className="text-xs text-indigo-800 leading-relaxed max-w-2xl">
                          Convertiros en expertos de la zona elegida de la Región de Murcia para diseñar un restaurante 100% sostenible y coherente con el entorno. Cada micro-tarea es una pieza clave para el éxito del entregable final.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-5 border border-zinc-100 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckSquare className="h-4 w-4" />
                          <h4 className="text-xs font-black uppercase">Dinámica de Trabajo</h4>
                        </div>
                        <ul className="space-y-2">
                          <li className="text-[11px] text-zinc-600"><span className="font-black text-zinc-900">Asignación:</span> El coordinador debe repartir las 10 tareas entre los miembros.</li>
                          <li className="text-[11px] text-zinc-600"><span className="font-black text-zinc-900">Investigación:</span> Cada alumno completa sus puntos en la pestaña "Investigación".</li>
                        </ul>
                      </div>
                      <div className="p-5 border border-zinc-100 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckSquare className="h-4 w-4" />
                          <h4 className="text-xs font-black uppercase">Resultado Final</h4>
                        </div>
                        <ul className="space-y-2">
                          <li className="text-[11px] text-zinc-600"><span className="font-black text-zinc-900">Grupal:</span> Definición del concepto, valores y marca.</li>
                          <li className="text-[11px] text-zinc-600"><span className="font-black text-zinc-900">Individual:</span> Cada alumno genera su propio anexo de investigación basado en sus hallazgos.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-100">
                      <h4 className="text-xs font-black uppercase text-zinc-400 mb-4 tracking-widest">Contenido de la Investigación</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        Debéis profundizar en los 10 puntos clave: competencia, cartas, reputación, clientes (locales y turistas), catálogo de productos de temporada, productores Km0, medidas de sostenibilidad, benchmarking de innovación y tendencias visuales.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: INVESTIGACIÓN */}
              {activeStep3Tab === 'investigacion' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                    <div className="bg-emerald-500 p-1.5 rounded-lg">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs font-bold text-emerald-800">
                      <span className="font-black">Zona de trabajo individual:</span> Completa los puntos de tu tarea asignada. Estás identificado como: <span className="underline">{currentUser.name}</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    {TAREAS_INVESTIGACION.map((tarea) => {
                      const isAssignedToMe = taskAssignments[tarea.id] === currentUser.id;
                      const assignedUser = allUsers.find(u => u.id === taskAssignments[tarea.id]);
                      const isExpanded = expandedTaskId === tarea.id;

                      return (
                        <div 
                          key={tarea.id} 
                          className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                            isExpanded ? 'border-indigo-200 ring-4 ring-indigo-50' : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          {/* Task Header */}
                          <button
                            onClick={() => setExpandedTaskId(isExpanded ? null : tarea.id)}
                            className="w-full flex items-center justify-between p-4 text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                                isAssignedToMe ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-400'
                              }`}>
                                {tarea.id}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-zinc-900 flex items-center gap-2">
                                  {tarea.title}
                                  {!isAssignedToMe && <Lock className="h-3 w-3 text-zinc-300" />}
                                  {isAssignedToMe && <Unlock className="h-3 w-3 text-indigo-400" />}
                                </h4>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                                  RESPONSABLE: {assignedUser ? assignedUser.name : '-- SIN ASIGNAR --'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {isAssignedToMe && (
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded uppercase">Tu Tarea</span>
                              )}
                              {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                            </div>
                          </button>

                          {/* Task Body */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-zinc-100 p-6 space-y-6"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <h5 className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-2">
                                        <Info className="h-3 w-3" />
                                        ¿Qué debes hacer?
                                      </h5>
                                      <p className="text-xs text-zinc-600 leading-relaxed font-semibold">
                                        {tarea.desc}
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <h5 className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-2">
                                        <Plus className="h-3 w-3" />
                                        Puntos a describir
                                      </h5>
                                      <p className="text-[11px] text-zinc-500 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                        {tarea.guia}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <h5 className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-2">
                                        <Check className="h-3 w-3" />
                                        Entregable esperado
                                      </h5>
                                      <p className="text-[11px] text-zinc-500 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100 italic">
                                        {tarea.entregable}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-[10px] font-black text-zinc-900 uppercase">Tu Informe:</h5>
                                    {!isAssignedToMe && (
                                      <span className="text-[10px] text-zinc-400 italic">Sólo lectura</span>
                                    )}
                                  </div>
                                  <textarea
                                    rows={8}
                                    placeholder={isAssignedToMe ? "Desarrolla aquí los puntos solicitados anteriormente..." : "El responsable aún no ha completado esta investigación."}
                                    disabled={!isAssignedToMe}
                                    value={gastState.researchTexts[tarea.id] || ''}
                                    onChange={(e) => {
                                      setGastState(prev => ({
                                        ...prev,
                                        researchTexts: {
                                          ...prev.researchTexts,
                                          [tarea.id]: e.target.value
                                        }
                                      }));
                                    }}
                                    className={`w-full p-4 border rounded-2xl text-xs font-semibold leading-relaxed transition-all ${
                                      isAssignedToMe 
                                        ? 'bg-white border-indigo-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 text-zinc-800' 
                                        : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                                    }`}
                                  />
                                  <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400">
                                    <span>ÚLTIMA SINCRONIZACIÓN AUTOMÁTICA</span>
                                    <span>{(gastState.researchTexts[tarea.id] || '').length} CARACTERES REDACTADOS</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: DECISIÓN */}
              {activeStep3Tab === 'decision' && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-black text-zinc-900 tracking-tight">Decisión Grupal: El Concepto</h3>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                      Como coordinador/a, eres responsable de registrar la identidad final del restaurante acordada por el equipo.
                    </p>
                  </div>

                  {gastState.roles.projectManager !== currentUser.id && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center gap-3">
                      <Lock className="h-4 w-4 text-amber-600" />
                      <p className="text-xs font-bold text-amber-800">
                        Tienes permisos de <span className="font-black uppercase">Sólo Lectura</span>. Las modificaciones deben ser realizadas por el coordinador del equipo.
                      </p>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-900">Nombre del Restaurante</label>
                        <input 
                          type="text"
                          value={gastState.projectName || ''}
                          disabled={gastState.roles.projectManager !== currentUser.id}
                          onChange={(e) => setGastState(prev => ({ ...prev, projectName: e.target.value }))}
                          className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 transition-all"
                          placeholder="Ej: Raíces del Valle"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-900">Logo del Restaurante (Opcional)</label>
                        <div className={`w-full h-[54px] border-2 border-dashed rounded-xl flex items-center px-4 gap-4 transition-all ${
                          gastState.roles.projectManager === currentUser.id ? 'border-zinc-200 hover:border-indigo-200 cursor-pointer' : 'border-zinc-100 bg-zinc-50'
                        }`}>
                          <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                            <ImageIcon className="h-4 w-4 text-zinc-400" />
                          </div>
                          <p className="text-[11px] font-bold text-zinc-400">Sube el logo de tu marca si ya lo tienes diseñado.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-900">Propuesta de Valor (Eslogan)</label>
                      <input 
                        type="text"
                        value={gastState.decisionGrupal.slogan || ''}
                        disabled={gastState.roles.projectManager !== currentUser.id}
                        onChange={(e) => updateNestedField('decisionGrupal', 'slogan', e.target.value)}
                        className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 transition-all"
                        placeholder="El eslogan que os define..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-900">Público Objetivo Final</label>
                      <textarea 
                        rows={4}
                        value={gastState.decisionGrupal.publicoObjetivo || ''}
                        disabled={gastState.roles.projectManager !== currentUser.id}
                        onChange={(e) => updateNestedField('decisionGrupal', 'publicoObjetivo', e.target.value)}
                        className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 transition-all"
                        placeholder="Describe detalladamente a tu público..."
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-zinc-900">Valores (3 Adjetivos)</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[0, 1, 2].map((idx) => (
                          <input
                            key={idx}
                            type="text"
                            placeholder={`Valor ${idx + 1}`}
                            value={gastState.decisionGrupal.valores[idx] || ''}
                            disabled={gastState.roles.projectManager !== currentUser.id}
                            onChange={(e) => {
                              const newValores = [...(gastState.decisionGrupal.valores || [])];
                              newValores[idx] = e.target.value;
                              updateNestedField('decisionGrupal', 'valores', newValores);
                            }}
                            className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 transition-all"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        disabled={gastState.roles.projectManager !== currentUser.id}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white transition-all shadow-lg active:scale-95 ${
                          gastState.roles.projectManager === currentUser.id 
                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                            : 'bg-zinc-300 cursor-not-allowed'
                        }`}
                      >
                        <Save className="h-4 w-4" />
                        Guardar Decisión
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: DISEÑO DE CARTA / TAREA 3 */}
          {activeMenu === 'step-4' && (
            <div className="space-y-6" id="diseño-carta-view">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight">Diseño de Carta</h2>
                  <p className="text-xs font-bold text-zinc-400">Creación de Fichas Técnicas Profesionales.</p>
                </div>
                
                <div className="flex bg-zinc-100 p-1 rounded-xl self-start overflow-x-auto no-scrollbar">
                  {[
                    { id: 'instrucciones', label: 'Instrucciones', icon: BookOpen },
                    { id: 'temporada', label: 'Productos Temporada', icon: Leaf },
                    { id: 'mis-platos', label: 'Mis Platos', icon: Utensils },
                    { id: 'carta-completa', label: 'Ver Carta Completa', icon: ClipboardList },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveStep4Tab(tab.id as any)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                        activeStep4Tab === tab.id 
                          ? 'bg-white text-indigo-600 shadow-sm' 
                          : 'text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TAB CONTENT: INSTRUCCIONES */}
              {activeStep4Tab === 'instrucciones' && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-zinc-900">Guía de Trabajo: Tarea 3</h3>
                    
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
                      <div className="relative z-10 space-y-4">
                        <h4 className="text-sm font-black text-indigo-900">Trabajo Individual</h4>
                        <p className="text-xs text-indigo-800 leading-relaxed max-w-2xl">
                          Cada miembro del equipo debe crear <span className="font-bold">4 fichas técnicas</span> completas.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-indigo-700 font-semibold">
                          <li className="flex items-center gap-2">• 1 Aperitivo / Snack</li>
                          <li className="flex items-center gap-2">• 1 Entrante</li>
                          <li className="flex items-center gap-2">• 1 Plato Principal</li>
                          <li className="flex items-center gap-2">• 1 Postre</li>
                        </ul>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-500 leading-relaxed">
                      <span className="font-bold text-zinc-700">Nota sobre Costes:</span> En esta ficha indicarás los ingredientes y cantidades. El cálculo económico real se hará automáticamente en la <span className="font-bold text-zinc-700">fase de Escandallo</span>, y el precio final aparecerá aquí una vez calculado.
                    </p>

                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
                      <h4 className="text-xs font-bold text-amber-800 mb-1">Novedad: Productos de Temporada</h4>
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        Antes de diseñar tus platos, debes completar la sección de <span className="font-bold">Productos de Temporada</span>. Esta investigación es fundamental para justificar la elección de tus ingredientes y la sostenibilidad de tu propuesta.
                      </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setActiveStep4Tab('temporada')}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full text-xs font-black transition-all shadow-lg active:scale-95"
                      >
                        Completar Productos de Temporada
                      </button>
                      <button 
                        onClick={() => setActiveStep4Tab('mis-platos')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full text-xs font-black transition-all shadow-lg active:scale-95"
                      >
                        Ir a Mis Platos
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: TEMPORADA */}
              {activeStep4Tab === 'temporada' && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                        <Leaf className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-black text-zinc-900">1. Selección de Productos de Temporada</h3>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                      Esta sección es básica para entender el porqué de los platos elaborados en la carta.
                    </p>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-900">Lista de productos (ej. "Alcachofas, Murcia, km0")</label>
                        <textarea 
                          rows={4}
                          value={gastState.seasonalAnalysis[currentUser.id]?.products || ''}
                          onChange={(e) => {
                            const current = gastState.seasonalAnalysis[currentUser.id] || { products: '', sustainability: '', sources: '' };
                            updateNestedField('seasonalAnalysis', currentUser.id, { ...current, products: e.target.value });
                          }}
                          placeholder="Escribe aquí los productos que has seleccionado..."
                          className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-900">Sostenibilidad (ej. "Reduce emisiones, ODS 12")</label>
                        <input 
                          type="text"
                          value={gastState.seasonalAnalysis[currentUser.id]?.sustainability || ''}
                          onChange={(e) => {
                            const current = gastState.seasonalAnalysis[currentUser.id] || { products: '', sustainability: '', sources: '' };
                            updateNestedField('seasonalAnalysis', currentUser.id, { ...current, sustainability: e.target.value });
                          }}
                          placeholder="Justifica la sostenibilidad de estos productos..."
                          className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-900">Fuentes (mínimo 3)</label>
                        <textarea 
                          rows={3}
                          value={gastState.seasonalAnalysis[currentUser.id]?.sources || ''}
                          onChange={(e) => {
                            const current = gastState.seasonalAnalysis[currentUser.id] || { products: '', sustainability: '', sources: '' };
                            updateNestedField('seasonalAnalysis', currentUser.id, { ...current, sources: e.target.value });
                          }}
                          placeholder="Justificando la procedencia de la información..."
                          className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 transition-all"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button 
                          onClick={() => triggerToast('💾 Cambios guardados correctamente')}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-black transition-all shadow-lg active:scale-95"
                        >
                          Guardar Cambios
                        </button>
                        <button 
                          onClick={() => setActiveStep4Tab('mis-platos')}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl text-sm font-black transition-all shadow-lg active:scale-95 flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Guardar e ir a Mis Platos
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: MIS PLATOS */}
              {activeStep4Tab === 'mis-platos' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-zinc-900">Mis Creaciones ({gastState.dishes.filter((d: any) => d.userId === currentUser.id).length}/4)</h3>
                    <button 
                      onClick={() => {
                        const myDishes = gastState.dishes.filter((d: any) => d.userId === currentUser.id);
                        if (myDishes.length >= 4) {
                          triggerToast('⚠️ Ya has completado tus 4 platos obligatorios.');
                          return;
                        }
                        const newId = 'dish-' + Date.now();
                        const dish: any = {
                          id: newId,
                          userId: currentUser.id,
                          name: '',
                          type: 'aperitivo',
                          portions: 1,
                          description: '',
                          image: '',
                          ingredients: [],
                          elaboration: '',
                          sustainabilityJustification: '',
                          allergens: [],
                          pvp: 0
                        };
                        updateField('dishes', [...gastState.dishes, dish]);
                        setExpandedTaskId(null); // Use as active dish ID for editing
                        setExpandedTaskId(newId as any); 
                      }}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo Plato
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {gastState.dishes.filter((d: any) => d.userId === currentUser.id).map((dish: any) => {
                      const isEditing = expandedTaskId === dish.id as any;
                      return (
                        <div key={dish.id} className={`bg-white border rounded-2xl overflow-hidden transition-all ${isEditing ? 'border-indigo-200 ring-4 ring-indigo-50 shadow-xl' : 'border-zinc-200 hover:border-zinc-300 shadow-sm'}`}>
                          <div className="p-4 flex items-center justify-between bg-zinc-50/50 border-b border-zinc-100">
                            <div className="flex items-center gap-3">
                              <div className="bg-white p-2 rounded-lg border border-zinc-200">
                                <Utensils className="h-4 w-4 text-zinc-400" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-zinc-900">{dish.name || 'Sin nombre'}</h4>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{dish.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setExpandedTaskId(isEditing ? null : dish.id as any)}
                                className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors"
                              >
                                {isEditing ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                              </button>
                              <button 
                                onClick={() => {
                                  const updated = gastState.dishes.filter((d: any) => d.id !== dish.id);
                                  updateField('dishes', updated);
                                  triggerToast('🗑️ Plato eliminado');
                                }}
                                className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>

                          {isEditing && (
                            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-2">
                              {/* Form fields for dish */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nombre del Plato</label>
                                    <input 
                                      type="text"
                                      value={dish.name}
                                      onChange={(e) => {
                                        const updated = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, name: e.target.value } : d);
                                        updateField('dishes', updated);
                                      }}
                                      placeholder="Ej: Arroz con Conejo y Serranas"
                                      className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 transition-all"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tipo</label>
                                      <select 
                                        value={dish.type}
                                        onChange={(e) => {
                                          const updated = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, type: e.target.value } : d);
                                          updateField('dishes', updated);
                                        }}
                                        className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 transition-all"
                                      >
                                        <option value="aperitivo">Aperitivo / Snack</option>
                                        <option value="entrante">Entrante</option>
                                        <option value="principal">Plato Principal</option>
                                        <option value="postre">Postre</option>
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Raciones</label>
                                      <input 
                                        type="number"
                                        value={dish.portions}
                                        onChange={(e) => {
                                          const updated = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, portions: Number(e.target.value) } : d);
                                          updateField('dishes', updated);
                                        }}
                                        className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 transition-all"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Descripción Comercial</label>
                                    <textarea 
                                      rows={3}
                                      value={dish.description}
                                      onChange={(e) => {
                                        const updated = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, description: e.target.value } : d);
                                        updateField('dishes', updated);
                                      }}
                                      placeholder="Descripción atractiva para el cliente..."
                                      className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 transition-all"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-6">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Imagen de Referencia</label>
                                    <div className="w-full aspect-video bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden group cursor-pointer hover:border-indigo-200 transition-all">
                                      {dish.image ? (
                                        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <>
                                          <ImageIcon className="h-10 w-10 text-zinc-300 group-hover:scale-110 transition-transform" />
                                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Subir Foto del Plato</span>
                                        </>
                                      )}
                                      <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        onChange={(e) => {
                                          // Mock file upload
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              const updated = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, image: reader.result as string } : d);
                                              updateField('dishes', updated);
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h5 className="text-xs font-black text-zinc-900 border-b border-zinc-100 pb-2">Listado de Ingredientes</h5>
                                <div className="space-y-3">
                                  {dish.ingredients.map((ing: any, idx: number) => (
                                    <div key={idx} className="flex gap-3 items-center animate-in fade-in slide-in-from-left-2">
                                      <input 
                                        type="text" 
                                        placeholder="Ingrediente"
                                        value={ing.name}
                                        onChange={(e) => {
                                          const newIngs = [...dish.ingredients];
                                          newIngs[idx].name = e.target.value;
                                          const updated = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, ingredients: newIngs } : d);
                                          updateField('dishes', updated);
                                        }}
                                        className="flex-1 p-2 border border-zinc-200 rounded-lg text-xs font-semibold"
                                      />
                                      <input 
                                        type="text" 
                                        placeholder="Cant."
                                        value={ing.quantity}
                                        onChange={(e) => {
                                          const newIngs = [...dish.ingredients];
                                          newIngs[idx].quantity = e.target.value;
                                          const updated = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, ingredients: newIngs } : d);
                                          updateField('dishes', updated);
                                        }}
                                        className="w-20 p-2 border border-zinc-200 rounded-lg text-xs font-semibold"
                                      />
                                      <select
                                        value={ing.unit}
                                        onChange={(e) => {
                                          const newIngs = [...dish.ingredients];
                                          newIngs[idx].unit = e.target.value;
                                          // Also reset priceUnit to base of new unit when unit changes
                                          const newBase = INGREDIENT_UNITS.find(u => u.id === e.target.value)?.base;
                                          if (newBase) {
                                            newIngs[idx].priceUnit = newBase;
                                          }
                                          const updated = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, ingredients: newIngs } : d);
                                          updateField('dishes', updated);
                                        }}
                                        className="w-24 p-2 border border-zinc-200 rounded-lg text-xs font-semibold bg-white"
                                      >
                                        <option value="" disabled>Unidad</option>
                                        {INGREDIENT_UNITS.map(u => (
                                          <option key={u.id} value={u.id}>{u.id}</option>
                                        ))}
                                      </select>
                                      <button 
                                        onClick={() => {
                                          const newIngs = dish.ingredients.filter((_: any, i: number) => i !== idx);
                                          const updated = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, ingredients: newIngs } : d);
                                          updateField('dishes', updated);
                                        }}
                                        className="text-zinc-300 hover:text-red-500 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                  <button 
                                    onClick={() => {
                                      const newIngs = [...dish.ingredients, { name: '', quantity: '', unit: '', unitPrice: 0, netWeight: 0, grossWeight: 0 }];
                                      const updated = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, ingredients: newIngs } : d);
                                      updateField('dishes', updated);
                                    }}
                                    className="text-[10px] font-black text-indigo-600 flex items-center gap-1.5 hover:text-indigo-700"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Añadir Ingrediente
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h5 className="text-xs font-black text-zinc-900 border-b border-zinc-100 pb-2">Elaboración / Paso a Paso</h5>
                                <textarea 
                                  rows={5}
                                  value={dish.elaboration}
                                  onChange={(e) => {
                                    const updated = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, elaboration: e.target.value } : d);
                                    updateField('dishes', updated);
                                  }}
                                  placeholder="Describe los pasos para preparar este plato..."
                                  className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 transition-all"
                                />
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                                  <AlertCircle className="h-4 w-4 text-orange-500" />
                                  <h5 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Alérgenos (Haz clic para marcar)</h5>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                  {ALLERGENS.map((allergen) => {
                                    const isSelected = dish.allergens?.includes(allergen.id);
                                    return (
                                      <button
                                        key={allergen.id}
                                        type="button"
                                        onClick={() => {
                                          const currentAllergens = dish.allergens || [];
                                          const nextAllergens = isSelected
                                            ? currentAllergens.filter((id: string) => id !== allergen.id)
                                            : [...currentAllergens, allergen.id];
                                          const updated = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, allergens: nextAllergens } : d);
                                          updateField('dishes', updated);
                                        }}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1 ${
                                          isSelected
                                            ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                                            : 'border-zinc-100 bg-white hover:border-zinc-200'
                                        }`}
                                      >
                                        <span className="text-xl">{allergen.icon}</span>
                                        <span className={`text-[10px] font-bold text-center leading-tight ${isSelected ? 'text-indigo-900' : 'text-zinc-500'}`}>
                                          {allergen.label}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h5 className="text-xs font-black text-zinc-900 border-b border-zinc-100 pb-2">Justificación Sostenible (Km0 / Temporada)</h5>
                                <textarea 
                                  rows={3}
                                  value={dish.sustainabilityJustification}
                                  onChange={(e) => {
                                    const updated = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, sustainabilityJustification: e.target.value } : d);
                                    updateField('dishes', updated);
                                  }}
                                  placeholder="¿Por qué este plato es sostenible? (Ej: Uso de tomates de Mazarrón en temporada...)"
                                  className="w-full p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 transition-all"
                                />
                              </div>

                              <div className="flex justify-end pt-4">
                                <button 
                                  onClick={() => {
                                    setExpandedTaskId(null);
                                    triggerToast('🍽️ Plato guardado correctamente');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl text-sm font-black transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                >
                                  <Save className="h-4 w-4" />
                                  Guardar Plato
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {gastState.dishes.filter((d: any) => d.userId === currentUser.id).length === 0 && (
                      <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl py-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
                          <ChefHat className="h-8 w-8 text-zinc-300" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-zinc-900">Aún no has creado ningún plato</h4>
                          <p className="text-[11px] text-zinc-500 font-semibold max-w-xs mx-auto">
                            Comienza añadiendo tu primer plato (aperitivo, entrante, principal o postre) pulsando el botón superior.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: CARTA COMPLETA */}
              {activeStep4Tab === 'carta-completa' && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-black text-zinc-900">Carta Completa del Restaurante</h3>
                    <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed font-semibold">
                      Aquí puedes ver todos los platos creados por los distintos miembros del equipo para asegurar que la propuesta global tiene sentido.
                    </p>
                  </div>

                  {gastState.dishes.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 italic text-xs">
                      No hay platos en la carta aún.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {gastState.dishes.map((dish: any) => {
                        const creator = allUsers.find(u => u.id === dish.userId);
                        return (
                          <div key={dish.id} className="border border-zinc-100 rounded-2xl p-4 flex gap-4 hover:border-indigo-100 transition-all hover:bg-zinc-50/50">
                            <div className="w-24 h-24 rounded-xl bg-zinc-100 flex-shrink-0 overflow-hidden border border-zinc-200">
                              {dish.image ? (
                                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-zinc-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-start">
                                <h4 className="text-sm font-black text-zinc-900">{dish.name || 'Sin nombre'}</h4>
                                <span className="text-[9px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500 font-bold uppercase">{dish.type}</span>
                              </div>
                              <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{dish.description || 'Sin descripción.'}</p>
                              
                              <div className="pt-2 flex flex-wrap gap-1">
                                {dish.allergens?.map((allId: string) => {
                                  const allergen = ALLERGENS.find(a => a.id === allId);
                                  return allergen ? (
                                    <span key={allId} title={allergen.label} className="text-sm grayscale hover:grayscale-0 transition-all cursor-help" aria-label={allergen.label}>
                                      {allergen.icon}
                                    </span>
                                  ) : null;
                                })}
                              </div>

                              <div className="pt-2 flex items-center gap-2">
                                <img 
                                  src={creator?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(creator?.name || '')}`} 
                                  className="w-5 h-5 rounded-full border border-zinc-200"
                                  alt={creator?.name}
                                />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Chef: {creator?.name || 'Anon'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: PROTOTIPOS (TAREA 4) */}
          {activeMenu === 'step-5' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Header section with Tabs */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Prototipos</h2>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Diseño Visual de la Carta</p>
                </div>
                <div className="flex bg-zinc-100 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => updateNestedField('task4', 'activeTab', 'instrucciones')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      gastState.task4.activeTab === 'instrucciones'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    Instrucciones
                  </button>
                  <button
                    onClick={() => updateNestedField('task4', 'activeTab', 'prototipo')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      gastState.task4.activeTab === 'prototipo'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    Misión A y B (Prototipos)
                  </button>
                  <button
                    onClick={() => updateNestedField('task4', 'activeTab', 'dossier')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      gastState.task4.activeTab === 'dossier'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    Dossier de la Carta (Documento Tarea 4)
                  </button>
                </div>
              </div>

              {/* Collaborative Access Banner */}
              <div className={`${canEditTask4 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} rounded-xl p-4 flex items-center gap-3 transition-colors`}>
                <div className={`w-8 h-8 rounded-full ${canEditTask4 ? 'bg-emerald-100' : 'bg-amber-100'} flex items-center justify-center`}>
                  {canEditTask4 ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4 text-amber-600" />}
                </div>
                <div className="flex-1">
                  <p className={`text-[11px] font-bold ${canEditTask4 ? 'text-emerald-900' : 'text-amber-900'} leading-tight uppercase`}>
                    {canEditTask4 ? 'Modo Colaborativo: Acceso Autorizado' : 'Modo Lectura: Sin permisos de edición'}
                  </p>
                  <p className={`text-[10px] ${canEditTask4 ? 'text-emerald-700' : 'text-amber-700'} opacity-80`}>
                    {canEditTask4 
                      ? 'Tienes permisos para editar los prototipos del equipo.' 
                      : 'Solo el Coordinador o el Responsable de Marketing pueden modificar esta tarea.'}
                  </p>
                </div>
              </div>

              {/* Tab Content: Instrucciones */}
              {gastState.task4.activeTab === 'instrucciones' && (
                <div className="bg-white border border-zinc-200 rounded-3xl p-8 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                      <Palette className="h-5 w-5 text-indigo-500" />
                      Tarea 4: Prototipado de la Carta
                    </h3>
                    <div className="p-6 bg-indigo-50/50 border-l-4 border-indigo-500 rounded-r-2xl space-y-2">
                      <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">¿Qué deben hacer?</h4>
                      <p className="text-xs font-semibold text-zinc-600 leading-relaxed">
                        Diseñar visualmente la carta en soporte digital y físico, reflejando el concepto y la identidad del restaurante sostenible que habéis definido.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-emerald-50/30 border-l-4 border-emerald-500 rounded-r-2xl space-y-2">
                    <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest">Objetivo</h4>
                    <p className="text-xs font-semibold text-zinc-600 leading-relaxed">
                      Diseñar una primera versión (un prototipo) de los soportes visuales de vuestra oferta gastronómica.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white border border-zinc-100 rounded-2xl shadow-sm space-y-4 hover:border-indigo-200 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Monitor className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Misión 4.A: Digital</h4>
                      <p className="text-xs font-semibold text-zinc-500 leading-relaxed">
                        Crear un borrador de la carta virtual (ej: Canva) que sea visualmente atractivo y coherente con la marca. Debe ser apto para visualización en pantallas o vía QR.
                      </p>
                    </div>

                    <div className="p-6 bg-white border border-zinc-100 rounded-2xl shadow-sm space-y-4 hover:border-emerald-200 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PenTool className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Misión 4.B: Físico</h4>
                      <p className="text-xs font-semibold text-zinc-500 leading-relaxed">
                        Crear un boceto o maqueta de cómo sería la carta física del restaurante, detallando los aspectos palpables (formato, materiales, texturas) y su sostenibilidad.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button 
                      onClick={() => updateNestedField('task4', 'activeTab', 'prototipo')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-2xl text-xs font-black shadow-lg shadow-emerald-200 transition-all active:scale-95"
                    >
                      Comenzar Desarrollo
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Content: Prototipo */}
              {gastState.task4.activeTab === 'prototipo' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Identidad Visual */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                      <Palette className="h-4 w-4 text-zinc-400" />
                      <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Identidad Visual General</h3>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase leading-relaxed">
                      Explica brevemente la idea visual general (colores, tipografías, materiales que evocan la zona y la sostenibilidad).
                    </p>
                    <textarea 
                      rows={3}
                      value={gastState.task4.visualIdentity}
                      disabled={!canEditTask4}
                      onChange={(e) => updateNestedField('task4', 'visualIdentity', e.target.value)}
                      placeholder="Ej: Usaremos tonos ocres y verdes para recordar a la huerta..."
                      className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Mission 4.A */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6">
                      <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                        <Monitor className="h-4 w-4 text-indigo-500" />
                        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Misión 4.A (Digital)</h3>
                      </div>
                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        <p className="text-[10px] font-bold text-indigo-700 leading-relaxed">
                          Pega aquí el enlace de "Solo lectura" de tu diseño en Canva y/o sube una imagen con tu propio QR.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Enlace Canva (Link Público)</label>
                        <div className="relative">
                          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                          <input 
                            type="url"
                            value={gastState.task4.digitalLink}
                            disabled={!canEditTask4}
                            onChange={(e) => updateNestedField('task4', 'digitalLink', e.target.value)}
                            placeholder="https://www.canva.com/..."
                            className="w-full pl-9 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                          />
                        </div>
                      </div>

                      {/* Custom QR Image upload option requested by the user */}
                      <div className="space-y-3 pt-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Imagen del Código QR (Canva o Personalizado)</label>
                        <div 
                          onClick={() => {
                            if (!canEditTask4) return;
                            // Simulate upload
                            updateNestedField('task4', 'qrImage', 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(gastState.task4.digitalLink || 'https://www.canva.com'));
                            triggerToast('📸 Código QR subido correctamente');
                          }}
                          className={`aspect-square max-w-[160px] mx-auto bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all relative overflow-hidden ${canEditTask4 ? 'hover:border-indigo-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                        >
                          {gastState.task4.qrImage ? (
                            <>
                              <img src={gastState.task4.qrImage} className="w-full h-full object-contain p-2" />
                              {canEditTask4 && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Cambiar QR</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <QrCode className="h-5 w-5 text-zinc-300 group-hover:text-indigo-500" />
                              </div>
                              <span className="text-[10px] font-black text-zinc-400 group-hover:text-indigo-600 uppercase tracking-widest text-center px-2">Subir QR</span>
                            </>
                          )}
                        </div>
                        <p className="text-[9px] text-zinc-400 text-center font-medium italic">
                          Sube una captura de tu QR si ya lo creaste en Canva o prefieres usar un diseño propio.
                        </p>
                      </div>

                      {gastState.task4.digitalLink && !gastState.task4.qrImage && (
                        <div className="flex flex-col items-center gap-3 p-6 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 animate-in zoom-in-95 duration-500">
                          <div className="flex items-center gap-2 mb-1">
                            <QrCode className="h-3.5 w-3.5 text-indigo-500" />
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.15em]">Generador de Acceso QR (Auto)</span>
                          </div>
                          <div className="p-3 bg-white rounded-xl shadow-sm border border-zinc-100">
                            <QRCodeSVG 
                              value={gastState.task4.digitalLink} 
                              size={120}
                              level="H"
                              includeMargin={false}
                            />
                          </div>
                          <p className="text-[8px] font-bold text-zinc-400 max-w-[160px] text-center leading-relaxed">
                            Escanea este código autogenerado para auditar vuestra propuesta digital directamente.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Mission 4.B */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6">
                      <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                        <PenTool className="h-4 w-4 text-emerald-500" />
                        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Misión 4.B (Físico)</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Foto del Boceto / Maqueta</label>
                        <div 
                          onClick={() => {
                            if (!canEditTask4) return;
                            // Simulate upload
                            updateNestedField('task4', 'physicalImage', 'https://images.unsplash.com/photo-1586538599444-672584d43644?w=800');
                            triggerToast('📸 Boceto subido correctamente');
                          }}
                          className={`aspect-video bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-3 group transition-all relative overflow-hidden ${canEditTask4 ? 'hover:border-emerald-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                        >
                          {gastState.task4.physicalImage ? (
                            <>
                              <img src={gastState.task4.physicalImage} className="w-full h-full object-cover" />
                              {canEditTask4 && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Cambiar Foto</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <Upload className="h-5 w-5 text-zinc-300 group-hover:text-emerald-500" />
                              </div>
                              <span className="text-[10px] font-black text-zinc-400 group-hover:text-emerald-600 uppercase tracking-widest">Subir Foto</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Explicación del Formato Físico</label>
                        <textarea 
                          rows={3}
                          value={gastState.task4.physicalDescription}
                          disabled={!canEditTask4}
                          onChange={(e) => updateNestedField('task4', 'physicalDescription', e.target.value)}
                          placeholder="Ej: Será un díptico en papel reciclado con textura..."
                          className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}


            </div>
          )}

          {/* STEP 6: MEMORIA INTERMEDIA */}
          {activeMenu === 'step-6' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Memoria Intermedia</h2>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Documento Académico de Síntesis</p>
                </div>
                <div className="flex bg-zinc-100 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => updateNestedField('task5', 'activeTab', 'redactar')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      gastState.task5?.activeTab === 'redactar' || !gastState.task5?.activeTab
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    Redactar Memoria
                  </button>
                  <button
                    onClick={() => updateNestedField('task5', 'activeTab', 'pdf')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      gastState.task5?.activeTab === 'pdf'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    Vista Previa / PDF
                  </button>
                </div>
              </div>

              {(!gastState.task5?.activeTab || gastState.task5?.activeTab === 'redactar') && (
                <div className="space-y-8">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                    <h3 className="text-sm font-black text-indigo-900 mb-2 uppercase tracking-tight">Zona de Redacción Académica</h3>
                    <p className="text-xs font-semibold text-indigo-700 leading-relaxed max-w-3xl">
                      En esta sección, los editores del equipo deben formalizar y justificar las decisiones tomadas en las Tareas 1 a 4. Los datos básicos (como nombre del restaurante, logo, y listado de platos) se integrarán automáticamente en la vista de PDF final.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sección 2: Análisis del Entorno */}
                    <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
                      <h4 className="font-black text-zinc-800 text-sm border-b border-zinc-100 pb-2">2. Análisis del Entorno</h4>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Contexto y Justificación (Ubicación)</label>
                        <textarea
                          value={gastState.task5?.contextAndJustification || ''}
                          onChange={(e) => updateNestedField('task5', 'contextAndJustification', e.target.value)}
                          className="w-full text-xs font-semibold p-4 rounded-xl border border-zinc-200 bg-zinc-50 min-h-[100px] resize-y focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                          placeholder="¿Por qué se ha elegido este entorno geográfico y gastronómico?"
                          disabled={!gastState.modoEdicion}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Síntesis de Investigación Individual</label>
                        <textarea
                          value={gastState.task5?.researchSynthesis || ''}
                          onChange={(e) => updateNestedField('task5', 'researchSynthesis', e.target.value)}
                          className="w-full text-xs font-semibold p-4 rounded-xl border border-zinc-200 bg-zinc-50 min-h-[140px] resize-y focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                          placeholder="Resumen de los hallazgos más importantes de las micro-tareas de investigación..."
                          disabled={!gastState.modoEdicion}
                        />
                      </div>
                    </div>

                    {/* Sección 3: Conceptualización */}
                    <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
                      <h4 className="font-black text-zinc-800 text-sm border-b border-zinc-100 pb-2">3. Conceptualización</h4>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Objetivos del Restaurante</label>
                        <textarea
                          value={gastState.task5?.restaurantObjectives || ''}
                          onChange={(e) => updateNestedField('task5', 'restaurantObjectives', e.target.value)}
                          className="w-full text-xs font-semibold p-4 rounded-xl border border-zinc-200 bg-zinc-50 min-h-[100px] resize-y focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                          placeholder="Metas sostenibles y de negocio que persigue la apertura..."
                          disabled={!gastState.modoEdicion}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Propuesta de Valor y Diferenciación</label>
                        <textarea
                          value={gastState.task5?.valueProposition || ''}
                          onChange={(e) => updateNestedField('task5', 'valueProposition', e.target.value)}
                          className="w-full text-xs font-semibold p-4 rounded-xl border border-zinc-200 bg-zinc-50 min-h-[140px] resize-y focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                          placeholder="¿Por qué este restaurante es distinto a la competencia mapeada?"
                          disabled={!gastState.modoEdicion}
                        />
                      </div>
                    </div>

                    {/* Sección 4: Oferta Gastronómica */}
                    <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
                      <h4 className="font-black text-zinc-800 text-sm border-b border-zinc-100 pb-2">4. Oferta Gastronómica</h4>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Explicación de la carta y sostenibilidad</label>
                        <textarea
                          value={gastState.task5?.gastronomicExplanation || ''}
                          onChange={(e) => updateNestedField('task5', 'gastronomicExplanation', e.target.value)}
                          className="w-full text-xs font-semibold p-4 rounded-xl border border-zinc-200 bg-zinc-50 min-h-[200px] resize-y focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                          placeholder="Explicación de la carta diseñada, productos Km0 y justificación sostenible general (los platos específicos se inyectarán en el PDF automáticamente)..."
                          disabled={!gastState.modoEdicion}
                        />
                      </div>
                    </div>

                    {/* Sección 5: Desarrollo y Prototipo */}
                    <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
                      <h4 className="font-black text-zinc-800 text-sm border-b border-zinc-100 pb-2">5. Desarrollo y Prototipo</h4>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Metodología de trabajo</label>
                        <textarea
                          value={gastState.task5?.workMethodology || ''}
                          onChange={(e) => updateNestedField('task5', 'workMethodology', e.target.value)}
                          className="w-full text-xs font-semibold p-4 rounded-xl border border-zinc-200 bg-zinc-50 min-h-[100px] resize-y focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                          placeholder="Cómo se ha organizado el equipo de trabajo..."
                          disabled={!gastState.modoEdicion}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Planificación Temporal</label>
                        <textarea
                          value={gastState.task5?.timePlanning || ''}
                          onChange={(e) => updateNestedField('task5', 'timePlanning', e.target.value)}
                          className="w-full text-xs font-semibold p-4 rounded-xl border border-zinc-200 bg-zinc-50 min-h-[100px] resize-y focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                          placeholder="Explicación del desarrollo del prototipo visual y físico..."
                          disabled={!gastState.modoEdicion}
                        />
                      </div>
                    </div>

                    {/* Sección 6 y 7: Conclusiones y Bibliografía */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
                      <div className="space-y-4">
                        <h4 className="font-black text-zinc-800 text-sm border-b border-zinc-100 pb-2">6. Conclusiones y ODS</h4>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Relación con los ODS</label>
                          <textarea
                            value={gastState.task5?.odsRelationship || ''}
                            onChange={(e) => updateNestedField('task5', 'odsRelationship', e.target.value)}
                            className="w-full text-xs font-semibold p-4 rounded-xl border border-zinc-200 bg-zinc-50 min-h-[100px] resize-y focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                            placeholder="Justificación de cómo el proyecto impacta positivamente..."
                            disabled={!gastState.modoEdicion}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Valoración Final</label>
                          <textarea
                            value={gastState.task5?.finalValuation || ''}
                            onChange={(e) => updateNestedField('task5', 'finalValuation', e.target.value)}
                            className="w-full text-xs font-semibold p-4 rounded-xl border border-zinc-200 bg-zinc-50 min-h-[100px] resize-y focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                            placeholder="Reflexión del equipo sobre la viabilidad conceptual..."
                            disabled={!gastState.modoEdicion}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-black text-zinc-800 text-sm border-b border-zinc-100 pb-2">7. Bibliografía y Fuentes</h4>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Fuentes Consultadas</label>
                          <textarea
                            value={gastState.task5?.bibliography || ''}
                            onChange={(e) => updateNestedField('task5', 'bibliography', e.target.value)}
                            className="w-full text-xs font-semibold p-4 rounded-xl border border-zinc-200 bg-zinc-50 min-h-[250px] resize-y focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                            placeholder="Recopilación de fuentes, webs, artículos..."
                            disabled={!gastState.modoEdicion}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content: PDF */}
              {gastState.task5?.activeTab === 'pdf' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Documento Listo para Entregar</span>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      title="Recuerda activar 'Encabezados y pies de página' y 'A4' en el diálogo de impresión para ver la numeración."
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Imprimir / Descargar PDF
                    </button>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-sm p-12 md:p-16 shadow-lg max-w-4xl mx-auto print:max-w-none print:w-full print:border-none print:shadow-none print:p-0 font-serif" id="memoria-imprimible">
                    {renderIESHeader('Memoria Intermedia (Tarea 5)', 'Proyecto Gastronómico Sostenible')}
                    {/* PORTADA */}
                    <div className="min-h-[700px] flex flex-col items-center justify-center text-center space-y-12 border-b-2 border-zinc-900 pb-24 print:min-h-[220mm] print:border-none print:justify-center">
                      <div className="space-y-4">
                        <div className="w-24 h-24 bg-zinc-100 rounded-full mx-auto flex items-center justify-center border border-zinc-200 mb-6">
                          {gastState.decisionGrupal.logo ? (
                            <img src={gastState.decisionGrupal.logo} className="w-16 h-16 object-contain" alt="Logo" />
                          ) : (
                            <Leaf className="w-10 h-10 text-zinc-400" />
                          )}
                        </div>
                        <h3 className="text-sm font-black text-zinc-500 tracking-[0.2em] uppercase">Memoria Intermedia de Proyecto</h3>
                        <h1 className="text-5xl font-black text-zinc-900 tracking-tight uppercase leading-tight max-w-3xl">
                          {gastState.restaurantName || 'Arenal Ecocuisine'}
                        </h1>
                        <p className="text-xl font-bold text-zinc-600 italic mt-4">
                          Proyecto Gastronómico Integral Sostenible
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-12 text-left pt-12 border-t border-zinc-200 w-full max-w-xl">
                        <div>
                          <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Equipo</span>
                          <span className="text-sm font-bold text-zinc-800">{gastState.teamName || 'Los Cocedores del Arenal'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Zona Gastronómica</span>
                          <span className="text-sm font-bold text-zinc-800">
                            {GASTRONOMIC_ZONES.find(z => z.id === gastState.selectedZone)?.name || 'Zona Costa'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Público Objetivo</span>
                          <span className="text-sm font-bold text-zinc-800">{gastState.decisionGrupal.publicoObjetivo || 'Profesionales de 25-50 años'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Fecha</span>
                          <span className="text-sm font-bold text-zinc-800">{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-16 pt-16 print:break-before-page">
                      {/* 1. Identidad y Equipo */}
                      <section className="space-y-6">
                        <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">1. Identidad y Equipo</h2>
                        <div className="prose prose-sm prose-zinc max-w-none">
                          <p><strong>Restaurante:</strong> {gastState.restaurantName || 'Arenal Ecocuisine'}</p>
                          <p><strong>Ubicación Geográfica:</strong> {gastState.locationArea || 'Costa local'}</p>
                          <p><strong>Equipo de Trabajo:</strong> {gastState.teamName || 'Los Cocedores del Arenal'}</p>
                          <div className="mt-4 p-4 bg-zinc-50 border border-zinc-100 rounded-lg">
                            <p className="font-bold mb-2 text-sm uppercase tracking-wider text-zinc-500">Reparto de Roles Oficial</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {gastState.roles.projectManager && <li><strong>Coordinador:</strong> {allUsers.find(u => u.id === gastState.roles.projectManager)?.name || 'Asignado'}</li>}
                              {gastState.roles.fbDirector && <li><strong>Director de F&B:</strong> {allUsers.find(u => u.id === gastState.roles.fbDirector)?.name || 'Asignado'}</li>}
                              {gastState.roles.sustainabilityManager && <li><strong>Responsable de Sostenibilidad:</strong> {allUsers.find(u => u.id === gastState.roles.sustainabilityManager)?.name || 'Asignado'}</li>}
                              {gastState.roles.marketingDirector && <li><strong>Director de Marketing:</strong> {allUsers.find(u => u.id === gastState.roles.marketingDirector)?.name || 'Asignado'}</li>}
                              {gastState.roles.financialDirector && <li><strong>Director Financiero:</strong> {allUsers.find(u => u.id === gastState.roles.financialDirector)?.name || 'Asignado'}</li>}
                            </ul>
                          </div>
                        </div>
                      </section>

                      {/* 2. Análisis del Entorno */}
                      <section className="space-y-6 print:break-inside-avoid">
                        <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">2. Análisis del Entorno</h2>
                        <div className="space-y-4 prose prose-sm prose-zinc max-w-none">
                          <div>
                            <h3 className="text-lg font-bold text-zinc-800">2.1 Contexto y Justificación</h3>
                            <p className="whitespace-pre-wrap">{gastState.task5?.contextAndJustification || 'No se ha redactado este apartado.'}</p>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-zinc-800">2.2 Síntesis de Investigación</h3>
                            <p className="whitespace-pre-wrap">{gastState.task5?.researchSynthesis || 'No se ha redactado este apartado.'}</p>
                          </div>
                        </div>
                      </section>

                      {/* 3. Conceptualización */}
                      <section className="space-y-6 print:break-inside-avoid">
                        <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">3. Conceptualización</h2>
                        <div className="space-y-4 prose prose-sm prose-zinc max-w-none">
                          <div>
                            <h3 className="text-lg font-bold text-zinc-800">3.1 Objetivos del Restaurante</h3>
                            <p className="whitespace-pre-wrap">{gastState.task5?.restaurantObjectives || 'No se ha redactado este apartado.'}</p>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-zinc-800">3.2 Propuesta de Valor</h3>
                            <p className="whitespace-pre-wrap">{gastState.task5?.valueProposition || 'No se ha redactado este apartado.'}</p>
                          </div>
                        </div>
                      </section>

                      {/* 4. Oferta Gastronómica */}
                      <section className="space-y-6 print:break-before-page">
                        <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">4. Oferta Gastronómica</h2>
                        <div className="space-y-4 prose prose-sm prose-zinc max-w-none">
                          <p className="whitespace-pre-wrap">{gastState.task5?.gastronomicExplanation || 'Explicación general pendiente de redacción.'}</p>
                          
                          <h3 className="text-lg font-bold text-zinc-800 mt-6">4.1 Catálogo de Platos Seleccionados</h3>
                          {gastState.dishes && gastState.dishes.length > 0 ? (
                            <div className="space-y-4">
                              {gastState.dishes.map((dish: any, i: number) => (
                                <div key={dish.id} className="border border-zinc-200 p-4 rounded-lg bg-zinc-50 break-inside-avoid">
                                  <h4 className="font-bold text-zinc-900 uppercase text-sm mb-1">{dish.name} <span className="text-xs text-zinc-500 font-normal ml-2">({dish.type})</span></h4>
                                  <p className="text-xs text-zinc-600 mb-2">{dish.description}</p>
                                  <div className="text-xs">
                                    <p><strong>Justificación Sostenible:</strong> {dish.sustainabilityJustification || 'No indicada'}</p>
                                    <p><strong>Elaborado por:</strong> {allUsers.find(u => u.id === dish.userId)?.name || 'Anónimo'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-zinc-400 italic">No hay platos registrados en el sistema para inyectar.</p>
                          )}
                        </div>
                      </section>

                      {/* 5. Desarrollo y Prototipo */}
                      <section className="space-y-6 print:break-inside-avoid">
                        <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">5. Desarrollo y Prototipo</h2>
                        <div className="space-y-4 prose prose-sm prose-zinc max-w-none">
                          <div>
                            <h3 className="text-lg font-bold text-zinc-800">5.1 Metodología de Trabajo</h3>
                            <p className="whitespace-pre-wrap">{gastState.task5?.workMethodology || 'No se ha redactado este apartado.'}</p>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-zinc-800">5.2 Planificación Temporal</h3>
                            <p className="whitespace-pre-wrap">{gastState.task5?.timePlanning || 'No se ha redactado este apartado.'}</p>
                          </div>
                        </div>
                      </section>

                      {/* 6. Conclusiones y ODS */}
                      <section className="space-y-6 print:break-inside-avoid">
                        <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">6. Conclusiones y ODS</h2>
                        <div className="space-y-4 prose prose-sm prose-zinc max-w-none">
                          <div>
                            <h3 className="text-lg font-bold text-zinc-800">6.1 Relación con ODS</h3>
                            <p className="whitespace-pre-wrap">{gastState.task5?.odsRelationship || 'No se ha redactado este apartado.'}</p>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-zinc-800">6.2 Valoración Final</h3>
                            <p className="whitespace-pre-wrap">{gastState.task5?.finalValuation || 'No se ha redactado este apartado.'}</p>
                          </div>
                        </div>
                      </section>

                      {/* 7. Bibliografía */}
                      <section className="space-y-6 print:break-inside-avoid">
                        <h2 className="text-2xl font-black text-zinc-900 border-b-2 border-zinc-100 pb-2">7. Bibliografía y Fuentes</h2>
                        <div className="prose prose-sm prose-zinc max-w-none">
                          <p className="whitespace-pre-wrap">{gastState.task5?.bibliography || 'No se ha añadido bibliografía.'}</p>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: VIABILIDAD Y ESCANDALLOS */}
          {activeMenu === 'step-7' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-900">7. Viabilidad y Escandallos</h3>
                  <p className="text-[11px] text-zinc-400">Calcula el coste unitario, Food Cost y márgenes de rentabilidad de cada plato diseñado.</p>
                </div>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded">
                  Fase 3: Tareas
                </span>
              </div>

              {gastState.dishes.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs bg-zinc-50 rounded-xl border border-zinc-100">
                  <p>No hay platos creados. Vuelve a "Diseño de Carta" para añadir platos antes de calcular su viabilidad.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {gastState.dishes.map((dish: any) => {
                    const isAuthorOrPM = currentUser.id === dish.userId || currentUser.id === gastState.roles.projectManager;
                    const canEdit = gastState.modoEdicion && isAuthorOrPM;

                    // Cálculos
                    const totalFoodCost = dish.ingredients.reduce((acc: number, ing: any) => {
                      const unitDef = INGREDIENT_UNITS.find(u => u.id === (ing.unit || 'g')) || INGREDIENT_UNITS[1];
                      const priceUnitDef = INGREDIENT_UNITS.find(u => u.id === (ing.priceUnit || unitDef.base)) || INGREDIENT_UNITS.find(u => u.id === unitDef.base);
                      const weight = ing.grossWeight || ing.netWeight || 0;
                      const weightInBase = weight * unitDef.factor;
                      const pricePerBase = (ing.unitPrice || 0) / (priceUnitDef?.factor || 1);
                      return acc + (weightInBase * pricePerBase);
                    }, 0);
                    const foodCostPorRacion = dish.portions > 0 ? totalFoodCost / dish.portions : 0;
                    const pvp = dish.pvp || 0;
                    const margenBruto = pvp > 0 ? pvp - foodCostPorRacion : 0;
                    const foodCostPercent = pvp > 0 ? (foodCostPorRacion / pvp) * 100 : 0;

                    const isRentable = foodCostPercent >= 25 && foodCostPercent <= 35;

                    return (
                      <div key={dish.id} className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex flex-wrap justify-between items-center gap-4">
                          <div>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{dish.type}</span>
                            <h4 className="text-base font-black text-zinc-900">{dish.name}</h4>
                            <p className="text-xs text-zinc-500">Para {dish.portions} raciones</p>
                          </div>
                          {!canEdit && (
                            <span className="px-2 py-1 bg-zinc-200 text-zinc-600 text-[9px] font-black uppercase rounded">Modo Lectura</span>
                          )}
                        </div>

                        <div className="p-4 space-y-6">
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="border-b border-zinc-200 text-[10px] uppercase font-black text-zinc-500">
                                  <th className="pb-2">Ingrediente</th>
                                  <th className="pb-2 text-right">Cant. Receta</th>
                                  <th className="pb-2 text-right">Peso Bruto</th>
                                  <th className="pb-2 text-right">Peso Neto</th>
                                  <th className="pb-2 text-right">Merma %</th>
                                  <th className="pb-2 text-right">Precio Unit. (€)</th>
                                  <th className="pb-2 text-right">Coste Total (€)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-100">
                                {dish.ingredients.map((ing: any, idx: number) => {
                                  const unitDef = INGREDIENT_UNITS.find(u => u.id === (ing.unit || 'g')) || INGREDIENT_UNITS[1];
                                  const priceUnitDef = INGREDIENT_UNITS.find(u => u.id === (ing.priceUnit || unitDef.base)) || INGREDIENT_UNITS.find(u => u.id === unitDef.base);
                                  const weight = ing.grossWeight || ing.netWeight || 0;
                                  const weightInBase = weight * unitDef.factor;
                                  const pricePerBase = (ing.unitPrice || 0) / (priceUnitDef?.factor || 1);
                                  const costeTotal = weightInBase * pricePerBase;
                                  const gross = ing.grossWeight || 0;
                                  const net = ing.netWeight || 0;
                                  const merma = gross > 0 ? ((gross - net) / gross) * 100 : 0;
                                  return (
                                    <tr key={idx}>
                                      <td className="py-3 font-semibold text-zinc-800">{ing.name || 'Sin nombre'}</td>
                                      <td className="py-3 text-right text-zinc-600">{ing.quantity} {ing.unit}</td>
                                      <td className="py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <input
                                            type="number"
                                            value={ing.grossWeight || ''}
                                            onChange={(e) => {
                                              const newIngs = [...dish.ingredients];
                                              newIngs[idx] = { ...ing, grossWeight: Number(e.target.value) };
                                              const updatedDishes = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, ingredients: newIngs } : d);
                                              updateField('dishes', updatedDishes);
                                            }}
                                            disabled={!canEdit}
                                            className="w-16 p-1.5 border border-zinc-200 rounded text-right focus:outline-none focus:border-indigo-500 disabled:bg-zinc-50 text-[11px]"
                                            placeholder="Bruto"
                                          />
                                        </div>
                                      </td>
                                      <td className="py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <input
                                            type="number"
                                            value={ing.netWeight || ''}
                                            onChange={(e) => {
                                              const newIngs = [...dish.ingredients];
                                              newIngs[idx] = { ...ing, netWeight: Number(e.target.value) };
                                              const updatedDishes = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, ingredients: newIngs } : d);
                                              updateField('dishes', updatedDishes);
                                            }}
                                            disabled={!canEdit}
                                            className="w-16 p-1.5 border border-zinc-200 rounded text-right focus:outline-none focus:border-indigo-500 disabled:bg-zinc-50 text-[11px]"
                                            placeholder="Neto"
                                          />
                                          <span className="text-[9px] text-zinc-400 w-4 text-left">{ing.unit}</span>
                                        </div>
                                      </td>
                                      <td className="py-3 text-right font-bold text-zinc-500">
                                        {merma > 0 ? merma.toFixed(1) + '%' : '-'}
                                      </td>
                                      <td className="py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <input
                                            type="number"
                                            value={ing.unitPrice || ''}
                                            onChange={(e) => {
                                              const newIngs = [...dish.ingredients];
                                              newIngs[idx] = { ...ing, unitPrice: Number(e.target.value) };
                                              const updatedDishes = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, ingredients: newIngs } : d);
                                              updateField('dishes', updatedDishes);
                                            }}
                                            disabled={!canEdit}
                                            className="w-16 p-1.5 border border-zinc-200 rounded-l text-right focus:outline-none focus:border-indigo-500 disabled:bg-zinc-50 text-[11px]"
                                            placeholder="€"
                                          />
                                          <select
                                            value={ing.priceUnit || (INGREDIENT_UNITS.find(u => u.id === (ing.unit || 'g'))?.base || 'kg')}
                                            onChange={(e) => {
                                              const newIngs = [...dish.ingredients];
                                              newIngs[idx] = { ...ing, priceUnit: e.target.value };
                                              const updatedDishes = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, ingredients: newIngs } : d);
                                              updateField('dishes', updatedDishes);
                                            }}
                                            disabled={!canEdit}
                                            className="p-1.5 border border-l-0 border-zinc-200 rounded-r bg-zinc-50 focus:outline-none focus:border-indigo-500 disabled:bg-zinc-100 text-[10px] text-zinc-500"
                                          >
                                            {INGREDIENT_UNITS.filter(u => u.type === (INGREDIENT_UNITS.find(u2 => u2.id === (ing.unit || 'g'))?.type || 'mass')).map(u => (
                                              <option key={u.id} value={u.id}>€/{u.id}</option>
                                            ))}
                                          </select>
                                        </div>
                                      </td>
                                      <td className="py-3 text-right font-bold text-zinc-900">
                                        {costeTotal.toFixed(2)} €
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot className="border-t-2 border-zinc-800">
                                <tr>
                                  <td colSpan={6} className="py-3 text-right font-black text-zinc-900">FOOD COST TOTAL (Receta):</td>
                                  <td className="py-3 text-right font-black text-zinc-900">{totalFoodCost.toFixed(2)} €</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-900 rounded-xl p-4 text-white">
                            <div className="space-y-1">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase block">Coste por ración</span>
                              <span className="text-xl font-black text-indigo-400">{foodCostPorRacion.toFixed(2)} €</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-400 font-bold uppercase block">PVT (30% FC)</span>
                              </div>
                              <span className="text-xl font-black text-zinc-300">{(foodCostPorRacion / 0.3).toFixed(2)} €</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase block">PVP (Tu Precio)</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={dish.pvp || ''}
                                  onChange={(e) => {
                                    const updatedDishes = gastState.dishes.map((d: any) => d.id === dish.id ? { ...d, pvp: Number(e.target.value) } : d);
                                    updateField('dishes', updatedDishes);
                                  }}
                                  disabled={!canEdit}
                                  className="w-24 p-1 bg-zinc-800 border border-zinc-700 rounded text-right focus:outline-none focus:border-indigo-500 text-base font-bold disabled:opacity-50"
                                  placeholder="0.00"
                                />
                                <span>€</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase block">Margen Bruto</span>
                              <span className={`text-xl font-black ${margenBruto > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {margenBruto.toFixed(2)} €
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase block">Food Cost %</span>
                              <span className={`text-xl font-black ${isRentable ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {pvp > 0 ? foodCostPercent.toFixed(1) : '0.0'} %
                              </span>
                            </div>
                          </div>

                          {pvp > 0 && !isRentable && (
                            <div className="p-3 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200">
                              ⚠️ <strong>Revisar Escandallo:</strong> El Food Cost debería mantenerse preferiblemente entre el 25% y el 35% para asegurar la viabilidad económica del restaurante.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Financial Inputs (Punto de Equilibrio) */}
              <div className="border-t-2 border-zinc-100 pt-8 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-zinc-700 uppercase tracking-widest block">Costes Fijos & Parámetros Globales</span>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-600 block">Gastos Fijos Mensuales (€)</label>
                    <input
                      type="number"
                      value={gastState.viability.fixedCosts || ''}
                      disabled={!gastState.modoEdicion}
                      onChange={(e) => updateNestedField('viability', 'fixedCosts', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 disabled:bg-zinc-100"
                    />
                    <span className="text-[10px] text-zinc-400">Suma de: Alquiler, nóminas de cocina y sala, seguros e impuestos.</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-600 block">Aprovisionamientos y Variable (%)</label>
                    <input
                      type="number"
                      value={gastState.viability.variableCostPercent || ''}
                      disabled={!gastState.modoEdicion}
                      onChange={(e) => updateNestedField('viability', 'variableCostPercent', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 disabled:bg-zinc-100"
                    />
                    <span className="text-[10px] text-zinc-400">Sugerido un 28-32% en hostelería sostenible.</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-600 block">Ticket Medio Estimado (€)</label>
                    <input
                      type="number"
                      value={gastState.viability.averageTicket || ''}
                      disabled={!gastState.modoEdicion}
                      onChange={(e) => updateNestedField('viability', 'averageTicket', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 disabled:bg-zinc-100"
                    />
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-150 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-zinc-700 uppercase tracking-widest block">Resultados Financieros Automáticos</span>
                    
                    {(() => {
                      const fc = gastState.viability.fixedCosts || 0;
                      const vcPercent = (gastState.viability.variableCostPercent || 0) / 100;
                      const averageTicket = gastState.viability.averageTicket || 1;
                      
                      // Margen sobre ventas
                      const marginRatio = 1 - vcPercent;
                      // Ingreso de equilibrio (ventas necesarias en €)
                      const breakEvenSales = marginRatio > 0 ? fc / marginRatio : 0;
                      // Clientes necesarios al mes
                      const breakEvenCustomers = averageTicket > 0 ? Math.ceil(breakEvenSales / averageTicket) : 0;
                      
                      return (
                        <div className="space-y-3 font-semibold text-xs text-zinc-600">
                          <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-zinc-100 shadow-sm">
                            <span>Ingresos mínimos de Equilibrio:</span>
                            <span className="font-bold text-zinc-900 font-mono">{breakEvenSales.toLocaleString('es-ES', { maximumFractionDigits: 2 })} €</span>
                          </div>

                          <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-zinc-100 shadow-sm">
                            <span>Clientes mínimos requeridos / mes:</span>
                            <span className="font-bold text-emerald-700 font-mono">{breakEvenCustomers} comensales</span>
                          </div>

                          <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-zinc-100 shadow-sm">
                            <span>Margen Neto por Comensal (€):</span>
                            <span className="font-bold text-zinc-800 font-mono">{(averageTicket * marginRatio).toFixed(2)} €</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 leading-normal font-medium">
                    🌿 <strong>Nota de Sostenibilidad:</strong> Un ticket medio equilibrado y un control estricto de mermas asegura la viabilidad económica sin comprometer la retribución justa de los productores de Km 0.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: PRODUCCIÓN FINAL */}
          {activeMenu === 'step-8' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900">8. Producción Final (Defensa y Misiones)</h3>
                <p className="text-[11px] text-zinc-400">Pulido final del proyecto y preparación de la presentación física y digital.</p>
              </div>

              {/* Subtabs for Step 8 */}
              <div className="flex bg-zinc-100 p-1 rounded-xl gap-1">
                {['instrucciones', 'misiones', 'supervision'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => updateNestedField('task8', 'activeTab', tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all capitalize ${
                      gastState.task8?.activeTab === tab || (!gastState.task8?.activeTab && tab === 'instrucciones')
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    {tab === 'instrucciones' ? '1. Requisitos' : tab === 'misiones' ? '2. Misiones' : '3. Supervisión'}
                  </button>
                ))}
              </div>

              {/* Tab 1: Instrucciones */}
              {(gastState.task8?.activeTab === 'instrucciones' || !gastState.task8?.activeTab) && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-indigo-900 uppercase flex items-center gap-2">
                        <Rocket className="h-4 w-4" />
                        🚀 Requisitos y Entregables
                      </h4>
                      <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
                        Para que la presentación sea considerada válida, cada alumno deberá cumplir con lo siguiente:
                      </p>
                      <ul className="text-[11px] text-indigo-800 space-y-1.5 list-disc list-inside font-medium ml-1">
                        <li><strong>Soporte Visual:</strong> Presentación (PowerPoint, Canva, Genially, etc.) que sintetice los puntos clave del proyecto.</li>
                        <li><strong>Documentación Final:</strong> Asegurarse de que el documento esté subido a la plataforma y traer una impresión física el mismo día (si hay tribunal, traer 2 copias).</li>
                        <li><strong>Demo/Prototipo:</strong> Producto tangible o software listo para demostración en vivo y carta física.</li>
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-indigo-100 space-y-1.5">
                      <h4 className="text-xs font-black text-indigo-900 uppercase flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        💡 Recomendaciones
                      </h4>
                      <p className="text-[11px] text-indigo-800 font-bold">
                        Puntualidad: Se ruega estar presentes 10 minutos antes del inicio de la sesión.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-600 block">Mi Enlace de Presentación Individual</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://canva.com/..."
                          value={gastState.task8?.presentations?.find((p: any) => p.studentId === currentUser.id)?.url || ''}
                          onChange={(e) => {
                            const currentPres = [...(gastState.task8?.presentations || [])];
                            const idx = currentPres.findIndex((p: any) => p.studentId === currentUser.id);
                            if (idx >= 0) {
                              currentPres[idx].url = e.target.value;
                            } else {
                              currentPres.push({ studentId: currentUser.id, url: e.target.value });
                            }
                            updateNestedField('task8', 'presentations', currentPres);
                          }}
                          disabled={!gastState.modoEdicion}
                          className="flex-1 p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 focus:outline-none disabled:bg-zinc-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-600 block">Foto del Prototipo Físico (Enlace de Drive, Imgur, etc.)</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://drive.google.com/..."
                          value={gastState.task8?.prototypePhotoUrl || ''}
                          onChange={(e) => updateNestedField('task8', 'prototypePhotoUrl', e.target.value)}
                          disabled={!gastState.modoEdicion}
                          className="flex-1 p-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:border-indigo-300 focus:outline-none disabled:bg-zinc-50"
                        />
                      </div>
                      {gastState.task8?.prototypePhotoUrl && (
                        <div className="mt-2 text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                          <CheckSquare className="h-3 w-3" /> Foto vinculada correctamente.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}


              {/* Tab 2: Misiones */}
              {gastState.task8?.activeTab === 'misiones' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 leading-relaxed font-medium">
                    <p><strong>Reparto de Roles Finales:</strong> El coordinador del equipo debe repartir las misiones de producción. (Solo el coordinador debería hacer esto, pero en modo edición todos pueden probarlo).</p>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li><strong>Diseñadores:</strong> Diseño digital de la carta (Canva, etc.).</li>
                      <li><strong>Artesanos:</strong> Elaboración material de la maqueta/prototipo físico.</li>
                      <li><strong>Editores:</strong> Dar formato y repasar todo.</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Diseñadores */}
                    <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                      <h4 className="text-sm font-bold text-zinc-800">🎨 Diseñadores</h4>
                      <div className="space-y-2">
                        {allUsers.map(user => {
                          const isAssigned = gastState.task8?.missions?.designers?.includes(user.id);
                          return (
                            <label key={user.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-semibold border ${isAssigned ? 'bg-white border-indigo-200 text-indigo-700' : 'border-transparent text-zinc-600 hover:bg-zinc-100'}`}>
                              <input
                                type="checkbox"
                                checked={isAssigned || false}
                                disabled={!gastState.modoEdicion}
                                onChange={(e) => {
                                  const current = [...(gastState.task8?.missions?.designers || [])];
                                  if (e.target.checked) current.push(user.id);
                                  else current.splice(current.indexOf(user.id), 1);
                                  updateNestedField('task8', 'missions', { ...gastState.task8.missions, designers: current });
                                }}
                                className="rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
                              />
                              {user.name}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Artesanos */}
                    <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                      <h4 className="text-sm font-bold text-zinc-800">🛠️ Artesanos</h4>
                      <div className="space-y-2">
                        {allUsers.map(user => {
                          const isAssigned = gastState.task8?.missions?.artisans?.includes(user.id);
                          return (
                            <label key={user.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-semibold border ${isAssigned ? 'bg-white border-orange-200 text-orange-700' : 'border-transparent text-zinc-600 hover:bg-zinc-100'}`}>
                              <input
                                type="checkbox"
                                checked={isAssigned || false}
                                disabled={!gastState.modoEdicion}
                                onChange={(e) => {
                                  const current = [...(gastState.task8?.missions?.artisans || [])];
                                  if (e.target.checked) current.push(user.id);
                                  else current.splice(current.indexOf(user.id), 1);
                                  updateNestedField('task8', 'missions', { ...gastState.task8.missions, artisans: current });
                                }}
                                className="rounded text-orange-600 focus:ring-orange-500 border-zinc-300"
                              />
                              {user.name}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Editores */}
                    <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                      <h4 className="text-sm font-bold text-zinc-800">📝 Editores</h4>
                      <div className="space-y-2">
                        {allUsers.map(user => {
                          const isAssigned = gastState.task8?.missions?.editors?.includes(user.id);
                          return (
                            <label key={user.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-semibold border ${isAssigned ? 'bg-white border-emerald-200 text-emerald-700' : 'border-transparent text-zinc-600 hover:bg-zinc-100'}`}>
                              <input
                                type="checkbox"
                                checked={isAssigned || false}
                                disabled={!gastState.modoEdicion}
                                onChange={(e) => {
                                  const current = [...(gastState.task8?.missions?.editors || [])];
                                  if (e.target.checked) current.push(user.id);
                                  else current.splice(current.indexOf(user.id), 1);
                                  updateNestedField('task8', 'missions', { ...gastState.task8.missions, editors: current });
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300"
                              />
                              {user.name}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Supervisión */}
              {gastState.task8?.activeTab === 'supervision' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase font-black text-zinc-500">
                          <th className="p-3">Alumno</th>
                          <th className="p-3">Misiones Asignadas</th>
                          <th className="p-3 text-center">Enlace Defensa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {allUsers.map(user => {
                          const missions = [];
                          if (gastState.roles.projectManager === user.id) missions.push('Coordinador');
                          if (gastState.task8?.missions?.designers?.includes(user.id)) missions.push('Diseñador');
                          if (gastState.task8?.missions?.artisans?.includes(user.id)) missions.push('Artesano');
                          if (gastState.task8?.missions?.editors?.includes(user.id)) missions.push('Editor');
                          
                          const presentationUrl = gastState.task8?.presentations?.find((p: any) => p.studentId === user.id)?.url;

                          return (
                            <tr key={user.id} className="text-xs font-semibold text-zinc-800">
                              <td className="p-3">{user.name}</td>
                              <td className="p-3">
                                {missions.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {missions.map(m => (
                                      <span key={m} className={`px-2 py-0.5 rounded-full text-[10px] ${
                                        m === 'Coordinador' ? 'bg-amber-100 text-amber-700' :
                                        m === 'Diseñador' ? 'bg-indigo-100 text-indigo-700' :
                                        m === 'Artesano' ? 'bg-orange-100 text-orange-700' :
                                        'bg-emerald-100 text-emerald-700'
                                      }`}>
                                        {m}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-zinc-400 italic">Sin misión</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {presentationUrl ? (
                                  <a href={presentationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                    <FileText className="h-3 w-3" /> Abrir
                                  </a>
                                ) : (
                                  <span className="text-red-400 text-[10px] uppercase font-bold">Falta</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                    <div>
                      <h4 className="text-xs font-black text-zinc-800">Evidencia de Carta Física</h4>
                      <p className="text-[10px] text-zinc-500">¿Se ha subido la foto del prototipo de equipo?</p>
                    </div>
                    {gastState.task8?.prototypePhotoUrl ? (
                      <a href={gastState.task8.prototypePhotoUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" /> Ver Foto
                      </a>
                    ) : (
                      <span className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-black">
                        No subida
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 9: COEVALUACIÓN */}
          {activeMenu === 'step-9' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <Scale className="h-4 w-4 text-indigo-600" />
                    9. Coevaluación Confidencial (Tutoría)
                  </h3>
                  <p className="text-[11px] text-zinc-400">Evalúa el desempeño de tus compañeros. Estos datos son privados para el profesor.</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl text-right shrink-0">
                  <span className="text-[8px] text-indigo-400 font-extrabold uppercase block text-center">Impacto Máximo</span>
                  <span className="text-xs font-black text-indigo-700 font-mono text-center block">+/- {maxCoevaluationImpact.toFixed(1)}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 leading-relaxed font-medium">
                <p><strong>🔒 Confidencialidad:</strong> Tus compañeros no verán estas notas. Se utilizan para el ajuste de nota final por el tutor.</p>
              </div>

              <div className="space-y-8">
                {allUsers.filter(u => u.id !== currentUser.id && u.classroom === currentUser.classroom && u.role === 'alumno').map((teammate) => {
                  const review = gastState.task9?.reviews?.[currentUser.id]?.[teammate.id] || {
                    participacion: 0,
                    responsabilidad: 0,
                    colaboracion: 0,
                    contribucion: 0,
                    comment: ''
                  };

                  const updateReview = (field: string, value: any) => {
                    const currentReviews = { ...(gastState.task9?.reviews || {}) };
                    if (!currentReviews[currentUser.id]) currentReviews[currentUser.id] = {};
                    currentReviews[currentUser.id][teammate.id] = { ...review, [field]: value };
                    updateField('task9', { ...gastState.task9, reviews: currentReviews });
                  };

                  return (
                    <div key={teammate.id} className="space-y-6 p-6 border border-zinc-200 rounded-2xl bg-zinc-50/30">
                      <div className="flex items-center gap-3">
                        <img 
                          src={teammate.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(teammate.name)}`} 
                          className="w-10 h-10 rounded-full border border-zinc-200"
                          alt={teammate.name}
                        />
                        <div>
                          <h4 className="text-sm font-black text-zinc-900">{teammate.name}</h4>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{teammate.email}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          {[
                            { id: 'participacion', label: 'Participación', icon: '🙋‍♂️' },
                            { id: 'responsabilidad', label: 'Responsabilidad', icon: '⚖️' },
                            { id: 'colaboracion', label: 'Colaboración', icon: '🤝' },
                            { id: 'contribucion', label: 'Contribución', icon: '💎' }
                          ].map(cat => (
                            <div key={cat.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-zinc-600 flex items-center gap-1.5">
                                  <span>{cat.icon}</span>
                                  <span>{cat.label}</span>
                                </label>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                  (review[cat.id as keyof typeof review] as number) > 0 ? 'bg-emerald-100 text-emerald-700' : 
                                  (review[cat.id as keyof typeof review] as number) < 0 ? 'bg-rose-100 text-rose-700' : 'bg-zinc-100 text-zinc-600'
                                }`}>
                                  {(review[cat.id as keyof typeof review] as number) > 0 ? '+' : ''}{(review[cat.id as keyof typeof review] as number).toFixed(1)}
                                </span>
                              </div>
                              <input 
                                type="range" 
                                min="-1" 
                                max="1" 
                                step="0.1" 
                                value={review[cat.id as keyof typeof review] as number}
                                onChange={(e) => updateReview(cat.id, Number(e.target.value))}
                                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2 flex flex-col">
                          <label className="text-[11px] font-bold text-zinc-600">Justificación del Desempeño</label>
                          <textarea 
                            className="flex-1 w-full p-3 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 focus:border-indigo-300 focus:outline-none resize-none bg-white min-h-[120px]"
                            placeholder="Comenta brevemente el trabajo de tu compañero..."
                            value={review.comment}
                            onChange={(e) => updateReview('comment', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {allUsers.filter(u => u.id !== currentUser.id && u.classroom === currentUser.classroom && u.role === 'alumno').length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-zinc-100 rounded-3xl space-y-3">
                    <Users className="h-8 w-8 text-zinc-200 mx-auto" />
                    <p className="text-xs text-zinc-400 font-bold">No se han encontrado compañeros de equipo para evaluar en esta aula.</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-center">
                <p className="text-[11px] text-zinc-500 font-bold">Para generar el informe final para el profesor, ve a la <span className="text-indigo-600">Fase 3: 6. Informe Coevaluación</span>.</p>
              </div>
            </div>
          )}


          {/* STEP 10: MEMORIA FINAL (CHECKLIST) */}
          {activeMenu === 'step-10' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 space-y-10 animate-in fade-in duration-500">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2.5">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Estado de la Memoria Final del Proyecto
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mt-1">Visor unificado de progreso. Los datos se actualizan en tiempo real desde las otras pestañas.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest block">Tarea 9 Oficial</span>
                  <span className="text-xs font-bold text-zinc-400">Revisión Académica</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chapter List */}
                <div className="space-y-4">
                  {[
                    { 
                      id: 'cap1', 
                      title: '1. El Concepto', 
                      desc: 'Identidad, Roles, Ubicación y Justificación.',
                      isComplete: gastState.restaurantName && gastState.conceptDescription && gastState.roles?.chef && gastState.locationArea,
                      target: 'panel-principal'
                    },
                    { 
                      id: 'cap2', 
                      title: '2. La Investigación', 
                      desc: 'Análisis de mercado, micro-tareas y competencia.',
                      isComplete: gastState.marketStudy && gastState.locationArea,
                      target: 'step-3'
                    },
                    { 
                      id: 'cap3', 
                      title: '3. Nuestra Carta', 
                      desc: 'Justificación Km0 y oferta gastronómica.',
                      isComplete: gastState.menuPresentation && gastState.task4?.isComplete,
                      target: 'step-4'
                    },
                    { 
                      id: 'cap4', 
                      title: '4. Fichas Técnicas', 
                      desc: 'Recetario completo y control de alérgenos.',
                      isComplete: gastState.recetas?.length > 0,
                      target: 'step-4'
                    },
                    { 
                      id: 'cap5', 
                      title: '5. Producción Final', 
                      desc: 'Identidad visual, cartas físicas y digitales.',
                      isComplete: gastState.task8?.presentationUrl || gastState.task8?.prototypeUrl,
                      target: 'step-8'
                    },
                    { 
                      id: 'cap6', 
                      title: '6. Viabilidad Económica', 
                      desc: 'Escandallos consolidados y rentabilidad.',
                      isComplete: gastState.escandallos?.length > 0,
                      target: 'step-4'
                    }
                  ].map((cap, i) => (
                    <div 
                      key={cap.id} 
                      className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                        cap.isComplete 
                          ? 'bg-emerald-50/30 border-emerald-100' 
                          : 'bg-zinc-50 border-zinc-150'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${
                        cap.isComplete ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500'
                      }`}>
                        {cap.isComplete ? '✓' : i + 1}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex justify-between items-center">
                          <h4 className={`text-xs font-black uppercase tracking-tight ${cap.isComplete ? 'text-emerald-700' : 'text-zinc-800'}`}>
                            {cap.title}
                          </h4>
                          <button 
                            onClick={() => setActiveMenu(cap.target)}
                            className="text-[9px] font-black text-indigo-500 hover:text-indigo-700 uppercase"
                          >
                            Ir a editar →
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">{cap.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Summary Info */}
                <div className="space-y-6">
                  <div className="bg-indigo-600 rounded-2xl p-6 text-white space-y-4 shadow-xl shadow-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500 rounded-lg">
                        <Rocket className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-black uppercase">Próximo Paso: Defensa</h4>
                    </div>
                    <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                      Este visor es únicamente para control de calidad. Cuando veas todos los capítulos marcados como completados, dirígete a la pestaña de <strong>Fase 3: 7. Memoria Final</strong> para generar el documento oficial.
                    </p>
                    <div className="pt-2">
                      <button 
                        onClick={() => setActiveMenu('step-17')}
                        className="w-full bg-white text-indigo-600 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-50 transition-colors shadow-sm"
                      >
                        Ir al Generador de Informe
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      Recomendaciones Técnicas
                    </h4>
                    <ul className="space-y-3">
                      {[
                        'Revisar ortografía en todas las descripciones.',
                        'Verificar que los enlaces de Tarea 8 son públicos.',
                        'Asegurar que todas las recetas tienen sus alérgenos marcados.',
                        'Confirmar que el Food Cost es rentable en los escandallos.'
                      ].map((rec, i) => (
                        <li key={i} className="flex gap-2.5 text-[11px] text-zinc-300 font-medium leading-relaxed">
                          <span className="text-zinc-600 font-black">{i + 1}.</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 17: MEMORIA FINAL (GENERATOR) */}
          {activeMenu === 'step-17' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-8 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-indigo-600" />
                      7. Generación de Memoria Final del Proyecto
                    </h3>
                    <p className="text-[11px] text-zinc-400">Consolidación definitiva de todo el curso académico en un único documento.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {renderDeliveryStatus('step-17')}
                    {renderGradeBadge('step-17')}
                  </div>
                </div>
                <div className="px-3 py-1 bg-amber-50 border border-amber-100 rounded-lg shrink-0">
                  <span className="text-[10px] font-black text-amber-700">MODO EXPORTACIÓN</span>
                </div>
              </div>

              <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-6 space-y-6 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <FileText className="h-8 w-8 text-zinc-300" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-zinc-900">¿Todo listo para el tribunal?</h4>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                    Al generar este informe, el sistema agrupará vuestro progreso en los 6 capítulos académicos. Asegúrate de que todos los miembros del equipo han completado sus partes antes de imprimir.
                  </p>
                </div>

                {/* Requisitos y Entregables Box */}
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-6 text-left space-y-6 shadow-sm">
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-indigo-900 uppercase flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-indigo-600" />
                      🚀 Requisitos y Entregables
                    </h4>
                    <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                      Para que la presentación sea considerada válida, cada alumno deberá cumplir con lo siguiente:
                    </p>
                    <ul className="text-[11px] text-indigo-800 space-y-2.5 font-medium ml-1">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span><strong>Soporte Visual:</strong> Presentación (PowerPoint, Canva, Genially, etc.) que sintetice los puntos clave del proyecto.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span><strong>Documentación Final:</strong> Asegurarse de que el documento esté subido a la plataforma y traer una impresión física el mismo día (si hay tribunal, traer 2 copias).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span><strong>Demo/Prototipo:</strong> Producto tangible o software listo para demostración en vivo y carta física.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-indigo-100/50">
                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-indigo-600 mt-0.5" />
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-black text-indigo-900 uppercase">💡 Recomendaciones</h5>
                        <p className="text-[11px] text-indigo-800 font-medium italic">
                          Puntualidad: Se ruega estar presentes 10 minutos antes del inicio de la sesión.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => {
                      setShowDocType('memoria-final');
                      triggerToast('📚 Compilando memoria final oficial del proyecto...');
                    }}
                    className="flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-4 rounded-2xl text-xs font-black transition-all shadow-xl active:scale-95 mx-auto"
                  >
                    <Printer className="h-5 w-5" />
                    Generar Memoria Final (PDF Profesional)
                  </button>
                </div>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 space-y-4">
                <h4 className="text-xs font-black text-indigo-900 uppercase flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Optimización Automática para PDF
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-600 uppercase block">Saltos de Página</span>
                    <p className="text-[10px] text-indigo-800 font-medium">Cada capítulo comienza en una hoja limpia.</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-600 uppercase block">Identidad Visual</span>
                    <p className="text-[10px] text-indigo-800 font-medium">Portada A4 con logo del IES y nombres del equipo.</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-600 uppercase block">Smart Layout</span>
                    <p className="text-[10px] text-indigo-800 font-medium">Las tablas y fichas se agrupan para evitar cortes.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* DOCUMENT PREVIEW OVERLAY */}
      <AnimatePresence>
        {showDocType !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto print:p-0 print:bg-white"
          >
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none">
              {/* Header UI */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-white print:hidden">
                <button 
                  onClick={() => setShowDocType('none')}
                  className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al Simulador
                </button>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
                    title="Recuerda activar 'Encabezados y pies de página' y 'A4' en el diálogo de impresión para ver la numeración."
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir / Guardar PDF
                  </button>
                  <button 
                    onClick={() => setShowDocType('none')}
                    className="p-2 text-zinc-400 hover:text-zinc-900"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* PDF CONTENT AREA */}
              <div className="flex-1 overflow-y-auto p-12 bg-zinc-50 print:bg-white print:p-0">
                <div className="bg-white mx-auto shadow-lg p-[20mm] w-[210mm] min-h-[297mm] print:shadow-none print:w-full print:p-0 print:m-0">
                  
                  {/* Cabecera Oficial */}
                  {renderIESHeader(
                    'Manager Pro Sostenible',
                    showDocType === 'tarea1' ? 'Acta de Constitución del Proyecto' : 
                    showDocType === 'tarea2' ? 'Tarea 2: Informe de Análisis e Investigación' :
                    showDocType === 'coevaluacion' ? 'Informe Confidencial de Coevaluación' :
                    showDocType === 'memoria-final' ? 'Memoria Final del Proyecto Gastronómico' :
                    'Tarea 3: Dossier Gastronómico y Diseño de Carta'
                  )}

                  {showDocType === 'memoria-final' && (
                    <div className="space-y-12 animate-in fade-in duration-500">
                      {/* CHAPTER 1: EL CONCEPTO */}
                      <section className="space-y-6 break-after-page">
                        <div className="flex items-center gap-3 border-b-2 border-zinc-900 pb-3">
                          <span className="text-2xl font-black text-zinc-900">01.</span>
                          <h4 className="text-xl font-black uppercase text-zinc-900">El Concepto del Restaurante</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Nombre Comercial</span>
                              <p className="text-lg font-black text-zinc-800">{gastState.restaurantName || 'Sin definir'}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Justificación Conceptual</span>
                              <p className="text-xs text-zinc-600 leading-relaxed font-medium bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                {gastState.conceptDescription || 'Sin descripción.'}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Equipo de Gestión</span>
                            <div className="space-y-2">
                              {Object.entries(gastState.roles || {}).map(([role, name]) => (
                                <div key={role} className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                  <span className="text-[10px] font-black text-zinc-400 uppercase">{role}</span>
                                  <span className="text-xs font-bold text-zinc-800">{name as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* CHAPTER 2: INVESTIGACIÓN */}
                      <section className="space-y-6 break-after-page">
                        <div className="flex items-center gap-3 border-b-2 border-zinc-900 pb-3">
                          <span className="text-2xl font-black text-zinc-900">02.</span>
                          <h4 className="text-xl font-black uppercase text-zinc-900">Análisis e Investigación</h4>
                        </div>
                        <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
                          <div>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Zona Gastronómica Seleccionada</span>
                            <p className="text-sm font-bold text-zinc-800">{gastState.locationArea || 'No especificada'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Estudio de Mercado y Demanda</span>
                            <p className="text-xs text-zinc-600 leading-relaxed font-medium">{gastState.marketStudy || 'Sin datos.'}</p>
                          </div>
                        </div>
                      </section>

                      {/* CHAPTER 3: CARTA GASTRONÓMICA */}
                      <section className="space-y-6 break-after-page">
                        <div className="flex items-center gap-3 border-b-2 border-zinc-900 pb-3">
                          <span className="text-2xl font-black text-zinc-900">03.</span>
                          <h4 className="text-xl font-black uppercase text-zinc-900">Propuesta Gastronómica</h4>
                        </div>
                        <div className="space-y-6">
                           <div>
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Justificación Km0 y Sostenibilidad</span>
                              <p className="text-xs text-zinc-600 leading-relaxed font-medium bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                                {gastState.menuPresentation || 'Sin justificación de carta.'}
                              </p>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {gastState.selectedIngredients?.map((ing: any) => (
                                <div key={ing.id} className="p-3 border border-zinc-100 rounded-xl bg-zinc-50 text-center">
                                  <span className="text-lg block mb-1">{ing.icon}</span>
                                  <span className="text-[10px] font-bold text-zinc-800 uppercase block leading-tight">{ing.name}</span>
                                  <span className="text-[8px] text-zinc-400 font-bold uppercase">{ing.origin}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      </section>

                      {/* CHAPTER 4: FICHAS TÉCNICAS */}
                      <section className="space-y-6 break-after-page">
                        <div className="flex items-center gap-3 border-b-2 border-zinc-900 pb-3">
                          <span className="text-2xl font-black text-zinc-900">04.</span>
                          <h4 className="text-xl font-black uppercase text-zinc-900">Recetario y Fichas Técnicas</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-8">
                          {gastState.recetas?.map((rec: any, idx: number) => (
                            <div key={idx} className="p-6 border border-zinc-200 rounded-2xl bg-white shadow-sm break-inside-avoid">
                              <div className="flex justify-between items-start mb-4 border-b border-zinc-100 pb-3">
                                <div>
                                  <h5 className="text-sm font-black text-zinc-900 uppercase">{rec.nombre}</h5>
                                  <span className="text-[10px] text-zinc-400 font-bold uppercase">{rec.categoria}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-black text-zinc-400 uppercase block">Autor</span>
                                  <span className="text-xs font-bold text-zinc-800">{rec.autor}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <span className="text-[10px] font-black text-zinc-400 uppercase block mb-2">Ingredientes Clave</span>
                                  <ul className="text-[11px] text-zinc-600 font-medium space-y-1 list-disc list-inside">
                                    {rec.ingredientes?.split('\n').map((line: string, i: number) => (
                                      <li key={i}>{line}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <span className="text-[10px] font-black text-zinc-400 uppercase block mb-2">Alérgenos Declarados</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {rec.alergenos?.map((al: string) => (
                                      <span key={al} className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[9px] font-bold uppercase">
                                        {al}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* CHAPTER 5: PRODUCCIÓN FINAL */}
                      <section className="space-y-6 break-after-page">
                        <div className="flex items-center gap-3 border-b-2 border-zinc-900 pb-3">
                          <span className="text-2xl font-black text-zinc-900">05.</span>
                          <h4 className="text-xl font-black uppercase text-zinc-900">Producción y Defensa Final</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Soporte Visual de la Defensa</span>
                              <p className="text-xs font-bold text-indigo-600 truncate">{gastState.task8?.presentationUrl || 'No disponible'}</p>
                           </div>
                           <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Prototipo de Carta Digital</span>
                              <p className="text-xs font-bold text-indigo-600 truncate">{gastState.task8?.prototypeUrl || 'No disponible'}</p>
                           </div>
                        </div>
                      </section>

                      {/* CHAPTER 6: VIABILIDAD */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b-2 border-zinc-900 pb-3">
                          <span className="text-2xl font-black text-zinc-900">06.</span>
                          <h4 className="text-xl font-black uppercase text-zinc-900">Viabilidad Económica Consolidada</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                              <tr className="border-b-2 border-zinc-900">
                                <th className="py-3 text-[10px] font-black text-zinc-400 uppercase">Plato / Elaboración</th>
                                <th className="py-3 text-[10px] font-black text-zinc-400 uppercase text-center">Coste (Unit)</th>
                                <th className="py-3 text-[10px] font-black text-zinc-400 uppercase text-center">PVP (Sugerido)</th>
                                <th className="py-3 text-[10px] font-black text-zinc-400 uppercase text-center">Margen</th>
                                <th className="py-3 text-[10px] font-black text-zinc-400 uppercase text-right">Rentabilidad</th>
                              </tr>
                            </thead>
                            <tbody>
                              {gastState.escandallos?.map((esc: any, idx: number) => {
                                const cost = Number(esc.totalCost) || 0;
                                const pvp = cost * 4; // Mock estimation
                                const margin = pvp - cost;
                                return (
                                  <tr key={idx} className="border-b border-zinc-100">
                                    <td className="py-4 text-xs font-bold text-zinc-800">{esc.name}</td>
                                    <td className="py-4 text-xs font-mono font-bold text-zinc-600 text-center">{cost.toFixed(2)}€</td>
                                    <td className="py-4 text-xs font-mono font-bold text-zinc-900 text-center">{pvp.toFixed(2)}€</td>
                                    <td className="py-4 text-xs font-mono font-bold text-emerald-600 text-center">{margin.toFixed(2)}€</td>
                                    <td className="py-4 text-right">
                                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase">Alta</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    </div>
                  )}

                  {showDocType === 'coevaluacion' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                      <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl">
                        <h4 className="text-sm font-black text-amber-900 mb-2 uppercase tracking-widest flex items-center gap-2">
                          <Lock className="h-4 w-4" /> 
                          Documento de Uso Restringido (Profesorado)
                        </h4>
                        <p className="text-xs text-amber-800 leading-relaxed font-semibold">
                          Este informe contiene las valoraciones privadas emitidas por <strong>{currentUser.name}</strong> sobre sus compañeros de equipo. La información aquí contenida es estrictamente confidencial y se utilizará únicamente para ajustar la calificación individual según el desempeño cooperativo.
                        </p>
                      </div>

                      <div className="space-y-8">
                        {allUsers.filter(u => u.id !== currentUser.id && u.classroom === currentUser.classroom && u.role === 'alumno').map(teammate => {
                          const review = gastState.task9?.reviews?.[currentUser.id]?.[teammate.id] || {
                            participacion: 0,
                            responsabilidad: 0,
                            colaboracion: 0,
                            contribucion: 0,
                            comment: ''
                          };

                          const totalImpact = (review.participacion + review.responsabilidad + review.colaboracion + review.contribucion) / 4;
                          const finalImpact = totalImpact * maxCoevaluationImpact;

                          return (
                            <div key={teammate.id} className="border-b border-zinc-200 pb-8 last:border-0">
                              <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center font-black text-zinc-400 border border-zinc-200">
                                    {teammate.initials}
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-black text-zinc-900">Alumno Evaluado: {teammate.name}</h5>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{teammate.email}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Impacto Calculado</span>
                                  <span className={`text-xl font-black font-mono ${finalImpact > 0 ? 'text-emerald-600' : finalImpact < 0 ? 'text-rose-600' : 'text-zinc-400'}`}>
                                    {finalImpact > 0 ? '+' : ''}{finalImpact.toFixed(2)} pts
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                {[
                                  { label: 'Participación', val: review.participacion },
                                  { label: 'Responsabilidad', val: review.responsabilidad },
                                  { label: 'Colaboración', val: review.colaboracion },
                                  { label: 'Contribución', val: review.contribucion }
                                ].map(cat => (
                                  <div key={cat.label} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">{cat.label}</span>
                                    <span className={`text-xs font-black ${cat.val > 0 ? 'text-emerald-700' : cat.val < 0 ? 'text-rose-700' : 'text-zinc-600'}`}>
                                      {cat.val > 0 ? '+' : ''}{cat.val.toFixed(1)}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-2">
                                <span className="text-[10px] font-black text-zinc-400 uppercase block">Justificación del Alumno:</span>
                                <p className="text-xs text-zinc-700 leading-relaxed font-medium italic p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                  "{review.comment || 'Sin justificación proporcionada.'}"
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-12 border-t-2 border-zinc-100 flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Firma del Alumno</p>
                          <p className="text-xs font-black text-zinc-900 border-b border-zinc-300 pb-2 min-w-[200px]">
                            {currentUser.name}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fecha de Generación</p>
                          <p className="text-xs font-black text-zinc-900 font-mono">
                            {new Date().toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {showDocType === 'tarea1' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                      
                      {/* 1. Identidad del Equipo */}
                      <section className="space-y-4 print:break-inside-avoid">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 pb-2">01. Identidad del Equipo</h2>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase">Nombre del Restaurante</p>
                            <p className="text-lg font-black text-zinc-900">{gastState.projectName || 'SIN NOMBRE'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase">Componentes</p>
                            <ul className="space-y-1 mt-2">
                              {allUsers.map((user) => (
                                <li key={user.id} className="text-xs font-bold text-zinc-800 flex items-center justify-between">
                                  <span>{user.name}</span>
                                  {gastState.roles.projectManager === user.id && (
                                    <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase">Coordinador/a</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </section>

                      {/* 2. Selección de Zona y Justificación */}
                      <section className="space-y-4 print:break-inside-avoid">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 pb-2">02. Selección de Zona y Justificación</h2>
                        <div className="space-y-4">
                          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Zona Gastronómica Elegida</p>
                            <p className="text-sm font-black text-zinc-900">{GASTRONOMIC_ZONES.find(z => z.id === gastState.selectedZone)?.name || 'NO SELECCIONADA'}</p>
                            <p className="text-[10px] text-zinc-500 mt-1">Concepto: {GASTRONOMIC_ZONES.find(z => z.id === gastState.selectedZone)?.concept || '--'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Justificación y Enfoque Sostenible (ODS)</p>
                            <div className="text-xs text-zinc-700 leading-relaxed bg-white border border-zinc-100 p-4 rounded-2xl min-h-[100px]">
                              {gastState.conceptDescription || 'Sin redactar.'}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Estudio de Mercado</p>
                            <div className="text-xs text-zinc-700 leading-relaxed bg-white border border-zinc-100 p-4 rounded-2xl">
                              {gastState.marketStudy || 'Sin redactar.'}
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* 3. Reparto Global de Tareas */}
                      <section className="space-y-4 print:break-inside-avoid">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 pb-2">03. Reparto Global de Tareas (Fase 1)</h2>
                        <div className="overflow-hidden border border-zinc-200 rounded-2xl">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-zinc-50 border-b border-zinc-200">
                                <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase">Micro-tarea de Investigación</th>
                                <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase">Responsable</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                              {TAREAS_INVESTIGACION.map((tarea) => (
                                <tr key={tarea.id}>
                                  <td className="px-4 py-3 text-[10px] font-mono text-zinc-400 font-bold">{tarea.id}</td>
                                  <td className="px-4 py-3 text-xs font-bold text-zinc-800">{tarea.title}</td>
                                  <td className="px-4 py-3 text-xs font-black text-indigo-600">
                                    {allUsers.find(u => u.id === taskAssignments[tarea.id])?.name || '-- Sin asignar --'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>

                    </div>
                  )}
                  {showDocType === 'tarea2' && (
                    /* TAREA 2: INFORME DE ANÁLISIS */
                    <div className="space-y-12 animate-in fade-in duration-500">
                      {/* Parte 1: Identidad del Restaurante (Grupal) */}
                      <section className="space-y-6 print:break-inside-avoid">
                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-2">
                          <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-black">1</span>
                          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Identidad del Restaurante (Grupal)</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-bold text-zinc-500 uppercase">Nombre del Restaurante</p>
                              <p className="text-xl font-black text-zinc-900">{gastState.projectName || 'SIN NOMBRE'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-zinc-500 uppercase">Eslogan / Concepto</p>
                              <p className="text-sm font-bold text-indigo-600 italic">"{gastState.decisionGrupal.slogan || 'Sin eslogan definido.'}"</p>
                            </div>
                            <div className="pt-2">
                              <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Valores Fundamentales</p>
                              <div className="flex flex-wrap gap-2">
                                {gastState.decisionGrupal.valores.map((v, i) => (
                                  <span key={i} className="px-3 py-1 bg-zinc-100 text-zinc-900 text-[10px] font-black rounded-full border border-zinc-200 uppercase tracking-tighter">
                                    {v}
                                  </span>
                                ))}
                                {gastState.decisionGrupal.valores.length === 0 && <span className="text-[10px] text-zinc-400 italic">No definidos</span>}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Público Objetivo Final</p>
                              <div className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 border border-zinc-100 p-4 rounded-2xl">
                                {gastState.decisionGrupal.publicoObjetivo || 'No definido.'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Parte 2: Anexos de Investigación (Individual) */}
                      <section className="space-y-8 print:break-inside-avoid">
                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-2">
                          <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-black">2</span>
                          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Anexos de Investigación (Individual)</h2>
                        </div>

                        <div className="space-y-10">
                          {allUsers.map((user) => {
                            const userTasks = TAREAS_INVESTIGACION.filter(t => taskAssignments[t.id] === user.id);
                            if (userTasks.length === 0) return null;

                            return (
                              <div key={user.id} className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                  <h3 className="text-sm font-black text-zinc-900">Aportación de: {user.name}</h3>
                                  <span className="text-[9px] bg-zinc-100 px-2 py-0.5 rounded text-zinc-500 font-bold uppercase">{userTasks.length} Tareas</span>
                                </div>

                                <div className="space-y-6 pl-3">
                                  {userTasks.map((tarea) => (
                                    <div key={tarea.id} className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono font-black text-indigo-400">[{tarea.id}]</span>
                                        <h4 className="text-[11px] font-black text-zinc-800 uppercase tracking-tight">{tarea.title}</h4>
                                      </div>
                                      <div className="text-xs text-zinc-700 leading-relaxed pl-8 border-l-2 border-zinc-100 py-1 italic bg-zinc-50/30 rounded-r-xl">
                                        {gastState.researchTexts[tarea.id] || (
                                          <span className="text-zinc-400">[Sin contenido redactado por el alumno]</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    </div>
                  )}

                  {showDocType === 'tarea3' && (
                    <div className="space-y-12 animate-in fade-in duration-500">
                      <section className="space-y-6 print:break-inside-avoid">
                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-2">
                          <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-black">1</span>
                          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Análisis de Productos de Temporada</h2>
                        </div>
                        <div className="space-y-8">
                          {allUsers.map((user) => {
                            const analysis = gastState.seasonalAnalysis[user.id];
                            if (!analysis) return null;
                            return (
                              <div key={user.id} className="space-y-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <h3 className="text-xs font-black text-zinc-900 flex items-center gap-2">
                                  <img 
                                    src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`} 
                                    className="w-5 h-5 rounded-full border border-zinc-200"
                                    alt={user.name}
                                  />
                                  Aportación de: {user.name}
                                </h3>
                                <div className="grid grid-cols-1 gap-4 text-[11px]">
                                  <div>
                                    <p className="font-bold text-zinc-500 uppercase text-[9px]">Productos Seleccionados:</p>
                                    <p className="text-zinc-800 font-semibold">{analysis.products}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="font-bold text-zinc-500 uppercase text-[9px]">Justificación Sostenibilidad:</p>
                                      <p className="text-zinc-800 font-semibold">{analysis.sustainability}</p>
                                    </div>
                                    <div>
                                      <p className="font-bold text-zinc-500 uppercase text-[9px]">Fuentes consultadas:</p>
                                      <p className="text-zinc-800 font-semibold italic">{analysis.sources}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <section className="space-y-6 print:break-before-page">
                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-2">
                          <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-black">2</span>
                          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Dossier de Fichas Técnicas</h2>
                        </div>
                        <div className="space-y-12">
                          {gastState.dishes.map((dish: any) => {
                            const user = allUsers.find(u => u.id === dish.userId);
                            return (
                              <div key={dish.id} className="space-y-6 border-b border-zinc-100 pb-12 last:border-0">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{dish.type}</span>
                                    <h3 className="text-lg font-black text-zinc-900">{dish.name}</h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Chef Responsable: {user?.name || 'Anon'}</p>
                                  </div>
                                  <div className="w-32 h-32 rounded-2xl bg-zinc-50 border border-zinc-200 overflow-hidden">
                                    {dish.image && <img src={dish.image} className="w-full h-full object-cover" />}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50 pb-1">Ingredientes (para {dish.portions} raciones)</h4>
                                    <table className="w-full text-[10px]">
                                      <tbody className="divide-y divide-zinc-50">
                                        {dish.ingredients.map((ing: any, i: number) => (
                                          <tr key={i}>
                                            <td className="py-1.5 font-bold text-zinc-800">{ing.name}</td>
                                            <td className="py-1.5 text-right font-black text-zinc-900">{ing.quantity} {ing.unit}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50 pb-1">Justificación Sostenible</h4>
                                    <p className="text-[10px] font-semibold text-zinc-600 leading-relaxed italic bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                                      {dish.sustainabilityJustification}
                                    </p>
                                  </div>
                                </div>

                                  <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50 pb-1">Alérgenos</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {dish.allergens && dish.allergens.length > 0 ? (
                                        dish.allergens.map((allId: string) => {
                                          const allergen = ALLERGENS.find(a => a.id === allId);
                                          return allergen ? (
                                            <div key={allId} className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-100">
                                              <span className="text-xs">{allergen.icon}</span>
                                              <span className="text-[9px] font-bold text-zinc-600 uppercase">{allergen.label}</span>
                                            </div>
                                          ) : null;
                                        })
                                      ) : (
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase italic">Sin alérgenos declarados</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50 pb-1">Elaboración</h4>
                                  <p className="text-[10px] font-medium text-zinc-600 whitespace-pre-wrap leading-relaxed">
                                    {dish.elaboration}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    </div>
                  )}

                  {/* Pie de Página */}
                  <div className="mt-20 pt-6 border-t border-zinc-200 flex justify-between items-center text-[9px] font-bold text-zinc-400">
                    <p>Manager Pro Sostenible - {showDocType === 'tarea1' ? 'Fase 0: Constitución' : 'Fase 1: Informe de Análisis'}</p>
                    <p>Fecha de generación: {new Date().toLocaleDateString('es-ES')}</p>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Custom simple sub-icons/logos to keep sidebar visual pristine
function LayoutIcon({ active }: { active: boolean }) {
  return (
    <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
      active ? 'bg-zinc-900 border-zinc-900' : 'bg-transparent border-zinc-600'
    }`}>
      <span className={`w-2 h-2 rounded-xs ${active ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
    </span>
  );
}

function CheckCircleStatus() {
  return (
    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
      <Check className="h-4 w-4 text-emerald-700" />
    </div>
  );
}
