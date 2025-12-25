
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initialize GoogleGenAI with the API key from environment variables
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  // Restyle image using gemini-2.5-flash-image
  async restyleImage(base64Image: string, style: string): Promise<string | null> {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: cleanBase64, mimeType: 'image/png' } },
            { text: `Apply a ${style} filter to this person's video frame. Maintain facial features but transform the environment and lighting. Return the edited image.` },
          ],
        },
      });

      // Find the image part, do not assume it is the first part
      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : null;
    } catch (error) {
      console.error("Restyle Error:", error);
      return null;
    }
  }

  // Fix: Added missing editSnapshot method for ImageEditorOverlay
  async editSnapshot(base64Image: string, prompt: string): Promise<string | null> {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: cleanBase64, mimeType: 'image/png' } },
            { text: prompt },
          ],
        },
      });

      // Find the image part, do not assume it is the first part
      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : null;
    } catch (error) {
      console.error("Edit Snapshot Error:", error);
      return null;
    }
  }

  // Live Transcription Setup using Gemini Live API
  connectTranscription(callbacks: {
    onTranscript: (text: string, isUser: boolean) => void;
    onError: (err: any) => void;
  }) {
    // Fix: Providing all required callbacks: onopen, onmessage, onerror, and onclose
    return this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          console.debug('Live transcription session opened');
        },
        onmessage: async (message: LiveServerMessage) => {
          // Process model's audio transcription
          if (message.serverContent?.outputTranscription) {
            callbacks.onTranscript(message.serverContent.outputTranscription.text, false);
          }
          // Process user's audio transcription
          if (message.serverContent?.inputTranscription) {
            callbacks.onTranscript(message.serverContent.inputTranscription.text, true);
          }
        },
        onerror: (e: any) => {
          callbacks.onError(e);
        },
        onclose: () => {
          console.debug('Live transcription session closed');
        },
      },
      config: {
        responseModalities: [Modality.AUDIO], // Must be an array with a single Modality.AUDIO element
        outputAudioTranscription: {}, // Enable transcription for model output
        inputAudioTranscription: {},  // Enable transcription for user input
      }
    });
  }
}

export const geminiService = new GeminiService();
