'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { GenkitClient, Message, Role } from '../genkit';

interface UseGenkitProps {
  apiKey?: string;
  modelName?: string;
  initialMessages?: Message[];
  threadId?: string;
  onResponse?: () => void;
  onFinish?: (messages: Message[]) => void;
  onError?: (error: Error) => void;
  systemPrompt?: string;
}

/**
 * Custom hook for integrating with Google Genkit AI
 */
export const useGenkit = ({
  apiKey,
  modelName,
  initialMessages = [],
  threadId: initialThreadId,
  onResponse,
  onFinish,
  onError,
  systemPrompt = "You are a helpful AI assistant."
}: UseGenkitProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [threadId, setThreadId] = useState<string | undefined>(initialThreadId);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  // Reference to store instance of genkit client
  const genkitClientRef = useRef<GenkitClient | null>(null);

  // Initialize the genkit client
  useEffect(() => {
    if (!apiKey) return;
    
    if (!genkitClientRef.current) {
      genkitClientRef.current = new GenkitClient({ 
        apiKey, 
        modelName 
      });
    }
  }, [apiKey, modelName]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | string) => {
    const value = typeof e === 'string' ? e : e.target.value;
    setInput(value);
  }, []);

  // Stop ongoing streaming
  const stop = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  }, [abortController]);

  // Create a unique ID for messages
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }, []);

  // Add a new message to the chat
  const addMessage = useCallback((role: Role, content: string) => {
    const newMessage: Message = {
      role,
      content
    };
    
    setMessages((current) => [...current, newMessage]);
    return newMessage;
  }, []);

  // Send a message and get a response 
  const sendMessage = useCallback(async (content: string) => {
    if (!content || !genkitClientRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message
      const userMessage = addMessage('user', content);
      
      // Pre-create an assistant message with empty content
      const assistantMessage = addMessage('assistant', '');
      
      // Generate a unique thread ID if not provided
      if (!threadId) {
        const newThreadId = generateId();
        setThreadId(newThreadId);
      }
      
      onResponse?.();
      
      // Create a new abort controller for this request
      const controller = new AbortController();
      setAbortController(controller);
      
      // Stream the response
      const stream = await genkitClientRef.current.streamChat(
        [...messages, userMessage] as Message[],
        systemPrompt
      );
      
      let responseText = '';
      
      // Process the stream
      for await (const chunk of stream) {
        if (controller.signal.aborted) break;
        
        responseText += chunk.text();
        
        setMessages((currentMessages) => {
          const updatedMessages = [...currentMessages];
          // Update the last message (which is the assistant message)
          updatedMessages[updatedMessages.length - 1] = {
            ...updatedMessages[updatedMessages.length - 1],
            content: responseText
          };
          return updatedMessages;
        });
      }
      
      // Only call onFinish if not aborted
      if (!controller.signal.aborted) {
        const finalMessages = [
          ...messages, 
          userMessage, 
          {
            role: 'assistant' as Role,
            content: responseText
          }
        ];
        onFinish?.(finalMessages);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [messages, threadId, addMessage, onResponse, onFinish, onError, systemPrompt, generateId]);

  // Handle submission
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    sendMessage(input);
    setInput('');
  }, [input, isLoading, sendMessage]);

  // Regenerate the last assistant message
  const regenerate = useCallback(() => {
    if (isLoading) return;
    
    // Find the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex];
    
    // Remove all messages after the last user message
    setMessages(messages.slice(0, messages.length - lastUserMessageIndex));
    
    // Re-send the last user message
    sendMessage(lastUserMessage.content);
  }, [messages, isLoading, sendMessage]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    threadId,
    sendMessage,
    regenerate,
    stop,
    setMessages
  };
};
