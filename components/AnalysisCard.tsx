
import React from 'react';
import { DiseaseAnalysis } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AnalysisCardProps {
  analysis: DiseaseAnalysis;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const globalVal = data.global_weight;
    const localVal = data.local_weight;
    
    return (
      <div className="bg-[#050505] border border-gray-800 p-3 rounded-lg shadow-2xl text-[10px] font-mono min-w-[180px] animate-in fade-in zoom-in duration-150">
        <div className="mb-2 pb-2 border-b border-gray-800">
          <span className="text-gray-500 uppercase tracking-tighter">Parameter:</span>
          <span className="text-white ml-2 capitalize font-bold">{data.name}</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Global Weight:</span>
            <span className={`font-bold ${globalVal >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {globalVal > 0 ? '+' : ''}{globalVal.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Local Weight:</span>
            <span className="text-blue-400 font-bold">
              {localVal > 0 ? '+' : ''}{localVal.toFixed(3)}
            </span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-800 flex justify-between items-center">
          <span className="text-gray-500 uppercase text-[9px]">Direction:</span>
          <span className={`font-black tracking-widest uppercase text-[9px] ${data.direction === 'POSITIVE' ? 'text-emerald-500' : data.direction === 'NEGATIVE' ? 'text-rose-500' : 'text-gray-500'}`}>
            {data.direction}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
  const chartData = analysis.backendData.features.map(f => ({
    name: f.parameter.replace(/_/g, ' '),
    global: f.global_scaled,
    local: f.local_scaled,
    global_weight: f.global_weight,
    local_weight: f.local_weight,
    direction: f.direction
  }));

  const corrections = analysis.backendData.features.filter(f => 
    Math.sign(f.global_weight) !== Math.sign(f.local_weight) && Math.abs(f.global_weight) > 0.1
  );

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] border border-gray-800 rounded-xl overflow-hidden shadow-2xl transition-all hover:border-gray-700 group">
      <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#0d0d0d]">
        <div>
          <h3 className="text-lg font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{analysis.name}</h3>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-[0.2em] font-medium">{analysis.category} Intelligence</p>
        </div>
        {analysis.backendData.bias_flag ? (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-red-950/20 border border-red-900/40 rounded text-[9px] font-black text-red-400 uppercase tracking-tighter">
            <AlertCircle size={10} strokeWidth={3} />
            <span>BIAS FLAG</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-green-950/20 border border-green-900/40 rounded text-[9px] font-black text-green-400 uppercase tracking-tighter">
            <CheckCircle2 size={10} strokeWidth={3} />
            <span>STABLE</span>
          </div>
        )}
      </div>

      <div className="flex-grow p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[380px]">
        {/* Metric Insights */}
        <div className="lg:col-span-5 flex flex-col space-y-3 h-full">
          <div className="flex-1 min-h-[80px] p-4 bg-[#0a0a0a] rounded-lg border border-gray-800/50 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Global Catalyst</span>
              <TrendingUp size={12} className="text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-white truncate capitalize mb-0.5">
              {analysis.topPositive.parameter.replace(/_/g, ' ')}
            </p>
            <div className="text-[10px] text-emerald-500 font-mono font-medium">
              +{analysis.topPositive.global_weight.toFixed(3)}
            </div>
          </div>

          <div className="flex-1 min-h-[80px] p-4 bg-[#0a0a0a] rounded-lg border border-gray-800/50 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Inhibitor</span>
              <TrendingDown size={12} className="text-rose-500" />
            </div>
            <p className="text-sm font-bold text-white truncate capitalize mb-0.5">
              {analysis.topNegative.parameter.replace(/_/g, ' ')}
            </p>
            <div className="text-[10px] text-rose-500 font-mono font-medium">
              {analysis.topNegative.global_weight.toFixed(3)}
            </div>
          </div>

          {/* Deflections Box */}
          <div className="flex-[1.5] p-4 bg-red-950/5 rounded-lg border border-red-900/10 flex flex-col overflow-hidden">
            <span className="text-[9px] font-black text-red-500/80 uppercase tracking-widest block mb-2">Directional Corrections</span>
            <div className="flex-grow space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
              {corrections.length > 0 ? (
                corrections.map(f => (
                  <div key={f.parameter} className="flex items-center justify-between text-[10px] font-mono border-b border-red-900/10 pb-1">
                    <span className="capitalize text-gray-400 truncate mr-2">{f.parameter.replace(/_/g, ' ')}</span>
                    <span className="text-red-400 shrink-0 uppercase text-[8px] font-black tracking-tighter">Corrected</span>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-[10px] text-gray-600 italic">
                  No directional bias detected.
                </div>
              )}
            </div>
            <p className="mt-2 text-[9px] text-gray-600 leading-tight">
              Using {analysis.backendData.normalization}.
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-7 h-full bg-[#0a0a0a] rounded-lg p-3 border border-gray-800/30 flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Normalized Weight Distribution</span>
             <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-[8px] text-gray-500 uppercase">Global</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 border border-blue-500 rounded-full"></div>
                  <span className="text-[8px] text-gray-500 uppercase">Local</span>
                </div>
             </div>
          </div>
          <div className="flex-grow min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical" 
                margin={{ top: 0, right: 10, left: 20, bottom: 0 }}
              >
                <XAxis type="number" hide domain={[-1, 1]} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#374151" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false}
                  width={60}
                  tick={{ fill: '#6b7280', fontWeight: 500 }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  wrapperStyle={{ pointerEvents: 'none' }}
                />
                <ReferenceLine x={0} stroke="#1f2937" strokeWidth={1} />
                <Bar dataKey="global" name="Global Influence" radius={[0, 2, 2, 0]} barSize={8}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.global >= 0 ? '#10b981' : '#ef4444'} fillOpacity={0.8} />
                  ))}
                </Bar>
                <Bar dataKey="local" name="Local Influence" radius={[0, 2, 2, 0]} barSize={4}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-local-${index}`} fill="transparent" stroke="#3b82f6" strokeWidth={1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
