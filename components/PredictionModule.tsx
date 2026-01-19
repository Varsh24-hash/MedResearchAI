
import React, { useState } from 'react';
import { DiseaseAnalysis } from '../types';
import { predictOutcome } from '../services/dataService';
import { ShieldCheck, ShieldAlert, Cpu, Calculator, Info } from 'lucide-react';

interface PredictionModuleProps {
  selectedAnalysis: DiseaseAnalysis;
}

export const PredictionModule: React.FC<PredictionModuleProps> = ({ selectedAnalysis }) => {
  const [formData, setFormData] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ confidence: number; result: string } | null>(null);

  const handlePredict = () => {
    const res = predictOutcome(selectedAnalysis, formData);
    setResult(res);
  };

  const isHighConfidence = result && result.confidence >= 0.8;

  const handleInputChange = (parameter: string, value: string) => {
    setFormData(p => ({ ...p, [parameter]: parseFloat(value) || 0 }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7 space-y-8">
        <div className="bg-[#050505] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Calculator size={16} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Biometric Input Parameters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {selectedAnalysis.weights.slice(0, 8).map(w => (
              <div key={w.parameter} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider truncate">
                    {w.parameter.replace(/_/g, ' ')}
                  </label>
                  <span className={`text-[10px] font-mono ${w.globalWeight >= 0 ? 'text-emerald-500/50' : 'text-rose-500/50'}`}>
                    W: {w.globalWeight.toFixed(2)}
                  </span>
                </div>
                {w.parameter === 'gender' ? (
                  <select
                    onChange={(e) => handleInputChange(w.parameter, e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-600 transition-all font-mono appearance-none"
                    defaultValue=""
                  >
                    <option value="" disabled>Select Orientation</option>
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                    <option value="3">Other</option>
                  </select>
                ) : (
                  <input 
                    type="number" 
                    onChange={(e) => handleInputChange(w.parameter, e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-600 transition-all font-mono"
                    placeholder="0.0"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handlePredict}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] text-sm uppercase tracking-widest shadow-2xl shadow-blue-900/20 flex items-center justify-center space-x-3"
        >
          <Cpu size={18} />
          <span>Execute Neural Inference</span>
        </button>
      </div>

      <div className="lg:col-span-5">
        {result ? (
          <div className="animate-in fade-in zoom-in-95 duration-300 h-full">
            <div className={`p-8 rounded-2xl border h-full flex flex-col ${isHighConfidence ? 'bg-blue-950/10 border-blue-800/30' : 'bg-orange-950/10 border-orange-800/30'}`}>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Neural Confidence</span>
                  <div className={`text-6xl font-black font-mono mt-2 tracking-tighter ${isHighConfidence ? 'text-blue-400' : 'text-orange-400'}`}>
                    {(result.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${isHighConfidence ? 'bg-blue-900/20 text-blue-400' : 'bg-orange-900/20 text-orange-400'}`}>
                  {isHighConfidence ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}
                </div>
              </div>

              <div className="space-y-6 flex-grow flex flex-col justify-end">
                <div className="bg-[#050505] p-6 rounded-2xl border border-gray-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Prediction</span>
                    <span className={`text-xl font-black ${isHighConfidence ? 'text-white' : 'text-orange-400'}`}>
                      {isHighConfidence ? result.result : 'UNCERTAIN'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>Threshold Alignment</span>
                      <span>85.0% Required</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0f0f0f] rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${isHighConfidence ? 'bg-blue-500' : 'bg-orange-500'}`}
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 text-gray-500">
                  <Info size={14} className="mt-1 shrink-0" />
                  <p className="text-[11px] leading-relaxed italic">
                    Result calculated using weighted summation of {selectedAnalysis.weights.length} parameters against global consensus models.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-[#050505]/30">
            <Cpu size={48} className="text-gray-800 mb-6" />
            <h3 className="text-gray-400 font-bold mb-2">Neural Engine Idle</h3>
            <p className="text-gray-600 text-xs max-w-[200px]">Waiting for biometric data stream to begin inference protocols.</p>
          </div>
        )}
      </div>
    </div>
  );
};
