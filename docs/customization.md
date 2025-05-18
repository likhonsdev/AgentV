# Customization Guide

This document provides detailed instructions on how to customize various aspects of Sifra UI to meet your specific requirements.

## Table of Contents

- [Customization Guide](#customization-guide)
  - [Table of Contents](#table-of-contents)
  - [UI Customization](#ui-customization)
    - [Theming](#theming)
      - [Global Theme](#global-theme)
      - [CSS Variables](#css-variables)
    - [Component Styling](#component-styling)
      - [Example: Customizing the Chat Input](#example-customizing-the-chat-input)
      - [Creating Component Variants](#creating-component-variants)
    - [Layout Customization](#layout-customization)
      - [Custom Page Layout](#custom-page-layout)
  - [Behavior Customization](#behavior-customization)
    - [Custom System Prompts](#custom-system-prompts)
    - [Message Handling](#message-handling)
    - [Response Processing](#response-processing)
  - [AI Model Customization](#ai-model-customization)
    - [Using Different Models](#using-different-models)
    - [Advanced Model Parameters](#advanced-model-parameters)
  - [Advanced Customization](#advanced-customization)
    - [Custom Components](#custom-components)
    - [Custom Hooks](#custom-hooks)
    - [Extensions](#extensions)

## UI Customization

### Theming

Sifra UI uses Tailwind CSS for styling, making it easy to customize the appearance.

#### Global Theme

To customize the global theme, modify the `tailwind.config.ts` file:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // ...
  theme: {
    extend: {
      colors: {
        // Define your custom colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... other shades
          500: '#4B96FF', // Primary blue color
          // ... other shades
          900: '#0c4a6e',
        },
        secondary: {
          // Your secondary color palette
        },
        // Other color definitions
      },
      // ...
    },
  },
  // ...
};

export default config;
```

#### CSS Variables

You can also customize colors by modifying the CSS variables in `app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  
  /* ... other dark mode variables */
}
```

### Component Styling

You can customize individual components by using the `className` prop provided by most components.

#### Example: Customizing the Chat Input

```tsx
import { ChatInput } from '@/components/chat-input';

// In your component
<ChatInput
  // ... other props
  className="rounded-xl shadow-lg border-2 border-primary-500"
/>
```

#### Creating Component Variants

For more extensive customization, you can create custom variants of existing components:

```tsx
// components/custom-chat-input.tsx
import { ChatInput } from '@/components/chat-input';
import { cn } from '@/lib/utils';

interface CustomChatInputProps extends React.ComponentProps<typeof ChatInput> {
  variant: 'minimal' | 'prominent';
}

export function CustomChatInput({
  variant = 'minimal',
  className,
  ...props
}: CustomChatInputProps) {
  return (
    <ChatInput
      className={cn(
        // Base styles
        "transition-all duration-200",
        
        // Variant-specific styles
        variant === 'minimal' && "bg-transparent border-0 shadow-none",
        variant === 'prominent' && "bg-primary-50 border-2 border-primary-300 shadow-md",
        
        // Allow overriding with custom className
        className
      )}
      {...props}
    />
  );
}
```

### Layout Customization

You can customize the layout by modifying the `app/layout.tsx` file or creating custom layouts.

#### Custom Page Layout

```tsx
// app/custom-layout.tsx
import { Header } from '@/components/header';
import { GenkitChatbot } from '@/components/genkit-chatbot';

export default function CustomChatLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Custom header */}
      <Header className="border-b border-gray-200" />
      
      {/* Custom sidebar */}
      <div className="flex flex-1">
        <aside className="w-64 bg-gray-50 p-4 hidden md:block">
          <h2 className="text-xl font-semibold">Chat History</h2>
          {/* Sidebar content */}
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-4">
          <GenkitChatbot />
        </main>
      </div>
      
      {/* Custom footer */}
      <footer className="bg-gray-100 p-4 text-center text-gray-600">
        Powered by Sifra UI
      </footer>
    </div>
  );
}
```

## Behavior Customization

### Custom System Prompts

You can customize the AI's behavior by providing a custom system prompt:

```tsx
// app/page.tsx
import { GenkitChatbot } from '@/components/genkit-chatbot';

export default function ChatPage() {
  const customSystemPrompt = `
    You are an AI assistant specialized in helping with technical support issues.
    Please provide clear, step-by-step instructions to solve problems.
    If you don't know the solution, suggest troubleshooting steps instead of guessing.
  `;
  
  return (
    <GenkitChatbot
      systemPrompt={customSystemPrompt}
    />
  );
}
```

### Message Handling

You can customize how messages are processed by extending the `useGenkit` hook:

```tsx
// lib/hooks/use-custom-genkit.tsx
import { useGenkit } from '@/lib/hooks/use-genkit';
import { useState, useCallback } from 'react';
import { Message } from '@/lib/genkit';

export function useCustomGenkit(options) {
  // Use the base hook
  const baseHook = useGenkit(options);
  
  // Add custom functionality
  const handleCustomSubmit = useCallback((e) => {
    // For example, add timestamps to messages
    const currentTime = new Date().toISOString();
    const messageWithMetadata = {
      ...baseHook.input,
      metadata: { timestamp: currentTime }
    };
    
    // Process the message
    baseHook.handleSubmit(e);
    
    // Additional logic, like logging
    console.log(`Message sent at ${currentTime}`);
  }, [baseHook.input, baseHook.handleSubmit]);

  // Return the enhanced hook
  return {
    ...baseHook,
    handleSubmit: handleCustomSubmit,
  };
}
```

### Response Processing

You can customize how responses are processed before displaying them:

```tsx
// components/custom-chat-message.tsx
import { ChatMessage } from '@/components/chat-message';
import { Message } from '@/lib/genkit';
import { useMemo } from 'react';

interface CustomChatMessageProps {
  message: Message;
  isLast?: boolean;
}

export function CustomChatMessage({ message, isLast }: CustomChatMessageProps) {
  // Process the message content
  const processedContent = useMemo(() => {
    // Example: Add syntax highlighting to specific patterns
    if (message.role === 'assistant') {
      // Highlight URLs
      return message.content.replace(
        /(https?:\/\/[^\s]+)/g,
        '<span class="text-blue-500 underline">$1</span>'
      );
    }
    
    return message.content;
  }, [message]);

  const processedMessage = {
    ...message,
    content: processedContent,
  };
  
  return <ChatMessage message={processedMessage} isLast={isLast} />;
}
```

## AI Model Customization

### Using Different Models

You can use different Gemini models by changing the `modelName` prop:

```tsx
<GenkitChatbot
  modelName="gemini-ultra" // For more advanced capabilities
  // ...other props
/>
```

### Advanced Model Parameters

You can customize the model's behavior by modifying the `GenkitClient` class:

```typescript
// lib/custom-genkit.ts
import { GenkitClient } from '@/lib/genkit';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

interface CustomGenkitClientOptions {
  // Extend with custom options
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  // ...other options
}

export class CustomGenkitClient extends GenkitClient {
  private customOptions: CustomGenkitClientOptions;
  
  constructor(options, customOptions: CustomGenkitClientOptions = {}) {
    super(options);
    this.customOptions = {
      temperature: 0.7,
      topK: 1,
      topP: 0.95,
      maxOutputTokens: 2048,
      ...customOptions
    };
  }
  
  // Override the createChat method to use custom options
  async createChat(systemPrompt?: string) {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });

    const generationConfig = {
      temperature: this.customOptions.temperature,
      topK: this.customOptions.topK,
      topP: this.customOptions.topP,
      maxOutputTokens: this.customOptions.maxOutputTokens,
    };

    // Custom safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH, // Less restrictive
      },
      // ...other safety settings
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      systemInstruction: systemPrompt,
    });

    return chat;
  }
}
```

## Advanced Customization

### Custom Components

Creating custom components that integrate with the existing architecture:

```tsx
// components/suggestions-bar.tsx
import { Button } from '@/components/ui/button';
import { useGenkit } from '@/lib/hooks/use-genkit';

const SUGGESTIONS = [
  "Tell me about AI",
  "How does Next.js work?",
  "Write a function to sort an array",
];

interface SuggestionsBarProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function SuggestionsBar({ onSuggestionClick }: SuggestionsBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {SUGGESTIONS.map((suggestion) => (
        <Button
          key={suggestion}
          variant="outline"
          size="sm"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}

// Usage in your GenkitChatbot wrapper
export function EnhancedChatbot(props) {
  const {
    handleInputChange,
    handleSubmit,
    // ...other hook values
  } = useGenkit({
    // ... any options
  });

  const handleSuggestionClick = (suggestion: string) => {
    // Update the input field
    handleInputChange(suggestion);
    
    // Automatically submit the suggestion
    const event = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(event);
  };
  
  return (
    <div>
      <SuggestionsBar onSuggestionClick={handleSuggestionClick} />
      <GenkitChatbot {...props} />
    </div>
  );
}
```

### Custom Hooks

Create custom hooks to extend functionality:

```typescript
// lib/hooks/use-chat-history.ts
import { useEffect, useState } from 'react';
import { Message } from '@/lib/genkit';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('chat-sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);
  
  // Save sessions to localStorage when they change
  useEffect(() => {
    localStorage.setItem('chat-sessions', JSON.stringify(sessions));
  }, [sessions]);
  
  // Create a new session
  const createSession = () => {
    const id = Date.now().toString();
    const newSession: ChatSession = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setSessions([...sessions, newSession]);
    setCurrentSessionId(id);
    return id;
  };
  
  // Get a session by ID
  const getSession = (id: string) => {
    return sessions.find(session => session.id === id) || null;
  };
  
  // Update a session
  const updateSession = (id: string, updates: Partial<ChatSession>) => {
    setSessions(sessions.map(session => {
      if (session.id === id) {
        return {
          ...session,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return session;
    }));
  };
  
  // Delete a session
  const deleteSession = (id: string) => {
    setSessions(sessions.filter(session => session.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  };
  
  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createSession,
    getSession,
    updateSession,
    deleteSession,
  };
}
```

### Extensions

You can create extensions that add functionality to the core application. Here are some examples of possible extensions:

1. **Speech-to-Text**: Add voice input capability
2. **Text-to-Speech**: Read AI responses aloud
3. **Data Visualization**: Render charts and graphs from data
4. **Language Translation**: Translate messages between languages
5. **File Upload**: Allow uploading and processing files
6. **Theme Switcher**: Enable dynamic theme changes

Example of a basic extension integration:

```tsx
// components/voice-input.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  onSpeechResult: (text: string) => void;
}

export function VoiceInput({ onSpeechResult }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const instance = new SpeechRecognition();
        instance.lang = 'en-US';
        instance.continuous = false;
        instance.interimResults = true;
        
        instance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onSpeechResult(transcript);
        };
        
        instance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        instance.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(instance);
      }
    }
  }, [onSpeechResult]);
  
  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
        setIsListening(true);
      }
    }
  };
  
  return (
    <Button 
      onClick={toggleListening}
      variant="outline"
      size="icon"
      className="rounded-full h-10 w-10"
      disabled={!recognition}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
```
