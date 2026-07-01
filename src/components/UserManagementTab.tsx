import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  UserCheck, 
  UserX, 
  Search, 
  UserPlus, 
  Shield, 
  GraduationCap, 
  Clock, 
  Building2, 
  Check, 
  Edit, 
  Trash2,
  Mail,
  User as UserIcon,
  Sparkles,
  RefreshCw,
  Send,
  Copy,
  Link
} from 'lucide-react';
import { AppUser, UserRole, Invitation } from '../types';

interface UserManagementTabProps {
  users: AppUser[];
  invitations: Invitation[];
  onUpdateUser: (updatedUser: AppUser) => void;
  onDeleteUser: (userId: string) => void;
  onAddUser: (newUser: AppUser) => void;
  onRefreshUsers: () => void;
  classrooms: string[];
}

export default function UserManagementTab({ 
  users, 
  invitations,
  onUpdateUser, 
  onDeleteUser, 
  onAddUser,
  onRefreshUsers,
  classrooms
}: UserManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  // Invitation states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('alumno');
  const [inviteClassroom, setInviteClassroom] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for manual registration simulation
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('pending');
  const [newClassroom, setNewClassroom] = useState('');

  // Editing state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('pending');
  const [editClassroom, setEditClassroom] = useState('');

  // Stats
  const totalUsers = users.length;
  const pendingUsersCount = users.filter(u => u.role === 'pending').length;
  const teachersCount = users.filter(u => u.role === 'profesor').length;
  const studentsCount = users.filter(u => u.role === 'alumno').length;

  const handleCreateInvitation = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inviteEmail.trim()) return;
      await addDoc(collection(db, 'invitations'), {
          email: inviteEmail.toLowerCase(),
          role: inviteRole,
          classroomId: inviteRole !== 'pending' && inviteClassroom ? inviteClassroom : null,
          createdAt: new Date().toISOString()
      });
      setInviteEmail('');
      setInviteRole('alumno');
      setInviteClassroom('');
      alert(`Invitación creada para ${inviteEmail}`);
  };

  const handleDeleteInvitation = async (id: string) => {
      await deleteDoc(doc(db, 'invitations', id));
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      alert('Por favor completa los campos de nombre y correo.');
      return;
    }

    const initials = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';
    const colors = [
      'bg-red-500 text-white', 
      'bg-blue-500 text-white', 
      'bg-green-500 text-white', 
      'bg-amber-500 text-white', 
      'bg-purple-500 text-white', 
      'bg-pink-500 text-white', 
      'bg-indigo-500 text-white'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const rolesList = newRole === 'admin' 
      ? ['admin', 'profesor', 'alumno'] as UserRole[]
      : newRole === 'profesor'
        ? ['profesor'] as UserRole[]
        : [newRole] as UserRole[];

    const newUser: AppUser = {
      id: `u-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      roles: rolesList,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newName)}`,
      initials,
      color: randomColor,
      classroom: newRole !== 'pending' && newClassroom ? newClassroom : undefined,
      joinedAt: new Date().toISOString().split('T')[0]
    };

    onAddUser(newUser);
    
    // Reset form
    setNewName('');
    setNewEmail('');
    setNewRole('pending');
    setNewClassroom('');
    setIsAddingUser(false);
  };

  const startEditing = (user: AppUser) => {
    setEditingUserId(user.id);
    setEditRole(user.role);
    setEditClassroom(user.classroom || '');
  };

  const saveEdit = (user: AppUser) => {
    const rolesList = editRole === 'admin' 
      ? ['admin', 'profesor', 'alumno'] as UserRole[]
      : editRole === 'profesor'
        ? ['profesor'] as UserRole[]
        : [editRole] as UserRole[];

    onUpdateUser({
      ...user,
      role: editRole,
      roles: rolesList,
      classroom: editRole !== 'pending' && editClassroom.trim() ? editClassroom : undefined
    });
    setEditingUserId(null);
  };

  return (
    <div className="space-y-6" id="user-management-tab-container">
      
      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Total */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
            <UserIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">Usuarios Totales</span>
            <span className="text-2xl font-extrabold text-zinc-900 font-mono">{totalUsers}</span>
          </div>
        </div>

        {/* Stat 2: Pendientes */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-xs relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">Esperando Asignación</span>
            <span className="text-2xl font-extrabold text-amber-600 font-mono">{pendingUsersCount}</span>
          </div>
          {pendingUsersCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
        </div>

        {/* Stat 3: Profesores */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">Profesores Activos</span>
            <span className="text-2xl font-extrabold text-indigo-600 font-mono">{teachersCount}</span>
          </div>
        </div>

        {/* Stat 4: Alumnos */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">Alumnos Asignados</span>
            <span className="text-2xl font-extrabold text-emerald-600 font-mono">{studentsCount}</span>
          </div>
        </div>

      </div>

      {/* Action header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
        
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-zinc-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider hidden md:inline">Rol:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer text-zinc-700"
            >
              <option value="all">Todos los Roles</option>
              <option value="pending">⏳ Pendiente (Sin asignar)</option>
              <option value="profesor">🎓 Profesor</option>
              <option value="alumno">✏️ Alumno</option>
              <option value="admin">🔑 Administrador</option>
            </select>
          </div>
        </div>

        {/* Add simulation user button */}
        <div className="flex gap-2">
          <button
            onClick={onRefreshUsers}
            className="flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Recargar Usuarios</span>
          </button>
          <button
            onClick={() => setIsAddingUser(!isAddingUser)}
            className="flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>Simular Login de Nuevo Usuario</span>
          </button>
        </div>

      </div>

      {/* Manual user signup simulation form overlay */}
      {isAddingUser && (
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-6 shadow-xs animate-fadeIn mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Simulador de Registro / Acceso Directo</span>
              </h3>
              <p className="text-xs text-amber-700 mt-1">
                Registra un nuevo usuario en la base de datos simulando un login por primera vez. Quedará en el espacio de espera (o rol que elijas) para que pruebes los diferentes dashboards.
              </p>
            </div>
            <button 
              onClick={() => setIsAddingUser(false)}
              className="text-amber-800 hover:bg-amber-100 p-1 rounded-lg text-xs font-bold cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          <form onSubmit={handleRegisterUser} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Nombre Completo</label>
              <input 
                type="text"
                placeholder="Ej. Lucas Gómez"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Correo Electrónico</label>
              <input 
                type="email"
                placeholder="Ej. lucas@colegio.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Estado de Registro</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="pending">⏳ Pendiente (Sin Rol ni Aula asignada)</option>
                <option value="alumno">✏️ Alumno (Asignación Directa)</option>
                <option value="profesor">🎓 Profesor (Asignación Directa)</option>
              </select>
            </div>

            <div className="flex gap-2">
              {newRole !== 'pending' ? (
                <div className="flex-1 font-sans">
                  <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Aula</label>
                  <select 
                    value={newClassroom}
                    onChange={(e) => setNewClassroom(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-sans font-semibold"
                  >
                    <option value="">-- Seleccionar Aula --</option>
                    {classrooms.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              ) : null}
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex-1 cursor-pointer transition-all shrink-0"
              >
                Crear Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invitations Section */}
      <div className="bg-sky-50/50 border border-sky-200/80 rounded-2xl p-6 shadow-xs animate-fadeIn mb-6">
          <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-sky-900 flex items-center gap-2">
                    <Send className="h-4 w-4 text-sky-500" />
                    <span>Sistema de Invitaciones</span>
                </h3>
                <p className="text-xs text-sky-700 mt-1">
                    Genera invitaciones para que los usuarios se registren automáticamente con el rol y aula predefinidos.
                </p>
              </div>
          </div>

          <form onSubmit={handleCreateInvitation} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end mb-6">
            <div>
              <label className="block text-[11px] font-bold text-sky-800 uppercase tracking-wider mb-1">Correo a invitar</label>
              <input 
                type="email"
                placeholder="Ej. alumno@correo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-sky-800 uppercase tracking-wider mb-1">Rol</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="alumno">✏️ Alumno</option>
                <option value="profesor">🎓 Profesor</option>
                <option value="admin">🔑 Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-sky-800 uppercase tracking-wider mb-1">Aula</label>
              <select 
                value={inviteClassroom}
                onChange={(e) => setInviteClassroom(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer font-sans font-semibold"
              >
                <option value="">-- Sin Aula --</option>
                {classrooms.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all shrink-0"
              >
                Generar Invitación
            </button>
          </form>

          <div className="border-t border-sky-200 pt-4">
              <h4 className="text-xs font-bold text-sky-800 mb-2">Invitaciones Pendientes ({invitations.length})</h4>
              <div className="space-y-2">
                  {invitations.map(inv => {
                      const link = `${window.location.origin}?invite=${inv.id}`;
                      const isCopied = copiedId === inv.id;
                      return (
                          <div key={inv.id} className="bg-white border border-sky-100 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <div>
                                  <span className="font-bold text-sky-900">{inv.email}</span>
                                  <span className="text-sky-600 mx-2 hidden sm:inline">|</span>
                                  <span className="text-sky-700 capitalize font-medium">{inv.role}</span>
                                  {inv.classroomId && <span className="text-sky-700 font-bold ml-2">({inv.classroomId})</span>}
                                  <span className="text-[10px] text-zinc-400 block font-mono truncate max-w-xs sm:max-w-md mt-0.5" title={link}>
                                      {link}
                                  </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                  <button 
                                      onClick={() => {
                                          navigator.clipboard.writeText(link);
                                          setCopiedId(inv.id);
                                          setTimeout(() => setCopiedId(null), 2000);
                                      }}
                                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                                          isCopied 
                                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                              : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                                      }`}
                                      title="Copiar enlace de invitación"
                                  >
                                      {isCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                      <span>{isCopied ? 'Copiado' : 'Copiar Enlace'}</span>
                                  </button>
                                  <button 
                                      onClick={() => handleDeleteInvitation(inv.id)} 
                                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Eliminar invitación"
                                  >
                                      <Trash2 className="h-4 w-4" />
                                  </button>
                              </div>
                          </div>
                      );
                  })}
              </div>

              {/* Fast Classroom Links */}
              <div className="mt-5 pt-4 border-t border-sky-200/60">
                  <h4 className="text-xs font-bold text-sky-800 mb-2 flex items-center gap-1.5">
                      <Link className="h-3.5 w-3.5 text-sky-500" />
                      <span>Enlaces de Registro Directo para Alumnos (Moodle / Correo)</span>
                  </h4>
                  <p className="text-[11px] text-sky-700 mb-3">
                      Copia estos enlaces para publicarlos en tu aula Moodle o enviarlos por correo masivo. Cualquier alumno que acceda mediante estos enlaces será asignado automáticamente con el rol de <strong className="font-bold">Alumno</strong> en el aula correspondiente.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {classrooms.map(c => {
                          const link = `${window.location.origin}?aula=${c}`;
                          const isCopied = copiedId === `aula-${c}`;
                          return (
                              <div key={c} className="bg-white border border-sky-100 rounded-xl p-3 flex items-center justify-between text-xs shadow-xs">
                                  <div className="min-w-0 flex-1 mr-2">
                                      <span className="font-extrabold text-zinc-800 flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                          <span>Aula {c}</span>
                                      </span>
                                      <span className="text-[10px] text-zinc-400 font-mono block truncate mt-0.5" title={link}>{link}</span>
                                  </div>
                                  <button 
                                      onClick={() => {
                                          navigator.clipboard.writeText(link);
                                          setCopiedId(`aula-${c}`);
                                          setTimeout(() => setCopiedId(null), 2000);
                                      }}
                                      className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                                          isCopied 
                                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                              : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700'
                                      }`}
                                  >
                                      {isCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                      <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                                  </button>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/70 border-b border-zinc-150">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Usuario / Correo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Fecha Alta</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Perfil (Rol)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Aula Asignada</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-xs text-zinc-400 font-medium">
                    No se encontraron usuarios con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isEditing = editingUserId === user.id;
                  
                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                      
                      {/* Avatar + name + email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={user.name} 
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                              onError={(e) => {
                                // fallback to initials
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border border-zinc-200/50 ${user.color}`} style={{ display: user.avatarUrl ? 'none' : 'flex' }}>
                            {user.initials}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-zinc-900 block">{user.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono block">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="px-6 py-4 text-xs font-medium text-zinc-500 font-mono">
                        {user.joinedAt}
                      </td>

                      {/* Profile / Role */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as UserRole)}
                            className="px-2 py-1 bg-white border border-zinc-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-zinc-900 focus:outline-none cursor-pointer"
                          >
                            <option value="pending">⏳ Pendiente</option>
                            <option value="alumno">✏️ Alumno</option>
                            <option value="profesor">🎓 Profesor</option>
                            <option value="admin">🔑 Administrador</option>
                          </select>
                        ) : (
                          <div className="flex items-center">
                            {user.role === 'admin' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 shadow-2xs">
                                <Shield className="h-3 w-3" />
                                Admin
                              </span>
                            )}
                            {user.role === 'profesor' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 shadow-2xs">
                                <Shield className="h-3 w-3" />
                                Profesor
                              </span>
                            )}
                            {user.role === 'alumno' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                                <GraduationCap className="h-3 w-3" />
                                Alumno
                              </span>
                            )}
                            {user.role === 'pending' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 animate-pulse shadow-2xs">
                                <Clock className="h-3 w-3" />
                                Sin asignar
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Classroom (Aula) */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          editRole !== 'pending' ? (
                            <select 
                              value={editClassroom}
                              onChange={(e) => setEditClassroom(e.target.value)}
                              className="px-2 py-1 bg-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-800 focus:ring-1 focus:ring-zinc-900 focus:outline-none cursor-pointer"
                            >
                              <option value="">-- Sin Aula --</option>
                              {classrooms.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-[11px] text-zinc-400 italic">No requiere aula</span>
                          )
                        ) : (
                          <div>
                            {user.role === 'pending' ? (
                              <span className="text-zinc-400 text-[11px] italic">Esperando rol...</span>
                            ) : user.classroom ? (
                              <span className="text-xs font-semibold text-zinc-700 bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-200 flex items-center gap-1 w-fit">
                                <Building2 className="h-3 w-3 text-zinc-400 shrink-0" />
                                {user.classroom}
                              </span>
                            ) : (
                              <span className="text-amber-500 text-[11px] font-medium flex items-center gap-1 italic">
                                ⚠️ Sin aula asignada
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(user)}
                                className="p-1 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                                title="Guardar Cambios"
                              >
                                <Check className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="px-1.5 py-1 hover:bg-zinc-100 text-zinc-500 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(user)}
                                className="p-1 hover:bg-zinc-100 text-zinc-600 rounded-lg transition-colors cursor-pointer"
                                title="Asignar Rol y Aula"
                              >
                                <Edit className="h-4.5 w-4.5" />
                              </button>
                              
                              {user.role === 'pending' && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      // Quick approval as Alumno
                                      onUpdateUser({
                                        ...user,
                                        role: 'alumno',
                                        classroom: classrooms[0] || '2HCA'
                                      });
                                    }}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer border border-emerald-100"
                                  >
                                    Asignar Alumno {classrooms[0] ? `(${classrooms[0]})` : ''}
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Quick approval as Profesor
                                      onUpdateUser({
                                        ...user,
                                        role: 'profesor',
                                        classroom: classrooms[0] || '2HCA'
                                      });
                                    }}
                                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer border border-indigo-100"
                                  >
                                    Asignar Profesor {classrooms[0] ? `(${classrooms[0]})` : ''}
                                  </button>
                                </div>
                              )}

                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${user.name}?`)) {
                                      onDeleteUser(user.id);
                                    }
                                  }}
                                  className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar Usuario"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
