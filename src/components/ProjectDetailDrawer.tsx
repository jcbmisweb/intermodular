import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit, 
  AlertCircle,
  Activity,
  FolderSync
} from 'lucide-react';
import { Project, TeamMember, ProjectStatus, ProjectPriority } from '../types';

interface ProjectDetailDrawerProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  team: TeamMember[];
  onToggleTask: (projectId: string, taskId: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export default function ProjectDetailDrawer({
  project,
  isOpen,
  onClose,
  team,
  onToggleTask,
  onEdit,
  onDelete
}: ProjectDetailDrawerProps) {
  if (!isOpen || !project) return null;

  const getMember = (id: string) => team.find(m => m.id === id);

  // Status Style Helpers
  const getStatusDetails = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return { label: 'Activo', color: 'text-emerald-700 bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500' };
      case 'completed':
        return { label: 'Completado', color: 'text-blue-700 bg-blue-50 border-blue-100', dot: 'bg-blue-500' };
      case 'on_hold':
        return { label: 'En Pausa', color: 'text-amber-700 bg-amber-50 border-amber-100', dot: 'bg-amber-500' };
      case 'planning':
        return { label: 'En Planificación', color: 'text-slate-500 bg-slate-50 border-slate-100', dot: 'bg-slate-400' };
    }
  };

  const statusInfo = getStatusDetails(project.status);
  const remainingBudget = project.budget - project.spent;
  const isOverBudget = remainingBudget < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Overlay Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
      />

      {/* Main Drawer Sheet */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col z-10 border-l border-zinc-250"
      >
        {/* Top Header Controls */}
        <div className="px-6 py-5 border-b border-zinc-150 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Detalles de Proyecto</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-150 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Title Block */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block">
              {project.category}
            </span>
            <h2 className="text-xl font-bold text-zinc-900 leading-tight">
              {project.name}
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Quick status bar */}
          <div className="grid grid-cols-2 gap-3 bg-zinc-50 border border-zinc-200/60 p-3.5 rounded-2xl">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Estado</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                <span className="text-xs font-bold text-zinc-800">{statusInfo.label}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Prioridad</span>
              <div className="flex items-center">
                <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${
                  project.priority === 'high' ? 'text-rose-600 bg-rose-50 border-rose-100' :
                  project.priority === 'medium' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                  'text-slate-600 bg-slate-50 border-slate-100'
                }`}>
                  {project.priority === 'high' ? 'Alta' : project.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Progress Display */}
          <div className="space-y-2 bg-zinc-50/50 border border-zinc-200/50 p-4 rounded-2xl">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-500">Progreso Técnico</span>
              <span className="font-bold text-zinc-900 font-mono text-sm">{project.progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400">Calculado dinámicamente según el porcentaje de hitos completados.</p>
          </div>

          {/* Budget Analytics Grid */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Métricas Financieras</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-zinc-200 bg-white space-y-1">
                <span className="text-[10px] text-zinc-400 font-medium block">PRESUPUESTO ASIGNADO</span>
                <span className="text-base font-bold text-zinc-900 font-mono">${project.budget.toLocaleString()}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-zinc-200 bg-white space-y-1">
                <span className="text-[10px] text-zinc-400 font-medium block">GASTO REAL</span>
                <span className="text-base font-bold text-zinc-900 font-mono">${project.spent.toLocaleString()}</span>
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              isOverBudget ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'
            }`}>
              <div className="flex items-center gap-1.5 font-medium">
                <AlertCircle className={`h-4 w-4 ${isOverBudget ? 'text-rose-500' : 'text-emerald-500'}`} />
                <span>{isOverBudget ? 'Exceso de Presupuesto:' : 'Margen Disponible:'}</span>
              </div>
              <span className="font-bold font-mono text-sm">${Math.abs(remainingBudget).toLocaleString()}</span>
            </div>
          </div>

          {/* Timeline Dates */}
          <div className="space-y-2 border-t border-zinc-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Plazos y Cronograma</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <div>
                  <span className="text-zinc-400 block text-[10px]">INICIO</span>
                  <span className="font-semibold text-zinc-800 font-mono">{project.startDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-zinc-400" />
                <div>
                  <span className="text-zinc-400 block text-[10px]">ENTREGA</span>
                  <span className="font-semibold text-zinc-800 font-mono">{project.dueDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Assignees Grid */}
          <div className="space-y-3 border-t border-zinc-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Profesionales a Cargo ({project.team.length})</h4>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {project.team.map((id) => {
                const member = getMember(id);
                if (!member) return null;
                return (
                  <div key={id} className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-xl transition-colors border border-zinc-100 bg-white">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${member.color}`}>
                      {member.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-900 truncate">{member.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{member.role}</p>
                    </div>
                  </div>
                );
              })}
              {project.team.length === 0 && (
                <p className="text-xs text-zinc-400 italic">No hay profesionales asignados de momento.</p>
              )}
            </div>
          </div>

          {/* Task Interactive Checklist */}
          <div className="space-y-3 border-t border-zinc-100 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Hitos y Tareas del Proyecto</h4>
              <span className="text-[10px] bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full font-mono text-zinc-600 font-bold">
                {project.tasks.filter(t => t.completed).length} de {project.tasks.length}
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {project.tasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => onToggleTask(project.id, task.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/50 border border-zinc-200/50 hover:border-zinc-300 transition-all cursor-pointer select-none"
                >
                  <span className={`text-xs ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-700 font-medium'}`}>
                    {task.title}
                  </span>
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-zinc-300 hover:border-zinc-400 shrink-0" />
                  )}
                </div>
              ))}
              {project.tasks.length === 0 && (
                <p className="text-xs text-zinc-400 italic text-center py-6 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                  No hay hitos programados para este proyecto.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Drawer Actions Footer */}
        <div className="px-6 py-4 border-t border-zinc-150 bg-zinc-50 flex items-center justify-between">
          <button
            onClick={() => {
              onDelete(project.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Eliminar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onEdit(project);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-zinc-250 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <Edit className="h-4 w-4 text-zinc-400" />
              <span>Editar Proyecto</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
