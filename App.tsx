
import React, { useState } from 'react';
import { Tab } from './types';
import Sidebar from './components/Sidebar';
import ReconConsole from './components/ReconConsole';
import MediaLab from './components/MediaLab';
import PhishingGen from './components/PhishingGen';
import ReportGen from './components/ReportGen';
import LiveSession from './components/LiveSession';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ReconConsole);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.ReconConsole:
        return <ReconConsole />;
      case Tab.MediaLab:
        return <MediaLab />;
      case Tab.PhishingGen:
        return <PhishingGen />;
      case Tab.ReportGen:
        return <ReportGen />;
      case Tab.LiveSession:
        return <LiveSession />;
      default:
        return <ReconConsole />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-mono">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;