# Component Documentation

This document provides detailed information about the UI components used in Sifra UI. Each component is described with its purpose, props, usage examples, and customization options.

## Table of Contents

- [Core Components](#core-components)
  - [GenkitChatbot](#genkitchatbot)
  - [ChatList](#chatlist)
  - [ChatMessage](#chatmessage)
  - [ChatInput](#chatinput)
  - [Opening](#opening)
- [Utility Components](#utility-components)
  - [Markdown](#markdown)
  - [UI Components](#ui-components)
  - [Header](#header)

## Core Components

### GenkitChatbot

The main container component that orchestrates the chat experience.

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `id` | `string` | Optional thread ID for persistence | `undefined` |
| `initialMessages` | `Message[]` | Messages to pre-populate the chat | `[]` |
| `apiKey` | `string` | API key for Gemini | `process.env.NEXT_PUBLIC_GEMINI_API_KEY` |
| `modelName` | `string` | Model name to use | `'gemini-pro'` |
| `systemPrompt` | `string` | System prompt for the AI | Default prompt about being Sifra |
| `className` | `string` | Additional CSS classes | `''` |

#### Usage

```tsx
import { GenkitChatbot } from '@/components/genkit-chatbot';

export default function ChatPage() {
  return (
    <GenkitChatbot 
      systemPrompt="You are a helpful assistant specialized in web development."
      modelName="gemini-pro"
    />
  );
}
```

#### Customization

The component can be customized by:
- Providing custom CSS via the `className` prop
- Setting a custom system prompt
- Initializing with existing messages
- Using a different model

### ChatList

Renders a list of chat messages.

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `messages` | `Message[]` | Array of chat messages | Required |
| `className` | `string` | Additional CSS classes | `''` |

#### Usage

```tsx
import { ChatList } from '@/components/chat-list';

export default function MyComponent({ messages }) {
  return <ChatList messages={messages} />;
}
```

### ChatMessage

Renders an individual chat message with proper styling based on the role.

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `message` | `Message` | The message to display | Required |
| `isLast` | `boolean` | Whether this is the last message in the list | `false` |

#### Usage

```tsx
import { ChatMessage } from '@/components/chat-message';

export default function MyComponent({ message }) {
  return <ChatMessage message={message} />;
}
```

### ChatInput

Provides the input interface for users to enter messages.

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `id` | `string` | Thread ID | `undefined` |
| `isLoading` | `boolean` | Whether a response is being generated | `false` |
| `stop` | `() => void` | Function to stop response generation | Required |
| `regenerate` | `() => void` | Function to regenerate the last response | Required |
| `messages` | `Message[]` | Current chat messages | Required |
| `input` | `string` | Current input value | Required |
| `handleInputChange` | `(e) => void` | Input change handler | Required |
| `handleSubmit` | `(e) => void` | Form submission handler | Required |

#### Usage

```tsx
import { ChatInput } from '@/components/chat-input';

export default function MyComponent({
  isLoading,
  stop,
  regenerate,
  messages,
  input,
  handleInputChange,
  handleSubmit
}) {
  return (
    <ChatInput
      isLoading={isLoading}
      stop={stop}
      regenerate={regenerate}
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
    />
  );
}
```

### Opening

Displays a welcome screen when no conversation has started yet.

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `className` | `string` | Additional CSS classes | `''` |

#### Usage

```tsx
import { Opening } from '@/components/opening';

export default function MyComponent() {
  return <Opening />;
}
```

## Utility Components

### Markdown

Renders markdown content with proper formatting and syntax highlighting.

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `content` | `string` | Markdown content to render | Required |
| `className` | `string` | Additional CSS classes | `''` |

#### Usage

```tsx
import { Markdown } from '@/components/markdown';

export default function MyComponent() {
  const markdownContent = "# Hello\nThis is **bold** text";
  return <Markdown content={markdownContent} />;
}
```

### UI Components

The application includes several reusable UI components in the `components/ui` directory:

#### Button

Standard button component with various styles and states.

```tsx
import { Button } from '@/components/ui/button';

export default function MyComponent() {
  return <Button variant="primary">Click Me</Button>;
}
```

#### CodeBlock

Renders code with syntax highlighting.

```tsx
import { CodeBlock } from '@/components/ui/codeblock';

export default function MyComponent() {
  return <CodeBlock language="javascript" code="console.log('Hello World');" />;
}
```

#### Separator

Renders a horizontal or vertical line to separate content.

```tsx
import { Separator } from '@/components/ui/separator';

export default function MyComponent() {
  return <Separator orientation="horizontal" />;
}
```

#### Textarea

Enhanced textarea with auto-resize capability.

```tsx
import { Textarea } from '@/components/ui/textarea';

export default function MyComponent() {
  return <Textarea placeholder="Enter your message..." />;
}
```

### Header

Renders the application header.

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `className` | `string` | Additional CSS classes | `''` |

#### Usage

```tsx
import { Header } from '@/components/header';

export default function Layout() {
  return (
    <>
      <Header />
      <main>{/* content */}</main>
    </>
  );
}
```

## Component Interactions

The components interact in the following way:

1. `GenkitChatbot` is the parent component that:
   - Manages state through the `useGenkit` hook
   - Renders either the `Opening` component or `ChatList`
   - Renders the `ChatInput` at the bottom

2. `ChatList` iterates through messages and renders:
   - Individual `ChatMessage` components for each message

3. `ChatInput` provides the UI for:
   - Entering new messages
   - Submitting messages
   - Regenerating responses
   - Stopping response generation

## Extending Components

To extend or customize components:

1. Create a new component that wraps the existing component
2. Pass custom props or additional functionality
3. Apply custom styling using the `className` prop or by using Tailwind utility classes

Example of extending the `ChatInput` component:

```tsx
import { ChatInput } from '@/components/chat-input';

export function CustomChatInput(props) {
  // Add custom functionality
  const handleCustomSubmit = (e) => {
    // Custom logic
    props.handleSubmit(e);
  };

  return (
    <div className="custom-wrapper">
      <h3>Custom Header</h3>
      <ChatInput 
        {...props} 
        handleSubmit={handleCustomSubmit}
        className="custom-input-styles" 
      />
    </div>
  );
}
```

## Best Practices

When working with these components:

1. Always provide all required props
2. Use TypeScript to ensure type safety
3. Leverage the customization options rather than modifying the components directly
4. Keep component responsibilities clear and focused
5. Use composition to create complex UIs from simple components
