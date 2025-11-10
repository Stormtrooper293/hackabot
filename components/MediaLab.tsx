
import React, { useState, useEffect, useCallback } from 'react';
import { AspectRatio } from '../types';
import { analyzeImage, editImage, generateImage, generateVideo } from '../services/geminiService';
import { fileToBase64 } from '../utils/helpers';
import ApiKeyModal from './ApiKeyModal';
import Loader from './Loader';
import { ImageIcon, EditIcon, AnalyzeIcon, VideoIcon } from './icons';

type MediaTool = 'generate-image' | 'edit-image' | 'analyze-image' | 'generate-video';

const MediaLab: React.FC = () => {
    const [activeTool, setActiveTool] = useState<MediaTool>('generate-image');
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Generating...');
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');

    const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
    const [apiKeySelected, setApiKeySelected] = useState(false);

    const checkApiKey = useCallback(async () => {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
            setApiKeySelected(true);
            return true;
        }
        setApiKeySelected(false);
        return false;
    }, []);

    useEffect(() => {
        if (activeTool === 'generate-video') {
            checkApiKey();
        }
    }, [activeTool, checkApiKey]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
                setResult(null); 
            };
            reader.readAsDataURL(file);
        }
    };

    const resetState = () => {
        setPrompt('');
        setImageFile(null);
        setImageUrl(null);
        setResult(null);
        setIsLoading(false);
        setError(null);
        setLoadingMessage('Generating...');
    }

    const handleToolChange = (tool: MediaTool) => {
        setActiveTool(tool);
        resetState();
    }

    const handleSubmit = async () => {
        if (!prompt && activeTool !== 'analyze-image') {
            setError('Prompt is required.');
            return;
        }
        if ((activeTool === 'edit-image' || activeTool === 'analyze-image' || (activeTool === 'generate-video' && imageFile)) && !imageFile) {
            setError('Image is required for this tool.');
            return;
        }

        setError(null);
        setIsLoading(true);
        setResult(null);

        try {
            if (activeTool === 'generate-image') {
                setLoadingMessage('Generating image with Imagen 4...');
                const generatedImage = await generateImage(prompt, aspectRatio);
                setResult(generatedImage);
            } else if (imageFile) {
                 const { base64, mimeType } = await fileToBase64(imageFile);
                if (activeTool === 'edit-image') {
                    setLoadingMessage('Editing image with Gemini...');
                    const editedImage = await editImage(prompt, base64, mimeType);
                    setResult(editedImage);
                } else if (activeTool === 'analyze-image') {
                    setLoadingMessage('Analyzing image with Gemini...');
                    const analysis = await analyzeImage(prompt || 'Describe this image in detail.', base64, mimeType);
                    setResult(analysis);
                } else if (activeTool === 'generate-video') {
                     if (!apiKeySelected) {
                        const hasKey = await checkApiKey();
                        if (!hasKey) {
                            setIsKeyModalOpen(true);
                            setIsLoading(false);
                            return;
                        }
                    }
                    setLoadingMessage('Generating video with Veo... This may take a few minutes.');
                    const videoUrl = await generateVideo(prompt, videoAspectRatio, {base64, mimeType}, setLoadingMessage);
                    setResult(videoUrl);
                }
            } else if (activeTool === 'generate-video' && !imageFile) {
                 if (!apiKeySelected) {
                    const hasKey = await checkApiKey();
                    if (!hasKey) {
                        setIsKeyModalOpen(true);
                        setIsLoading(false);
                        return;
                    }
                }
                setLoadingMessage('Generating video with Veo... This may take a few minutes.');
                const videoUrl = await generateVideo(prompt, videoAspectRatio, null, setLoadingMessage);
                setResult(videoUrl);
            }

        } catch (err: any) {
            console.error(err);
             if (err.message.includes("Requested entity was not found")) {
                setError("API Key error. Please re-select your API key.");
                setApiKeySelected(false);
             } else {
                setError(`An error occurred: ${err.message}`);
             }
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderTool = () => {
        const isImageTool = ['edit-image', 'analyze-image'].includes(activeTool);
        const isVideoTool = activeTool === 'generate-video';

        return (
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 space-y-4">
                    <div className="space-y-2">
                        <label className="font-semibold text-cyan-400">Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={activeTool === 'analyze-image' ? 'Optional: Ask something specific about the image...' : 'e.g., A futuristic hacker in a neon city...'}
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 h-32"
                            disabled={isLoading}
                        />
                    </div>
                    {(isImageTool || isVideoTool) && (
                        <div>
                            <label className="font-semibold text-cyan-400">{isVideoTool ? 'Starting Image (Optional)' : 'Upload Image'}</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-300 hover:file:bg-cyan-500/20" disabled={isLoading} />
                        </div>
                    )}
                    {activeTool === 'generate-image' && (
                         <div>
                            <label htmlFor="aspect-ratio" className="font-semibold text-cyan-400">Aspect Ratio</label>
                            <select id="aspect-ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:border-cyan-400">
                                <option value="1:1">1:1 (Square)</option>
                                <option value="16:9">16:9 (Landscape)</option>
                                <option value="9:16">9:16 (Portrait)</option>
                                <option value="4:3">4:3</option>
                                <option value="3:4">3:4</option>
                            </select>
                        </div>
                    )}
                     {activeTool === 'generate-video' && (
                         <div>
                            <label htmlFor="video-aspect-ratio" className="font-semibold text-cyan-400">Aspect Ratio</label>
                            <select id="video-aspect-ratio" value={videoAspectRatio} onChange={(e) => setVideoAspectRatio(e.target.value as '16:9' | '9:16')} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:border-cyan-400">
                                <option value="16:9">16:9 (Landscape)</option>
                                <option value="9:16">9:16 (Portrait)</option>
                            </select>
                        </div>
                    )}
                    <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors disabled:bg-slate-600">
                        {isLoading ? 'Processing...' : 'Generate'}
                    </button>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
                <div className="w-full md:w-2/3 min-h-[300px] md:min-h-0 bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center p-4">
                    {isLoading ? (
                       <div className="text-center">
                         <Loader />
                         <p className="mt-4 text-cyan-300 animate-pulse">{loadingMessage}</p>
                       </div>
                    ) : result ? (
                        activeTool === 'analyze-image' ? <div className="text-slate-300 overflow-y-auto max-h-96 whitespace-pre-wrap">{result}</div> : 
                        activeTool === 'generate-video' ? <video src={result} controls className="max-w-full max-h-full rounded-md" /> :
                        <img src={result} alt="Generated result" className="max-w-full max-h-full object-contain rounded-md" />
                    ) : imageUrl ? (
                         <img src={imageUrl} alt="Uploaded preview" className="max-w-full max-h-full object-contain rounded-md" />
                    ) : (
                        <p className="text-slate-500">Result will appear here</p>
                    )}
                </div>
            </div>
        );
    }
    
    const tools = [
        { id: 'generate-image' as MediaTool, name: 'Generate Image', icon: <ImageIcon />},
        { id: 'edit-image' as MediaTool, name: 'Edit Image', icon: <EditIcon />},
        { id: 'analyze-image' as MediaTool, name: 'Analyze Image', icon: <AnalyzeIcon />},
        { id: 'generate-video' as MediaTool, name: 'Generate Video', icon: <VideoIcon />},
    ];

    return (
        <div className="h-full flex flex-col bg-slate-800/40 rounded-xl border border-slate-700">
            <ApiKeyModal
                isOpen={isKeyModalOpen}
                onClose={() => setIsKeyModalOpen(false)}
                onKeySelected={() => {
                    setApiKeySelected(true);
                    setIsKeyModalOpen(false);
                    // Automatically retry after key selection
                    handleSubmit();
                }}
            />
            <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h2 className="text-lg font-bold text-cyan-400 mb-2 sm:mb-0">Media Lab</h2>
                <div className="flex items-center space-x-1 bg-slate-900/50 p-1 rounded-md">
                     {tools.map(tool => (
                        <button key={tool.id} onClick={() => handleToolChange(tool.id)} className={`px-3 py-1.5 text-xs rounded flex items-center space-x-2 transition-colors ${activeTool === tool.id ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                            {tool.icon}
                            <span className="hidden sm:inline">{tool.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
                {renderTool()}
            </div>
        </div>
    );
};

export default MediaLab;