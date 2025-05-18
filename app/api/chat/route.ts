import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenkitClient } from '@/lib/genkit';

export const runtime = 'edge';

/**
 * Stream AI Chat Messages from Google Genkit
 *
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        'Please set GEMINI_API_KEY in your environment variables.'
      );
    }

    // Get chat prompt messages and threadId from the client.
    const { messages, systemPrompt, threadId } = await req.json();

    // Initialize the genkit client
    const genkitClient = new GenkitClient({
      apiKey: process.env.GEMINI_API_KEY
    });

    // Get the stream from Genkit
    const stream = await genkitClient.streamChat(messages, systemPrompt);

    // Convert the AsyncIterable to a ReadableStream that the browser can consume
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(new TextEncoder().encode(chunk.text()));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(readableStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'X-Thread-ID': threadId || ''
      }
    });
  } catch (error: any) {
    console.error('Uncaught API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
