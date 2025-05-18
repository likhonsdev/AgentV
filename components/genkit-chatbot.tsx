'use client';

import { ChatList } from '@/components/chat-list';
import { ChatInput } from '@/components/chat-input';
import { Opening } from '@/components/opening';
import { useGenkit } from '@/lib/hooks/use-genkit';
import { toast } from 'sonner';
import cn from 'mxcn';
import { useState } from 'react';
import { Message } from '@/lib/genkit';

export interface GenkitChatbotProps extends React.ComponentProps<'div'> {
  id?: string; // Optional: Thread ID if you want to persist the chat in a DB
  initialMessages?: Message[]; // Optional: Messages to pre-populate the chat
  apiKey?: string; // Optional: Override the default API key
  modelName?: string; // Optional: Specify a different model
  systemPrompt?: string; // Optional: Custom system prompt for the AI
}

export function GenkitChatbot({
  id,
  initialMessages,
  apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  modelName = 'gemini-pro',
  systemPrompt = 'You are Sifra, a helpful and friendly AI assistant built with Google\'s Gemini model.',
  className
}: GenkitChatbotProps) {
  const [chatThreadId, setChatThreadId] = useState<string | undefined>(id);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    regenerate,
    stop,
    setMessages,
    threadId,
    sendMessage
  } = useGenkit({
    apiKey,
    modelName,
    initialMessages,
    threadId: chatThreadId,
    systemPrompt,
    onResponse: () => {
      setChatThreadId(threadId);
    },
    onFinish: () => {},
    onError: error => {
      console.error('Error in chat:', error.message);
      toast.error(error.message);
    }
  });

  return (
    <div className="min-h-screen">
      <div className={cn('pb-36 pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
          </>
        ) : (
          <Opening />
        )}
      </div>
      <ChatInput
        id={id}
        isLoading={isLoading}
        stop={stop}
        regenerate={regenerate}
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
