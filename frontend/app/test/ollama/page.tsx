'use client';

import { OllamaChatComponent } from '@/components/ollama/ollama-chat';

export default function OllamaTestPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🤖 Ollama AI Integration</h1>
          <p className="text-gray-300">
            Frontend (React) → Backend (Node.js) → Ollama → Llama 3.2
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">🎯 Frontend</h3>
            <p className="text-sm opacity-90">React Hook (useOllama)</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">🔗 Backend</h3>
            <p className="text-sm opacity-90">NestJS API Gateway</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">🧠 Ollama</h3>
            <p className="text-sm opacity-90">Llama 3.2 Model</p>
          </div>
        </div>

        <OllamaChatComponent />

        <div className="mt-8 bg-gray-800 text-gray-100 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">📋 API Endpoints</h3>
          <ul className="space-y-2 text-sm">
            <li><code className="bg-gray-900 px-2 py-1 rounded">POST /api/ai/generate</code> - Generate text</li>
            <li><code className="bg-gray-900 px-2 py-1 rounded">POST /api/ai/chat</code> - Chat conversation</li>
            <li><code className="bg-gray-900 px-2 py-1 rounded">GET /api/ai/models</code> - List available models</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
