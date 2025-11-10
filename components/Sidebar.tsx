
import React from 'react';
import { Tab } from '../types';
import { ConsoleIcon, MediaIcon, PhishingIcon, ReportIcon, LiveIcon, BotIcon } from './icons';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const navItems = [
  { id: Tab.ReconConsole, name: 'Recon Console', icon: <ConsoleIcon /> },
  { id: Tab.MediaLab, name: 'Media Lab', icon: <MediaIcon /> },
  { id: Tab.PhishingGen, name: 'Phishing Gen', icon: <PhishingIcon /> },
  { id: Tab.ReportGen, name: 'Report Gen', icon: <ReportIcon /> },
  { id: Tab.LiveSession, name: 'Live Session', icon: <LiveIcon /> },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="w-16 md:w-64 bg-slate-900/70 backdrop-blur-sm border-r border-slate-800 flex flex-col">
      <div className="flex items-center justify-center md:justify-start p-4 h-16 border-b border-slate-800">
        <BotIcon />
        <h1 className="hidden md:block text-xl font-bold ml-2 text-cyan-400">ReconBot AI</h1>
      </div>
      <ul className="flex-1 p-2">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center w-full p-3 my-1 rounded-md transition-colors duration-200 ${
                activeTab === item.id
                  ? 'bg-cyan-500/10 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              {item.icon}
              <span className="hidden md:block ml-4">{item.name}</span>
            </button>
          </li>
        ))}
      </ul>
       <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
        <p className="hidden md:block">For educational and ethical purposes only.</p>
       </div>
    </nav>
  );
};

export default Sidebar;