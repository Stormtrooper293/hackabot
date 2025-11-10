
import React, { useState, useRef, useEffect } from 'react';
import { Message, ReconMode } from '../types';
import { generateText } from '../services/geminiService';
import { SendIcon, BotIcon, UserIcon, BrainIcon, BoltIcon, SearchIcon, MapIcon, TrashIcon, FingerprintIcon } from './icons';
import Loader from './Loader';
import MarkdownRenderer from './MarkdownRenderer';

const initialMessages: Message[] = [
    { role: 'model', content: "Welcome to ReconBot AI. Enter a target (domain, IP, email) or ask a cybersecurity question to begin. \n\nExamples:\n- `Find subdomains for tesla.com`\n- `Perform an OSINT scan on example@email.com`\n- `Find tech companies near Mountain View, CA`" }
];

const ReconConsole: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ReconMode>('flash');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { text, sources } = await generateText(input, mode);
      const modelMessage: Message = { role: 'model', content: text, sources };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: 'model', content: 'Error: Could not get a response from the AI.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearSession = () => {
    if (window.confirm('Are you sure you want to clear this session? This action cannot be undone.')) {
        setMessages(initialMessages);
        setInput('');
    }
  };

  const modeConfig = {
    flash: { 
      icon: <BoltIcon />, 
      label: 'Quick Scan', 
      model: 'gemini-flash-lite-latest', 
      description: 'Fast, general-purpose answers for quick questions and standard recon tasks.' 
    },
    pro: { 
      icon: <BrainIcon />, 
      label: 'Deep Analysis', 
      model: 'gemini-2.5-pro',
      description: 'Advanced reasoning for complex queries, code analysis, and in-depth vulnerability assessment.'
    },
    osint: { 
      icon: <FingerprintIcon />, 
      label: 'OSINT Scan', 
      model: 'gemini-2.5-pro',
      description: 'Performs a live web search to gather Open-Source Intelligence on a specific target.'
    },
    search: { 
      icon: <SearchIcon />, 
      label: 'Web Search', 
      model: 'gemini-2.5-flash',
      description: 'Uses Google Search to find up-to-date information on recent events or trending topics.'
    },
    maps: { 
      icon: <MapIcon />, 
      label: 'Map Search', 
      model: 'gemini-2.5-flash',
      description: 'Leverages Google Maps for location-based queries and geographical intelligence.'
    },
  };

  return (
    <div className="h-full flex flex-col bg-slate-800/40 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-cyan-400">Recon Console</h2>
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-900/50 p-1 rounded-md">
            {(Object.keys(modeConfig) as ReconMode[]).map(key => (
              <div key={key} className="relative group flex items-center">
                <button 
                  onClick={() => setMode(key)}
                  className={`px-3 py-1.5 text-xs rounded flex items-center space-x-2 transition-colors ${mode === key ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/10' : 'text-slate-300 hover:bg-slate-700'}`}
                >
                  {modeConfig[key].icon}
                  <span className="hidden sm:inline">{modeConfig[key].label}</span>
                </button>
                <div className="absolute bottom-full mb-2 w-64 p-3 bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 left-1/2 -translate-x-1/2">
                    <p className="font-bold text-cyan-400 mb-1">{modeConfig[key].label}</p>
                    <p className="mb-2">{modeConfig[key].description}</p>
                    <p className="text-xs text-slate-500 italic">Model: {modeConfig[key].model}</p>
                </div>
              </div>
            ))}
            </div>
            <button 
                onClick={handleClearSession} 
                className="p-2 text-slate-400 rounded-md hover:bg-slate-700 hover:text-red-400 transition-colors"
                title="Clear Session"
            >
                <TrashIcon />
            </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <div className="p-2 bg-slate-700 rounded-full"><BotIcon /></div>}
              <div className={`max-w-xl p-4 rounded-lg shadow-lg ${msg.role === 'user' ? 'bg-slate-700' : 'bg-slate-900/50'}`}>
                <MarkdownRenderer content={msg.content} />
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-2 border-t border-slate-600">
                    <h4 className="text-xs font-bold text-slate-400 mb-1">Sources:</h4>
                    <ul className="text-xs space-y-1">
                      {msg.sources.map((source, i) => (
                        <li key={i}>
                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">
                            {source.title || source.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {msg.role === 'user' && <div className="p-2 bg-slate-700 rounded-full"><UserIcon /></div>}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-700 rounded-full"><BotIcon /></div>
              <div className="max-w-xl p-4 rounded-lg shadow-lg bg-slate-900/50"><Loader /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex items-center bg-slate-900/80 border border-slate-700 rounded-lg focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ReconBot... (Mode: ${modeConfig[mode].label})`}
            className="flex-1 bg-transparent p-3 focus:outline-none text-slate-200 placeholder-slate-500"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="p-3 text-cyan-400 disabled:text-slate-600 hover:bg-cyan-500/10 rounded-r-lg transition-colors">
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReconConsole;
