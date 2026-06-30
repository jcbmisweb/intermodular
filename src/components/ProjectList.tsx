import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  CheckSquare,
  Square
} from 'lucide-react';
import { Project, ProjectStatus, ProjectPriority, TeamMember } from '../types';

interface ProjectListProps {
  projects: Project[];
  team: TeamMember[];
  onSelectProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onToggleTask: (projectId: string, taskId: string) => void;
  onOpenCreateModal: () => void;
}

export default function ProjectList({
  projects,
  team,
  onSelectProject,
  onEditProject,
  onDeleteProject,
  onToggleTask,
  onOpenCreateModal
}: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'dueDate' | 'budget'>('dueDate');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTasksProjectId, setExpandedTasksProjectId] = useState<string | null>(null);

  // Helper: get team member details
  const getMember = (id: string) => team.find(m => m.id === id);

  // Status visual attributes
  const getStatusStyle = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          dot: 'bg-emerald-500',
          label: 'Activo'
        };
      case 'completed':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-100',
          dot: 'bg-blue-500',
          label: 'Completado'
        };
      case 'on_hold':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-100',
          dot: 'bg-amber-500',
          label: 'En Pausa'
        };
      case 'planning':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Planificación'
        };
    }
  };

  // Priority visual attributes
  const getPriorityStyle = (priority: ProjectPriority) => {
    switch (priority) {
      case 'high':
        return 'text-rose-600 bg-rose-50 border-rose-100 font-medium';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-100 font-medium';
      case 'low':
        return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  // Filter & Sort Logic
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'budget') return b.budget - a.budget;
      if (sortBy === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return 0;
    });

  // Group by Classroom
  const projectsByClassroom = filteredProjects.reduce((acc, project) => {
    const classroom = project.classroom || 'Sin Aula Asignada';
    if (!acc[classroom]) acc[classroom] = [];
    acc[classroom].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  const classroomOrder = Object.keys(projectsByClassroom).sort();

  // Calculate generic summary metrics for current filtered selection
  const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = filteredProjects.reduce((sum, p) => sum + p.spent, 0);
  const averageProgress = filteredProjects.length > 0 
    ? Math.round(filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* 1. Filter and search bar */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, categoría o palabra clave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all cursor-pointer ${
                showFilters || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtros</span>
              {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                <span className="ml-1 w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            <div className="h-9 w-px bg-zinc-200 mx-1 hidden sm:block" />

            <div className="flex items-center bg-zinc-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-white text-zinc-900 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
                title="Vista Cuadrícula"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' 
                    ? 'bg-white text-zinc-900 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
                title="Vista Lista"
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm shadow-emerald-600/10 hover:shadow-md cursor-pointer ml-auto md:ml-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Proyecto</span>
            </button>
          </div>
        </div>

        {/* Expandable detailed filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-4 border-t border-zinc-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Estado</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="planning">Planificación</option>
                    <option value="active">Activo</option>
                    <option value="on_hold">En Pausa</option>
                    <option value="completed">Completado</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Prioridad</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="all">Todas las prioridades</option>
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="dueDate">Fecha de entrega</option>
                    <option value="name">Nombre</option>
                    <option value="progress">Progreso</option>
                    <option value="budget">Presupuesto</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Micro summary of filtered selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/50 flex items-center justify-between">
          <div>
            <span className="block text-xs text-zinc-500 font-medium">Proyectos Filtrados</span>
            <span className="text-lg font-bold text-zinc-900 font-mono">{filteredProjects.length}</span>
          </div>
          <span className="text-xs text-zinc-400">de {projects.length} totales</span>
        </div>
        <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/50 flex items-center justify-between">
          <div>
            <span className="block text-xs text-zinc-500 font-medium">Presupuesto Acumulado</span>
            <span className="text-lg font-bold text-zinc-900 font-mono">${totalBudget.toLocaleString()}</span>
          </div>
          <span className="text-xs text-zinc-400">Gastado: ${totalSpent.toLocaleString()}</span>
        </div>
        <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/50 flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="block text-xs text-zinc-500 font-medium">Progreso Promedio</span>
            <span className="text-lg font-bold text-zinc-900 font-mono">{averageProgress}%</span>
          </div>
          {/* visual progress sparkline */}
          <div className="w-12 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${averageProgress}%` }} />
          </div>
        </div>
      </div>

      {/* 3. Empty State */}
      {filteredProjects.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-zinc-200 p-12 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-400">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 mb-1">No se encontraron proyectos</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Prueba a cambiar los términos de búsqueda o los filtros actuales para encontrar lo que buscas.
          </p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setPriorityFilter('all');
            }}
            className="mt-4 px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-medium rounded-xl transition-all cursor-pointer"
          >
            Restablecer Filtros
          </button>
        </motion.div>
      )}

      {/* 4. Projects Listing (Grid View) */}
      {viewMode === 'grid' && filteredProjects.length > 0 && (
        <div className="space-y-12">
          {classroomOrder.map((classroom) => (
            <div key={classroom} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-zinc-200" />
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 px-4 py-1.5 bg-zinc-100 rounded-full border border-zinc-200">
                  <Briefcase className="h-3 w-3" />
                  {classroom}
                </h3>
                <div className="h-px flex-1 bg-zinc-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {projectsByClassroom[classroom].map((project) => {
                    const statusStyle = getStatusStyle(project.status);
                    const completedTasksCount = project.tasks.filter(t => t.completed).length;
                    const totalTasksCount = project.tasks.length;
                    
                    return (
                      <motion.div
                        key={project.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col overflow-hidden group"
                      >
                        {/* Top Bar inside Card */}
                        <div className="p-5 border-b border-zinc-100 flex items-start justify-between gap-2 bg-gradient-to-b from-zinc-50/50 to-white">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">
                              {project.category}
                            </span>
                            <h4 
                              onClick={() => onSelectProject(project)}
                              className="text-base font-semibold text-zinc-900 hover:text-emerald-600 transition-colors cursor-pointer line-clamp-1"
                              title={project.name}
                            >
                              {project.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusStyle.bg} flex items-center gap-1`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                              <span>{statusStyle.label}</span>
                            </span>
                          </div>
                        </div>

                        {/* Body Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                            {project.description}
                          </p>

                          {/* Progress Slider Display - Enhanced visibility */}
                          <div className="space-y-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Trabajo Realizado</span>
                              <span className="text-xs font-black text-emerald-600 font-mono">{project.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${project.progress}%` }}
                                className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                              />
                            </div>
                          </div>

                          {/* Budget & Timeline Spark */}
                          <div className="grid grid-cols-2 gap-2 border-t border-b border-zinc-100/80 py-3 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-zinc-400 block">Presupuesto</span>
                              <span className="font-semibold text-zinc-800 font-mono">
                                ${project.budget.toLocaleString()}
                              </span>
                            </div>
                            <div className="space-y-0.5 text-right">
                              <span className="text-zinc-400 block">Fecha Entrega</span>
                              <span className="font-semibold text-zinc-700 flex items-center justify-end gap-1">
                                <Calendar className="h-3 w-3 text-zinc-400" />
                                {new Date(project.dueDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          {/* Team avatars and tasks count */}
                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {project.team.map((id) => {
                                const m = getMember(id);
                                if (!m) return null;
                                return (
                                  <div 
                                    key={id}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white cursor-help ${m.color}`}
                                    title={`${m.name} - ${m.role}`}
                                  >
                                    {m.initials}
                                  </div>
                                );
                              })}
                              {project.team.length === 0 && (
                                <span className="text-xs text-zinc-400 italic">Sin asignar</span>
                              )}
                            </div>

                            <button
                              onClick={() => setExpandedTasksProjectId(expandedTasksProjectId === project.id ? null : project.id)}
                              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium px-2 py-1 rounded-lg hover:bg-zinc-50 transition-all cursor-pointer border border-zinc-100"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" />
                              <span>{completedTasksCount}/{totalTasksCount}</span>
                              <ChevronDown className={`h-3 w-3 transition-transform ${expandedTasksProjectId === project.id ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Inline Tasks List Drawer */}
                        <AnimatePresence>
                          {expandedTasksProjectId === project.id && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="border-t border-zinc-100 bg-zinc-50/50 overflow-hidden text-xs"
                            >
                              <div className="p-4 space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                                  <span>Lista de tareas</span>
                                  <span>Completado</span>
                                </div>
                                {project.tasks.map((task) => (
                                  <div 
                                    key={task.id} 
                                    onClick={() => onToggleTask(project.id, task.id)}
                                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-zinc-200/60 hover:border-zinc-300 cursor-pointer select-none transition-colors"
                                  >
                                    <span className={`line-clamp-1 ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-700 font-medium'}`}>
                                      {task.title}
                                    </span>
                                    {task.completed ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full border-2 border-zinc-300 hover:border-zinc-400 shrink-0" />
                                    )}
                                  </div>
                                ))}
                                {project.tasks.length === 0 && (
                                  <span className="text-zinc-400 italic block py-1">Sin tareas creadas</span>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Footer Actions */}
                        <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${getPriorityStyle(project.priority)} uppercase tracking-wider`}>
                            Prioridad {project.priority === 'high' ? 'Alta' : project.priority === 'medium' ? 'Media' : 'Baja'}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEditProject(project)}
                              className="p-1.5 hover:bg-zinc-200/60 text-zinc-500 hover:text-zinc-950 rounded-lg transition-colors cursor-pointer"
                              title="Editar Proyecto"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteProject(project.id)}
                              className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar Proyecto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Projects Listing (List View) */}
      {viewMode === 'list' && filteredProjects.length > 0 && (
        <div className="space-y-8">
          {classroomOrder.map((classroom) => (
            <div key={classroom} className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5" />
                  {classroom}
                </h3>
                <span className="text-[10px] font-bold text-zinc-400">{projectsByClassroom[classroom].length} Proyectos</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="py-3 px-5">Proyecto</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-center">Prioridad</th>
                      <th className="py-3 px-4">Progreso</th>
                      <th className="py-3 px-4">Fecha Entrega</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm">
                    <AnimatePresence mode="popLayout">
                      {projectsByClassroom[classroom].map((project) => {
                        const statusStyle = getStatusStyle(project.status);
                        return (
                          <motion.tr
                            key={project.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-zinc-50/50 transition-colors group"
                          >
                            <td className="py-4 px-5">
                              <div>
                                <span 
                                  onClick={() => onSelectProject(project)}
                                  className="font-semibold text-zinc-900 hover:text-emerald-600 transition-colors cursor-pointer block"
                                >
                                  {project.name}
                                </span>
                                <span className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{project.description}</span>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded uppercase">
                                {project.category}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-center">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusStyle.bg} inline-flex items-center gap-1 font-bold`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                                <span>{statusStyle.label}</span>
                              </span>
                            </td>

                            <td className="py-4 px-4 text-center">
                              <span className={`text-[10px] px-2 py-0.5 rounded border ${getPriorityStyle(project.priority)} uppercase tracking-wider`}>
                                {project.priority}
                              </span>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2 w-32">
                                <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                                <span className="font-black text-emerald-600 font-mono text-xs">{project.progress}%</span>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <span className="text-zinc-600 text-xs font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-zinc-400" />
                                {new Date(project.dueDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => onEditProject(project)}
                                  className="p-1.5 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-850 rounded-lg transition-colors cursor-pointer"
                                  title="Editar"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteProject(project.id)}
                                  className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
