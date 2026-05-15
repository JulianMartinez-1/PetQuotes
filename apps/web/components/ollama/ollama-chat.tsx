'use client';

import { useState } from 'react';
import { useOllama, ChatMessage } from '@/hooks/useOllama';

export const OllamaChatComponent = () => {
  const { generateText, chat, getModels, loading, error } = useOllama();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'generate' | 'chat'>('chat');

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');

    try {
      let response: string;

      if (mode === 'generate') {
        response = await generateText(input);
      } else {
        const messagesForChat = [...messages, userMessage];
        response = await chat(messagesForChat);
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response },
      ]);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold">Ollama Chat</h2>
          <p className="text-sm opacity-90">Powered by Llama 3.2</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 p-4 border-b">
          <button
            onClick={() => {
              setMode('chat');
              handleClearChat();
            }}
            className={`px-4 py-2 rounded ${
              mode === 'chat'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Chat Mode
          </button>
          <button
            onClick={() => {
              setMode('generate');
              handleClearChat();
            }}
            className={`px-4 py-2 rounded ${
              mode === 'generate'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Generate Mode
          </button>
        </div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              <p>Inicia una conversación o genera texto con Ollama</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-300 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="break-words">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">
                <p className="animate-pulse">Escribiendo...</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 mx-4 my-2 rounded">
            {error}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t bg-white rounded-b-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            >
              {loading ? '...' : 'Enviar'}
            </button>
            <button
              onClick={handleClearChat}
              disabled={loading}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
