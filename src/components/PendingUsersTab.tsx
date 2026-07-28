import React, { useState } from 'react';
import { AppUser, UserRole } from '../types';
import { 
  UserCheck, 
  Shield, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Search, 
  Building2, 
  Mail, 
  UserPlus,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface PendingUsersTabProps {
  users: AppUser[];
  classrooms: string[];
  onUpdateUser: (updatedUser: AppUser) => void;
  onDeleteUser: (userId: string) => void;
  onNavigateToAllUsers?: () => void;
}

export default function PendingUsersTab({
  users,
  classrooms,
  onUpdateUser,
  onDeleteUser,
  onNavigateToAllUsers
}: PendingUsersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAulaMap, setSelectedAulaMap] = useState<Record<string, string>>({});

  const pendingUsers = users.filter(u => u.role === 'pending' || u.status === 'pending' || (u.roles && u.roles.includes('pending')));

  const filteredPending = pendingUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSetAulaForUser = (userId: string, classroom: string) => {
    setSelectedAulaMap(prev => ({ ...prev, [userId]: classroom }));
  };

  const getSelectedAula = (user: AppUser) => {
    return selectedAulaMap[user.id] || user.classroom || classrooms[0] || '2HCA';
  };

  const handleApprove = (user: AppUser, role: UserRole) => {
    const aula = getSelectedAula(user);
    const updated: AppUser = {
      ...user,
      role: role,
      roles: [role],
      classroom: aula,
      status: 'active'
    };
    onUpdateUser(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-2">
            <Clock className="h-3.5 w-3.5 animate-pulse text-amber-200" />
            <span>Control de Accesos y Registro</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
            <span>Solicitudes de Nuevos Usuarios</span>
            <span className="px-2.5 py-0.5 bg-white text-amber-600 rounded-full text-sm font-extrabold shadow-xs">
              {pendingUsers.length}
            </span>
          </h2>
          <p className="text-amber-100 text-xs md:text-sm max-w-2xl">
            Desde aquí puedes revisar, asignar aula y aprobar las nuevas cuentas de alumnos y profesores que se hayan registrado mediante formulario o cuenta de Google.
          </p>
        </div>

        {onNavigateToAllUsers && (
          <button
            onClick={onNavigateToAllUsers}
            className="self-start md:self-auto px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 shrink-0"
          >
            <UserCheck className="h-4 w-4 text-amber-600" />
            <span>Ver Todos los Usuarios Activos</span>
          </button>
        )}
      </div>

      {/* Control & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        <div className="text-xs text-zinc-500 font-medium self-end sm:self-auto">
          Mostrando <strong className="text-zinc-800">{filteredPending.length}</strong> solicitudes pendientes
        </div>
      </div>

      {/* Pending List or Empty State */}
      {filteredPending.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-extrabold text-zinc-900">¡No hay solicitudes pendientes!</h3>
            <p className="text-xs text-zinc-500">
              {searchTerm 
                ? 'No se encontraron resultados para la búsqueda realizada.' 
                : 'Todas las solicitudes de registro han sido procesadas. Los nuevos usuarios que intenten registrarse aparecerán aquí automáticamente.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredPending.map((user) => {
            const currentAula = getSelectedAula(user);
            const activeClassrooms = classrooms.length > 0 ? classrooms : ['2HCA', '2HCB', '2HCC'];

            return (
              <div 
                key={user.id} 
                className="bg-white border-2 border-amber-200/80 hover:border-amber-400 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between gap-4 relative overflow-hidden group"
              >
                {/* Decorative side indicator */}
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500"></div>

                <div className="flex items-start justify-between gap-3 pl-2">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className="w-12 h-12 rounded-2xl object-cover border border-amber-200 shadow-xs bg-amber-50 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0">
                        {user.initials || user.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-sm font-black text-zinc-900 truncate flex items-center gap-2">
                        <span>{user.name}</span>
                        {user.requestedRole && (
                          <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-bold">
                            Pide: {user.requestedRole === 'profesor' ? 'Profesor' : 'Alumno'}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                        <Mail className="h-3 w-3 text-zinc-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </p>
                      <div className="pt-0.5 flex items-center gap-2">
                        <span className="text-[10px] font-mono text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md font-semibold inline-flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          Registrado: {user.joinedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteUser(user.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer shrink-0"
                    title="Rechazar y eliminar solicitud"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Assignment Controls */}
                <div className="pt-3 border-t border-zinc-150 pl-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl">
                  {/* Classroom Selector */}
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-extrabold text-zinc-700">Aula:</span>
                    <select
                      value={currentAula}
                      onChange={(e) => handleSetAulaForUser(user.id, e.target.value)}
                      className="bg-white border border-zinc-300 text-xs font-bold rounded-xl px-3 py-1.5 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
                    >
                      {activeClassrooms.map(c => (
                        <option key={c} value={c}>Aula {c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Approval Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleApprove(user, 'alumno')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Aprobar Alumno</span>
                    </button>

                    <button
                      onClick={() => handleApprove(user, 'profesor')}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      <span>Aprobar Profesor</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
