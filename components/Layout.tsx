
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200">
      <header className="border-b border-gray-800 bg-[#0a0a0a] sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white">M</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">MedResearch AI</h1>
            <p className="text-xs text-gray-500 font-mono">Cross-Hospital Analytics v2.4</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-950/30 border border-green-900/50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-green-400">Secure Node Online</span>
          </div>
          <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Documentation</button>
        </div>
      </header>
      <main className="max-w-[1600px] mx-auto p-6">
        {children}
      </main>
    </div>
  );
};
