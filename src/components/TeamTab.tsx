import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TeamMember, Project } from '../types';
import { Users, Mail, Shield, Plus, X, Trash2, Layers, Briefcase } from 'lucide-react';

interface TeamTabProps {
  team: TeamMember[];
  projects: Project[];
  onAddMember: (member: TeamMember) => void;
  onRemoveMember: (memberId: string) => void;
}

export default function TeamTab({ team, projects, onAddMember, onRemoveMember }: TeamTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [colorAccent, setColorAccent] = useState('bg-blue-500 text-white');

  // Available colors for team initials avatar
  const COLOR_OPTIONS = [
    { name: 'Azul', value: 'bg-blue-500 text-white' },
    { name: 'Verde', value: 'bg-emerald-500 text-white' },
    { name: 'Naranja', value: 'bg-amber-500 text-white' },
    { name: 'Morado', value: 'bg-purple-500 text-white' },
    { name: 'Rosa', value: 'bg-pink-500 text-white' },
    { name: 'Cian', value: 'bg-cyan-500 text-white' }
  ];

  // Calculate projects count per team member
  const getProjectsForMember = (memberId: string) => {
    return projects.filter(p => p.team.includes(memberId));
  };

  const getWorkloadLabel = (count: number) => {
    if (count >= 3) return { label: 'Alta', color: 'text-amber-700 bg-amber-50 border-amber-100' };
    if (count > 0) return { label: 'Óptima', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
    return { label: 'Disponible', color: 'text-slate-500 bg-slate-50 border-slate-100' };
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !role.trim()) return;

    // Create initials
    const words = name.trim().split(' ');
    const initials = words.length > 1 
      ? (words[0][0] + words[1][0]).toUpperCase() 
      : words[0].substring(0, 2).toUpperCase();

    const newMember: TeamMember = {
      id: `member_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      initials,
      color: colorAccent
    };

    onAddMember(newMember);
    
    // reset form
    setName('');
    setEmail('');
    setRole('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab top controller */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900">Equipo de Trabajo</h3>
          <p className="text-xs text-zinc-500">Administra los profesionales asignados a los flujos de la plataforma.</p>
        </div>
        
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Registrar Profesional</span>
          </button>
        )}
      </div>

      {/* Registration inline form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
              <span className="text-xs font-bold text-zinc-800">Registrar Nuevo Integrante de Equipo</span>
              <button onClick={() => setShowAddForm(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Andrés Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="Ej. andres@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Rol Organizacional</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Product Designer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Color de Avatar</label>
                <div className="flex flex-wrap gap-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColorAccent(c.value)}
                      className={`w-5 h-5 rounded-full ${c.value.split(' ')[0]} border transition-transform ${
                        colorAccent === c.value ? 'scale-125 border-zinc-950' : 'border-transparent'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="sm:col-span-4 flex justify-end gap-2 pt-2 border-t border-zinc-50">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Agregar Profesional
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team grid rendering */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {team.map((m) => {
            const assignedProjects = getProjectsForMember(m.id);
            const workload = getWorkloadLabel(assignedProjects.length);
            
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-zinc-200/80 p-5 flex flex-col justify-between shadow-xs hover:border-zinc-300 transition-all group"
              >
                {/* Member Identity */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm tracking-wide shrink-0 shadow-xs ${m.color}`}>
                    {m.initials}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="font-semibold text-zinc-900 group-hover:text-emerald-700 transition-colors truncate">
                      {m.name}
                    </h4>
                    <p className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                      <Shield className="h-3 w-3 text-zinc-400" />
                      <span>{m.role}</span>
                    </p>
                    <p className="text-xs text-zinc-400 truncate flex items-center gap-1">
                      <Mail className="h-3 w-3 text-zinc-400" />
                      <span>{m.email}</span>
                    </p>
                  </div>
                </div>

                {/* Workload Metric */}
                <div className="border-t border-b border-zinc-100/80 my-4 py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-zinc-500">
                    <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Proyectos Activos:</span>
                  </div>
                  <span className="font-bold text-zinc-800 font-mono">{assignedProjects.length}</span>
                </div>

                {/* Workload Status Tag & Actions */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${workload.color} uppercase tracking-wider font-semibold`}>
                    Carga {workload.label}
                  </span>

                  {/* Render delete button only if member is not default or can be safely deleted */}
                  <button
                    onClick={() => onRemoveMember(m.id)}
                    className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title={`Desvincular a ${m.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Assigned projects bullet tags */}
                {assignedProjects.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-zinc-100/60">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block mb-1.5">Asignado a:</span>
                    <div className="flex flex-wrap gap-1">
                      {assignedProjects.map(p => (
                        <span key={p.id} className="text-[10px] bg-zinc-50 border border-zinc-100 rounded px-1.5 py-0.5 truncate max-w-[120px] font-medium text-zinc-600" title={p.name}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
