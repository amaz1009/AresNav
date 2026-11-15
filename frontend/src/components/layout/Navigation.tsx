import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import type { NavPage } from '../../types/models';
import {
  Compass,
  Map,
  Layers,
  MapPin,
  Route,
  Activity,
  FileText,
  Box,
} from 'lucide-react';

interface TabItem {
  id: NavPage;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Navigation: React.FC = () => {
  const { activePage, setActivePage, candidateSites, routes, base, destination } = useMissionStore();

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Mission Overview',
      icon: <Compass className="h-3.5 w-3.5" strokeWidth={1.5} />,
    },
    {
      id: 'explorer',
      label: 'Mars Explorer',
      icon: <Map className="h-3.5 w-3.5" strokeWidth={1.5} />,
    },
    {
      id: 'layers',
      label: 'Scientific Layers',
      icon: <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />,
      badge: '5',
    },
    {
      id: 'sites',
      label: 'Site Intelligence',
      icon: <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />,
      badge: String(candidateSites.length),
    },
    {
      id: 'traverse',
      label: 'Traverse Planner',
      icon: <Route className="h-3.5 w-3.5" strokeWidth={1.5} />,
      badge: base && destination ? `${routes.length} Alt` : undefined,
    },
    {
      id: 'simulation',
      label: 'Mission Simulation',
      icon: <Activity className="h-3.5 w-3.5" strokeWidth={1.5} />,
    },
    {
      id: 'terrain-3d',
      label: '3D Terrain',
      icon: <Box className="h-3.5 w-3.5" strokeWidth={1.5} />,
      badge: '3D',
    },
    {
      id: 'reports',
      label: 'Mission Reports',
      icon: <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />,
    },
  ];

  return (
    <nav className="h-10 border-b border-[#181A22] bg-[#060709] px-4 flex items-center space-x-1 overflow-x-auto z-20 shrink-0 select-none">
      <div className="flex items-center space-x-1">
        {tabs.map((tab) => {
          const isActive = activePage === tab.id;
          return (
            <button
              key={tab.id}
              data-testid={`nav-tab-${tab.id}`}
              onClick={() => setActivePage(tab.id)}
              className={`relative flex items-center space-x-2 px-3.5 h-10 text-[11px] font-mono uppercase tracking-[0.12em] font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-[#F4F4F2] bg-[#0A0B0E]'
                  : 'text-[#8B909A] hover:text-[#F4F4F2] hover:bg-[#0F1015]'
              }`}
            >
              <span className={isActive ? 'text-[#C85A32]' : 'text-[#8B909A]'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded-[2px] tracking-normal ${
                    isActive
                      ? 'bg-[#C85A32]/20 text-[#E27B54] border border-[#C85A32]/40 font-semibold'
                      : 'bg-[#0F1015] text-[#8B909A] border border-[#181A22]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              {/* Active Tab Accent Line: Muted Martian Rust */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C85A32]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
