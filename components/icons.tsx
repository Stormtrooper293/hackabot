
import React from 'react';

const iconProps = {
  className: "w-5 h-5",
  strokeWidth: 2,
};

export const ConsoleIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M4 17l6-6-6-6M12 19h8" />
  </svg>
);
export const MediaIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);
export const PhishingIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M2.5 13.5A2.5 2.5 0 0 1 5 11h14a2.5 2.5 0 0 1 2.5 2.5v6a2.5 2.5 0 0 1-2.5 2.5H5a2.5 2.5 0 0 1-2.5-2.5v-6Z" />
    <path d="M5 11V6a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 19 6v5" />
    <path d="m14 17-2-2-2 2" />
    <path d="M10 13h4" />
  </svg>
);
export const ReportIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);
export const LiveIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
export const BotIcon = () => (
  <svg {...iconProps} className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 8V4H8" />
    <rect x="4" y="12" width="16" height="8" rx="2" />
    <path d="M12 12v8" />
    <path d="M9 16.5v-1" />
    <path d="M15 16.5v-1" />
    <path d="M12 4.5a2.5 2.5 0 0 1 5 0" />
    <path d="M12 4.5a2.5 2.5 0 0 0-5 0" />
  </svg>
);
export const UserIcon = () => (
    <svg {...iconProps} className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);
export const SendIcon = () => (
  <svg {...iconProps} className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22 11 13 2 9 22 2z" />
  </svg>
);
export const BrainIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7h-3A2.5 2.5 0 0 1 4 4.5v0A2.5 2.5 0 0 1 6.5 2h3Z"/><path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v0A2.5 2.5 0 0 1 14.5 7h-3a2.5 2.5 0 0 1-2.5-2.5v0A2.5 2.5 0 0 1 11.5 2h3Z"/><path d="M6 15.5A2.5 2.5 0 0 1 3.5 13v-3A2.5 2.5 0 0 1 6 7.5h3A2.5 2.5 0 0 1 11.5 10v3A2.5 2.5 0 0 1 9 15.5H6Z"/><path d="M18 15.5A2.5 2.5 0 0 1 15.5 13v-3A2.5 2.5 0 0 1 18 7.5h3A2.5 2.5 0 0 1 23.5 10v3A2.5 2.5 0 0 1 21 15.5H18Z"/><path d="M12 22a2.5 2.5 0 0 1-2.5-2.5v-3A2.5 2.5 0 0 1 12 14h0a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 12 22Z"/></svg>;
export const BoltIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
export const SearchIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
export const MapIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>;
export const ImageIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
export const EditIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
export const AnalyzeIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"/></svg>;
export const VideoIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
export const MicIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
export const StopCircleIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect></svg>;
export const PlayIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
export const StopIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="6" y="6" width="12" height="12"></rect></svg>;
export const TrashIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);
export const FingerprintIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/>
        <path d="M5 12a7 7 0 0 1 14 0"/>
        <path d="M5 12a7 7 0 0 1 14 0"/>
        <path d="M8.5 12a3.5 3.5 0 0 1 7 0"/>
        <path d="M12 12a1 1 0 0 1 2 0"/>
        <path d="M2 16h.01"/>
        <path d="M21.8 16.2a10 10 0 0 0-11.4 1.4"/>
        <path d="M2.2 16.2a10 10 0 0 1 11.4 1.4"/>
        <path d="M7 19.5a2.5 2.5 0 0 1 5 0"/>
        <path d="M17 19.5a2.5 2.5 0 0 0-5 0"/>
    </svg>
);