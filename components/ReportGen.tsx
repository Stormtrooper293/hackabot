
import React, { useState } from 'react';
import { generateText } from '../services/geminiService';
import Loader from './Loader';
import MarkdownRenderer from './MarkdownRenderer';

const ReportGen: React.FC = () => {
    const [findings, setFindings] = useState('');
    const [target, setTarget] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!findings || !target) return;
        setIsLoading(true);
        setResult('');
        
        const prompt = `
            You are a professional cybersecurity analyst tasked with writing a penetration test report.
            Generate a formal report in Markdown format based on the provided information.
            The report must include:
            1.  An Executive Summary for non-technical stakeholders.
            2.  A Technical Findings section detailing each vulnerability.
            3.  Severity Ratings (Critical, High, Medium, Low) for each finding.
            4.  Remediation recommendations for each finding.

            **Target System:** ${target}
            
            **Raw Findings:**
            ${findings}
        `;

        try {
            const { text } = await generateText(prompt, 'pro');
            setResult(text);
        } catch (error) {
            console.error(error);
            setResult('Error: Could not generate the report.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-800/40 rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-700">
                <h2 className="text-lg font-bold text-cyan-400">Auto-Generated Pentest Report</h2>
            </div>
            <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 overflow-y-auto">
                <div className="w-full md:w-1/3 space-y-4">
                    <div>
                        <label className="font-semibold text-cyan-400">Target System / Application</label>
                        <input
                            type="text"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="e.g., web-app.corp.com"
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:border-cyan-400"
                        />
                    </div>
                    <div>
                        <label className="font-semibold text-cyan-400">Raw Findings & Notes</label>
                        <textarea
                            value={findings}
                            onChange={(e) => setFindings(e.target.value)}
                            placeholder="- Found XSS on /search?q=... (High)
- Exposed .git directory (Medium)
- Outdated jQuery v1.8 (Low)"
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:border-cyan-400 h-64"
                        />
                    </div>
                    <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors disabled:bg-slate-600">
                        {isLoading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
                <div className="w-full md:w-2/3 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <h3 className="text-md font-semibold text-slate-300 mb-2">Generated Report</h3>
                    <div className="overflow-y-auto h-full max-h-[calc(100vh-250px)] prose prose-invert prose-p:text-slate-300 prose-headings:text-cyan-400 prose-strong:text-slate-100 prose-code:text-amber-400">
                       {isLoading ? <Loader /> : result ? <MarkdownRenderer content={result} /> : <p className="text-slate-500">Result will appear here.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportGen;