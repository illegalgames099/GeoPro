import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import * as pmtiles from 'pmtiles';
import 'mapbox-gl/dist/mapbox-gl.css';

import PlaceSearch from './PlaceSearch';
import LayersPanel from './LayersPanel';
import DirectionsPanel from './DirectionsPanel';
import FeatureTable from './FeatureTable';

// Safe runtime fallback token check
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN';
const isTokenMissing = !MAPBOX_TOKEN || MAPBOX_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN';
if (!isTokenMissing) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  type: 'vector' | 'raster' | 'geojson';
}

interface ViewportState {
  lat: number;
  lng: number;
  zoom: number;
}

export default function PageMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [activePanel, setActivePanel] = useState<'layers' | 'directions' | 'search'>('layers');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTableOpen, setIsTableOpen] = useState(false);

  // HUD state tracks local workspace coordinate telemetry safely
  const [viewport, setViewport] = useState<ViewportState>({
    lat: 39.1502,
    lng: -123.2078,
    zoom: 14.5,
  });

  const [layers, setLayers] = useState<Layer[]>([
    { id: 'basemap', name: 'Standard Terrain Base', visible: true, type: 'raster' },
    { id: 'buildings', name: '3D Buildings (Overture/OSM)', visible: true, type: 'vector' },
    { id: 'roads', name: 'Transportation Network', visible: true, type: 'vector' },
    { id: 'custom-pmtiles', name: 'Local Infrastructure PMTiles', visible: false, type: 'vector' },
  ]);

  // 1. Initialize PMTiles Protocol globally
  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    mapboxgl.addProtocol("pmtiles", protocol.tile);
    
    return () => {
      mapboxgl.removeProtocol("pmtiles");
    };
  }, []);

  // 2. Mapbox Lifecycle Core Setup
  useEffect(() => {
    if (isTokenMissing || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // High-contrast premium dark layout
      center: [viewport.lng, viewport.lat],
      zoom: viewport.zoom,
      pitch: 45,
      attributionControl: false,
      trackResize: true
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);

      // Force-inject Mapbox core 3D building styling parameters safely if layers exist
      if (map.getLayer('building')) {
        map.setLayoutProperty('building', 'visibility', 'visible');
      }
    });

    // Performance-optimized HUD updater utilizing requestAnimationFrame to debounce re-renders
    const handleMapMove = () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

      animationFrameRef.current = requestAnimationFrame(() => {
        const center = map.getCenter();
        setViewport({
          lng: center.lng,
          lat: center.lat,
          zoom: map.getZoom(),
        });
      });
    };

    map.on('move', handleMapMove);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      map.off('move', handleMapMove);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 3. Fix Layout Canvas Stretching Bug on Panel Toggles
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    // Resize map canvas immediately and right after transition speeds finish (300ms)
    mapRef.current.resize();
    const resizeTimer = setTimeout(() => {
      mapRef.current?.resize();
    }, 320);

    return () => clearTimeout(resizeTimer);
  }, [isSidebarOpen, isTableOpen, mapLoaded]);

  // 4. Memoized Layer Action Toggles
  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.id === id) {
          const nextVisibility = !layer.visible;
          const visibilityString = nextVisibility ? 'visible' : 'none';

          const map = mapRef.current;
          if (map && map.isStyleLoaded()) {
            // Defensive layer verification mapping routines
            if (id === 'buildings' && map.getLayer('building')) {
              map.setLayoutProperty('building', 'visibility', visibilityString);
            } else if (map.getLayer(id)) {
              map.setLayoutProperty(id, 'visibility', visibilityString);
            }
          }
          return { ...layer, visible: nextVisibility };
        }
        return layer;
      })
    );
  }, []);

  // 5. Memoized Navigational Fly-to Actions
  const handlePanToCoordinates = useCallback((coords: [number, number]) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: coords,
        zoom: 15.5,
        essential: true,
        pitch: 30,
      });
    }
  }, []);

  // Early return if security authorization is completely missing
  if (isTokenMissing) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="border border-red-900 bg-red-950/20 px-6 py-8 rounded-lg max-w-md shadow-2xl">
          <h2 className="text-red-500 font-black tracking-widest uppercase mb-2">Configuration Required</h2>
          <p className="text-neutral-400 text-xs leading-relaxed mb-4">
            Mapbox API Access Token is missing or invalid. Please populate your environment configuration file or insert your credential parameter to spin up the engine instance canvas.
          </p>
          <div className="text-[10px] bg-[#111111] p-2 rounded font-mono text-neutral-500 border border-[#222222]">
            VITE_MAPBOX_ACCESS_TOKEN Token Check Fail
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0a0a] text-neutral-200 overflow-hidden select-none font-sans">
      
      {/* Top Navigation Control Bar */}
      <header className="flex items-center justify-between px-4 h-14 bg-[#111111] border-b border-[#222222] z-10 shadow-md">
        <div className="flex items-center gap-6">
          <h1 className="text-red-500 font-black tracking-wider text-lg uppercase">
            GeoPro <span className="text-white font-light">Engine</span>
          </h1>
          <div className="w-72">
            <PlaceSearch onSelect={handlePanToCoordinates} />
          </div>
        </div>
        
        <div>
          <button 
            onClick={() => setIsSidebarOpen(prev => !prev)} 
            className="px-3 py-1.5 bg-[#222222] hover:bg-red-700 hover:text-white border border-[#333333] rounded text-xs uppercase font-semibold tracking-wider transition-colors duration-200"
          >
            {isSidebarOpen ? 'Hide Controls' : 'Show Controls'}
          </button>
        </div>
      </header>

      {/* Main Workspace Split Layout */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Dynamic Sidebar Controls */}
        <aside 
          className={`flex flex-col bg-[#111111] border-r border-[#222222] transition-all duration-300 z-20 will-change-[width] ${
            isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden border-r-0'
          }`}
        >
          {/* Tab Selection Headers */}
          <div className="flex border-b border-[#222222] bg-[#0d0d0d] text-xs font-semibold uppercase tracking-wider">
            <button 
              onClick={() => setActivePanel('layers')} 
              className={`flex-1 py-3.5 text-center transition-all ${ 
                activePanel === 'layers' 
                  ? 'text-red-500 border-b-2 border-red-600 bg-[#161616]' 
                  : 'text-neutral-400 hover:text-white hover:bg-[#141414]' 
              }`}
            >
              Layers
            </button>
            <button 
              onClick={() => setActivePanel('directions')} 
              className={`flex-1 py-3.5 text-center transition-all ${ 
                activePanel === 'directions' 
                  ? 'text-red-500 border-b-2 border-red-600 bg-[#161616]' 
                  : 'text-neutral-400 hover:text-white hover:bg-[#141414]' 
              }`}
            >
              Routing
            </button>
          </div>

          {/* Panel Views Content Context */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activePanel === 'layers' && (
              <LayersPanel layers={layers} onToggleLayer={toggleLayerVisibility} />
            )} 
            {activePanel === 'directions' && ( 
              <DirectionsPanel onRoute={(start, end) => console.log('Route requested:', start, end)} /> 
            )}
          </div>

          {/* Bottom Diagnostics / Status Foot */}
          <div className="p-3 bg-[#0d0d0d] border-t border-[#222222] flex justify-between items-center text-[10px] font-mono text-neutral-500">
            <span>STATUS: <span className={mapLoaded ? 'text-green-500' : 'text-amber-500'}>{mapLoaded ? 'MAP_READY' : 'INITIALIZING'}</span></span>
            <span>EPSG:3857</span>
          </div>
        </aside>

        {/* Core Map Viewport Container */}
        <main className="flex-1 relative h-full bg-[#0d0d0d]">
          
          {/* Mapbox Render Container Canvas Target */}
          <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />

          {/* Map Overlay Loading State */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm flex flex-col items-center justify-center z-40 transition-opacity duration-500">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-red-500 font-mono tracking-widest text-xs uppercase animate-pulse">
                Loading Mapbox Engine...
              </span>
            </div>
          )}

          {/* Floating Map HUD Utilities - Throttled Precision Telemetry */}
          {mapLoaded && (
            <div className="absolute top-4 right-4 bg-[#111111]/85 backdrop-blur-md border border-[#333333] p-3 rounded shadow-2xl z-30 pointer-events-none text-[11px] font-mono text-neutral-400 space-y-1 w-48">
              <div className="text-red-500 border-b border-[#222222] pb-1 mb-1 font-bold tracking-wider uppercase text-[10px]">
                HUD Diagnostics
              </div>
              <div>Lat: <span className="text-white">{viewport.lat.toFixed(4)}° N</span></div>
              <div>Lon: <span className="text-white">{Math.abs(viewport.lng).toFixed(4)}° W</span></div>
              <div>Zoom: <span className="text-white">{viewport.zoom.toFixed(1)}</span></div>
            </div>
          )}

          {/* Floating Control for Attribute Panel Toggle */}
          {mapLoaded && (
            <button
              onClick={() => setIsTableOpen(prev => !prev)}
              className="absolute bottom-4 left-4 z-30 px-3 py-1.5 bg-[#111111]/90 hover:bg-red-700 border border-[#333333] hover:border-red-600 rounded text-[10px] uppercase font-mono tracking-wider transition-all duration-200"
            >
              {isTableOpen ? 'Close Data Table' : 'Open Data Table'}
            </button>
          )}

          {/* Collapsible Feature/Attribute Table Panel */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-[#111111] border-t border-[#222222] z-30 transition-all duration-300 ease-in-out transform will-change-[height] ${
              isTableOpen ? 'h-64' : 'h-0 overflow-hidden border-t-0'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d0d] border-b border-[#222222]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Attribute Inspection Console</span>
              <button 
                onClick={() => setIsTableOpen(false)} 
                className="text-neutral-500 hover:text-red-500 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="h-[calc(100%-33px)] overflow-auto">
              <FeatureTable />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
