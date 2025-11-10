
import React, { useState, useRef, useEffect } from 'react';
import { startLiveSession, LiveSession } from '../services/geminiService';
import { MicIcon, StopCircleIcon } from './icons';
import { encode, decode, decodeAudioData } from '../utils/helpers';
import { LiveServerMessage, Blob } from '@google/genai';

type SessionState = 'idle' | 'connecting' | 'active' | 'error' | 'closed';

const LiveSession: React.FC = () => {
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [userTranscript, setUserTranscript] = useState('');
    const [modelTranscript, setModelTranscript] = useState('');
    const [history, setHistory] = useState<{ user: string, model: string }[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const sessionRef = useRef<LiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);

    // Audio playback queue
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const stopSession = () => {
        if (sessionRef.current) {
            sessionRef.current.close();
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (outputAudioContextRef.current) {
            outputAudioContextRef.current.close();
        }
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        
        sessionRef.current = null;
        audioContextRef.current = null;
        outputAudioContextRef.current = null;
        mediaStreamRef.current = null;
        processorRef.current = null;
        nextStartTimeRef.current = 0;
        
        setSessionState('closed');
    };

    const handleMessage = async (message: LiveServerMessage) => {
        // Handle transcription
        if (message.serverContent?.inputTranscription) {
            setUserTranscript(prev => prev + message.serverContent.inputTranscription.text);
        }
        if (message.serverContent?.outputTranscription) {
            setModelTranscript(prev => prev + message.serverContent.outputTranscription.text);
        }
        if (message.serverContent?.turnComplete) {
            setHistory(prev => [...prev, { user: userTranscript, model: modelTranscript }]);
            setUserTranscript('');
            setModelTranscript('');
        }

        // Handle audio playback
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio && outputAudioContextRef.current) {
            const outCtx = outputAudioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
            const source = outCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outCtx.destination);
            source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            audioSourcesRef.current.add(source);
        }

        if (message.serverContent?.interrupted) {
            audioSourcesRef.current.forEach(source => source.stop());
            audioSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
        }
    };

    const start = async () => {
        if (sessionState === 'active' || sessionState === 'connecting') return;
        setSessionState('connecting');
        setHistory([]);
        setUserTranscript('');
        setModelTranscript('');
        setErrorMessage(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const inputCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = inputCtx;
            outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });


            const sessionPromise = startLiveSession({
                onmessage: handleMessage,
                onclose: () => setSessionState('closed'),
                onerror: (e) => {
                    console.error('Session error:', e);
                    setErrorMessage('A communication error occurred. The session has been disconnected.');
                    setSessionState('error');
                    stopSession();
                },
                onopen: () => {
                    const source = inputCtx.createMediaStreamSource(stream);
                    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                    processorRef.current = processor;

                    processor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(int16.buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    source.connect(processor);
                    processor.connect(inputCtx.destination);
                    setSessionState('active');
                }
            });

            sessionPromise.then(session => {
                sessionRef.current = session;
            }).catch(err => {
                 console.error('Failed to start session:', err);
                 setErrorMessage('Failed to connect to the live session service. Please check your network connection and try again.');
                 setSessionState('error');
            });

        } catch (err) {
            console.error('Error getting user media or starting session:', err);
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setErrorMessage('Microphone access denied. Please allow microphone access in your browser settings to continue.');
                } else {
                    setErrorMessage('Could not access microphone. Please ensure it is connected and enabled in your system settings.');
                }
            } else {
                 setErrorMessage('An unknown error occurred while trying to access the microphone.');
            }
            setSessionState('error');
        }
    };
    
    useEffect(() => {
        // Cleanup on unmount
        return () => stopSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="h-full flex flex-col bg-slate-800/40 rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-cyan-400">Live Session</h2>
                <div className="flex items-center space-x-2">
                    <span className={`h-3 w-3 rounded-full ${sessionState === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span className="text-sm capitalize">{sessionState}</span>
                </div>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
                <div className="w-full max-w-2xl bg-slate-900/50 rounded-lg p-4 h-64 overflow-y-auto">
                   {history.map((turn, i) => (
                       <div key={i} className="mb-4">
                           <p className="text-cyan-400 font-semibold">You:</p>
                           <p className="text-slate-300 mb-2">{turn.user}</p>
                           <p className="text-green-400 font-semibold">ReconBot:</p>
                           <p className="text-slate-300">{turn.model}</p>
                       </div>
                   ))}
                   {sessionState === 'active' && (
                       <div>
                           <p className="text-cyan-400 font-semibold">You:</p>
                           <p className="text-slate-300 mb-2">{userTranscript}...</p>
                           <p className="text-green-400 font-semibold">ReconBot:</p>
                           <p className="text-slate-300">{modelTranscript}...</p>
                       </div>
                   )}
                   {sessionState === 'idle' && <p className="text-slate-500">Press Start to begin a new session.</p>}
                   {sessionState === 'connecting' && <p className="text-slate-500">Connecting...</p>}
                   {sessionState === 'error' && <p className="text-red-500">{errorMessage || 'Session ended due to an error.'}</p>}
                   {sessionState === 'closed' && <p className="text-slate-500">Session closed. Press Start to begin a new session.</p>}
                </div>
                
                {sessionState !== 'active' ? (
                    <button onClick={start} className="flex items-center space-x-2 bg-green-600 text-white font-bold py-3 px-6 rounded-full hover:bg-green-500 transition-colors disabled:bg-slate-600">
                        <MicIcon />
                        <span>Start Session</span>
                    </button>
                ) : (
                    <button onClick={stopSession} className="flex items-center space-x-2 bg-red-600 text-white font-bold py-3 px-6 rounded-full hover:bg-red-500 transition-colors">
                        <StopCircleIcon />
                        <span>Stop Session</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default LiveSession;