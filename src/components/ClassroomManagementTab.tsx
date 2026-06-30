import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Users, 
  Shield, 
  GraduationCap, 
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { AppUser, Project } from '../types';

interface ClassroomManagementTabProps {
  classrooms: string[];
  onCreateClassroom: (name: string) => void;
  onDeleteClassroom: (name: string) => void;
  users: AppUser[];
  projects: Project[];
  onUpdateUser: (updatedUser: AppUser) => void;
}

export default function ClassroomManagementTab({
  classrooms,
  onCreateClassroom,
  onDeleteClassroom,
  users,
  projects,
  onUpdateUser
}: ClassroomManagementTabProps) {
  const [newClassroomName, setNewClassroomName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newClassroomName.trim().toUpperCase(); // Normalise to upper case like 2HCA
    if (!trimmed) {
      setError('El nombre del aula no puede estar vacío.');
      return;
    }
    if (classrooms.includes(trimmed)) {
      setError('Esa aula ya existe.');
      return;
    }
    onCreateClassroom(trimmed);
    setNewClassroomName('');
    setError(null);
  };

  return (
    <div className="space-y-6" id="classroom-management-container">
      
      {/* Header Info */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-4.5 w-4.5 text-zinc-800" />
            <span>Gestión de Aulas de la Academia</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Crea y administra las aulas del centro. Después podrás asignar a un profesor y a los alumnos a cada aula.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full md:w-auto flex gap-2">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Ej. 2HCA, 2HCB, 2HCC"
              value={newClassroomName}
              onChange={(e) => {
                setNewClassroomName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-zinc-800 uppercase"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Crear Aula</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Classrooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.length === 0 ? (
          <div className="col-span-full bg-white border border-zinc-200 rounded-2xl p-10 text-center space-y-3">
            <Building2 className="h-8 w-8 text-zinc-300 mx-auto" />
            <p className="text-xs text-zinc-500 font-bold">No hay aulas creadas todavía.</p>
            <p className="text-[11px] text-zinc-400">Utiliza el formulario de arriba para añadir tu primera sección (ej. 2HCA).</p>
          </div>
        ) : (
          classrooms.map((classroom) => {
            // Find teacher assigned to this classroom
            const teacher = users.find(u => u.role === 'profesor' && u.classroom === classroom);
            // Count students in this classroom
            const classroomStudents = users.filter(u => u.role === 'alumno' && u.classroom === classroom);
            // Count projects assigned to this classroom
            const classroomProjects = projects.filter(p => p.classroom === classroom);

            return (
              <div 
                key={classroom} 
                className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs hover:border-zinc-300 transition-all space-y-4 relative overflow-hidden"
              >
                {/* Visual badge indicator */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-50 rounded-full translate-x-10 -translate-y-10 -z-10" />

                {/* Card Title & Delete */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-inner">
                      {classroom}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-zinc-900 uppercase">Aula {classroom}</h3>
                      <span className="text-[10px] text-zinc-400 font-medium">Sección Activa</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`¿Estás seguro de que deseas eliminar el aula ${classroom}? Esto dejará sin aula a sus alumnos y profesores correspondientes.`)) {
                        onDeleteClassroom(classroom);
                      }
                    }}
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar Aula"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Details Section */}
                <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                  
                  {/* Teacher assigned */}
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-zinc-300" />
                      Profesor:
                    </span>
                    <select
                      value={teacher?.id || ''}
                      onChange={(e) => {
                        const newTeacherId = e.target.value;
                        if (teacher) {
                          // Remove from old teacher
                          onUpdateUser({ ...teacher, classroom: undefined });
                        }
                        if (newTeacherId) {
                          const newTeacher = users.find(u => u.id === newTeacherId);
                          if (newTeacher) {
                            onUpdateUser({ ...newTeacher, classroom });
                          }
                        }
                      }}
                      className="text-zinc-900 font-bold flex items-center gap-1 bg-indigo-50/70 border border-indigo-100 px-2 py-0.5 rounded-lg text-[11px] cursor-pointer"
                    >
                      <option value="">-- Sin asignar --</option>
                      {users.filter(u => u.role === 'profesor').map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Student Count */}
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-zinc-300" />
                      Alumnos:
                    </span>
                    <span className="text-zinc-900 font-extrabold font-mono">
                      {classroomStudents.length}
                    </span>
                  </div>

                  {/* Projects Count */}
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-zinc-300" />
                      Proyectos asignados:
                    </span>
                    <span className="text-zinc-900 font-extrabold font-mono">
                      {classroomProjects.length}
                    </span>
                  </div>

                  {/* Classroom Progress Summary */}
                  {classroomProjects.length > 0 && (
                    <div className="pt-2.5 space-y-1.5 border-t border-zinc-100">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        <span>Progreso Medio del Aula</span>
                        <span className="font-mono">
                          {Math.round(classroomProjects.reduce((sum, p) => sum + p.progress, 0) / classroomProjects.length)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden shadow-inner border border-zinc-200/50">
                        <div 
                          className="bg-emerald-500 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-700" 
                          style={{ width: `${Math.round(classroomProjects.reduce((sum, p) => sum + p.progress, 0) / classroomProjects.length)}%` }}
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* Simple helper badge */}
                <div className="bg-zinc-50 p-2.5 rounded-xl flex items-center gap-2 border border-zinc-150">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-zinc-500">
                    {teacher ? 'Aula gestionada por el profesor' : 'Asigna un profesor en "Gestión de Usuarios"'}
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Classroom Guide / Setup Help */}
      <div className="p-5 bg-gradient-to-tr from-zinc-900 to-zinc-950 text-white rounded-2xl space-y-3 border border-zinc-800 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-400">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <h3 className="text-xs font-extrabold tracking-tight">Flujo de Trabajo para las Aulas</h3>
        <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
          1. <strong>Crea el aula</strong> aquí poniendo su nombre (ej: <strong>2HCA</strong>, <strong>2HCB</strong>).<br />
          2. Ve a la pestaña <strong>Gestión de Usuarios</strong>, edita el perfil del profesor y selecciona su aula correspondiente.<br />
          3. Haz lo mismo con los alumnos: asígnalos al aula que corresponda.<br />
          4. ¡Todo listo! El profesor de ese aula gestionará a esos alumnos y les podrá guiar con los proyectos asociados.
        </p>
      </div>

    </div>
  );
}
