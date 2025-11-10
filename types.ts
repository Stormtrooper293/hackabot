export enum Tab {
  ReconConsole,
  MediaLab,
  PhishingGen,
  ReportGen,
  LiveSession,
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  sources?: { uri: string, title: string }[];
}

export type ReconMode = 'flash' | 'pro' | 'search' | 'maps' | 'osint';

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

// This is a global declaration to extend the Window interface for aistudio
declare global {
  // FIX: Declared and used a named interface `AIStudio` to resolve type conflicts
  // with other global declarations of `window.aistudio`.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
    webkitAudioContext: typeof AudioContext
  }
}