import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Database, 
  Bell, 
  Lock, 
  Download, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  Server,
  Terminal,
  School,
  Upload,
  Image as ImageIcon,
  Check,
  Scale
} from 'lucide-react';
import { Project, TeamMember, AssessmentTask } from '../types';

interface SettingsTabProps {
  projects: Project[];
  team: TeamMember[];
  onResetWorkspace: () => void;
  iesName: string;
  iesLogo: string;
  onUpdateIesSettings: (name: string, logo: string) => void;
  maxCoevaluationImpact: number;
  onUpdateCoevaluationImpact: (impact: number) => void;
  maxTeamScore: number;
  maxExpositionScore: number;
  maxCoevalAdjustment: number;
  onUpdateOralGradeConfig: (team: number, expo: number, coeval: number) => void;
  assessmentTasks: AssessmentTask[];
  onUpdateTaskWeights: (weights: { [taskId: string]: number }) => void;
}

export default function SettingsTab({ 
  projects, 
  team, 
  onResetWorkspace,
  iesName,
  iesLogo,
  onUpdateIesSettings,
  maxCoevaluationImpact,
  onUpdateCoevaluationImpact,
  maxTeamScore,
  maxExpositionScore,
  maxCoevalAdjustment,
  onUpdateOralGradeConfig,
  assessmentTasks,
  onUpdateTaskWeights
}: SettingsTabProps) {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [localIesName, setLocalIesName] = useState(iesName);
  const [localIesLogo, setLocalIesLogo] = useState(iesLogo);
  const [isDragging, setIsDragging] = useState(false);

  const [localMaxTeamScore, setLocalMaxTeamScore] = useState(maxTeamScore);
  const [localMaxExpositionScore, setLocalMaxExpositionScore] = useState(maxExpositionScore);
  const [localMaxCoevalAdjustment, setLocalMaxCoevalAdjustment] = useState(maxCoevalAdjustment);

  const [localTaskWeights, setLocalTaskWeights] = useState<{ [taskId: string]: number }>({});

  useEffect(() => {
    setLocalIesName(iesName);
    setLocalIesLogo(iesLogo);
  }, [iesName, iesLogo]);

  useEffect(() => {
    setLocalMaxTeamScore(maxTeamScore);
    setLocalMaxExpositionScore(maxExpositionScore);
    setLocalMaxCoevalAdjustment(maxCoevalAdjustment);
  }, [maxTeamScore, maxExpositionScore, maxCoevalAdjustment]);

  useEffect(() => {
    const weights: { [taskId: string]: number } = {};
    assessmentTasks.forEach(task => {
      weights[task.id] = task.weight !== undefined ? task.weight : 0;
    });
    setLocalTaskWeights(weights);
  }, [assessmentTasks]);

  const handleLogoChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona una imagen válida (PNG, JPG, SVG, etc.).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setLocalIesLogo(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoChange(e.dataTransfer.files[0]);
    }
  };

  const handleSaveIesSettings = () => {
    onUpdateIesSettings(localIesName, localIesLogo);
    triggerToast('Ajustes del IES guardados con éxito.');
  };

  const handleSaveOralConfig = () => {
    onUpdateOralGradeConfig(localMaxTeamScore, localMaxExpositionScore, localMaxCoevalAdjustment);
    triggerToast('Ponderaciones de Defensa Oral actualizadas con éxito.');
  };

  const handleSaveTaskWeights = () => {
    onUpdateTaskWeights(localTaskWeights);
    triggerToast('Ponderaciones de tareas de Fase 1 actualizadas con éxito.');
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Export current memory database to a local file
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ projects, team }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `respaldo_proyectos_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Respaldo JSON descargado con éxito.');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Settings Block: IES & Logo */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden" id="ies-settings-card">
        <div className="px-5 py-4 bg-zinc-50 border-b border-zinc-150 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="h-4.5 w-4.5 text-zinc-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Ajustes de la Institución (IES)</h4>
          </div>
          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">Identidad</span>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block">Nombre del IES / Centro Educativo</label>
            <input
              type="text"
              id="ies-name-input"
              value={localIesName}
              onChange={(e) => setLocalIesName(e.target.value)}
              placeholder="Ej. IES El Arenal"
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-800 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block">Logotipo del Centro (Formato Cuadrado)</label>
            <p className="text-[11px] text-zinc-400">Este logo se usará en la cabecera y el panel principal para identificar a tu centro educativo de forma oficial.</p>
            
            <div className="flex flex-col sm:flex-row gap-5 items-center">
              {/* Logo Preview Container (Strictly Square Aspect Ratio) */}
              <div className="w-32 h-32 bg-zinc-50 border border-zinc-150 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 relative group shadow-inner">
                {localIesLogo ? (
                  <>
                    <img 
                      src={localIesLogo} 
                      alt="Logo del IES" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <button
                        type="button"
                        id="remove-ies-logo-btn"
                        onClick={() => setLocalIesLogo('')}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-semibold shadow-md transition-colors cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400 p-2 text-center">
                    <ImageIcon className="h-8 w-8 mb-1.5 text-zinc-300" />
                    <span className="text-[10px] font-bold">Sin logo</span>
                  </div>
                )}
              </div>

              {/* Upload Drop Zone Area */}
              <div
                id="ies-logo-dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-1 w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-zinc-900 bg-zinc-50' 
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
                onClick={() => document.getElementById('ies-logo-file-input')?.click()}
              >
                <input
                  type="file"
                  id="ies-logo-file-input"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleLogoChange(e.target.files[0]);
                    }
                  }}
                />
                <Upload className="h-5 w-5 text-zinc-400 mb-2" />
                <span className="text-xs font-bold text-zinc-700">Sube o arrastra tu logo aquí</span>
                <span className="text-[10px] text-zinc-400 mt-1">Formatos sugeridos: PNG, JPG, SVG (Máx 2MB). Formato cuadrado 1:1.</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              id="save-ies-settings-btn"
              onClick={handleSaveIesSettings}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Guardar Identidad del Centro</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Block: Coevaluación Configuration */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden" id="coevaluation-settings-card">
        <div className="px-5 py-4 bg-zinc-50 border-b border-zinc-150 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-4.5 w-4.5 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Configuración de Coevaluación</h4>
          </div>
          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">Academia</span>
        </div>

        <div className="p-5 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block">Impacto Máximo en Nota Final</label>
                <p className="text-[11px] text-zinc-400">Define cuántos puntos puede sumar o restar la coevaluación entre compañeros a la nota final del proyecto.</p>
              </div>
              <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-2">
                <span className="text-sm font-black text-indigo-700 font-mono">+/- {maxCoevaluationImpact.toFixed(1)}</span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase">Puntos</span>
              </div>
            </div>

            <div className="space-y-2">
              <input 
                type="range" 
                min="0.1" 
                max="3.0" 
                step="0.1" 
                value={maxCoevaluationImpact}
                onChange={(e) => onUpdateCoevaluationImpact(Number(e.target.value))}
                className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] text-zinc-400 font-bold uppercase px-1">
                <span>0.1 (Mínimo)</span>
                <span>1.5 (Medio)</span>
                <span>3.0 (Máximo)</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
              <strong>Nota:</strong> Este valor afecta directamente al cálculo de la nota final en el panel del profesor. Los alumnos verán este límite en su pestaña de coevaluación para entender el peso de sus valoraciones.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Block: Oral Defense Weights Configuration */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden" id="oral-defense-weights-settings-card">
        <div className="px-5 py-4 bg-zinc-50 border-b border-zinc-150 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-4.5 w-4.5 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Ajustes de Calificación de Defensa Oral</h4>
          </div>
          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">Ponderación</span>
        </div>

        <div className="p-5 space-y-6">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Configura el peso de puntos máximos para cada una de las tres fases del módulo. Los profesores calificarán a cada alumno de <strong>1 a 10</strong>, y el sistema calculará la nota final adaptando esa calificación al peso configurado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Team Score Weight */}
            <div className="space-y-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-zinc-500 block">Fase 1: Equipo</span>
                <span className="font-mono text-xs font-black text-indigo-600">{localMaxTeamScore.toFixed(1)} Pts</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="10.0" 
                step="0.5" 
                value={localMaxTeamScore}
                onChange={(e) => setLocalMaxTeamScore(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[9px] text-zinc-400 block leading-tight">
                Peso del resultado grupal del proyecto (ej: tareas correctas).
              </span>
            </div>

            {/* Coevaluation Weight */}
            <div className="space-y-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-zinc-500 block">Fase 2: Coevaluación</span>
                <span className="font-mono text-xs font-black text-indigo-600">± {localMaxCoevalAdjustment.toFixed(1)} Pts</span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="3.0" 
                step="0.1" 
                value={localMaxCoevalAdjustment}
                onChange={(e) => setLocalMaxCoevalAdjustment(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[9px] text-zinc-400 block leading-tight">
                Ajuste otorgado por compañeros, validado por profesor.
              </span>
            </div>

            {/* Exposition Score Weight */}
            <div className="space-y-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-zinc-500 block">Fase 3: Defensa Indiv.</span>
                <span className="font-mono text-xs font-black text-indigo-600">{localMaxExpositionScore.toFixed(1)} Pts</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="10.0" 
                step="0.5" 
                value={localMaxExpositionScore}
                onChange={(e) => setLocalMaxExpositionScore(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[9px] text-zinc-400 block leading-tight">
                Peso de la exposición y defensa oral individual.
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block">Distribución de Puntos Máximos</span>
              <p className="text-xs text-indigo-900 font-semibold leading-snug">
                Suma Base (Fase 1 + Fase 3): {(localMaxTeamScore + localMaxExpositionScore).toFixed(1)} puntos + Coevaluación (Fase 2: ±{localMaxCoevalAdjustment.toFixed(1)} puntos).
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-black text-indigo-700 font-mono block">
                {(localMaxTeamScore + localMaxExpositionScore).toFixed(1)} / 10.0 Ptos
              </span>
              <span className="text-[8px] text-indigo-400 uppercase font-bold block">Suma de Fase 1 y 3</span>
            </div>
          </div>

          {Math.abs((localMaxTeamScore + localMaxExpositionScore) - 10.0) > 0.01 && (
            <div className="p-3 bg-amber-55/10 border border-amber-100 rounded-xl flex gap-2.5 items-start text-[10px] text-amber-800 font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="leading-normal">
                <strong>Sugerencia Académica:</strong> Se recomienda que la suma base de las fases 1 y 3 sea de 10.0 puntos (por ejemplo, 6.0 de Resultado de Equipo y 3.0 de Defensa Individual, sumando 9.0, de modo que al sumarle o restarle la Coevaluación de la Fase 2 (hasta ±1.0 punto), la nota se sitúe siempre en el rango estándar de 0 a 10 puntos.
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              id="save-oral-weights-btn"
              onClick={handleSaveOralConfig}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all animate-none"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Guardar Configuración de Defensa Oral</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Block: Tasks Weights for Team Score (Fase 1) */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden" id="tasks-weights-settings-card">
        <div className="px-5 py-4 bg-zinc-50 border-b border-zinc-150 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4.5 w-4.5 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Ajustes de Pesos por Tarea (Fase 1: Nota Equipo)</h4>
          </div>
          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">Escala 0-10</span>
        </div>

        <div className="p-5 space-y-6">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Asigna el peso en puntos de cada tarea para el cálculo automático de la <strong>Nota de Equipo (Fase 1, escala 0-10)</strong>. La nota de equipo de cada alumno se calculará de forma ponderada según las notas obtenidas en cada entrega. La suma recomendada es de <strong>10.0 puntos</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessmentTasks.map(task => {
              const currentWeight = localTaskWeights[task.id] !== undefined ? localTaskWeights[task.id] : 0;
              return (
                <div key={task.id} className="space-y-2.5 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/60 flex flex-col justify-between">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-zinc-600 block truncate">{task.title}</span>
                    <span className="font-mono text-xs font-black text-indigo-600 shrink-0">{currentWeight.toFixed(1)} Pts</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="0.0" 
                      max="10.0" 
                      step="0.5" 
                      value={currentWeight}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setLocalTaskWeights(prev => ({
                          ...prev,
                          [task.id]: val
                        }));
                      }}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <input 
                      type="number" 
                      min="0.0" 
                      max="10.0" 
                      step="0.5"
                      value={currentWeight}
                      onChange={(e) => {
                        const val = Math.min(10, Math.max(0, parseFloat(e.target.value) || 0));
                        setLocalTaskWeights(prev => ({
                          ...prev,
                          [task.id]: val
                        }));
                      }}
                      className="w-12 px-1 py-0.5 bg-white border border-zinc-200 rounded-md text-[10px] font-bold text-center text-zinc-800 shrink-0"
                    />
                  </div>
                  
                  {task.id === 'step-11' && (
                    <span className="text-[8px] text-zinc-400 italic block leading-tight">
                      * Configuración inicial sugerida: 0.0 Ptos (solo configurar el equipo).
                    </span>
                  )}
                  {task.id === 'step-16' && (
                    <span className="text-[8px] text-zinc-400 italic block leading-tight">
                      * Configuración inicial sugerida: 0.0 Ptos (la coevaluación se evalúa por separado).
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summation box */}
          {(() => {
            const sum = Object.values(localTaskWeights).reduce((a, b) => (a as number) + (b as number), 0) as number;
            const isCorrect = Math.abs(sum - 10) < 0.01;
            return (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-950' : 'bg-amber-50 border-amber-100 text-amber-950'
                }`}>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider block">Suma de Puntos de Tareas</span>
                    <p className="text-xs font-semibold leading-snug">
                      {isCorrect 
                        ? '¡La distribución es perfecta! Suma exactamente 10.0 puntos (100% de la nota de la Fase 1).' 
                        : 'Se recomienda ajustar las tareas para que la suma total sea de exactamente 10.0 puntos.'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-black font-mono block ${isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {sum.toFixed(1)} / 10.0 Ptos
                    </span>
                    <span className="text-[8px] uppercase font-bold block opacity-75">Suma total actual</span>
                  </div>
                </div>

                {!isCorrect && (
                  <div className="p-3 bg-amber-55/10 border border-amber-100 rounded-xl flex gap-2.5 items-start text-[10px] text-amber-800 font-bold">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="leading-normal">
                      <strong>Sugerencia Académica:</strong> Al ajustar los pesos para sumar 10.0, el sistema calculará la nota de la Fase 1 en el rango estándar de 0 a 10 puntos (por ejemplo: T1 = 0.0, T2 = 2.0, T3 = 3.0, T4 = 1.0, T5 = 2.0, T6 = 0.0, T7 = 2.0, sumando exactamente 10.0).
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              id="save-task-weights-btn"
              onClick={handleSaveTaskWeights}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all animate-none"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Guardar Distribución de Tareas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Block: General */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-zinc-50 border-b border-zinc-150 flex items-center gap-2">
          <Settings className="h-4.5 w-4.5 text-zinc-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Preferencias de Notificaciones</h4>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-zinc-900 block">Notificaciones por Correo</label>
              <span className="text-xs text-zinc-500">Enviar correos cuando un hito técnico es marcado como completado.</span>
            </div>
            <button 
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${emailAlerts ? 'bg-zinc-950' : 'bg-zinc-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${emailAlerts ? 'left-5.5' : 'left-0.5'}`} />
            </button>
          </div>

          <hr className="border-zinc-100" />

          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-zinc-900 block">Resumen Semanal de Desempeño</label>
              <span className="text-xs text-zinc-500">Generar reporte de presupuestos y hilos los lunes por la mañana.</span>
            </div>
            <button 
              onClick={() => setWeeklyDigest(!weeklyDigest)}
              className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${weeklyDigest ? 'bg-zinc-950' : 'bg-zinc-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${weeklyDigest ? 'left-5.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Block: Persistence & Backup */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-zinc-50 border-b border-zinc-150 flex items-center gap-2">
          <Database className="h-4.5 w-4.5 text-zinc-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Base de Datos & Respaldos</h4>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-zinc-800">Exportar información actual</p>
              <p className="text-zinc-500">Descarga un archivo estructurado con todos los proyectos, tareas y profesionales.</p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-zinc-250 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-xl transition-all cursor-pointer bg-white shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar JSON</span>
            </button>
          </div>

          <hr className="border-zinc-100" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-zinc-800 text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <span>Restaurar Entorno de Fábrica</span>
              </p>
              <p className="text-zinc-500">Esto reescribirá todo el almacenamiento local con los proyectos de prueba por defecto.</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas restablecer la plataforma al estado original? Se perderán los proyectos modificados.')) {
                  onResetWorkspace();
                  triggerToast('Plataforma restaurada al estado original con éxito.');
                }
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restaurar Fábrica</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud & Connection Presets */}
      <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-850 text-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <Server className="h-4.5 w-4.5 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Estado de Servidores y API</h4>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          La plataforma está operando temporalmente bajo un motor reactivo de memoria local de alta velocidad. El panel está listo para acoplarse con servicios REST API, Postgres en Cloud SQL, o Firebase Firestore.
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-300 font-medium">Cliente Local: Conectado</span>
          </div>
          <div className="text-zinc-500">|</div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
            <Terminal className="h-3.5 w-3.5" />
            <span>v1.0.0-lite</span>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 text-xs"
          >
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
