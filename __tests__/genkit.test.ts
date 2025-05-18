import { GenkitClient, Message } from '../lib/genkit';

// Mock GoogleGenerativeAI
jest.mock('@google/generative-ai', () => {
  const mockSendMessageStream = jest.fn().mockImplementation(() => {
    return {
      stream: (async function* () {
        yield { text: () => 'Hello' };
        yield { text: () => ', ' };
        yield { text: () => 'World!' };
      })(),
    };
  });

  const mockSendMessage = jest.fn().mockImplementation(() => {
    return {
      response: Promise.resolve({
        text: () => 'Hello, World!'
      })
    };
  });

  const mockStartChat = jest.fn().mockImplementation(() => {
    return {
      sendMessageStream: mockSendMessageStream,
      sendMessage: mockSendMessage,
    };
  });

  const mockGetGenerativeModel = jest.fn().mockImplementation(() => {
    return {
      startChat: mockStartChat,
    };
  });

  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: mockGetGenerativeModel,
      };
    }),
    HarmCategory: {
      HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
      HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
      HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    },
    HarmBlockThreshold: {
      BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  };
});

describe('GenkitClient', () => {
  const apiKey = 'test-api-key';
  let genkitClient: GenkitClient;
  
  beforeEach(() => {
    genkitClient = new GenkitClient({ apiKey });
  });
  
  it('should create a chat session', async () => {
    const chat = await genkitClient.createChat('You are a helpful assistant');
    expect(chat).toBeDefined();
  });
  
  it('should stream chat responses', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello' }
    ];
    
    const stream = await genkitClient.streamChat(messages);
    
    let result = '';
    for await (const chunk of stream) {
      result += chunk.text();
    }
    
    expect(result).toBe('Hello, World!');
  });
  
  it('should generate a complete response', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello' }
    ];
    
    const response = await genkitClient.generateResponse(messages);
    
    expect(response).toBe('Hello, World!');
  });
});
