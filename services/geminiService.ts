import { GoogleGenAI, GenerateContentResponse, Modality, Type, Operation } from "@google/genai";
import { ReconMode, AspectRatio } from '../types';
import { fileToBase64, decode, decodeAudioData } from '../utils/helpers';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateText = async (prompt: string, mode: ReconMode): Promise<{ text: string, sources: {uri: string, title: string}[] | undefined }> => {
    const ai = getAI();
    let model, config;

    switch(mode) {
        case 'pro':
            model = 'gemini-2.5-pro';
            config = { thinkingConfig: { thinkingBudget: 32768 } };
            break;
        case 'search':
            model = 'gemini-2.5-flash';
            config = { tools: [{ googleSearch: {} }] };
            break;
        case 'maps':
            model = 'gemini-2.5-flash';
            config = { tools: [{ googleMaps: {} }] };
            break;
        case 'osint':
            model = 'gemini-2.5-flash';
            const osintSystemInstruction = `You are ReconBot AI, a specialized OSINT (Open-Source Intelligence) assistant. Your mission is to use your web search capabilities to find and summarize publicly available information about the given target (e.g., domain, email, username).

Your task is to:
1.  Analyze the user's query to identify the target.
2.  Perform a web search to gather intelligence related to the target. This includes looking for subdomains, associated accounts, data breaches, technologies used, and other relevant public records.
3.  Synthesize the search results into a concise and structured report.
4.  Structure your response in Markdown format, using headings for different categories of information found (e.g., Domain Information, Associated Accounts, Public Mentions, etc.).
5.  You MUST cite your sources. All information should be backed by the search results provided to you. Do not provide a plan; execute the search and provide the findings.`;
            config = {
                systemInstruction: osintSystemInstruction,
                tools: [{ googleSearch: {} }],
            };
            break;
        case 'flash':
        default:
            model = 'gemini-flash-lite-latest';
            config = {};
            break;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: config
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => {
        const source = chunk.web || chunk.maps;
        return {
            uri: source?.uri || '',
            title: source?.title || ''
        }
    }).filter(s => s.uri);

    return { text: response.text, sources };
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        }
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const editImage = async (prompt: string, base64Data: string, mimeType: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64Data, mimeType: mimeType } },
                { text: prompt },
            ],
        },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error('No image was generated.');
};

export const analyzeImage = async (prompt: string, base64Data: string, mimeType: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ inlineData: { data: base64Data, mimeType: mimeType } }, { text: prompt }] },
    });
    return response.text;
};

export const generateVideo = async (
    prompt: string, 
    aspectRatio: '16:9' | '9:16', 
    image: { base64: string; mimeType: string } | null,
    setLoadingMessage: (message: string) => void
): Promise<string> => {
    const ai = getAI();
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        ...(image && { image: { imageBytes: image.base64, mimeType: image.mimeType } }),
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });

    setLoadingMessage("Video generation started. Polling for completion...");
    let pollCount = 0;
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        pollCount++;
        setLoadingMessage(`Checking status... (Attempt ${pollCount})`);
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation failed or returned no URI.");
    }
    
    setLoadingMessage("Video generated! Fetching video data...");
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};


export const generateSpeech = async (text: string): Promise<{context: AudioContext, source: AudioBufferSourceNode}> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: `Please read this: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    return { context: audioContext, source };
}

// Live Session types and functions
// FIX: Used `InstanceType<typeof GoogleGenAI>` to correctly get the instance type of the GoogleGenAI class, allowing access to instance methods like `live.connect` for type inference.
export type LiveSession = Awaited<ReturnType<InstanceType<typeof GoogleGenAI>['live']['connect']>>;
// FIX: Used `InstanceType<typeof GoogleGenAI>` for consistency to correctly infer the parameter types for the `live.connect` method.
type LiveSessionCallbacks = NonNullable<Parameters<InstanceType<typeof GoogleGenAI>['live']['connect']>[0]>['callbacks'];

export const startLiveSession = (callbacks: LiveSessionCallbacks): Promise<LiveSession> => {
    const ai = getAI();
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: 'You are ReconBot AI, a helpful and concise cybersecurity assistant.',
        },
    });
};