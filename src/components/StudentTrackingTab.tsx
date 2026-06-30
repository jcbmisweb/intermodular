import React, { useMemo, useState } from 'react';
import { 
  Users, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Minus,
  FileText, 
  Award,
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Eye,
  TrendingUp,
  Scale
} from 'lucide-react';
import { AppUser, AssessmentTask, StudentGrade, IndividualOralGrade, Project } from '../types';
import { LEARNING_OUTCOMES } from '../data/ra';
import StudentDossierModal from './StudentDossierModal';

interface StudentTrackingTabProps {
  students: AppUser[];
  assessmentTasks: AssessmentTask[];
  grades: StudentGrade[];
  onUpdateGrade: (studentId: string, taskId: string, score: number) => void;
  onToggleDelivery: (studentId: string, taskId: string, isDelivered: boolean) => void;
  onAddTask: () => void;
  projects: Project[];
  individualOralGrades: IndividualOralGrade[];
  maxTeamScore?: number;
  maxExpositionScore?: number;
  maxCoevalAdjustment?: number;
}

const StudentTrackingTab: React.FC<StudentTrackingTabProps> = ({
  students,
  assessmentTasks,
  grades,
  onUpdateGrade,
  onToggleDelivery,
  onAddTask,
  projects,
  individualOralGrades,
  maxTeamScore = 6.0,
  maxExpositionScore = 3.0,
  maxCoevalAdjustment = 1.0
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRAs, setExpandedRAs] = useState<number[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<AppUser | null>(null);
  
  // Sort students by surname (assuming last word of name is surname)
  const sortedStudents = useMemo(() => {
    return [...students]
      .filter(s => s.role === 'alumno')
      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const surnameA = a.name.split(' ').slice(-1)[0] || '';
        const surnameB = b.name.split(' ').slice(-1)[0] || '';
        return surnameA.localeCompare(surnameB);
      });
  }, [students, searchTerm]);

  // Helper to get grade record for a student and task
  const getGradeRecord = (studentId: string, taskId: string) => {
    return grades.find(g => g.studentId === studentId && g.taskId === taskId);
  };

  // Helper to calculate progress for a criterion
  const calculateCriterionProgress = (studentId: string, criterionId: string) => {
    const tasksCovering = assessmentTasks.filter(t => t.criterionIds.includes(criterionId));
    if (tasksCovering.length === 0) return 0;

    const deliveredGrades = tasksCovering
      .map(t => getGradeRecord(studentId, t.id))
      .filter((g): g is StudentGrade => g !== undefined && g.isDelivered === true);

    if (deliveredGrades.length === 0) return 0;
    
    const avgGrade = deliveredGrades.reduce((sum, g) => sum + g.score, 0) / deliveredGrades.length;
    
    // Find criterion weight
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

  const calculateRAProgress = (studentId: string, raId: number) => {
    const ra = LEARNING_OUTCOMES.find(r => r.id === raId);
    if (!ra) return 0;
    
    return ra.criteria.reduce((sum, crit) => {
      return sum + calculateCriterionProgress(studentId, crit.id);
    }, 0);
  };

  // Overall student grade out of 10.0
  const calculateStudentOverallGrade = (studentId: string) => {
    const oralRecord = individualOralGrades.find(g => g.studentId === studentId) || {
      studentId,
      teamGrade: 5.0,
      expositionGrade: 5.0,
      coevalItem1: 'neutral' as const,
      coevalItem2: 'neutral' as const,
      justification: '',
      presented: true
    };
    const isPresented = oralRecord.presented !== false;
    if (!isPresented) return null;

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
      const gradeRecord = grades.find(g => g.studentId === studentId && g.taskId === task.id);
      const score = gradeRecord ? gradeRecord.score : 0;
      teamGrade += (score / 10) * weight;
    });
    teamGrade = Math.min(10, Math.max(0, teamGrade));

    const expositionGrade = oralRecord.expositionGrade !== undefined ? oralRecord.expositionGrade : 5.0;

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
    if (isPresented && !hasMinimumInAllParts) {
      finalComputedScore = Math.min(4.0, finalComputedScore);
    }
    return finalComputedScore;
  };

  const toggleRAExpansion = (raId: number) => {
    setExpandedRAs(prev => 
      prev.includes(raId) ? prev.filter(id => id !== raId) : [...prev, raId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Buscar alumno por nombre o apellido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span>Haz clic en la fila de un alumno para ver su ficha completa.</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th rowSpan={2} className="sticky left-0 z-10 bg-zinc-50 px-6 py-4 text-left text-[10px] font-black uppercase text-zinc-500 tracking-wider w-60 border-r border-zinc-200">
                  Alumno
                </th>
                <th rowSpan={2} className="px-4 py-4 text-center text-[10px] font-black uppercase text-zinc-500 tracking-wider w-24 border-r border-zinc-200 bg-zinc-100/50">
                  Nota Global
                </th>
                {LEARNING_OUTCOMES.map(ra => {
                  const isExpanded = expandedRAs.includes(ra.id);
                  const spanSize = isExpanded ? ra.criteria.length + 1 : 1;

                  return (
                    <th key={ra.id} colSpan={spanSize} className="px-3 py-2.5 text-center border-r border-zinc-200 bg-indigo-50/20">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => toggleRAExpansion(ra.id)}
                          className="p-0.5 hover:bg-indigo-100 rounded text-indigo-700 cursor-pointer transition-colors"
                          title={isExpanded ? "Contraer criterios" : "Expandir criterios (CE)"}
                        >
                          {isExpanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        </button>
                        <div className="group relative cursor-help inline-block">
                          <span className="text-[10px] font-black uppercase text-indigo-700">RA.{ra.id}</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-zinc-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case font-medium leading-relaxed shadow-lg">
                            {ra.title}
                          </div>
                          <div className="text-[8px] font-bold text-zinc-400">{ra.weight}%</div>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
              <tr className="bg-zinc-50/50 border-b border-zinc-200">
                {LEARNING_OUTCOMES.map(ra => {
                  const isExpanded = expandedRAs.includes(ra.id);
                  if (isExpanded) {
                    return (
                      <React.Fragment key={ra.id}>
                        <th className="px-2 py-2 text-center border-r border-zinc-200 bg-indigo-50/50 min-w-[55px]">
                          <span className="text-[9px] font-black text-indigo-700">TOTAL</span>
                        </th>
                        {ra.criteria.map(crit => (
                          <th key={crit.id} className="px-2 py-2 text-center border-r border-zinc-200 min-w-[45px] bg-white">
                            <div className="group relative cursor-help inline-block">
                              <span className="text-[9px] font-bold text-zinc-500 uppercase">{crit.nomenclature}</span>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-zinc-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case font-medium text-left leading-relaxed shadow-lg">
                                {crit.description}
                              </div>
                              <div className="text-[8px] font-medium text-zinc-400">{crit.weight}%</div>
                            </div>
                          </th>
                        ))}
                      </React.Fragment>
                    );
                  } else {
                    return (
                      <th key={ra.id} className="px-2 py-2 text-center border-r border-zinc-200 bg-indigo-50/40 min-w-[55px]">
                        <span className="text-[9px] font-bold text-indigo-700">TOTAL</span>
                      </th>
                    );
                  }
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {sortedStudents.map(student => {
                const overallGrade = calculateStudentOverallGrade(student.id);

                return (
                  <tr 
                    key={student.id} 
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-indigo-50/15 cursor-pointer transition-colors group"
                  >
                    {/* Student Identity */}
                    <td className="sticky left-0 z-10 bg-white px-6 py-3.5 border-r border-zinc-200 group-hover:bg-indigo-50/10">
                      <div className="flex items-center gap-3">
                        <div className={`w-8.5 h-8.5 rounded-xl ${student.color || 'bg-indigo-600 text-white'} flex items-center justify-center text-[10px] font-black shadow-sm`}>
                          {student.initials}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-zinc-900 flex items-center gap-1">
                            <span>{student.name}</span>
                            <Eye className="h-3 w-3 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[9px] font-medium text-zinc-400 uppercase tracking-tight">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Overall Grade */}
                    <td className="px-4 py-3.5 text-center border-r border-zinc-200 font-mono font-black bg-zinc-50/40">
                      {overallGrade !== null ? (
                        <div className={`text-xs ${overallGrade >= 5.0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {overallGrade.toFixed(1)} <span className="text-[9px] text-zinc-400">/ 10</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded uppercase">N.P.</span>
                      )}
                    </td>

                    {/* RAs column loop */}
                    {LEARNING_OUTCOMES.map(ra => {
                      const raProgress = calculateRAProgress(student.id, ra.id);
                      const raPercentage = (raProgress / ra.weight) * 100;
                      const isExpanded = expandedRAs.includes(ra.id);
                      
                      return (
                        <React.Fragment key={ra.id}>
                          {/* RA TOTAL */}
                          <td className="px-2 py-3.5 text-center border-r border-zinc-200 bg-indigo-50/5">
                            <div className={`text-[10px] font-black font-mono ${
                              raPercentage >= 100 ? 'text-emerald-600' : 
                              raPercentage >= 50 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {raProgress.toFixed(1)}%
                            </div>
                          </td>

                          {/* RA Criteria details (only if expanded) */}
                          {isExpanded && ra.criteria.map(crit => {
                            const critProgress = calculateCriterionProgress(student.id, crit.id);
                            const critPercentage = (critProgress / crit.weight) * 100;
                            return (
                              <td key={crit.id} className="px-2 py-3.5 text-center border-r border-zinc-200">
                                <div className={`text-[9px] font-bold font-mono ${
                                  critPercentage >= 100 ? 'text-emerald-500' : 
                                  critPercentage >= 50 ? 'text-amber-500' : 'text-zinc-400'
                                }`}>
                                  {critProgress.toFixed(1)}%
                                </div>
                              </td>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Dossier Modal */}
      {selectedStudent && (
        <StudentDossierModal
          student={selectedStudent}
          assessmentTasks={assessmentTasks}
          grades={grades}
          individualOralGrades={individualOralGrades}
          projects={projects}
          maxTeamScore={maxTeamScore}
          maxExpositionScore={maxExpositionScore}
          maxCoevalAdjustment={maxCoevalAdjustment}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default StudentTrackingTab;
