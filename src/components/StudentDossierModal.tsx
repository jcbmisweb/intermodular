import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  BookOpen, 
  Award, 
  CheckSquare, 
  Layers, 
  Activity, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Scale,
  MessageSquare
} from 'lucide-react';
import { AppUser, AssessmentTask, StudentGrade, IndividualOralGrade, Project } from '../types';
import { LEARNING_OUTCOMES } from '../data/ra';

interface StudentDossierModalProps {
  student: AppUser;
  assessmentTasks: AssessmentTask[];
  grades: StudentGrade[];
  individualOralGrades: IndividualOralGrade[];
  projects: Project[];
  maxTeamScore?: number;
  maxExpositionScore?: number;
  maxCoevalAdjustment?: number;
  onClose: () => void;
}

const StudentDossierModal: React.FC<StudentDossierModalProps> = ({
  student,
  assessmentTasks,
  grades,
  individualOralGrades,
  projects,
  maxTeamScore = 6.0,
  maxExpositionScore = 3.0,
  maxCoevalAdjustment = 1.0,
  onClose
}) => {
  // 1. Find or build oral record
  const oralRecord = individualOralGrades.find(g => g.studentId === student.id) || {
    studentId: student.id,
    teamGrade: 5.0,
    expositionGrade: 5.0,
    coevalItem1: 'neutral' as const,
    coevalItem2: 'neutral' as const,
    justification: 'Sin justificación registrada.',
    presented: true
  };

  const isPresented = oralRecord.presented !== false;

  // 2. Calculate Team Grade dynamically from task grades and task weights
  let teamGrade = 0;
  assessmentTasks.forEach(task => {
    let weight = task.weight;
    if (weight === undefined) {
      if (task.id === 'step-11') weight = 0.0;
      else if (task.id === 'step-12') weight = 2.0;
      else if (task.id === 'step-13') weight = 3.0;
      else if (task.id === 'step-14') weight = 1.0;
      else if (task.id === 'step-15') weight = 2.0;
      else if (task.id === 'step-16') weight = 0.0;
      else if (task.id === 'step-17') weight = 2.0;
      else weight = 0.0;
    }
    const gradeRecord = grades.find(g => g.studentId === student.id && g.taskId === task.id);
    const score = gradeRecord ? gradeRecord.score : 0;
    teamGrade += (score / 10) * weight;
  });
  teamGrade = Math.min(10, Math.max(0, teamGrade));

  const expositionGrade = oralRecord.expositionGrade !== undefined ? oralRecord.expositionGrade : 5.0;

  // 3. Coeval adjustments
  let coevalAdjustment = 0;
  const singleCoevalImpact = maxCoevalAdjustment / 2;
  if (oralRecord.coevalItem1 === 'positive') coevalAdjustment += singleCoevalImpact;
  if (oralRecord.coevalItem1 === 'negative') coevalAdjustment -= singleCoevalImpact;
  if (oralRecord.coevalItem2 === 'positive') coevalAdjustment += singleCoevalImpact;
  if (oralRecord.coevalItem2 === 'negative') coevalAdjustment -= singleCoevalImpact;

  const calculatedTeamPoints = (teamGrade / 10) * maxTeamScore;
  const calculatedExpositionPoints = (expositionGrade / 10) * maxExpositionScore;
  const preliminaryScore = calculatedTeamPoints + calculatedExpositionPoints + coevalAdjustment;

  let finalComputedScore = Math.min(10, Math.max(0, preliminaryScore));
  const hasMinimumInAllParts = teamGrade >= 5.0 && expositionGrade >= 5.0;
  const isPassed = isPresented && hasMinimumInAllParts && finalComputedScore >= 5.0;

  if (isPresented && !hasMinimumInAllParts) {
    finalComputedScore = Math.min(4.0, finalComputedScore);
  }

  // 4. Calculate criterion & RA progress
  const getGradeRecord = (taskId: string) => {
    return grades.find(g => g.studentId === student.id && g.taskId === taskId);
  };

  const calculateCriterionProgress = (criterionId: string) => {
    const tasksCovering = assessmentTasks.filter(t => t.criterionIds.includes(criterionId));
    if (tasksCovering.length === 0) return 0;

    const deliveredGrades = tasksCovering
      .map(t => getGradeRecord(t.id))
      .filter((g): g is StudentGrade => g !== undefined && g.isDelivered === true);

    if (deliveredGrades.length === 0) return 0;
    
    const avgGrade = deliveredGrades.reduce((sum, g) => sum + g.score, 0) / deliveredGrades.length;
    
    let weight = 0;
    for (const ra of LEARNING_OUTCOMES) {
      const crit = ra.criteria.find(c => c.id === criterionId);
      if (crit) {
        weight = crit.weight;
        break;
      }
    }

    return (avgGrade / 10) * weight;
  };

  const calculateRAProgress = (raId: number) => {
    const ra = LEARNING_OUTCOMES.find(r => r.id === raId);
    if (!ra) return 0;
    
    return ra.criteria.reduce((sum, crit) => {
      return sum + calculateCriterionProgress(crit.id);
    }, 0);
  };

  // Find student's assigned project
  const studentProject = projects.find(p => p.team.includes(student.id) || p.classroom === student.classroom);

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-150 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${student.color || 'bg-indigo-600 text-white'} flex items-center justify-center text-xs font-black shadow-sm`}>
              {student.initials}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
                <span>Ficha del Alumno</span>
                <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 rounded text-[9px] font-bold text-indigo-700">
                  {student.classroom || 'Sin Aula'}
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-medium">Expediente y desempeño académico integral del estudiante.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-200/80 rounded-xl transition-colors cursor-pointer text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top Profile Summary Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Student Info */}
            <div className="p-5 border border-zinc-150 rounded-2xl bg-zinc-50/30 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Identidad</div>
                <div className="space-y-1">
                  <div className="text-base font-extrabold text-zinc-900">{student.name}</div>
                  <div className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                    <Mail className="h-3 w-3 text-zinc-400" />
                    <span>{student.email}</span>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-zinc-400 font-medium">
                Registrado: {student.joinedAt}
              </div>
            </div>

            {/* Overall Grade Card */}
            <div className="p-5 border border-zinc-150 rounded-2xl bg-indigo-50/20 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Nota Global del Módulo</div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-black ${isPassed ? 'text-indigo-700' : 'text-rose-600'}`}>
                    {isPresented ? finalComputedScore.toFixed(1) : 'N.P.'}
                  </span>
                  <span className="text-xs font-bold text-zinc-400">/ 10</span>
                </div>
              </div>
              <div>
                {isPresented ? (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-rose-50 text-rose-700 border border-rose-150'
                  }`}>
                    {isPassed ? 'APROBADO' : 'SUSPENSO'}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-full text-[10px] font-bold">
                    No Presentado
                  </span>
                )}
              </div>
            </div>

            {/* Assigned Project / Team Info */}
            <div className="p-5 border border-zinc-150 rounded-2xl bg-zinc-50/30 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Proyecto Activo</div>
                {studentProject ? (
                  <div className="space-y-0.5">
                    <div className="text-xs font-extrabold text-zinc-800 line-clamp-1">{studentProject.name}</div>
                    <div className="text-[10px] text-zinc-400 font-medium uppercase">{studentProject.category}</div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400 italic">No asignado a ningún proyecto todavía</div>
                )}
              </div>
              {studentProject && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase">
                    <span>Avance Global</span>
                    <span className="font-mono">{studentProject.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 rounded-full h-1">
                    <div 
                      className="bg-indigo-600 h-1 rounded-full" 
                      style={{ width: `${studentProject.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RA Breakdown (Results de Aprendizaje) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-150 pb-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span>Desglose de Resultados de Aprendizaje (RA)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LEARNING_OUTCOMES.map(ra => {
                const raProgress = calculateRAProgress(ra.id);
                const raPercentage = (raProgress / ra.weight) * 100;

                return (
                  <div key={ra.id} className="p-4 border border-zinc-150 rounded-xl space-y-2.5 hover:border-zinc-300 transition-colors bg-white shadow-3xs">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5 pr-2">
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded">
                          RA.{ra.id} (Ponderación: {ra.weight}%)
                        </span>
                        <p className="text-[11px] font-bold text-zinc-800 line-clamp-1 mt-1">{ra.title}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-zinc-900">
                          {raProgress.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-zinc-400 block font-semibold">de {ra.weight}%</span>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="space-y-1">
                      <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            raPercentage >= 100 ? 'bg-emerald-500' :
                            raPercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, raPercentage)}%` }}
                        />
                      </div>
                    </div>

                    {/* Criteria collapsible listing list inside this RA */}
                    <div className="pt-2 border-t border-zinc-100 grid grid-cols-2 gap-x-3 gap-y-1.5">
                      {ra.criteria.map(crit => {
                        const critProgress = calculateCriterionProgress(crit.id);
                        const critPercentage = (critProgress / crit.weight) * 100;
                        return (
                          <div key={crit.id} className="flex justify-between items-center text-[10px]">
                            <span className="text-zinc-500 font-semibold">{crit.nomenclature}:</span>
                            <span className={`font-mono font-bold ${
                              critPercentage >= 100 ? 'text-emerald-600' : 
                              critPercentage >= 50 ? 'text-amber-600' : 'text-zinc-400'
                            }`}>
                              {critProgress.toFixed(1)}% <span className="text-[8px] text-zinc-400">/ {crit.weight}%</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Task grades / entregables section */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-150 pb-2">
              <CheckSquare className="h-4 w-4 text-indigo-600" />
              <span>Calificaciones de Tareas Evaluables</span>
            </h3>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden shadow-3xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-200 text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                    <th className="px-4 py-3">Entregable / Tarea</th>
                    <th className="px-4 py-3 text-center">Criterios Asociados</th>
                    <th className="px-4 py-3 text-center">Peso</th>
                    <th className="px-4 py-3 text-center">Estado de Entrega</th>
                    <th className="px-4 py-3 text-right">Nota de Alumno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150">
                  {assessmentTasks.map(task => {
                    const gradeRecord = getGradeRecord(task.id);
                    const isDelivered = gradeRecord?.isDelivered ?? false;
                    const score = gradeRecord?.score ?? 0;
                    const weight = task.weight ?? 1;

                    return (
                      <tr key={task.id} className="hover:bg-zinc-100/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-zinc-800">{task.title}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-wrap justify-center gap-1">
                            {task.criterionIds.map(cid => (
                              <span key={cid} className="px-1.5 py-0.5 bg-zinc-200 rounded text-[9px] font-black text-zinc-600">
                                {cid.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-zinc-500 font-mono">{weight.toFixed(1)} ptos</td>
                        <td className="px-4 py-3 text-center">
                          {isDelivered ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-md text-[9px] font-bold">
                              ENTREGADO
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-400 border border-zinc-250 rounded-md text-[9px] font-bold">
                              PENDIENTE
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-bold font-mono">
                          {isDelivered && gradeRecord ? (
                            <span className={score >= 5.0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {score.toFixed(1)} / 10
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic font-medium">Sin calificar</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Oral Defense, Coeval, and Justification */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-150 pb-2">
              <Scale className="h-4 w-4 text-indigo-600" />
              <span>Defensa Oral e Individual del Alumno</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Defense grades card */}
              <div className="p-5 border border-zinc-150 rounded-xl space-y-4 bg-white shadow-3xs">
                <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Evaluación Oral y Justificación</div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-semibold">Exposición Individual:</span>
                    <span className="font-mono font-bold text-zinc-800">{expositionGrade.toFixed(1)} / 10</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-semibold">Evaluación de Coevaluación (Items):</span>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        oralRecord.coevalItem1 === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                        oralRecord.coevalItem1 === 'negative' ? 'bg-rose-50 text-rose-700 border border-rose-150' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        Actitud {oralRecord.coevalItem1 === 'positive' ? '+0.25' : oralRecord.coevalItem1 === 'negative' ? '-0.25' : '0.0'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        oralRecord.coevalItem2 === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                        oralRecord.coevalItem2 === 'negative' ? 'bg-rose-50 text-rose-700 border border-rose-150' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        Trabajo {oralRecord.coevalItem2 === 'positive' ? '+0.25' : oralRecord.coevalItem2 === 'negative' ? '-0.25' : '0.0'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-zinc-100 space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Justificación del Profesor:</span>
                    <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-150 italic leading-relaxed">
                      "{oralRecord.justification || 'No se ha redactado ninguna justificación por el docente todavía.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Module components breakdown weight card */}
              <div className="p-5 border border-zinc-150 rounded-xl space-y-4 bg-white shadow-3xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Cálculo de Puntos Finales</div>
                  
                  <div className="space-y-2 text-xs font-semibold text-zinc-600">
                    <div className="flex justify-between">
                      <span>1. Trabajos de Equipo (Fase 1):</span>
                      <span className="font-mono text-zinc-950">{calculatedTeamPoints.toFixed(2)} / {maxTeamScore.toFixed(1)} ptos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2. Exposición Individual (Fase 2):</span>
                      <span className="font-mono text-zinc-950">{calculatedExpositionPoints.toFixed(2)} / {maxExpositionScore.toFixed(1)} ptos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3. Coevaluaciones de Compañeros:</span>
                      <span className={`font-mono ${coevalAdjustment > 0 ? 'text-emerald-600' : coevalAdjustment < 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
                        {coevalAdjustment >= 0 ? '+' : ''}{coevalAdjustment.toFixed(2)} ptos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-150 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Nota de Calificación final</span>
                    <span className="text-sm font-black text-zinc-800">Cómputo Total del Módulo</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-black ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPresented ? finalComputedScore.toFixed(2) : 'N.P.'}
                    </span>
                    <span className="text-xs font-bold text-zinc-400"> / 10.0</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-150 bg-zinc-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
          >
            Aceptar y Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

export default StudentDossierModal;
