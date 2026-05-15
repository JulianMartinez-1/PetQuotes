# Integración Ollama con Pet Quotes

## Arquitectura
```
Frontend (React/Next.js) 
    ↓
Backend (NestJS API Gateway) 
    ↓
Ollama API 
    ↓
Llama 3.2 Model
```

## Configuración

### 1. Ollama (Local)
```bash
# Ollama debe estar corriendo en tu máquina
# Puerto por defecto: 11434
# URL: http://localhost:11434

# Descargar modelo Llama 3.2
ollama pull llama2
# o usar otro modelo disponible
```

### 2. Variables de Entorno (.env)
```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

## Backend API

### Endpoints disponibles

#### 1. Generate Text
```http
POST /api/ai/generate
Content-Type: application/json

{
  "prompt": "Escribe una historia sobre un gato"
}

Response:
{
  "response": "Érase una vez un gato llamado Luna..."
}
```

#### 2. Chat
```http
POST /api/ai/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "Hola, ¿cómo estás?"},
    {"role": "assistant", "content": "Estoy bien, gracias..."}
  ]
}

Response:
{
  "message": "¿En qué puedo ayudarte?"
}
```

#### 3. Get Available Models
```http
GET /api/ai/models

Response:
{
  "models": ["llama2", "neural-chat", "mistral"]
}
```

## Frontend Hook

### useOllama

```typescript
import { useOllama } from '@/hooks/useOllama';

function MyComponent() {
  const { generateText, chat, getModels, loading, error } = useOllama();

  // Generate text
  const handleGenerate = async () => {
    const response = await generateText("Write a poem");
    console.log(response);
  };

  // Chat
  const handleChat = async () => {
    const messages = [
      { role: 'user', content: 'Tell me a joke' }
    ];
    const response = await chat(messages);
    console.log(response);
  };

  // Get models
  const handleGetModels = async () => {
    const models = await getModels();
    console.log(models);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generando...' : 'Generar'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

## Componente OllamaChatComponent

Componente UI completo para chat con Ollama:

```typescript
import { OllamaChatComponent } from '@/components/ollama/ollama-chat';

export default function Page() {
  return <OllamaChatComponent />;
}
```

## Página de Prueba

Accede a: **http://localhost:3000/test/ollama**

Aquí puedes:
- Cambiar entre modo "Generate" y modo "Chat"
- Enviar mensajes
- Ver respuestas en tiempo real
- Limpiar el historial de chat

## Instalación y Setup

### 1. Asegúrate que Ollama está corriendo
```bash
ollama serve
# En otra terminal:
ollama pull llama2
```

### 2. Inicia los servicios con Docker
```bash
docker compose up -d web api-gateway auth-service postgres-db
```

### 3. Accede a la aplicación
- Frontend: http://localhost:3000
- API Gateway: http://localhost:3001
- Test Ollama: http://localhost:3000/test/ollama

## Modelos disponibles en Ollama

Puedes usar diferentes modelos cambiando `OLLAMA_MODEL` en `.env`:

- `llama2` - Modelo general rápido
- `neural-chat` - Optimizado para chat
- `mistral` - Modelo más potente
- `dolphin-mixtral` - Modelo avanzado

```bash
# Descargar nuevos modelos
ollama pull neural-chat
ollama pull mistral
ollama pull dolphin-mixtral

# Ver modelos instalados
ollama list
```

## Troubleshooting

### Error: Connection refused (Ollama not running)
```bash
# Asegúrate que Ollama está corriendo
ollama serve
```

### Error: Model not found
```bash
# Descargar el modelo
ollama pull llama2
```

### Timeout en requests largos
- Aumentar el timeout en `useOllama.ts` si es necesario
- Usar modelos más rápidos
- Reducir el tamaño del prompt

## Casos de uso

1. **Chat AI**: Conversación con IA local
2. **Generación de texto**: Crear contenido
3. **Análisis**: Analizar información
4. **Recomendaciones**: Sugerir clínicas o servicios para mascotas
5. **FAQs**: Responder preguntas frecuentes

## Seguridad

- Ollama corre **localmente** en tu máquina
- No hay datos enviados a servidores externos
- Ideal para datos sensibles
- Privacidad garantizada

## Performance

- Primera request: 2-5 segundos (carga del modelo)
- Requests posteriores: 1-3 segundos
- Depende del modelo y tamaño del prompt
- Ejecuta en CPU/GPU según tu máquina

## Próximos pasos

- Integrar AI en recomendación de clínicas
- Chat bot para soporte de usuarios
- Análisis de síntomas de mascotas
- Generación de contenido para servicios
