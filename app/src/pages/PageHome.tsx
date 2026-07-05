import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PageHome() {
  const navigate = useNavigate();

  // Core system diagnostics metrics
  const systemMetrics = [
    { label: 'CORE LATENCY', value: '4.2ms', status: 'OPTIMAL' },
    { label: 'CELLULAR MESH (INTERCELL)', value: 'ACTIVE Node: Ukiah_CA_01', status: 'ONLINE' },
    { label: 'AI COGNITIVE APEX', value: 'Guava Core v1.5', status: 'STANDBY' },
  ];

  // Active module definitions
  const platformModules = [
    {
      id: 'geopro',
      title: 'GeoPro Spatial Engine',
      description: 'Vector-level 3D mesh rendering pipeline. Overrides standard consumer map limits using live OpenStreetMap and Overture spatial arrays.',
      status: 'READY FOR INGESTION',
      actionText: 'Launch Engine Map',
      route: '/map',
      hot: true
    },
    {
      id: 'intercell',
      title: 'Intercell Node Manager',
      description: 'Localized regional cellular connection deployment arrays and solar-powered network asset orchestration metrics.',
      status: 'CONNECTED [99.8% UPTIME]',
      actionText: 'View Network Map',
      route: '/map',
      hot: false
    },
    {
      id: 'guava',
      title: 'Firehouse Guava AI Console',
      description: 'Dedicated web client workspace hosting custom large language model training parameters and automated token streaming pipelines.',
      status: 'SECURE LINK COMPILED',
      actionText: 'Initialize Node Chat',
      route: '/',
      hot: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-200 font-mono text-xs selection:bg-red-600 selection:text-white p-4 md:p-8 pt-20">
      
      {/* Master Telemetry Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {systemMetrics.map((metric, idx) => (
          <div key={idx} className="bg-[#111111] border border-[#222222] p-4 rounded flex flex-col space-y-1.5">
            <span className="text-neutral-500 font-bold tracking-widest text-[10px] uppercase">{metric.label}</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans font-bold text-white tracking-wide">{metric.value}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                metric.status === 'OPTIMAL' || metric.status === 'ONLINE'
                  ? 'bg-green-950/40 text-green-400 border-green-900' 
                  : 'bg-neutral-900 text-neutral-400 border-[#333]'
              }`}>
                {metric.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Command Display Block */}
      <div className="border border-[#222222] bg-[#111111] rounded overflow-hidden mb-8">
        <div className="p-4 bg-[#141414] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="font-bold tracking-wider uppercase text-neutral-300">STUDIOOS_SYSTEM_CORE_V2</span>
          </div>
          <span className="text-neutral-600 text-[10px]">LOC_REF // CA.US</span>
        </div>
        
        <div className="p-6 md:p-10 space-y-4 max-w-3xl">
          <h1 className="text-2xl md:text-4xl font-sans font-black tracking-tight text-white uppercase">
            High-Performance <br />
            <span className="text-red-600">Spatial & Core Systems</span> Console
          </h1>
          <p className="text-neutral-400 leading-relaxed font-sans text-sm max-w-xl">
            Bypassing consumer abstractions to deliver raw infrastructure mapping, hardware telemetry tracking, and independent neural platform instances through a single command array.
          </p>
        </div>
      </div>

      {/* Interactive Platform Grid */}
      <div className="space-y-3">
        <div className="text-neutral-500 font-bold tracking-widest text-[10px] uppercase px-1">AVAILABLE PLATFORM PIPELINES</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platformModules.map((module) => (
            <div 
              key={module.id} 
              className={`bg-[#111111] border rounded p-5 flex flex-col justify-between transition-all duration-200 ${
                module.hot ? 'border-red-900/50 hover:border-red-600 shadow-lg shadow-red-950/10' : 'border-[#222222] hover:border-[#333333]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-bold text-base text-white">{module.title}</h3>
                  <span className="text-[9px] font-mono text-neutral-500 tracking-tighter">{module.status}</span>
                </div>
                <p className="text-neutral-400 font-sans leading-relaxed text-xs">
                  {module.description}
                </p>
              </div>

              <button
                onClick={() => navigate(module.route)}
                className={`mt-6 w-full py-2.5 rounded font-bold uppercase tracking-wider text-center text-[11px] border transition-all duration-150 ${
                  module.hot 
                    ? 'bg-red-600 border-red-700 text-white hover:bg-red-700' 
                    : 'bg-[#181818] border-[#282828] text-neutral-300 hover:bg-[#222222] hover:text-white'
                }`}
              >
                {module.actionText}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
