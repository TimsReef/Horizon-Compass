
import React, { useState, useEffect, useCallback } from 'react';
import { Theme, InsightData } from './types';
import { useCompass } from './hooks/useCompass';
import CompassDisc from './components/CompassDisc';
import { getHeadingInsight } from './services/geminiService';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const { orientation, location, error, requestPermissions, permissionGranted } = useCompass();
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [lastInsightHeading, setLastInsightHeading] = useState(-1);

  // Auto-detect theme from system or default to dark (better for car safety)
  useEffect(() => {
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);

  const fetchInsight = useCallback(async () => {
    if (isInsightLoading) return;
    setIsInsightLoading(true);
    try {
      const data = await getHeadingInsight(orientation.heading, location.latitude, location.longitude);
      setInsight(data);
      setLastInsightHeading(orientation.heading);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInsightLoading(false);
    }
  }, [orientation.heading, location.latitude, location.longitude, isInsightLoading]);

  // Request new insight if heading changes significantly (e.g., > 30 degrees)
  useEffect(() => {
    if (Math.abs(orientation.heading - lastInsightHeading) > 30 && permissionGranted) {
      const timer = setTimeout(() => {
        fetchInsight();
      }, 2000); // debounce
      return () => clearTimeout(timer);
    }
  }, [orientation.heading, lastInsightHeading, permissionGranted, fetchInsight]);

  const isDarkMode = theme === Theme.DARK;

  if (!permissionGranted) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-8 ${isDarkMode ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-zinc-900'}`}>
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center">
          <i className="fa-solid fa-compass text-5xl text-red-500 animate-pulse"></i>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Horizon Compass</h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            High-precision navigation with real-time sensor data and AI-powered heading insights.
          </p>
        </div>
        <button
          onClick={requestPermissions}
          className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 transition-all active:scale-95"
        >
          Initialize Sensors
        </button>
        {error && <p className="text-red-400 text-sm bg-red-400/10 p-4 rounded-lg border border-red-400/20">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'}`}>
      
      {/* Header - Fixed Top */}
      <header className="p-6 flex justify-between items-center z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-location-arrow text-white text-xs"></i>
          </div>
          <span className="font-extrabold tracking-tighter text-xl">HORIZON</span>
        </div>
        <button 
          onClick={toggleTheme}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-zinc-100 hover:bg-zinc-200'}`}
        >
          <i className={`fa-solid ${isDarkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-indigo-600'} text-xl`}></i>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-8 md:gap-12 max-w-7xl mx-auto w-full">
        
        {/* Left/Center Column: Visual Compass */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
          <CompassDisc heading={orientation.heading} isDarkMode={isDarkMode} />
          
          {/* Secondary Telemetry */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-100'} flex flex-col items-center`}>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Pitch</span>
              <span className="text-xl font-bold mono">{orientation.pitch}°</span>
            </div>
            <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-100'} flex flex-col items-center`}>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Roll</span>
              <span className="text-xl font-bold mono">{orientation.roll}°</span>
            </div>
          </div>
        </div>

        {/* Right Column: Insights & Navigation Data (Optimal for CarPlay/Landscape) */}
        <div className="flex-1 w-full flex flex-col space-y-6">
          
          {/* Geolocation Card */}
          <div className={`p-6 rounded-3xl shadow-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <i className="fa-solid fa-satellite text-blue-500"></i>
              </div>
              <h2 className="text-lg font-bold">Live Telemetry</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Latitude</p>
                <p className="text-lg font-bold mono">{location.latitude?.toFixed(4) || '--.----'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Longitude</p>
                <p className="text-lg font-bold mono">{location.longitude?.toFixed(4) || '--.----'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Altitude</p>
                <p className="text-lg font-bold mono">{location.altitude ? `${Math.round(location.altitude)}m` : '-- m'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Speed</p>
                <p className="text-lg font-bold mono">{location.speed ? `${Math.round(location.speed * 3.6)}km/h` : '0 km/h'}</p>
              </div>
            </div>
          </div>

          {/* Smart Insights Card */}
          <div className={`p-6 rounded-3xl shadow-xl border relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'} ${isInsightLoading ? 'opacity-50' : ''}`}>
            {isInsightLoading && (
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                <div className="h-full bg-red-500 animate-[loading_2s_infinite]"></div>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <i className="fa-solid fa-sparkles text-emerald-500"></i>
                </div>
                <h2 className="text-lg font-bold">Heading Insight</h2>
              </div>
              <button 
                onClick={fetchInsight}
                disabled={isInsightLoading}
                className="text-zinc-500 hover:text-red-500 transition-colors"
              >
                <i className={`fa-solid fa-rotate-right ${isInsightLoading ? 'animate-spin' : ''}`}></i>
              </button>
            </div>

            {insight ? (
              <div className="animate-in slide-in-from-bottom-2 duration-500">
                <h3 className="text-xl font-extrabold text-red-500 mb-2">{insight.headingName}</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {insight.description}
                </p>
                {insight.landmarks && insight.landmarks.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {insight.landmarks.map((l, i) => (
                      <span key={i} className={`text-[10px] px-2 py-1 rounded-lg border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-500'}`}>
                        {l}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 italic">Stabilizing heading for smarter insights...</p>
            )}
          </div>

        </div>
      </main>

      {/* Footer / CarPlay Action Bar */}
      <footer className={`p-6 md:p-8 flex justify-center sticky bottom-0 z-30 ${isDarkMode ? 'bg-zinc-950/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md'}`}>
        <div className={`p-2 rounded-2xl flex items-center space-x-2 border shadow-sm ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-100 border-gray-200'}`}>
          <button className="w-14 h-14 rounded-xl flex items-center justify-center bg-red-500 text-white shadow-lg active:scale-95 transition-transform">
            <i className="fa-solid fa-map-location-dot text-xl"></i>
          </button>
          <button className={`w-14 h-14 rounded-xl flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors active:scale-95`}>
            <i className="fa-solid fa-share-nodes text-xl"></i>
          </button>
          <button className={`w-14 h-14 rounded-xl flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors active:scale-95`}>
            <i className="fa-solid fa-gear text-xl"></i>
          </button>
        </div>
      </footer>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default App;
