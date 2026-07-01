import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { auth, googleProvider, db } from './lib/firebase';
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
  PenTool,
  Shield,
  GraduationCap,
  UserCheck,
  Sparkles,
  RefreshCw,
  LogIn,
  Target
} from 'lucide-react';
import { Project, TeamMember, ProjectStatus, AppUser, UserRole, AssessmentTask, StudentGrade, IndividualOralGrade, Announcement, Invitation } from './types';
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
  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('studio_team_v2');
    return saved ? JSON.parse(saved) : INITIAL_TEAM;
  });
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
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  // User Management & Active Session Simulation
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);

  // Modal / Drawer States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditingAdminProfile, setIsEditingAdminProfile] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToInspect, setProjectToInspect] = useState<Project | null>(null);
  
  const [activeTab, setActiveTab] = useState('metrics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Time state for header
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Real-time Firestore Synchronization & Seed Loader
  useEffect(() => {
    // A. Sync Classrooms
    const unsubClassrooms = onSnapshot(collection(db, 'classrooms'), (snapshot) => {
      if (snapshot.empty) {
        const initialClassroomsList = ['2HCA', '2HCB', '2HCC'];
        initialClassroomsList.forEach(async (c) => {
          await setDoc(doc(db, 'classrooms', c), { name: c });
        });
        setClassrooms(initialClassroomsList);
      } else {
        const list: string[] = [];
        snapshot.forEach(doc => list.push(doc.id));
        setClassrooms(list);
      }
    });

    // B. Sync Users
    const unsubUsers = onSnapshot(collection(db, 'users'), async (snapshot) => {
      const list: AppUser[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as AppUser));
      
      const hasAdmin = list.some(u => u.id === 'u-admin' || u.role === 'admin');
      if (!hasAdmin) {
        const defaultAdmin: AppUser = {
          id: 'u-admin',
          name: 'Juan Carlos (Admin)',
          email: 'jcbmisweb@gmail.com',
          role: 'admin',
          roles: ['admin', 'profesor', 'alumno'],
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin',
          initials: 'JC',
          color: 'bg-emerald-600 text-white',
          joinedAt: new Date().toISOString().split('T')[0]
        };
        await setDoc(doc(db, 'users', 'u-admin'), defaultAdmin);
        list.push(defaultAdmin);
      }
      setUsers(list);
    });

    // C. Sync Projects
    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_PROJECTS.forEach(async (p) => {
          await setDoc(doc(db, 'projects', p.id), p);
        });
        setProjects(INITIAL_PROJECTS);
      } else {
        const list: Project[] = [];
        snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as Project));
        setProjects(list);
      }
    });

    // D. Sync Student Grades
    const unsubGrades = onSnapshot(collection(db, 'studentGrades'), (snapshot) => {
      const list: StudentGrade[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as any));
      setStudentGrades(list);
    });

    // E. Sync Individual Oral Grades
    const unsubOral = onSnapshot(collection(db, 'individualOralGrades'), (snapshot) => {
      const list: IndividualOralGrade[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as any));
      setIndividualOralGrades(list);
    });

    // F. Sync Announcements
    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const list: Announcement[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as any));
      setAnnouncements(list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    // H. Sync Invitations
    const unsubInvitations = onSnapshot(collection(db, 'invitations'), (snapshot) => {
      const list: Invitation[] = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id } as any));
      setInvitations(list);
    });

    // G. Sync Platform Configuration (IES name, logo, maximums, weights)
    const unsubConfig = onSnapshot(doc(db, 'config', 'ies'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.iesName) setIesName(data.iesName);
        if (data.iesLogo) setIesLogo(data.iesLogo);
        if (data.maxCoevaluationImpact !== undefined) setMaxCoevaluationImpact(data.maxCoevaluationImpact);
        if (data.maxTeamScore !== undefined) setMaxTeamScore(data.maxTeamScore);
        if (data.maxExpositionScore !== undefined) setMaxExpositionScore(data.maxExpositionScore);
        if (data.maxCoevalAdjustment !== undefined) setMaxCoevalAdjustment(data.maxCoevalAdjustment);
      } else {
        // Seed default config
        setDoc(doc(db, 'config', 'ies'), {
          iesName: 'IES Sostenible',
          iesLogo: '',
          maxCoevaluationImpact: 1.0,
          maxTeamScore: 6.0,
          maxExpositionScore: 3.0,
          maxCoevalAdjustment: 1.0
        });
      }
    });

    return () => {
      unsubClassrooms();
      unsubUsers();
      unsubProjects();
      unsubGrades();
      unsubOral();
      unsubAnnouncements();
      unsubInvitations();
      unsubConfig();
    };
  }, []);

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Synchronize Google authenticated firebaseUser with live application users
  useEffect(() => {
    const syncUser = async () => {
      // If user logged out, clear local storage and current user
      if (!firebaseUser) {
        localStorage.removeItem('studio_current_user_id_v2');
        setCurrentUser(null);
        setActiveRole('alumno');
        return;
      }
      
      const emailLower = (firebaseUser.email || '').toLowerCase();
      const isSuperAdmin = emailLower === 'jcbprofesor@gmail.com' || emailLower === 'jcbmisweb@gmail.com' || emailLower.includes('murciaeduca');
      
      // Parse URL parameters for direct boarding
      const searchParams = new URLSearchParams(window.location.search);
      const inviteId = searchParams.get('invite');
      const aulaCode = searchParams.get('aula');

      if (inviteId) {
        try {
          const invSnap = await getDoc(doc(db, 'invitations', inviteId));
          if (invSnap.exists()) {
            const invData = invSnap.data();
            const initials = firebaseUser.displayName 
              ? firebaseUser.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
              : emailLower.slice(0, 2).toUpperCase();
            
            // Check if user already exists in db
            const existingQ = query(collection(db, 'users'), where('email', '==', emailLower));
            const existingSnap = await getDocs(existingQ);
            let userToSave: AppUser;
            if (!existingSnap.empty) {
              const prevUser = existingSnap.docs[0].data() as AppUser;
              userToSave = {
                ...prevUser,
                role: invData.role,
                roles: Array.from(new Set([...(prevUser.roles || []), invData.role])),
                classroom: invData.classroomId || prevUser.classroom || ''
              };
            } else {
              userToSave = {
                id: `u-${Date.now()}`,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario Invitado',
                email: emailLower,
                role: invData.role,
                roles: [invData.role],
                avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(emailLower)}`,
                initials: initials,
                color: invData.role === 'admin' ? 'bg-emerald-600 text-white' : 'bg-zinc-600 text-white',
                joinedAt: new Date().toISOString().split('T')[0],
                classroom: invData.classroomId || ''
              };
            }

            await setDoc(doc(db, 'users', userToSave.id), userToSave);
            await deleteDoc(doc(db, 'invitations', inviteId));
            
            // Clear URL params
            window.history.replaceState({}, document.title, window.location.pathname);
            
            setCurrentUser(userToSave);
            setActiveRole(userToSave.role);
            localStorage.setItem('studio_current_user_id_v2', userToSave.id);
            return;
          }
        } catch (err) {
          console.error("Error applying direct invitation link:", err);
        }
      } else if (aulaCode) {
        try {
          const cleanCode = aulaCode.trim().toUpperCase();
          const classroomsList = classrooms.length > 0 ? classrooms : ['2HCA', '2HCB', '2HCC'];
          const matchedClass = classroomsList.find(c => c.toUpperCase() === cleanCode);
          if (matchedClass) {
            const initials = firebaseUser.displayName 
              ? firebaseUser.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
              : emailLower.slice(0, 2).toUpperCase();

            const existingQ = query(collection(db, 'users'), where('email', '==', emailLower));
            const existingSnap = await getDocs(existingQ);
            let userToSave: AppUser;
            if (!existingSnap.empty) {
              const prevUser = existingSnap.docs[0].data() as AppUser;
              userToSave = {
                ...prevUser,
                role: 'alumno',
                roles: Array.from(new Set([...(prevUser.roles || []), 'alumno'])),
                classroom: matchedClass
              };
            } else {
              userToSave = {
                id: `u-${Date.now()}`,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Estudiante',
                email: emailLower,
                role: 'alumno',
                roles: ['alumno'],
                avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(emailLower)}`,
                initials: initials,
                color: 'bg-zinc-600 text-white',
                joinedAt: new Date().toISOString().split('T')[0],
                classroom: matchedClass
              };
            }

            await setDoc(doc(db, 'users', userToSave.id), userToSave);
            
            // Clear URL params
            window.history.replaceState({}, document.title, window.location.pathname);
            
            setCurrentUser(userToSave);
            setActiveRole('alumno');
            localStorage.setItem('studio_current_user_id_v2', userToSave.id);
            return;
          }
        } catch (err) {
          console.error("Error joining classroom via direct link:", err);
        }
      }

      // Try finding user in current state (populated by onSnapshot)
      let matched = users.find(u => u.email.toLowerCase() === emailLower);
      
      // If not in state, check Firestore directly
      if (!matched) {
        // Check invitations first
        const inv = invitations.find(i => i.email.toLowerCase() === emailLower);
        if (inv) {
            // Invitation found, create user
            const newUser: AppUser = {
              id: `u-${Date.now()}`,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Nuevo Usuario',
              email: emailLower,
              role: inv.role,
              roles: [inv.role],
              avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(emailLower)}`,
              initials: firebaseUser.displayName 
                  ? firebaseUser.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
                  : emailLower.slice(0, 2).toUpperCase(),
              color: inv.role === 'admin' ? 'bg-emerald-600 text-white' : 'bg-zinc-600 text-white',
              joinedAt: new Date().toISOString().split('T')[0],
              classroom: inv.classroomId
            };
            await setDoc(doc(db, 'users', newUser.id), newUser);
            await deleteDoc(doc(db, 'invitations', inv.id));
            matched = newUser;
        } else {
            // No invitation, continue with normal logic
            const q = query(collection(db, 'users'), where('email', '==', emailLower));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              matched = querySnapshot.docs[0].data() as AppUser;
            }
        }
      }
      
      if (matched) {
        // If matched user exists but does not have super admin roles when they are a superadmin, upgrade them
        if (isSuperAdmin && (!matched.roles.includes('admin') || matched.role !== 'admin')) {
          const updatedUser = {
            ...matched,
            role: 'admin',
            roles: Array.from(new Set([...(matched.roles || []), 'admin', 'profesor', 'alumno'])),
            color: 'bg-emerald-600 text-white'
          };
          await setDoc(doc(db, 'users', matched.id), updatedUser);
          matched = updatedUser;
        }
        
        // User already exists
        setCurrentUser(matched);
        setActiveRole(matched.role);
        localStorage.setItem('studio_current_user_id_v2', matched.id);
      } else {
        // No match and no invitation, perhaps auto-create as student? Or do nothing?
        // User not found, create them!
        const initials = firebaseUser.displayName 
          ? firebaseUser.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
          : emailLower.slice(0, 2).toUpperCase();
        
        const newUser: AppUser = {
          id: `u-${Date.now()}`,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Nuevo Usuario',
          email: emailLower,
          role: isSuperAdmin ? 'admin' : 'pending',
          roles: isSuperAdmin ? ['admin', 'profesor', 'alumno'] : ['pending'],
          avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(emailLower)}`,
          initials: initials,
          color: isSuperAdmin ? 'bg-emerald-600 text-white' : 'bg-zinc-600 text-white',
          joinedAt: new Date().toISOString().split('T')[0]
        };
        
        await setDoc(doc(db, 'users', newUser.id), newUser);
        // Note: onSnapshot will catch this and update state automatically
      }
    };
    
    syncUser();
  }, [firebaseUser, users, invitations, classrooms]);

  // Project inspect syncer
  useEffect(() => {
    if (projectToInspect && projects.length > 0) {
      const refreshed = projects.find(p => p.id === projectToInspect.id);
      if (refreshed) {
        setProjectToInspect(refreshed);
      }
    }
  }, [projects, projectToInspect]);

  const saveProjects = async (updated: Project[]) => {
    for (const p of updated) {
      await setDoc(doc(db, 'projects', p.id), p);
    }
  };

  const saveTeam = (updated: TeamMember[]) => {
    setTeam(updated);
    localStorage.setItem('studio_team_v2', JSON.stringify(updated));
  };

  const handleSwitchSession = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      setActiveRole(targetUser.role);
      localStorage.setItem('studio_current_user_id_v2', userId);
    }
  };

  const handleChangeRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  };

  const handleUpdateUser = async (updatedUser: AppUser) => {
    await setDoc(doc(db, 'users', updatedUser.id), updatedUser);
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteDoc(doc(db, 'users', userId));
    if (currentUser?.id === userId) {
      handleSwitchSession('u-admin');
    }
  };

  const handleAddUser = async (newUser: AppUser) => {
    await setDoc(doc(db, 'users', newUser.id), newUser);
  };

  const handleRefreshUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    const list: AppUser[] = [];
    snapshot.forEach(d => list.push(d.data() as AppUser));
    setUsers(list);
  };

  const handleCreateClassroom = async (name: string) => {
    await setDoc(doc(db, 'classrooms', name), { name });
  };

  const handleDeleteClassroom = async (name: string) => {
    await deleteDoc(doc(db, 'classrooms', name));
    
    // Clear classroom from users
    const usersToUpdate = users.filter(u => u.classroom === name);
    for (const u of usersToUpdate) {
      await setDoc(doc(db, 'users', u.id), { ...u, classroom: undefined });
    }

    // Clear classroom from projects
    const updatedProjects = projects.map(p => p.classroom === name ? { ...p, classroom: undefined } : p);
    saveProjects(updatedProjects);
  };

  const handleUpdateGrade = async (studentId: string, taskId: string, score: number) => {
    const docId = `${studentId}_${taskId}`;
    const existing = studentGrades.find(g => g.studentId === studentId && g.taskId === taskId);
    const isDelivered = existing ? existing.isDelivered : true;
    await setDoc(doc(db, 'studentGrades', docId), { studentId, taskId, score, isDelivered });
  };

  const handleToggleDelivery = async (studentId: string, taskId: string, isDelivered: boolean) => {
    const docId = `${studentId}_${taskId}`;
    const existing = studentGrades.find(g => g.studentId === studentId && g.taskId === taskId);
    const score = existing ? existing.score : 0;
    await setDoc(doc(db, 'studentGrades', docId), { studentId, taskId, score, isDelivered });
  };

  const handleUpdateIndividualOralGrade = async (studentId: string, updated: Partial<IndividualOralGrade>) => {
    const existing = individualOralGrades.find(g => g.studentId === studentId);
    const base = existing || {
      studentId,
      teamGrade: 5.0,
      expositionGrade: 5.0,
      coevalItem1: 'neutral',
      coevalItem2: 'neutral',
      justification: '',
      presented: true
    };
    const newGrade = { ...base, ...updated };
    await setDoc(doc(db, 'individualOralGrades', studentId), newGrade);
  };

  const handleUpdateOralGradeConfig = async (maxTeam: number, maxExposition: number, maxCoeval: number) => {
    setMaxTeamScore(maxTeam);
    setMaxExpositionScore(maxExposition);
    setMaxCoevalAdjustment(maxCoeval);
    await setDoc(doc(db, 'config', 'ies'), {
      maxTeamScore: maxTeam,
      maxExpositionScore: maxExposition,
      maxCoevalAdjustment: maxCoeval
    }, { merge: true });
  };

  const handleUpdateTaskWeights = async (weights: { [taskId: string]: number }) => {
    const updatedTasks = assessmentTasks.map(task => ({
      ...task,
      weight: weights[task.id] !== undefined ? weights[task.id] : (task.weight ?? 0.0)
    }));
    setAssessmentTasks(updatedTasks);
    await setDoc(doc(db, 'config', 'ies'), { assessmentTasks: updatedTasks }, { merge: true });
  };

  const handleAddAssessmentTask = async () => {
    const newTask: AssessmentTask = {
      id: `at${Date.now()}`,
      title: 'Nueva Tarea Evaluable',
      criterionIds: ['1a'],
      weight: 1.0
    };
    const updatedTasks = [...assessmentTasks, newTask];
    setAssessmentTasks(updatedTasks);
    await setDoc(doc(db, 'config', 'ies'), { assessmentTasks: updatedTasks }, { merge: true });
  };

  const handlePublishAnnouncement = async (text: string, authorName: string) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      text,
      date: new Date().toISOString().split('T')[0],
      author: authorName,
      readByStudentIds: []
    };
    await setDoc(doc(db, 'announcements', newAnn.id), newAnn);
  };

  const handleToggleReadAnnouncement = async (annId: string, studentId: string) => {
    const ann = announcements.find(a => a.id === annId);
    if (ann) {
      const reads = ann.readByStudentIds || [];
      const alreadyRead = reads.includes(studentId);
      const updatedReads = alreadyRead 
        ? reads.filter(id => id !== studentId) 
        : [...reads, studentId];
      await setDoc(doc(db, 'announcements', annId), { ...ann, readByStudentIds: updatedReads });
    }
  };

  const handleUpdateIesSettings = async (name: string, logo: string) => {
    setIesName(name);
    setIesLogo(logo);
    await setDoc(doc(db, 'config', 'ies'), { iesName: name, iesLogo: logo }, { merge: true });
  };

  const handleUpdateCoevaluationImpact = async (impact: number) => {
    setMaxCoevaluationImpact(impact);
    await setDoc(doc(db, 'config', 'ies'), { maxCoevaluationImpact: impact }, { merge: true });
  };

  const handleCreateOrUpdateProject = async (projectData: Partial<Project>) => {
    if (projectData.id) {
      const existing = projects.find(p => p.id === projectData.id);
      if (existing) {
        const updated = { ...existing, ...projectData, lastUpdated: new Date().toISOString() } as Project;
        await setDoc(doc(db, 'projects', updated.id), updated);
      }
    } else {
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
      await setDoc(doc(db, 'projects', newProject.id), newProject);
    }
    setProjectToEdit(null);
    setIsFormModalOpen(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto de forma permanente?')) {
      await deleteDoc(doc(db, 'projects', projectId));
      if (projectToInspect?.id === projectId) {
        setProjectToInspect(null);
      }
    }
  };

  const handleToggleTask = async (projectId: string, taskId: string) => {
    const p = projects.find(proj => proj.id === projectId);
    if (p) {
      const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const progress = updatedTasks.length > 0 
        ? Math.round((completedCount / updatedTasks.length) * 100) 
        : p.progress;

      let status = p.status;
      if (progress === 100 && p.status !== 'completed') {
        status = 'completed';
      } else if (progress < 100 && p.status === 'completed') {
        status = 'active';
      }

      const updated = {
        ...p,
        tasks: updatedTasks,
        progress,
        status,
        lastUpdated: new Date().toISOString()
      };
      await setDoc(doc(db, 'projects', projectId), updated);
    }
  };

  const handleUpdateUserProfile = async (userId: string, newName: string, newAvatarUrl: string) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate) {
      const updatedUser = { ...userToUpdate, name: newName, avatarUrl: newAvatarUrl };
      const initials = newName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      updatedUser.initials = initials;
      await handleUpdateUser(updatedUser);
    }
  };

  const handleJoinProject = async (projectId: string, studentId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      if (!project.team.includes(studentId)) {
        const updatedTeam = [...project.team, studentId];
        const gastState = project.gastronomicState || {
          restaurantName: '',
          locationArea: 'No seleccionada',
          conceptDescription: '',
          marketStudy: '',
          isOpen: true,
          modoEdicion: true,
          dishes: [],
          roles: {
            projectManager: '',
            marketingDirector: '',
            operationsManager: '',
            financialOfficer: '',
            chef: ''
          }
        };
        await setDoc(doc(db, 'projects', projectId), {
          ...project,
          team: updatedTeam,
          gastronomicState: gastState,
          lastUpdated: new Date().toISOString()
        });
      }
    }
  };

  const handleLeaveProject = async (projectId: string, studentId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedTeam = project.team.filter(id => id !== studentId);
      let gastState = project.gastronomicState;
      if (gastState) {
        const roles = { ...gastState.roles };
        if (roles.projectManager === studentId) roles.projectManager = '';
        if (roles.marketingDirector === studentId) roles.marketingDirector = '';
        if (roles.operationsManager === studentId) roles.operationsManager = '';
        if (roles.financialOfficer === studentId) roles.financialOfficer = '';
        if (roles.chef === studentId) roles.chef = '';
        
        const isOpen = updatedTeam.length === 0 ? true : gastState.isOpen;
        
        gastState = {
          ...gastState,
          isOpen,
          roles
        };
      }
      await setDoc(doc(db, 'projects', projectId), {
        ...project,
        team: updatedTeam,
        status: updatedTeam.length === 0 ? 'planning' : project.status,
        gastronomicState: gastState,
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const handleCloseTeam = async (projectId: string, coordinatorId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      let gastState = project.gastronomicState || {
        restaurantName: '',
        locationArea: 'No seleccionada',
        conceptDescription: '',
        marketStudy: '',
        isOpen: true,
        modoEdicion: true,
        dishes: [],
        roles: {
          projectManager: '',
          marketingDirector: '',
          operationsManager: '',
          financialOfficer: '',
          chef: ''
        }
      };
      
      gastState = {
        ...gastState,
        isOpen: false,
        roles: {
          ...gastState.roles,
          projectManager: coordinatorId
        }
      };

      await setDoc(doc(db, 'projects', projectId), {
        ...project,
        status: 'active',
        gastronomicState: gastState,
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const handleUpdateProjectGastronomicState = async (projectId: string, gastronomicState: any) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      await setDoc(doc(db, 'projects', projectId), {
        ...project,
        gastronomicState,
        lastUpdated: new Date().toISOString()
      });
    }
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
    setUsers([]);
    setClassrooms(['2HCA', '2HCB', '2HCC']);
    setIesName('IES Sostenible');
    setIesLogo('');
    setStudentGrades([]);
    setIndividualOralGrades([]);
    setAnnouncements([]);
    localStorage.setItem('studio_projects_v2', JSON.stringify(INITIAL_PROJECTS));
    localStorage.setItem('studio_team_v2', JSON.stringify(INITIAL_TEAM));
    localStorage.setItem('studio_users_v2', JSON.stringify([]));
    localStorage.setItem('studio_classrooms_v2', JSON.stringify(['2HCA', '2HCB', '2HCC']));
    localStorage.setItem('studio_ies_name_v2', 'IES Sostenible');
    localStorage.setItem('studio_ies_logo_v2', '');
    localStorage.setItem('studio_student_grades_v2', JSON.stringify([]));
    localStorage.setItem('studio_individual_oral_grades_v2', JSON.stringify([]));
    localStorage.setItem('studio_announcements_v2', JSON.stringify([]));
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
          classrooms={classrooms}
          onJoinClassroomByCode={async (code) => {
            if (currentUser) {
              const updatedUser: AppUser = {
                ...currentUser,
                role: 'alumno',
                roles: ['alumno'],
                classroom: code
              };
              await handleUpdateUser(updatedUser);
              setActiveRole('alumno');
            }
          }}
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
          onUpdateUserProfile={handleUpdateUserProfile}
          onUpdateProjectGastronomicState={handleUpdateProjectGastronomicState}
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
          onUpdateUserProfile={handleUpdateUserProfile}
          onJoinProject={handleJoinProject}
          onLeaveProject={handleLeaveProject}
          onCloseTeam={handleCloseTeam}
          onUpdateProjectGastronomicState={handleUpdateProjectGastronomicState}
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
            <div 
              onClick={() => setIsEditingAdminProfile(true)}
              className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-zinc-200/60 shadow-xs hover:border-zinc-300 hover:shadow-sm cursor-pointer transition-all group"
              title="Haz clic para modificar tu nombre o cambiar tu foto"
            >
              {currentUser?.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-full object-cover shadow-inner shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
                  {currentUser?.initials || 'JC'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-zinc-900 group-hover:text-emerald-700 transition-colors block truncate">{currentUser?.name}</span>
                <span className="text-[10px] text-zinc-400 font-medium block truncate">Administrador Principal</span>
              </div>
              <PenTool className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0" />
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
                invitations={invitations}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onAddUser={handleAddUser}
                onRefreshUsers={handleRefreshUsers}
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
                onUpdateUser={handleUpdateUser}
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

  const googleLinkedUser = firebaseUser 
    ? users.find(u => u.email?.toLowerCase() === firebaseUser.email?.toLowerCase()) 
    : null;

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
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* If the logged-in Google user is an admin, always show the user simulation dropdown so they can switch between different users */}
              {googleLinkedUser?.roles.includes('admin') && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-medium text-[11px]">Simular Usuario:</span>
                  <select 
                    value={currentUser?.id || ''} 
                    onChange={(e) => handleSwitchSession(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-600 font-sans"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="bg-zinc-900 text-white font-medium">
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Show the roles of the currently active user as beautiful, clickable buttons (pills) */}
              {currentUser && (currentUser.roles || []).length > 0 && (
                <div className="flex items-center gap-1.5 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/80">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider px-2">Perfiles:</span>
                  {currentUser.roles.map((r) => {
                    const isActive = activeRole === r;
                    const label = r === 'admin' ? 'Administrador' : r === 'profesor' ? 'Profesor' : r === 'alumno' ? 'Alumno' : r;
                    const activeBg = r === 'admin' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : r === 'profesor' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-teal-600 text-white shadow-sm';
                    return (
                      <button
                        key={r}
                        onClick={() => handleChangeRole(r)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          isActive 
                            ? `${activeBg} font-extrabold` 
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              <button 
                onClick={handleLogout} 
                className="text-zinc-400 hover:text-white transition-colors text-xs font-bold border-l border-zinc-700 pl-3 ml-1"
              >
                Cerrar sesión
              </button>
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

          {/* Admin Profile Edit Modal */}
          {isEditingAdminProfile && currentUser && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-6 py-5 border-b border-zinc-150 bg-zinc-50 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Editar Perfil de Administrador</h3>
                  <button 
                    onClick={() => setIsEditingAdminProfile(false)}
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
                      await handleUpdateUserProfile(currentUser.id, name.trim(), avatarUrl.trim());
                      setIsEditingAdminProfile(false);
                    }
                  }}
                  className="p-6 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                    <input 
                      type="text" 
                      name="name" 
                      defaultValue={currentUser.name}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-250 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white shadow-xs"
                      placeholder="Ej. Juan Carlos"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5">URL de Foto de Perfil (Avatar)</label>
                    <input 
                      type="url" 
                      name="avatarUrl" 
                      defaultValue={currentUser.avatarUrl || ''}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-250 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white shadow-xs"
                      placeholder="https://ejemplo.com/foto.jpg"
                    />
                    <span className="text-[10px] text-zinc-400 mt-1 block">Deja vacío para usar iniciales.</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2.5">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingAdminProfile(false)}
                      className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
