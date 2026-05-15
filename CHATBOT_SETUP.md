# Configuración del Chatbot con IA 🤖

## Descripción

Se ha implementado un chatbot flotante con IA powered by Google Gemini en tu aplicación Pet Quotes. El chatbot:

- ✅ Aparece como un botón flotante en la esquina inferior derecha
- ✅ Mantiene contexto de la conversación completa
- ✅ Aplica rate limiting para evitar costos excesivos
- ✅ Tiene personality personalizada para veterinaria
- ✅ Maneja errores elegantemente
- ✅ Responde en español
- ✅ Tiene animaciones suaves

## Archivos Creados

```
apps/web/
├── components/chat/
│   ├── ChatWidget.tsx        # Botón flotante + modal
│   └── ChatWindow.tsx        # Interfaz del chat
├── app/api/chat/
│   └── route.ts              # Endpoint API que conecta con Gemini
├── lib/
│   ├── rate-limiter.ts       # Control de límite de requests
│   └── chat-system-prompt.ts # Definición de personality del bot
└── app/layout.tsx            # Actualizado con ChatWidget
```

## Configuración Requerida

### 1. Obtener Clave de Gemini

1. Ir a: https://ai.google.dev/
2. Hacer clic en "Get API Key"
3. Crear una nueva API key (si no tienes cuenta, crear una)
4. Copiar la clave

### 2. Agregar Variable de Entorno

En `apps/web/.env.local`, reemplazar:
```env
GEMINI_API_KEY=tu_clave_gemini_aqui
```

Con tu clave real:
```env
GEMINI_API_KEY=AIzaSy...
```

### 3. Variables Opcionales Adicionales

Puedes personalizar en `apps/web/.env.local`:
```env
# Temperatura (0-1): más baja = más determinista, más alta = más creativo
# Por defecto: 0.7
# GEMINI_TEMPERATURE=0.7

# Máximo de tokens por respuesta (por defecto: 500)
# Por defecto: 500
# GEMINI_MAX_TOKENS=500
```

## Características Implementadas

### 1️⃣ Guardar Contexto
- El chatbot mantiene el historial de los últimos 10 mensajes
- Cada solicitud incluye la conversación anterior
- Permite que el bot entienda referencias anteriores

### 2️⃣ Rate Limiting
- **Límite**: 10 mensajes por minuto por usuario (por IP)
- **Previene**: Costos excesivos de API
- **Almacenamiento**: En memoria (en producción usar Redis)
- **Respuesta**: Retorna error 429 cuando se excede el límite

```typescript
// Ejemplo de error por rate limit
{
  "error": "Demasiadas solicitudes. Por favor intenta más tarde.",
  "retryAfter": 45  // segundos para reintentar
}
```

### 3️⃣ Prompt System Personalizado
El bot tiene una personalidad definida en `lib/chat-system-prompt.ts`:

- Asistente amable y profesional para clínica veterinaria
- Responde sobre: servicios, cuidado de mascotas, reservas
- Información de emergencia incluida
- No intenta dar diagnósticos médicos
- Idioma: Español

**Para personalizar**: Editar `CHAT_SYSTEM_PROMPT` en `lib/chat-system-prompt.ts`

### 4️⃣ Error Handling Completo

| Error | Manejo |
|-------|--------|
| Rate limit (429) | Mensaje amable con tiempo de espera |
| API no configurada | Sugiere contactar soporte |
| Conexión fallida | Reintenta y muestra error descriptivo |
| Input vacío | Desactiva botón de envío |
| Input > 1000 chars | Rechaza con error validación |

Ejemplo de error en UI:
```
❌ Error al conectar con el servidor. Por favor intenta de nuevo.
```

### 5️⃣ Loading States
- Spinner animado mientras se procesa
- Mensaje: "El asistente está escribiendo..."
- Input desactivado durante carga
- Animaciones suaves con Framer Motion

## Uso

### Para Usuarios
1. Hace clic en el botón flotante (esquina inferior derecha)
2. Se abre la ventana del chat
3. Escribe una pregunta
4. El bot responde con contexto de la conversación

### Para Desarrolladores

#### Cambiar modelo de IA
En `app/api/chat/route.ts`:
```typescript
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
// Cambiar "gemini-pro" por "gemini-1.5-pro" para mejor calidad (más tokens)
```

#### Modificar límite de rate limit
En `lib/rate-limiter.ts`:
```typescript
const MAX_REQUESTS_PER_MINUTE = 20;  // Aumentar a 20
```

#### Cambiar personalidad del bot
En `lib/chat-system-prompt.ts`:
```typescript
export const CHAT_SYSTEM_PROMPT = `Tu nueva personalidad aquí...`;
```

#### Agregar historial persistente
Por defecto usa memoria. Para producción:

1. **Usar Redis** (recomendado):
```typescript
// En rate-limiter.ts, reemplazar Map por Redis
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});
```

2. **Guardar conversaciones en BD**:
```typescript
// En app/api/chat/route.ts
await db.conversations.create({
  userId: userIp,
  message: input,
  response: reply,
  timestamp: new Date(),
});
```

## Costos

**Google Gemini** (recomendado):
- Gemini 1.5 Flash: ~$0.075 por 1M tokens de entrada, ~$0.30 por 1M tokens de salida
- Respuesta típica: ~0.00001-0.00002 USD (MUY económico)
- **Primera opción**: Gratuito con límite de 15 rpm (requests por minuto)

**Ejemplo de gasto**:
- 100 conversaciones diarias = ~$0.001-0.002/día
- ~$0.03-0.06/mes (prácticamente gratis)

**Para reducir costos**:
1. ✅ Usar el tier gratuito (15 rpm ilimitadas)
2. ↓ Reducir `max_tokens` (actual: 500)
3. ↓ Aumentar `RATE_LIMIT` (actual: 10/min)
4. ✅ Usar caché de respuestas frecuentes

## Troubleshooting

### ❌ "Error de autenticación con la API de IA"
**Solución**: Verificar que `GEMINI_API_KEY` es válida en `.env.local`

### ❌ "El servicio de IA está ocupado"
**Solución**: Esperar unos segundos e intentar de nuevo. Problema de Gemini o límite de rate.

### ❌ "Demasiadas solicitudes"
**Solución**: Esperar el tiempo indicado. Límite por usuario es 10/min.

### ❌ Chatbot no aparece
**Solución**: 
1. Verificar que `ChatWidget` está en `layout.tsx`
2. Ejecutar `npm run dev:web`
3. Limpiar caché del navegador (Ctrl+Shift+Del)

### ❌ "Error desconocido" genérico
**Solución**:
1. Abrir console del navegador (F12)
2. Ver error en Network tab
3. Verificar `.env.local` tiene GEMINI_API_KEY

## Testing

### Test manual local:
```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env.local con GEMINI_API_KEY

# 3. Correr dev server
npm run dev:web

# 4. Ir a http://localhost:3000

# 5. Hacer clic en botón esquina inferior derecha

# 6. Escribir mensaje
```

### Test API directamente:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola, tengo preguntas sobre tu servicio",
    "conversationHistory": []
  }'
```

## Seguridad

- ⚠️ **NUNCA** compartir `GEMINI_API_KEY` públicamente
- ⚠️ **NO** incluir `.env.local` en Git
- ✅ Rate limiting por IP implementado
- ✅ Validación de input en backend
- ✅ Timeout en requests a Gemini

## Próximos Pasos (Opcional)

1. **Agregar persistencia**:
   - Guardar conversaciones en base de datos
   - Permitir usuarios ver historial

2. **Mejorar performance**:
   - Caché de respuestas frecuentes
   - Usar streaming para respuestas más rápidas

3. **Analytics**:
   - Rastrear preguntas más frecuentes
   - Monitorear calidad de respuestas

4. **Personalización**:
   - Entrenar modelo con FAQ de tu clínica
   - Integrar con sistema de reservas

## Soporte

Para problemas:
1. Revisar console del navegador (F12)
2. Revisar logs del servidor (`npm run dev:web`)
3. Verificar `GEMINI_API_KEY` es válida
4. Confirmar cuota de Gemini no está excedida (límite gratuito: 15 rpm)
