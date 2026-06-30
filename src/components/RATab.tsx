import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Layout, 
  Edit3, 
  Save, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { LEARNING_OUTCOMES as INITIAL_OUTCOMES, LearningOutcome, RACriterion } from '../data/ra';

interface RATabProps {
  readOnly?: boolean;
}

const RATab: React.FC<RATabProps> = ({ readOnly = false }) => {
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>(INITIAL_OUTCOMES);
  const [expandedRAs, setExpandedRAs] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null); // e.g. 'ra-1' or 'crit-1a'

  const toggleRA = (id: number) => {
    setExpandedRAs(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const totalGlobalWeight = useMemo(() => 
    outcomes.reduce((sum, ra) => sum + ra.weight, 0), 
  [outcomes]);

  const handleUpdateRAWeight = (id: number, weight: number) => {
    if (readOnly) return;
    setOutcomes(prev => prev.map(ra => ra.id === id ? { ...ra, weight } : ra));
  };

  const handleUpdateRATitle = (id: number, title: string) => {
    if (readOnly) return;
    setOutcomes(prev => prev.map(ra => ra.id === id ? { ...ra, title } : ra));
  };

  const handleUpdateCriterionWeight = (raId: number, critId: string, weight: number) => {
    if (readOnly) return;
    setOutcomes(prev => prev.map(ra => {
      if (ra.id === raId) {
        return {
          ...ra,
          criteria: ra.criteria.map(c => c.id === critId ? { ...c, weight } : c)
        };
      }
      return ra;
    }));
  };

  const handleUpdateCriterionDescription = (raId: number, critId: string, description: string) => {
    if (readOnly) return;
    setOutcomes(prev => prev.map(ra => {
      if (ra.id === raId) {
        return {
          ...ra,
          criteria: ra.criteria.map(c => c.id === critId ? { ...c, description } : c)
        };
      }
      return ra;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Global Validation Header */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm transition-colors ${
        Math.abs(totalGlobalWeight - 100) < 0.01
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
          : 'bg-rose-50 border-rose-200 text-rose-800'
      }`}>
        <div className="flex items-center gap-3">
          {Math.abs(totalGlobalWeight - 100) < 0.01 ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600" />
          )}
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight">Validación Global de Pesos</h3>
            <p className="text-[11px] font-medium opacity-80">
              {readOnly 
                ? 'Estado actual de la configuración de pesos del módulo.' 
                : 'La suma de todos los Resultados de Aprendizaje debe ser exactamente 100%'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black font-mono">{totalGlobalWeight.toFixed(1)}%</span>
          <p className="text-[10px] font-bold uppercase opacity-60">Total Global</p>
        </div>
      </div>

      <div className="grid gap-4">
        {outcomes.map((ra) => {
          const isExpanded = expandedRAs.includes(ra.id);
          const criteriaSum = ra.criteria.reduce((sum, c) => sum + c.weight, 0);
          const isSpecialized = ra.id >= 6;
          
          return (
            <div 
              key={ra.id} 
              className={`border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${
                !isSpecialized 
                  ? (isExpanded ? 'bg-emerald-50/40 border-emerald-200' : 'bg-emerald-50/10 border-zinc-200')
                  : (isExpanded ? 'bg-blue-50/40 border-blue-200' : 'bg-blue-50/10 border-zinc-200')
              }`}
            >
              <div className="p-4 flex items-center gap-4">
                <button 
                  onClick={() => toggleRA(ra.id)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    !isSpecialized ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${!isSpecialized ? 'text-emerald-600' : 'text-blue-600'}`}>RA.{ra.id}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">{ra.criteria.length} Criterios</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Peso RA:</span>
                      {readOnly ? (
                        <span className={`text-[10px] font-black ${!isSpecialized ? 'text-emerald-700' : 'text-blue-700'}`}>{ra.weight}</span>
                      ) : (
                        <input 
                          type="number"
                          value={ra.weight}
                          onChange={(e) => handleUpdateRAWeight(ra.id, Number(e.target.value))}
                          className={`w-14 px-2 py-0.5 text-[10px] font-black rounded border transition-colors focus:outline-none focus:ring-1 ${
                            !isSpecialized 
                              ? 'bg-white border-emerald-100 text-emerald-700 focus:ring-emerald-500' 
                              : 'bg-white border-blue-100 text-blue-700 focus:ring-blue-500'
                          }`}
                        />
                      )}
                      <span className={`text-[10px] font-black ${!isSpecialized ? 'text-emerald-400' : 'text-blue-400'}`}>%</span>
                    </div>
                  </div>

                  {editingId === `ra-${ra.id}` && !readOnly ? (
                    <div className="flex items-center gap-2">
                      <input 
                        autoFocus
                        value={ra.title}
                        onChange={(e) => handleUpdateRATitle(ra.id, e.target.value)}
                        onBlur={() => setEditingId(null)}
                        className="flex-1 text-sm font-black text-zinc-900 bg-white border border-zinc-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <button onClick={() => setEditingId(null)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Save className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div 
                      className={`flex items-center gap-2 ${!readOnly ? 'group cursor-pointer' : ''}`} 
                      onClick={() => !readOnly && setEditingId(`ra-${ra.id}`)}
                    >
                      <h3 className="text-sm font-black text-zinc-900 leading-tight">
                        {ra.title}
                      </h3>
                      {!readOnly && <Edit3 className="h-3 w-3 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  )}
                </div>

                <div className={`text-right px-4 py-2 rounded-xl border ${
                  Math.abs(criteriaSum - 100) < 0.01
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                    : 'bg-rose-50 border-rose-100 text-rose-700'
                }`}>
                  <span className="text-xs font-black font-mono block">{criteriaSum.toFixed(1)}%</span>
                  <span className="text-[8px] font-bold uppercase opacity-60">Suma Crit.</span>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 space-y-3">
                  {ra.criteria.map((criterion) => (
                    <div 
                      key={criterion.id}
                      className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center shadow-2xs hover:border-zinc-300 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs font-mono font-black text-[11px] ${
                        !isSpecialized ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {criterion.nomenclature}
                      </div>

                      <div className="flex-1">
                        {editingId === `crit-${criterion.id}` && !readOnly ? (
                          <textarea 
                            autoFocus
                            rows={2}
                            value={criterion.description}
                            onChange={(e) => handleUpdateCriterionDescription(ra.id, criterion.id, e.target.value)}
                            onBlur={() => setEditingId(null)}
                            className="w-full text-xs text-zinc-600 font-medium leading-relaxed bg-zinc-50 border border-zinc-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                          />
                        ) : (
                          <p 
                            className={`text-xs text-zinc-600 font-medium leading-relaxed flex items-start gap-2 ${!readOnly ? 'group cursor-pointer' : ''}`}
                            onClick={() => !readOnly && setEditingId(`crit-${criterion.id}`)}
                          >
                            {criterion.description}
                            {!readOnly && <Edit3 className="h-3 w-3 text-zinc-300 opacity-0 group-hover:opacity-100 shrink-0 mt-0.5" />}
                          </p>
                        )}
                      </div>

                      <div className="md:w-80 shrink-0 flex items-center justify-end gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-zinc-400 uppercase">Peso:</span>
                          {readOnly ? (
                            <span className={`text-[10px] font-black ${!isSpecialized ? 'text-emerald-700' : 'text-blue-700'}`}>{criterion.weight}</span>
                          ) : (
                            <input 
                              type="number"
                              value={criterion.weight}
                              onChange={(e) => handleUpdateCriterionWeight(ra.id, criterion.id, Number(e.target.value))}
                              className={`w-14 px-2 py-1 text-[10px] font-black rounded-lg border text-center transition-colors focus:outline-none focus:ring-2 ${
                                !isSpecialized 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 focus:ring-emerald-500' 
                                  : 'bg-blue-50 border-blue-200 text-blue-700 focus:ring-blue-500'
                              }`}
                            />
                          )}
                          <span className="text-[10px] font-black text-zinc-400">%</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[9px] font-black text-indigo-600 uppercase tracking-tight">
                          <Layout className="h-2.5 w-2.5" />
                          {criterion.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RATab;
