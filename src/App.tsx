import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from './lib/firebase';
import { 
  Briefcase, 
  TrendingUp, 
  Settings as SettingsIcon, 
  Calendar, 
  Clock, 
  Menu, 
  X, 
  Building,
  Building2,
  User as UserIcon,
  ExternalLink,
  Plus,
  Shield,
  GraduationCap,
  UserCheck,
  Sparkles,
  RefreshCw,
  LogIn,
  Target
} from 'lucide-react';
import { Project, TeamMember, ProjectStatus, AppUser, UserRole, AssessmentTask, StudentGrade, IndividualOralGrade, Announcement } from './types';
import { INITIAL_PROJECTS, INITIAL_TEAM } from './data';
import ProjectList from './components/ProjectList';
import ProjectFormModal from './components/ProjectFormModal';
import ProjectDetailDrawer from './components/ProjectDetailDrawer';
import MetricsTab from './components/MetricsTab';
import SettingsTab from './components/SettingsTab';
import UserManagementTab from './components/UserManagementTab';
import ClassroomManagementTab from './components/ClassroomManagementTab';
import RATab from './components/RATab';
import PendingSpace from './components/PendingSpace';
import ProfesorDashboard from './components/ProfesorDashboard';
import AlumnoDashboard from './components/AlumnoDashboard';
import LoginPage from './components/LoginPage';

const INITIAL_USERS: AppUser[] = [
  {
    id: 'u-admin',
    name: 'Juan Carlos',
    email: 'jcbprofesor@gmail.com',
    role: 'admin',
    roles: ['admin', 'profesor'],
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    initials: 'JC',
    color: 'bg-emerald-600 text-white',
    joinedAt: '2026-06-01'
  },
  {
    id: 'u-prof1',
    name: 'Sofía Alcántara',
    email: 'sofia@empresa.com',
    role: 'profesor',
    roles: ['profesor'],
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    initials: 'SA',
    color: 'bg-indigo-600 text-white',
    classroom: 'Aula de Desarrollo Web',
    joinedAt: '2026-06-10'
  },
  {
    id: 'u-alum1',
    name: 'Laura Torres',
    email: 'laura@empresa.com',
    role: 'alumno',
    roles: ['alumno'],
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    initials: 'LT',
    color: 'bg-teal-600 text-white',
    classroom: 'Aula de Desarrollo Web',
    joinedAt: '2026-06-12'
  },
  {
    id: 'u-alum2',
    name: 'Lucas Gómez',
    email: 'lucas@colegio.com',
    role: 'alumno',
    roles: ['alumno'],
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucas',
    initials: 'LG',
    color: 'bg-amber-600 text-white',
    joinedAt: '2026-06-29'
  },
  {
    id: 'u-alum3',
    name: 'Marta Ruiz',
    email: 'marta@colegio.com',
    role: 'alumno',
    roles: ['alumno'],
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Marta',
    initials: 'MR',
    color: 'bg-rose-600 text-white',
    joinedAt: '2026-06-29'
  }
];

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Core Data State (synchronized with localStorage)
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [classrooms, setClassrooms] = useState<string[]>([]);
  const [iesName, setIesName] = useState<string>('IES Sostenible');
  const [iesLogo, setIesLogo] = useState<string>('');
  const [maxCoevaluationImpact, setMaxCoevaluationImpact] = useState<number>(1.0);
  
  // New: Assessment Tasks and Grades
  const [assessmentTasks, setAssessmentTasks] = useState<AssessmentTask[]>([
    { id: 'step-11', title: '1. Entregable Tarea 1', criterionIds: ['1a', '1b', '1c'], weight: 0.0 },
    { id: 'step-12', title: '2. Entregable Tarea 2', criterionIds: ['1d', '1e', '2a'], weight: 2.0 },
    { id: 'step-13', title: '3. Entregable Tarea 3', criterionIds: ['2b', '2c', '2d'], weight: 3.0 },
    { id: 'step-14', title: '4. Entregable Tarea 4', criterionIds: ['2e', '2f', '2g'], weight: 1.0 },
    { id: 'step-15', title: '5. Entregable Tarea 5', criterionIds: ['3a', '3b', '3c'], weight: 2.0 },
    { id: 'step-16', title: '6. Informe Coevaluación', criterionIds: ['3d', '3e', '3f'], weight: 0.0 },
    { id: 'step-17', title: '7. Memoria Final del Proyecto', criterionIds: ['4a', '4b', '4c'], weight: 2.0 },
  ]);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [individualOralGrades, setIndividualOralGrades] = useState<IndividualOralGrade[]>([]);
  const [maxTeamScore, setMaxTeamScore] = useState<number>(6.0);
  const [maxExpositionScore, setMaxExpositionScore] = useState<number>(3.0);
  const [maxCoevalAdjustment, setMaxCoevalAdjustment] = useState<number>(1.0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // User Management & Active Session Simulation
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);

  // Modal / Drawer States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToInspect, setProjectToInspect] = useState<Project | null>(null);
  
  const [activeTab, setActiveTab] = useState('metrics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Time state for header
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Initial State Load
  useEffect(() => {
    const savedProjects = localStorage.getItem('studio_projects_v1');
    const savedTeam = localStorage.getItem('studio_team_v1');
    const savedUsers = localStorage.getItem('studio_users_v1');
    const savedCurrentUserId = localStorage.getItem('studio_current_user_id_v1');

    let loadedProjects = INITIAL_PROJECTS;
    let loadedTeam = INITIAL_TEAM;
    let loadedUsers = INITIAL_USERS;
    let loadedCurrentUserId = 'u-admin';

    if (savedProjects && savedTeam) {
      loadedProjects = JSON.parse(savedProjects);
      // Migration: Ensure projects have a classroom if they match initial data names
      let needsMigration = false;
      const migratedProjects = loadedProjects.map(p => {
        if (!p.classroom) {
          if (p.name.includes('E-commerce')) p.classroom = '2HCA';
          else if (p.name.includes('Sistemas Internos')) p.classroom = '2HCA';
          else if (p.name.includes('SEO')) p.classroom = '2HCB';
          else if (p.name.includes('Multi-Cloud')) p.classroom = '2HCB';
          if (p.classroom) needsMigration = true;
        }
        return p;
      });

      if (needsMigration) {
        loadedProjects = migratedProjects;
        localStorage.setItem('studio_projects_v1', JSON.stringify(migratedProjects));
      }

      loadedTeam = JSON.parse(savedTeam);
      setProjects(loadedProjects);
      setTeam(loadedTeam);
    } else {
      setProjects(INITIAL_PROJECTS);
      setTeam(INITIAL_TEAM);
      localStorage.setItem('studio_projects_v1', JSON.stringify(INITIAL_PROJECTS));
      localStorage.setItem('studio_team_v1', JSON.stringify(INITIAL_TEAM));
    }

    if (savedUsers) {
      loadedUsers = JSON.parse(savedUsers);
      setUsers(loadedUsers);
    } else {
      setUsers(INITIAL_USERS);
      localStorage.setItem('studio_users_v1', JSON.stringify(INITIAL_USERS));
    }

    const savedClassrooms = localStorage.getItem('studio_classrooms_v1');
    const initialClassroomsList = ['2HCA', '2HCB', '2HCC'];
    if (savedClassrooms) {
      setClassrooms(JSON.parse(savedClassrooms));
    } else {
      setClassrooms(initialClassroomsList);
      localStorage.setItem('studio_classrooms_v1', JSON.stringify(initialClassroomsList));
    }

    const savedIesName = localStorage.getItem('studio_ies_name_v1');
    if (savedIesName) {
      setIesName(savedIesName);
    } else {
      localStorage.setItem('studio_ies_name_v1', 'IES Sostenible');
    }

    const savedIesLogo = localStorage.getItem('studio_ies_logo_v1');
    if (savedIesLogo) {
      setIesLogo(savedIesLogo);
    }

    const savedImpact = localStorage.getItem('studio_coeval_impact_v1');
    if (savedImpact) {
      setMaxCoevaluationImpact(Number(savedImpact));
    }

    const savedMaxTeam = localStorage.getItem('studio_max_team_score_v1');
    if (savedMaxTeam) {
      setMaxTeamScore(Number(savedMaxTeam));
    }
    const savedMaxExpo = localStorage.getItem('studio_max_expo_score_v1');
    if (savedMaxExpo) {
      setMaxExpositionScore(Number(savedMaxExpo));
    }
    const savedMaxCoeval = localStorage.getItem('studio_max_coeval_adjust_v1');
    if (savedMaxCoeval) {
      setMaxCoevalAdjustment(Number(savedMaxCoeval));
    }

    // Enforce matching assessment tasks with AlumnoDashboard and load weights
    const savedTasks = localStorage.getItem('studio_assessment_tasks_v1');
    const defaultTasks: AssessmentTask[] = [
      { id: 'step-11', title: '1. Entregable Tarea 1', criterionIds: ['1a', '1b', '1c'], weight: 0.0 },
      { id: 'step-12', title: '2. Entregable Tarea 2', criterionIds: ['1d', '1e', '2a'], weight: 2.0 },
      { id: 'step-13', title: '3. Entregable Tarea 3', criterionIds: ['2b', '2c', '2d'], weight: 3.0 },
      { id: 'step-14', title: '4. Entregable Tarea 4', criterionIds: ['2e', '2f', '2g'], weight: 1.0 },
      { id: 'step-15', title: '5. Entregable Tarea 5', criterionIds: ['3a', '3b', '3c'], weight: 2.0 },
      { id: 'step-16', title: '6. Informe Coevaluación', criterionIds: ['3d', '3e', '3f'], weight: 0.0 },
      { id: 'step-17', title: '7. Memoria Final del Proyecto', criterionIds: ['4a', '4b', '4c'], weight: 2.0 },
    ];

    let loadedTasks = defaultTasks;
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks) as AssessmentTask[];
        loadedTasks = parsed.map(pt => {
          const matchingDefault = defaultTasks.find(dt => dt.id === pt.id);
          return {
            ...pt,
            weight: pt.weight !== undefined ? pt.weight : (matchingDefault ? matchingDefault.weight : 0.0)
          };
        });
      } catch (err) {
        loadedTasks = defaultTasks;
      }
    }
    setAssessmentTasks(loadedTasks);
    localStorage.setItem('studio_assessment_tasks_v1', JSON.stringify(loadedTasks));

    const savedGrades = localStorage.getItem('studio_student_grades_v1');
    if (savedGrades) {
      setStudentGrades(JSON.parse(savedGrades));
    }

    const savedIndividualOral = localStorage.getItem('studio_individual_oral_grades_v1');
    if (savedIndividualOral) {
      const loaded = JSON.parse(savedIndividualOral);
      const migrated = loaded.map((g: any) => ({
        studentId: g.studentId,
        teamGrade: g.teamGrade !== undefined ? g.teamGrade : (g.teamScore !== undefined ? (g.teamScore / 6.0) * 10 : 9.0),
        expositionGrade: g.expositionGrade !== undefined ? g.expositionGrade : (g.expositionScore !== undefined ? (g.expositionScore / 3.0) * 10 : 8.5),
        coevalItem1: g.coevalItem1 || 'neutral',
        coevalItem2: g.coevalItem2 || 'neutral',
        justification: g.justification || '',
        presented: g.presented !== undefined ? g.presented : true
      }));
      setIndividualOralGrades(migrated);
    } else {
      const initialOral: IndividualOralGrade[] = [
        {
          studentId: 'u-alum1',
          teamGrade: 9.0,         // 9.0 out of 10
          expositionGrade: 8.5,   // 8.5 out of 10
          coevalItem1: 'positive',
          coevalItem2: 'positive',
          justification: 'Excelente participación durante la defensa del proyecto, resolviendo con soltura todas las preguntas técnicas planteadas.',
          presented: true
        }
      ];
      setIndividualOralGrades(initialOral);
      localStorage.setItem('studio_individual_oral_grades_v1', JSON.stringify(initialOral));
    }

    if (savedCurrentUserId) {
      loadedCurrentUserId = savedCurrentUserId;
    } else {
      localStorage.setItem('studio_current_user_id_v1', 'u-admin');
    }

    const savedAnnouncements = localStorage.getItem('studio_announcements_v1');
    if (savedAnnouncements) {
      setAnnouncements(JSON.parse(savedAnnouncements));
    } else {
      const defaultAnnouncements: Announcement[] = [
        {
          id: 'ann-1',
          text: 'Bienvenidos al nuevo trimestre. Por favor completen el diseño de wireframes para el proyecto de E-commerce.',
          date: '2026-06-28',
          author: 'Sofía Alcántara',
          readByStudentIds: []
        },
        {
          id: 'ann-2',
          text: 'Recuerden que la entrega de arquitectura de API es este viernes.',
          date: '2026-06-25',
          author: 'Sofía Alcántara',
          readByStudentIds: []
        }
      ];
      setAnnouncements(defaultAnnouncements);
      localStorage.setItem('studio_announcements_v1', JSON.stringify(defaultAnnouncements));
    }

    const currentFound = loadedUsers.find(u => u.id === loadedCurrentUserId) || loadedUsers[0];
    setCurrentUser(currentFound);
  }, []);

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 2. Persist state updates to LocalStorage
  const saveProjects = (updated: Project[]) => {
    setProjects(updated);
    localStorage.setItem('studio_projects_v1', JSON.stringify(updated));
    // If we're inspecting a project, keep it fresh in the detail drawer
    if (projectToInspect) {
      const refreshed = updated.find(p => p.id === projectToInspect.id);
      if (refreshed) {
        setProjectToInspect(refreshed);
      }
    }
  };

  const saveTeam = (updated: TeamMember[]) => {
    setTeam(updated);
    localStorage.setItem('studio_team_v1', JSON.stringify(updated));
  };

  const saveUsers = (updated: AppUser[]) => {
    setUsers(updated);
    localStorage.setItem('studio_users_v1', JSON.stringify(updated));
    if (currentUser) {
      const refreshed = updated.find(u => u.id === currentUser.id);
      if (refreshed) {
        setCurrentUser(refreshed);
      }
    }
  };

  const handleSwitchSession = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      setActiveRole(targetUser.roles[0]);
      localStorage.setItem('studio_current_user_id_v1', userId);
    }
  };

  const handleChangeRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  };

  const handleUpdateUser = (updatedUser: AppUser) => {
    const updated = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    saveUsers(updated);
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const updated = users.filter(u => u.id !== userId);
    saveUsers(updated);
    if (currentUser?.id === userId) {
      // fallback to admin
      handleSwitchSession('u-admin');
    }
  };

  const handleAddUser = (newUser: AppUser) => {
    const updated = [newUser, ...users];
    saveUsers(updated);
  };

  const handleCreateClassroom = (name: string) => {
    const updated = [...classrooms, name];
    setClassrooms(updated);
    localStorage.setItem('studio_classrooms_v1', JSON.stringify(updated));
  };

  const handleDeleteClassroom = (name: string) => {
    const updatedClassrooms = classrooms.filter(c => c !== name);
    setClassrooms(updatedClassrooms);
    localStorage.setItem('studio_classrooms_v1', JSON.stringify(updatedClassrooms));

    // Clear classroom from users
    const updatedUsers = users.map(u => u.classroom === name ? { ...u, classroom: undefined } : u);
    saveUsers(updatedUsers);

    // Clear classroom from projects
    const updatedProjects = projects.map(p => p.classroom === name ? { ...p, classroom: undefined } : p);
    saveProjects(updatedProjects);
  };

  const handleUpdateGrade = (studentId: string, taskId: string, score: number) => {
    setStudentGrades(prev => {
      const existingIdx = prev.findIndex(g => g.studentId === studentId && g.taskId === taskId);
      let updated;
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], score };
      } else {
        updated = [...prev, { studentId, taskId, score, isDelivered: true }];
      }
      localStorage.setItem('studio_student_grades_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleDelivery = (studentId: string, taskId: string, isDelivered: boolean) => {
    setStudentGrades(prev => {
      const existingIdx = prev.findIndex(g => g.studentId === studentId && g.taskId === taskId);
      let updated;
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], isDelivered };
      } else {
        updated = [...prev, { studentId, taskId, score: 0, isDelivered }];
      }
      localStorage.setItem('studio_student_grades_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateIndividualOralGrade = (studentId: string, updated: Partial<IndividualOralGrade>) => {
    setIndividualOralGrades(prev => {
      const idx = prev.findIndex(g => g.studentId === studentId);
      let newGrades;
      if (idx >= 0) {
        newGrades = [...prev];
        newGrades[idx] = { ...newGrades[idx], ...updated };
      } else {
        newGrades = [...prev, {
          studentId,
          teamGrade: 5.0,
          expositionGrade: 5.0,
          coevalItem1: 'neutral',
          coevalItem2: 'neutral',
          justification: '',
          presented: true,
          ...updated
        } as IndividualOralGrade];
      }
      localStorage.setItem('studio_individual_oral_grades_v1', JSON.stringify(newGrades));
      return newGrades;
    });
  };

  const handleUpdateOralGradeConfig = (maxTeam: number, maxExposition: number, maxCoeval: number) => {
    setMaxTeamScore(maxTeam);
    setMaxExpositionScore(maxExposition);
    setMaxCoevalAdjustment(maxCoeval);
    localStorage.setItem('studio_max_team_score_v1', maxTeam.toString());
    localStorage.setItem('studio_max_expo_score_v1', maxExposition.toString());
    localStorage.setItem('studio_max_coeval_adjust_v1', maxCoeval.toString());
  };

  const handleUpdateTaskWeights = (weights: { [taskId: string]: number }) => {
    setAssessmentTasks(prev => {
      const updated = prev.map(task => ({
        ...task,
        weight: weights[task.id] !== undefined ? weights[task.id] : (task.weight ?? 0.0)
      }));
      localStorage.setItem('studio_assessment_tasks_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddAssessmentTask = () => {
    const newTask: AssessmentTask = {
      id: `at${Date.now()}`,
      title: 'Nueva Tarea Evaluable',
      criterionIds: ['1a']
    };
    const updated = [...assessmentTasks, newTask];
    setAssessmentTasks(updated);
    localStorage.setItem('studio_assessment_tasks_v1', JSON.stringify(updated));
  };

  const handlePublishAnnouncement = (text: string, authorName: string) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      text,
      date: new Date().toISOString().split('T')[0],
      author: authorName,
      readByStudentIds: []
    };
    setAnnouncements(prev => {
      const updated = [newAnn, ...prev];
      localStorage.setItem('studio_announcements_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleReadAnnouncement = (annId: string, studentId: string) => {
    setAnnouncements(prev => {
      const updated = prev.map(ann => {
        if (ann.id === annId) {
          const reads = ann.readByStudentIds || [];
          const alreadyRead = reads.includes(studentId);
          return {
            ...ann,
            readByStudentIds: alreadyRead 
              ? reads.filter(id => id !== studentId) 
              : [...reads, studentId]
          };
        }
        return ann;
      });
      localStorage.setItem('studio_announcements_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateIesSettings = (name: string, logo: string) => {
    setIesName(name);
    setIesLogo(logo);
    localStorage.setItem('studio_ies_name_v1', name);
    localStorage.setItem('studio_ies_logo_v1', logo);
  };

  const handleUpdateCoevaluationImpact = (impact: number) => {
    setMaxCoevaluationImpact(impact);
    localStorage.setItem('studio_coeval_impact_v1', impact.toString());
  };

  // 3. Project Handlers
  const handleCreateOrUpdateProject = (projectData: Partial<Project>) => {
    if (projectData.id) {
      // EDIT MODE
      const updated = projects.map(p => {
        if (p.id === projectData.id) {
          return { ...p, ...projectData, lastUpdated: new Date().toISOString() } as Project;
        }
        return p;
      });
      saveProjects(updated);
    } else {
      // CREATE MODE
      const newProject: Project = {
        id: `proj_${Date.now()}`,
        name: projectData.name || 'Nuevo Proyecto',
        description: projectData.description || '',
        status: projectData.status || 'planning',
        priority: projectData.priority || 'medium',
        category: projectData.category || 'Desarrollo Web',
        budget: projectData.budget || 0,
        spent: projectData.spent || 0,
        startDate: projectData.startDate || new Date().toISOString().split('T')[0],
        dueDate: projectData.dueDate || new Date().toISOString().split('T')[0],
        progress: projectData.progress || 0,
        team: projectData.team || [],
        tasks: projectData.tasks || [],
        lastUpdated: new Date().toISOString(),
        classroom: projectData.classroom
      };
      saveProjects([newProject, ...projects]);
    }
    setProjectToEdit(null);
    setIsFormModalOpen(false);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto de forma permanente?')) {
      const updated = projects.filter(p => p.id !== projectId);
      saveProjects(updated);
      if (projectToInspect?.id === projectId) {
        setProjectToInspect(null);
      }
    }
  };

  const handleToggleTask = (projectId: string, taskId: string) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        // Recalculate progress based on task checklist completeness
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const progress = updatedTasks.length > 0 
          ? Math.round((completedCount / updatedTasks.length) * 100) 
          : p.progress;

        // Auto adjust status if 100% complete
        let status = p.status;
        if (progress === 100 && p.status !== 'completed') {
          status = 'completed';
        } else if (progress < 100 && p.status === 'completed') {
          status = 'active';
        }

        return {
          ...p,
          tasks: updatedTasks,
          progress,
          status,
          lastUpdated: new Date().toISOString()
        };
      }
      return p;
    });
    saveProjects(updated);
  };

  // 4. Team Member Handlers
  const handleAddTeamMember = (newMember: TeamMember) => {
    const updated = [...team, newMember];
    saveTeam(updated);
  };

  const handleRemoveTeamMember = (memberId: string) => {
    // Check if member is assigned to any project
    const isAssigned = projects.some(p => p.team.includes(memberId));
    if (isAssigned) {
      alert('No se puede desvincular al profesional porque está asignado activamente a uno o más proyectos. Remuévelo de los proyectos primero.');
      return;
    }

    if (window.confirm('¿Deseas desvincular a este profesional del equipo?')) {
      const updated = team.filter(m => m.id !== memberId);
      saveTeam(updated);
    }
  };

  // Reset entire workspace back to defaults
  const handleResetWorkspace = () => {
    setProjects(INITIAL_PROJECTS);
    setTeam(INITIAL_TEAM);
    setUsers(INITIAL_USERS);
    setClassrooms(['2HCA', '2HCB', '2HCC']);
    setIesName('IES Sostenible');
    setIesLogo('');
    localStorage.setItem('studio_projects_v1', JSON.stringify(INITIAL_PROJECTS));
    localStorage.setItem('studio_team_v1', JSON.stringify(INITIAL_TEAM));
    localStorage.setItem('studio_users_v1', JSON.stringify(INITIAL_USERS));
    localStorage.setItem('studio_classrooms_v1', JSON.stringify(['2HCA', '2HCB', '2HCC']));
    localStorage.setItem('studio_ies_name_v1', 'IES Sostenible');
    localStorage.setItem('studio_ies_logo_v1', '');
    setProjectToInspect(null);
    setProjectToEdit(null);
  };

  // Quick Open Handlers
  const openEditModal = (project: Project) => {
    setProjectToEdit(project);
    setIsFormModalOpen(true);
  };

  const openCreateModal = () => {
    setProjectToEdit(null);
    setIsFormModalOpen(true);
  };

  // Date Formatting for Header
  const formattedDate = currentTime.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // 5. Active Role Layout Dispatcher
  const renderDashboardContent = () => {
    if (!currentUser) {
      return (
        <div className="flex-1 bg-slate-50 flex items-center justify-center py-12">
          <div className="text-center p-6 bg-white rounded-2xl shadow-md border border-zinc-200">
            <RefreshCw className="h-8 w-8 text-zinc-600 animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-500 font-bold">Cargando...</p>
          </div>
        </div>
      );
    }

    if (activeRole === 'pending') {
      return (
        <PendingSpace 
          currentUser={currentUser} 
          onUpdateCurrentUser={handleUpdateUser} 
          onLogoutToAdmin={() => handleSwitchSession('u-admin')} 
        />
      );
    }

    if (activeRole === 'profesor') {
      return (
        <ProfesorDashboard 
          currentUser={currentUser} 
          projects={projects} 
          allUsers={users} 
          onLogoutToAdmin={() => handleSwitchSession('u-admin')} 
          onToggleTask={handleToggleTask} 
          iesName={iesName}
          iesLogo={iesLogo}
          maxCoevaluationImpact={maxCoevaluationImpact}
          assessmentTasks={assessmentTasks}
          studentGrades={studentGrades}
          onUpdateGrade={handleUpdateGrade}
          onToggleDelivery={handleToggleDelivery}
          onAddAssessmentTask={handleAddAssessmentTask}
          individualOralGrades={individualOralGrades}
          onUpdateIndividualOralGrade={handleUpdateIndividualOralGrade}
          maxTeamScore={maxTeamScore}
          maxExpositionScore={maxExpositionScore}
          maxCoevalAdjustment={maxCoevalAdjustment}
          onUpdateOralGradeConfig={handleUpdateOralGradeConfig}
          announcements={announcements}
          onPublishAnnouncement={handlePublishAnnouncement}
          activeRole={activeRole}
          onChangeActiveRole={handleChangeRole}
        />
      );
    }

    if (activeRole === 'alumno') {
      return (
        <AlumnoDashboard 
          currentUser={currentUser} 
          projects={projects} 
          allUsers={users} 
          onLogoutToAdmin={() => handleSwitchSession('u-admin')} 
          onToggleTask={handleToggleTask} 
          iesName={iesName}
          iesLogo={iesLogo}
          maxCoevaluationImpact={maxCoevaluationImpact}
          assessmentTasks={assessmentTasks}
          studentGrades={studentGrades}
          onToggleDelivery={handleToggleDelivery}
          individualOralGrades={individualOralGrades}
          maxTeamScore={maxTeamScore}
          maxExpositionScore={maxExpositionScore}
          maxCoevalAdjustment={maxCoevalAdjustment}
          announcements={announcements}
          onToggleReadAnnouncement={(annId) => handleToggleReadAnnouncement(annId, currentUser.id)}
          onUpdateStudentName={(studentId, newName) => {
            const userToUpdate = users.find(u => u.id === studentId);
            if (userToUpdate) {
              const updatedUser = { ...userToUpdate, name: newName };
              const initials = newName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              updatedUser.initials = initials;
              handleUpdateUser(updatedUser);
            }
          }}
          activeRole={activeRole}
          onChangeActiveRole={handleChangeRole}
        />
      );
    }

    // Default: 'admin' role
    return (
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        {/* 1. Desktop Left Sidebar / Drawer */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-zinc-200/85 flex flex-col shrink-0 z-30">
          
          {/* Brand Header */}
          <div className="px-6 py-5 border-b border-zinc-150 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white overflow-hidden shadow-xs shrink-0">
                {iesLogo ? (
                  <img src={iesLogo} alt="Logo Centro" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Building className="h-4.5 w-4.5" />
                )}
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-zinc-900 block">Manager Pro intermodular</span>
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">{iesName}</span>
              </div>
            </div>

            {/* Mobile hamburger toggle button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 hover:bg-zinc-100 text-zinc-500 rounded-lg md:hidden cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Sidebar Nav Links */}
          <nav className={`flex-1 px-3.5 py-4 space-y-1 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest block px-3.5 mb-2">
              Navegación
            </span>
            
            <button
              onClick={() => {
                setActiveTab('metrics');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'metrics'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Métricas e Informes</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('users');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <div className="flex-1 flex items-center justify-between">
                <span>Gestión de Usuarios</span>
                {users.filter(u => u.role === 'pending').length > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-extrabold rounded-full">
                    {users.filter(u => u.role === 'pending').length}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('ra');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'ra'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <Target className="h-4 w-4" />
              <span>Gestión de RA</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('classrooms');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'classrooms'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Gestión de Aulas</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('settings');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
              <span>Ajustes de Plataforma</span>
            </button>
          </nav>

          {/* Administrator Profile Card */}
          <div className={`p-4 border-t border-zinc-150 bg-zinc-50/50 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-zinc-200/60 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                JC
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-zinc-900 block truncate">{currentUser.name}</span>
                <span className="text-[10px] text-zinc-400 font-medium block truncate">Administrador Principal</span>
              </div>
            </div>
          </div>

        </aside>

        {/* 2. Main Content Stage */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Top Floating Dashboard Header */}
          <header className="bg-white border-b border-zinc-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky top-0 z-20 shadow-xs/10">
            
            <div className="space-y-0.5">
              <h1 className="text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                <span>Panel de Administración</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" title="Sistema Operativo Local" />
              </h1>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-zinc-500 font-medium">
                <span className="capitalize flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  {formattedDate}
                </span>
                <span className="text-zinc-300 hidden sm:inline">•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" />
                  {formattedTime}
                </span>
              </div>
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
                      onClick={() => handleChangeRole(r as any)}
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

            {/* Workspace metric pills */}
            <div className="flex items-center gap-2 text-xs shrink-0">
              <div className="bg-zinc-100 border border-zinc-200/60 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                <span className="text-zinc-500 font-medium">Proyectos:</span>
                <span className="font-bold text-zinc-900 font-mono">{projects.length}</span>
              </div>
              
              <button
                onClick={openCreateModal}
                className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-xl font-semibold text-xs cursor-pointer shadow-xs transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nuevo</span>
              </button>
            </div>

          </header>

          {/* Tab Viewport Workspace */}
          <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
            
            {/* Active rendering view switch */}
            {activeTab === 'projects' && (
              <ProjectList
                projects={projects}
                team={team}
                onSelectProject={setProjectToInspect}
                onEditProject={openEditModal}
                onDeleteProject={handleDeleteProject}
                onToggleTask={handleToggleTask}
                onOpenCreateModal={openCreateModal}
              />
            )}

            {activeTab === 'metrics' && (
              <MetricsTab 
                projects={projects}
                users={users}
                onToggleTask={handleToggleTask}
              />
            )}

            {activeTab === 'users' && (
              <UserManagementTab 
                users={users}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onAddUser={handleAddUser}
                classrooms={classrooms}
              />
            )}

            {activeTab === 'ra' && (
              <RATab />
            )}

            {activeTab === 'classrooms' && (
              <ClassroomManagementTab
                classrooms={classrooms}
                onCreateClassroom={handleCreateClassroom}
                onDeleteClassroom={handleDeleteClassroom}
                users={users}
                projects={projects}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab 
                projects={projects}
                team={team}
                onResetWorkspace={handleResetWorkspace}
                iesName={iesName}
                iesLogo={iesLogo}
                onUpdateIesSettings={handleUpdateIesSettings}
                maxCoevaluationImpact={maxCoevaluationImpact}
                onUpdateCoevaluationImpact={handleUpdateCoevaluationImpact}
                maxTeamScore={maxTeamScore}
                maxExpositionScore={maxExpositionScore}
                maxCoevalAdjustment={maxCoevalAdjustment}
                onUpdateOralGradeConfig={handleUpdateOralGradeConfig}
                assessmentTasks={assessmentTasks}
                onUpdateTaskWeights={handleUpdateTaskWeights}
              />
            )}

          </div>

        </main>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col antialiased">
      {!firebaseUser ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <>
          {/* ⚠️ Simulated Environment Top Navigation Banner */}
          <div className="bg-zinc-900 text-white px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold select-none z-50 shrink-0 border-b border-zinc-850">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span className="text-zinc-200">Simulador de Roles de Plataforma</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest font-mono">
                Academia
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-medium text-[11px]">Usuario Activo:</span>
              {(currentUser?.roles || []).includes('admin') ? (
                <select 
                  value={currentUser?.id || ''} 
                  onChange={(e) => handleSwitchSession(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-600 font-sans"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id} className="bg-zinc-900 text-white font-medium">
                      {u.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold font-sans flex items-center gap-2">
                  {currentUser?.name} ({activeRole === 'admin' ? '🔑 Administrador' : activeRole === 'profesor' ? '🎓 Profesor' : activeRole === 'alumno' ? '✏️ Alumno' : '⏳ Sin Asignar'})
                  {currentUser && (currentUser.roles || []).length > 1 && (
                    <select
                      value={activeRole || ''}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        setActiveRole(newRole);
                        if (currentUser) {
                          setCurrentUser({ ...currentUser, role: newRole });
                        }
                      }}
                      className="bg-zinc-900 text-white text-[10px] rounded p-0.5 ml-2 cursor-pointer"
                    >
                      {currentUser.roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              <button onClick={handleLogout} className="text-zinc-400 hover:text-white">Cerrar sesión</button>
            </div>
          </div>

          {/* Main Responsive Viewport based on selected Role */}
          {renderDashboardContent()}

          {/* 3. Global Overlays & Modals */}
          
          {/* Project create/edit overlay modal form */}
          <ProjectFormModal
            isOpen={isFormModalOpen}
            onClose={() => {
              setIsFormModalOpen(false);
              setProjectToEdit(null);
            }}
            onSubmit={handleCreateOrUpdateProject}
            project={projectToEdit}
            team={team}
            classrooms={classrooms}
          />

          {/* Project inspectors detailed sheet drawer */}
          <ProjectDetailDrawer
            project={projectToInspect}
            isOpen={!!projectToInspect}
            onClose={() => setProjectToInspect(null)}
            team={team}
            onToggleTask={handleToggleTask}
            onEdit={openEditModal}
            onDelete={handleDeleteProject}
          />
        </>
      )}
    </div>
  );
}
