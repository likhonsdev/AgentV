# API Reference

This document provides detailed information about the API endpoints, request/response formats, and data types used in Sifra UI.

## Table of Contents

- [Chat API](#chat-api)
  - [POST /api/chat](#post-apichat)
- [Genkit Client](#genkit-client)
  - [createChat](#createchat)
  - [streamChat](#streamchat)
  - [generateResponse](#generateresponse)
- [Data Types](#data-types)
  - [Message](#message)
  - [Role](#role)
  - [GenkitClientOptions](#genkitclientoptions)

## Chat API

### POST /api/chat

Streams AI chat messages from Google's Gemini model.

#### Request

- **Method:** POST
- **Content-Type:** application/json

#### Request Body

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `messages` | `Message[]` | Array of chat messages | Yes |
| `systemPrompt` | `string` | System prompt for the AI | No |
| `threadId` | `string` | Thread ID for conversation persistence | No |

Example request body:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how can you help me today?"
    }
  ],
  "systemPrompt": "You are a helpful AI assistant.",
  "threadId": "conversation-123"
}
```

#### Response

- **Content-Type:** text/plain (streaming)
- **Status Code:** 200 OK (Success)

The response is a stream of text chunks from the AI model. Each chunk is a part of the AI's response to the user's message.

#### Response Headers

| Header | Description |
|--------|-------------|
| `X-Thread-ID` | The thread ID for the conversation |

#### Error Response

- **Content-Type:** application/json
- **Status Code:** 500 Internal Server Error

Example error response:

```json
{
  "error": "Please set GEMINI_API_KEY in your environment variables."
}
```

## Genkit Client

The GenkitClient class provides methods to interact with Google's Generative AI API.

### Constructor

Creates a new instance of the GenkitClient.

```typescript
constructor(options: GenkitClientOptions)
```

### createChat

Creates a new chat session with the specified system prompt.

```typescript
async createChat(systemPrompt?: string): Promise<GenerativeModel>
```

#### Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `systemPrompt` | `string` | System prompt for the AI | No |

#### Returns

A Promise that resolves to a GenerativeModel instance from the Google Generative AI SDK.

### streamChat

Streams a response from the model based on the provided messages.

```typescript
async streamChat(messages: Message[], systemPrompt?: string): Promise<AsyncIterable<any>>
```

#### Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `messages` | `Message[]` | Array of chat messages | Yes |
| `systemPrompt` | `string` | System prompt for the AI | No |

#### Returns

A Promise that resolves to an AsyncIterable stream of response chunks.

### generateResponse

Generates a complete response (non-streaming) based on the provided messages.

```typescript
async generateResponse(messages: Message[], systemPrompt?: string): Promise<string>
```

#### Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `messages` | `Message[]` | Array of chat messages | Yes |
| `systemPrompt` | `string` | System prompt for the AI | No |

#### Returns

A Promise that resolves to the complete response text.

## Data Types

### Message

Represents a chat message in the conversation.

```typescript
interface Message {
  role: Role;
  content: string;
}
```

### Role

Defines the possible roles in a conversation.

```typescript
type Role = 'user' | 'assistant' | 'system';
```

### GenkitClientOptions

Configuration options for the GenkitClient.

```typescript
interface GenkitClientOptions {
  apiKey: string;
  modelName?: string;
}
```

## Usage Examples

### Streaming a Response from the API

```typescript
// Client-side code
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      {
        role: 'user',
        content: 'What is the capital of France?',
      },
    ],
    systemPrompt: 'You are a knowledgeable assistant that provides accurate information.',
  }),
});

// Create a reader from the stream
const reader = response.body.getReader();
let decoder = new TextDecoder();
let result = '';

// Process the stream
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  // Decode and display the chunk
  const chunk = decoder.decode(value);
  result += chunk;
  console.log('Current response:', result);
}
```

### Using GenkitClient in a React Component

```typescript
import { useEffect, useState } from 'react';
import { GenkitClient, Message } from '@/lib/genkit';

export default function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [client, setClient] = useState<GenkitClient | null>(null);

  useEffect(() => {
    // Initialize the client
    const newClient = new GenkitClient({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
    });
    setClient(newClient);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !client) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Get response
    try {
      const stream = await client.streamChat([...messages, userMessage]);
      let responseText = '';

      // Process the stream
      for await (const chunk of stream) {
        responseText += chunk.text();
        setResult(responseText);
      }

      // Add assistant message
      const assistantMessage: Message = { role: 'assistant', content: responseText };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div>
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {message.content}
          </div>
        ))}
        {result && (
          <div className="message assistant streaming">
            {result}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

## Rate Limiting and Quotas

When using the Google Generative AI API, be aware of the following:

- There are rate limits based on your API key tier
- Each request consumes tokens, which count against your quota
- The number of tokens used depends on the length of the input and output
- Streaming and non-streaming requests have the same token usage

## Error Handling

The API can return various error codes. Here are the most common ones and how to handle them:

| Error Code | Description | Recommended Action |
|------------|-------------|-------------------|
| 400 | Bad Request | Check your request format and parameters |
| 401 | Unauthorized | Verify your API key is correct and has permissions |
| 403 | Forbidden | Check your API key permissions |
| 404 | Not Found | Verify the API endpoint URL |
| 429 | Too Many Requests | Implement backoff and retry logic |
| 500 | Internal Server Error | Retry after a delay or contact support |

Example error handling:

```typescript
try {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Hello' }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Error ${response.status}: ${errorData.error}`);
    
    // Handle specific error codes
    if (response.status === 429) {
      // Implement retry with exponential backoff
    }
    
    return;
  }

  // Process successful response
} catch (error) {
  console.error('Network error:', error);
}
```

## Best Practices

1. **Implement Retry Logic**: For transient failures, implement exponential backoff and retry logic
2. **Handle Streaming Errors**: When using streaming, handle errors gracefully and inform users
3. **Validate Inputs**: Validate all user inputs before sending to the API
4. **Secure API Keys**: Keep API keys secure and never expose them in client-side code
5. **Set Appropriate Timeouts**: Configure reasonable timeout values for API requests
6. **Monitor Token Usage**: Track token usage to stay within quota limits
7. **Cache Responses**: For common queries, consider implementing caching to reduce API calls
