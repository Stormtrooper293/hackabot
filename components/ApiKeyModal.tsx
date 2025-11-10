
import React from 'react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onKeySelected: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySelected }) => {
    if (!isOpen) return null;

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            onKeySelected();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-lg p-8 max-w-sm w-full border border-slate-700 shadow-2xl shadow-cyan-500/10">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">API Key Required for Veo</h2>
                <p className="text-slate-300 mb-6">
                    Video generation with Veo requires you to select an API key. This is a one-time setup for this feature.
                </p>
                <p className="text-xs text-slate-400 mb-6">
                    Please ensure your project has billing enabled. For more details, see the {' '}
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                        billing documentation
                    </a>.
                </p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 rounded text-slate-300 hover:bg-slate-700">
                        Cancel
                    </button>
                    <button onClick={handleSelectKey} className="px-4 py-2 rounded bg-cyan-600 text-white hover:bg-cyan-500">
                        Select API Key
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;