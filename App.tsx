
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Layout } from './components/Layout';
import { Category, DiseaseAnalysis } from './types';
import { performAnalytics, analyzeFiles } from './services/dataService';
import { AnalysisCard } from './components/AnalysisCard';
import { PredictionModule } from './components/PredictionModule';
import { Database, FlaskConical, Dna, Heart, Brain, Search, Globe, ShieldCheck, Activity, LayoutDashboard, Zap, BarChart3, Fingerprint, Upload } from 'lucide-react';

enum View {
  ANALYSIS = 'ANALYSIS',
  PREDICTION = 'PREDICTION'
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.ANALYSIS);
  const [activeCategory, setActiveCategory] = useState<Category>(Category.GENETIC);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // File inputs
  const [globalFile, setGlobalFile] = useState<File | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const globalRef = useRef<HTMLInputElement>(null);
  const localRef = useRef<HTMLInputElement>(null);

  // Results state
  const [analysisResults, setAnalysisResults] = useState<Record<Category, DiseaseAnalysis[]>>({
    [Category.GENETIC]: [],
    [Category.SEXUAL]: [],
    [Category.MENTAL]: [],
  });

  const flatDiseases = useMemo(() => {
    return [...analysisResults[Category.GENETIC], ...analysisResults[Category.SEXUAL], ...analysisResults[Category.MENTAL]];
  }, [analysisResults]);

  const currentResults = useMemo(() => {
    return analysisResults[activeCategory].filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCategory, searchQuery, analysisResults]);

  const categorySummary = useMemo(() => {
    const data = analysisResults[activeCategory];
    if (!data.length) return null;
    const totalDiseases = data.length;
    const biasedCount = data.filter(d => d.backendData.bias_flag).length;
    const biasPercentage = ((biasedCount / (totalDiseases || 1)) * 100).toFixed(1);
    
    const catalysts = data.map(d => d.topPositive.parameter);
    const catalystFreq: Record<string, number> = {};
    catalysts.forEach(c => catalystFreq[c] = (catalystFreq[c] || 0) + 1);
    const topCatalyst = Object.entries(catalystFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { totalDiseases, biasedCount, biasPercentage, topCatalyst };
  }, [activeCategory, analysisResults]);

  const [selectedAnalysis, setSelectedAnalysis] = useState<DiseaseAnalysis | null>(null);

  useEffect(() => {
    if (currentResults.length > 0 && !selectedAnalysis) {
      setSelectedAnalysis(currentResults[0]);
    }
  }, [currentResults, selectedAnalysis]);

  const handleInitialize = async () => {
    if (!globalFile || !localFile) return;
    
    setIsAnalyzing(true);
    try {
      const genetic = await analyzeFiles(globalFile, localFile, Category.GENETIC);
      const sexual = await analyzeFiles(globalFile, localFile, Category.SEXUAL);
      const mental = await analyzeFiles(globalFile, localFile, Category.MENTAL);
      
      setAnalysisResults({
        [Category.GENETIC]: genetic,
        [Category.SEXUAL]: sexual,
        [Category.MENTAL]: mental,
      });
      setDataLoaded(true);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSimulation = () => {
    setAnalysisResults({
      [Category.GENETIC]: performAnalytics(Category.GENETIC),
      [Category.SEXUAL]: performAnalytics(Category.SEXUAL),
      [Category.MENTAL]: performAnalytics(Category.MENTAL),
    });
    setDataLoaded(true);
  };

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-[#0f0f0f] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <div className="flex justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-950/30 border border-blue-800/30 rounded-xl flex items-center justify-center">
                <Database className="text-blue-500" />
              </div>
              <div className="w-12 h-12 bg-emerald-950/30 border border-emerald-800/30 rounded-xl flex items-center justify-center">
                <Globe className="text-emerald-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Initialize Research Node</h1>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto font-mono">
              Upload global and local model files for cross-hospital weight validation and bias detection.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div 
              onClick={() => globalRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center cursor-pointer transition-all ${globalFile ? 'border-blue-600 bg-blue-600/5' : 'border-gray-800 hover:border-blue-600/50 hover:bg-blue-600/5'}`}
            >
              <input type="file" ref={globalRef} className="hidden" onChange={(e) => setGlobalFile(e.target.files?.[0] || null)} />
              <Globe className={`mb-3 ${globalFile ? 'text-blue-500' : 'text-gray-600'}`} />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{globalFile ? globalFile.name : 'Global Model'}</span>
              <span className="text-[10px] text-gray-600 mt-1 uppercase">.csv or .npy</span>
            </div>

            <div 
              onClick={() => localRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center cursor-pointer transition-all ${localFile ? 'border-emerald-600 bg-emerald-600/5' : 'border-gray-800 hover:border-emerald-600/50 hover:bg-emerald-600/5'}`}
            >
              <input type="file" ref={localRef} className="hidden" onChange={(e) => setLocalFile(e.target.files?.[0] || null)} />
              <Database className={`mb-3 ${localFile ? 'text-emerald-500' : 'text-gray-600'}`} />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{localFile ? localFile.name : 'Local Hospital'}</span>
              <span className="text-[10px] text-gray-600 mt-1 uppercase">.csv or .npy</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <button 
              disabled={!globalFile || !localFile || isAnalyzing}
              onClick={handleInitialize}
              className={`w-full font-bold py-4 rounded-xl transition-all text-sm flex items-center justify-center space-x-2 ${(!globalFile || !localFile || isAnalyzing) ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}
            >
              <span>{isAnalyzing ? 'Running Neural Audit...' : 'Execute /analyze Protocol'}</span>
              {isAnalyzing ? <Activity className="animate-spin" size={16} /> : <FlaskConical size={16} />}
            </button>
            <button 
              onClick={handleLoadSimulation}
              className="w-full text-[10px] text-gray-600 font-mono uppercase tracking-widest hover:text-white transition-colors"
            >
              Skip and Load Simulation Data
            </button>
            <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-600 font-mono uppercase tracking-widest pt-2">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>AES-256 Encrypted Connection</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col space-y-8">
        <div className="flex items-center space-x-1 p-1 bg-[#0f0f0f] border border-gray-800 rounded-xl self-start">
          <button
            onClick={() => setActiveView(View.ANALYSIS)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeView === View.ANALYSIS 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>Research Dashboard</span>
          </button>
          <button
            onClick={() => setActiveView(View.PREDICTION)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeView === View.PREDICTION 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Activity size={16} />
            <span>Prediction Terminal</span>
          </button>
        </div>

        {activeView === View.ANALYSIS ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <section className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Disease Parameter Parallelisms</h2>
                  <p className="text-sm text-gray-500 mt-1 font-mono uppercase text-[10px] tracking-widest">FastAPI Backend: /analyze endpoint active</p>
                </div>
                
                <div className="flex items-center bg-[#0a0a0a] border border-gray-800 rounded-lg px-3 py-2 w-full md:w-64 focus-within:border-blue-600 transition-colors">
                  <Search size={16} className="text-gray-600 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Filter diseases..."
                    className="bg-transparent border-none text-sm text-gray-200 focus:outline-none w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: Category.GENETIC, icon: Dna },
                  { id: Category.SEXUAL, icon: Heart },
                  { id: Category.MENTAL, icon: Brain },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl border transition-all ${
                      activeCategory === cat.id 
                      ? 'bg-white text-black border-white shadow-lg' 
                      : 'bg-[#0f0f0f] text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <cat.icon size={16} />
                    <span className="text-sm font-bold tracking-wide">{cat.id}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {currentResults.map(analysis => (
                  <div key={analysis.id} className="h-full">
                    <AnalysisCard analysis={analysis} />
                  </div>
                ))}
              </div>

              {categorySummary && (
                <div className="mt-16 bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  <div className="p-10 border-b border-gray-800 bg-gradient-to-r from-blue-950/20 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-3 max-w-xl">
                      <div className="flex items-center space-x-2 text-blue-500">
                        <Zap size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Aggregate Intelligence Summary</span>
                      </div>
                      <h3 className="text-3xl font-black text-white">{activeCategory} Category Synthesis</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Cross-hospital validation across <span className="text-white font-bold">{categorySummary.totalDiseases}</span> research conditions. 
                        Global catalyst most frequently identified as <span className="text-blue-400 font-mono font-bold uppercase">{categorySummary.topCatalyst.replace(/_/g, ' ')}</span>.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 shrink-0">
                      <div className="bg-[#050505] border border-gray-800 p-5 rounded-xl flex flex-col justify-center items-center text-center min-w-[140px]">
                        <BarChart3 className="text-gray-600 mb-2" size={20} />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bias Flux</span>
                        <span className="text-2xl font-black text-red-500 mt-1">{categorySummary.biasPercentage}%</span>
                      </div>
                      <div className="bg-[#050505] border border-gray-800 p-5 rounded-xl flex flex-col justify-center items-center text-center min-w-[140px]">
                        <Fingerprint className="text-gray-600 mb-2" size={20} />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Node Health</span>
                        <span className="text-2xl font-black text-emerald-500 mt-1">Verified</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                    <div className="p-8 space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Correlation</h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-mono">
                        Weights derived via max-absolute normalization protocols defined by backend /analyze service.
                      </p>
                    </div>
                    <div className="p-8 space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Local Deflection</h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-mono">
                        Identified {categorySummary.biasedCount} critical directional sign flips requiring research audit.
                      </p>
                    </div>
                    <div className="p-8 space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inference State</h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-mono">
                        System ready for diagnostic prediction with high-confidence weighted consensus.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-white tracking-tight">Diagnostic Inference Terminal</h2>
                  <p className="text-gray-500 text-sm">Select disease target and input biometric data for high-confidence prediction.</p>
                </div>
                <div className="w-full md:w-80">
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block">Disease Target</label>
                  <select 
                    value={selectedAnalysis?.id || ''}
                    onChange={(e) => setSelectedAnalysis(flatDiseases.find(d => d.id === e.target.value) || null)}
                    className="w-full bg-[#050505] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-600 transition-all font-bold appearance-none cursor-pointer"
                  >
                    {flatDiseases.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedAnalysis && (
                <PredictionModule selectedAnalysis={selectedAnalysis} />
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
