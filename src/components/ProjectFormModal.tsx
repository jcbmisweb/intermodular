import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2, Calendar, DollarSign, CheckCircle2, UserPlus, FolderOpen } from 'lucide-react';
import { Project, ProjectStatus, ProjectPriority, Task, TeamMember } from '../types';
import { AVAILABLE_CATEGORIES } from '../data';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: Partial<Project>) => void;
  project?: Project | null; // If passed, we are in EDIT mode
  team: TeamMember[];
  classrooms: string[];
}

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  project,
  team,
  classrooms
}: ProjectFormModalProps) {
  const isEdit = !!project;

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [priority, setPriority] = useState<ProjectPriority>('medium');
  const [category, setCategory] = useState(AVAILABLE_CATEGORIES[0]);
  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [classroom, setClassroom] = useState('');

  // Synchronize when editing a project
  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setStatus(project.status);
      setPriority(project.priority);
      setCategory(project.category);
      setBudget(project.budget);
      setSpent(project.spent);
      setStartDate(project.startDate);
      setDueDate(project.dueDate);
      setSelectedTeam(project.team);
      setTasks(project.tasks);
      setClassroom(project.classroom || '');
    } else {
      // Clear for new project
      setName('');
      setDescription('');
      setStatus('planning');
      setPriority('medium');
      setCategory(AVAILABLE_CATEGORIES[0]);
      setBudget(10000);
      setSpent(0);
      // Set default dates
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setDueDate(nextMonth.toISOString().split('T')[0]);
      setSelectedTeam([]);
      setTasks([]);
      setClassroom('');
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Calculate progress based on tasks if any exist
    let calculatedProgress = project?.progress || 0;
    if (tasks.length > 0) {
      const completed = tasks.filter(t => t.completed).length;
      calculatedProgress = Math.round((completed / tasks.length) * 100);
    } else if (status === 'completed') {
      calculatedProgress = 100;
    } else if (status === 'planning') {
      calculatedProgress = 0;
    }

    onSubmit({
      id: project?.id,
      name,
      description,
      status,
      priority,
      category,
      budget: Number(budget),
      spent: Number(spent),
      startDate,
      dueDate,
      progress: calculatedProgress,
      team: selectedTeam,
      tasks,
      lastUpdated: new Date().toISOString(),
      classroom: classroom || undefined
    });
    
    onClose();
  };

  // Toggle Team Member Selection
  const toggleTeamMember = (memberId: string) => {
    setSelectedTeam(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };

  // Tasks operations inside form
  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
  };

  const removeTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Dark overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
      />

      {/* Main Drawer Form */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col z-10 border-l border-zinc-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-150 flex items-center justify-between bg-zinc-50/50">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 block mb-0.5">
              Administración
            </span>
            <h3 className="text-lg font-bold text-zinc-900">
              {isEdit ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-150 rounded-lg text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block">
              Nombre del Proyecto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Rediseño de Portal de Clientes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white transition-all font-medium text-zinc-900"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block">
              Descripción
            </label>
            <textarea
              placeholder="Describe los objetivos clave, alcances y entregables..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white transition-all text-zinc-700 resize-none"
            />
          </div>

          {/* Category, Status, Priority, Classroom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {AVAILABLE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="planning">Planificación</option>
                <option value="active">Activo</option>
                <option value="on_hold">En Pausa</option>
                <option value="completed">Completado</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">Aula Asignada</label>
              <select
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                className="w-full bg-zinc-50 border border-indigo-150 rounded-xl p-2.5 text-sm text-indigo-950 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">-- General (Sin aula) --</option>
                {classrooms.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget and Spent fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-zinc-400" />
                <span>Presupuesto total (USD)</span>
              </label>
              <input
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white transition-all text-zinc-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-zinc-400" />
                <span>Monto Gastado (USD)</span>
              </label>
              <input
                type="number"
                min="0"
                value={spent}
                onChange={(e) => setSpent(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white transition-all text-zinc-900"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span>Fecha de Inicio</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm text-zinc-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span>Fecha Límite</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm text-zinc-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Team Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block">
              Equipo Asignado
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-zinc-100 rounded-xl p-2 bg-zinc-50/50">
              {team.map((member) => {
                const isSelected = selectedTeam.includes(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => toggleTeamMember(member.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                      isSelected
                        ? 'border-zinc-900 bg-white shadow-xs'
                        : 'border-zinc-200/50 bg-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${member.color}`}>
                      {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-850 truncate">{member.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{member.role}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-300'
                    }`}>
                      {isSelected && <span className="text-[8px]">✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tasks Planning Panel inside Form */}
          <div className="space-y-3 pt-3 border-t border-zinc-100">
            <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block">
              Planificación de Hitos / Tareas ({tasks.length})
            </label>
            
            {/* Add task bar */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Añadir hito o tarea técnica..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTask();
                  }
                }}
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
              />
              <button
                type="button"
                onClick={addTask}
                className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Agregar</span>
              </button>
            </div>

            {/* List of current tasks in form */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/60"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(t.id)}
                      className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                    >
                      {t.completed ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                      ) : (
                        <div className="h-4.5 w-4.5 rounded-full border-2 border-zinc-300" />
                      )}
                    </button>
                    <span className={`text-xs ${t.completed ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>
                      {t.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTask(t.id)}
                    className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-xs text-zinc-400 italic text-center py-4 bg-zinc-50/50 rounded-lg border border-dashed border-zinc-200">
                  Aún no has planificado tareas. Agrégalas arriba para calcular el progreso de forma dinámica.
                </p>
              )}
            </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-150 bg-zinc-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-zinc-250 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            {isEdit ? 'Guardar Cambios' : 'Crear Proyecto'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
