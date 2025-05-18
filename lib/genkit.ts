import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Types for our messages
export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  role: Role;
  content: string;
}

interface GenkitClientOptions {
  apiKey: string;
  modelName?: string;
}

export class GenkitClient {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(options: GenkitClientOptions) {
    this.genAI = new GoogleGenerativeAI(options.apiKey);
    this.modelName = options.modelName || 'gemini-pro';
  }

  // Create a new chat session
  async createChat(systemPrompt?: string) {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });

    const generationConfig = {
      temperature: 0.7,
      topK: 1,
      topP: 0.95,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      systemInstruction: systemPrompt,
    });

    return chat;
  }

  // Helper to convert Langbase Message format to Gemini format
  private formatMessages(messages: Message[]) {
    return messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : message.role,
      parts: [{ text: message.content }]
    }));
  }

  // Stream a response from the model
  async streamChat(messages: Message[], systemPrompt?: string) {
    try {
      const chat = await this.createChat(systemPrompt);
      
      // Remove system messages as they're handled by system prompt in Gemini
      const filteredMessages = messages.filter(msg => msg.role !== 'system');
      
      // Use the latest messages for the conversation
      const result = await chat.sendMessageStream(filteredMessages[filteredMessages.length - 1].content);
      
      return result.stream;
    } catch (error) {
      console.error('Error in streamChat:', error);
      throw error;
    }
  }
  
  // Generate a complete response (non-streaming)
  async generateResponse(messages: Message[], systemPrompt?: string) {
    try {
      const chat = await this.createChat(systemPrompt);
      
      // Remove system messages as they're handled by system prompt in Gemini
      const filteredMessages = messages.filter(msg => msg.role !== 'system');
      
      const result = await chat.sendMessage(filteredMessages[filteredMessages.length - 1].content);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      console.error('Error in generateResponse:', error);
      throw error;
    }
  }
}
