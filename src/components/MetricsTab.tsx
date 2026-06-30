import React, { useState } from 'react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  Project, 
  AppUser, 
  ProjectStatus,
  StudentGrade 
} from '../types';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Download
} from 'lucide-react';

interface MetricsTabProps {
  projects: Project[];
  users: AppUser[];
  onToggleTask: (projectId: string, taskId: string) => void;
}

export default function MetricsTab({ projects, users, onToggleTask }: MetricsTabProps) {
  // Simple stats
  const students = users.filter(u => u.role === 'alumno');
  
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Rendimiento de Aula", 14, 15);
    
    // Add some dummy data for RA and grades as per user request
    const tableData = students.map(student => [
      student.name,
      student.classroom || 'N/A',
      "85%", // Dummy RA completion
      "8.5"  // Dummy grade
    ]);

    (doc as any).autoTable({
      head: [['Alumno', 'Aula', '% RA', 'Nota Final']],
      body: tableData,
      startY: 25,
    });
    
    doc.save('reporte_aula.pdf');
  };

  // Dashboard view
  return (
    <div className="space-y-8 p-6 bg-zinc-50 min-h-screen">
      
      {/* Sección Proyectos del Aula */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-emerald-600" />
            Proyectos del Aula ({projects.length})
          </h2>
        </div>

        {projects.length === 0 ? (
          <div className="p-10 border-2 border-dashed border-zinc-200 rounded-3xl text-center bg-white">
            <p className="text-sm text-zinc-400 font-semibold">No hay proyectos activos en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => {
              const teamMembers = users.filter(u => project.team.includes(u.id));
              
              return (
                <div key={project.id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-zinc-900">{project.name}</h3>
                      <p className="text-xs text-zinc-500 mt-1">{project.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Participantes ({teamMembers.length})</span>
                      <button className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Mensaje
                      </button>
                    </div>
                    <div className="flex -space-x-2">
                      {teamMembers.map(m => (
                        <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: m.color }} title={m.name}>
                          {m.initials}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-zinc-50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-semibold">Progreso Tareas</span>
                      <span className="font-black text-zinc-900">{project.tasks.filter(t => t.completed).length} / {project.tasks.length}</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${(project.tasks.filter(t => t.completed).length / (project.tasks.length || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sección Métricas e Informes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Métricas e Informes de Aula
          </h2>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            Descargar PDF
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <span className="text-xs text-zinc-400 font-bold uppercase">Alumnos</span>
            <div className="text-2xl font-black text-zinc-900 mt-1">{students.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <span className="text-xs text-zinc-400 font-bold uppercase">% Aprobados</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">78%</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <span className="text-xs text-zinc-400 font-bold uppercase">% RA Terminados</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">45%</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <span className="text-xs text-zinc-400 font-bold uppercase">Aulas Activas</span>
            <div className="text-2xl font-black text-zinc-900 mt-1">
              {Array.from(new Set(students.map(s => s.classroom))).filter(Boolean).length}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
