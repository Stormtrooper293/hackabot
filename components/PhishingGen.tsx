
import React, { useState } from 'react';
import { generateText } from '../services/geminiService';
import Loader from './Loader';
import MarkdownRenderer from './MarkdownRenderer';
import { generateSpeech } from '../services/geminiService';
import { PlayIcon, StopIcon } from './icons';

const PhishingGen: React.FC = () => {
    const [scenario, setScenario] = useState('');
    const [target, setTarget] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);

    const handleSubmit = async () => {
        if (!target.trim() || !scenario.trim()) {
            setError('Target Profile and Scenario fields cannot be empty.');
            return;
        }
        setError(null);
        setIsLoading(true);
        setResult('');
        
        const prompt = `
            You are a phishing simulation expert creating content for a red team exercise.
            Generate a realistic phishing email based on the following details.
            The output should be in Markdown format, including a subject line.

            **Target Profile:** ${target}
            **Scenario:** ${scenario}
            
            **Email Content:**
        `;

        try {
            const { text } = await generateText(prompt, 'pro');
            setResult(text);
        } catch (error) {
            console.error(error);
            setResult('Error: Could not generate phishing email.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextToSpeech = async () => {
        if (isSpeaking) {
            audioSource?.stop();
            setIsSpeaking(false);
            return;
        }

        if (!result) return;
        setIsSpeaking(true);

        try {
            const { context, source } = await generateSpeech(result);
            setAudioContext(context);
            setAudioSource(source);
            source.onended = () => setIsSpeaking(false);
            source.start();
        } catch (error) {
            console.error("TTS Error:", error);
            setIsSpeaking(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-800/40 rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-700">
                <h2 className="text-lg font-bold text-cyan-400">Phishing Simulation Generator</h2>
            </div>
            <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 overflow-y-auto">
                <div className="w-full md:w-1/3 space-y-4">
                    <div>
                        <label className="font-semibold text-cyan-400">Target Profile</label>
                        <input
                            type="text"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="e.g., Employees at a tech company"
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:border-cyan-400"
                        />
                    </div>
                    <div>
                        <label className="font-semibold text-cyan-400">Scenario</label>
                        <textarea
                            value={scenario}
                            onChange={(e) => setScenario(e.target.value)}
                            placeholder="e.g., Urgent password reset required due to a security breach"
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:border-cyan-400 h-40"
                        />
                    </div>
                    <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors disabled:bg-slate-600">
                        {isLoading ? 'Generating...' : 'Craft Email'}
                    </button>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>
                <div className="w-full md:w-2/3 bg-slate-900/50 border border-slate-700 rounded-lg p-4 relative">
                    <h3 className="text-md font-semibold text-slate-300 mb-2">Generated Email Preview</h3>
                    <div className="overflow-y-auto h-full max-h-[calc(100vh-250px)]">
                        {isLoading ? <Loader /> : result ? <MarkdownRenderer content={result} /> : <p className="text-slate-500">Result will appear here.</p>}
                    </div>
                    {result && !isLoading && (
                        <button onClick={handleTextToSpeech} className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-cyan-400 transition-colors">
                           {isSpeaking ? <StopIcon /> : <PlayIcon />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhishingGen;