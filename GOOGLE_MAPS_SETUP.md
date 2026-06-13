# Configuración de Google Maps API

## API Key Actual
```
AIzaSyBOZ_q59tfVMpo2is4CK6SNLrZz9L331lY
```

## ✅ Pasos para Verificar/Activar

### 1. Ir a Google Cloud Console
1. Abre https://console.cloud.google.com
2. Selecciona tu proyecto (si no existe, crea uno)

### 2. Habilitar APIs Requeridas
Ve a **APIs & Services > Library** y habilita:

- ✅ **Maps JavaScript API** (CRÍTICA)
- ✅ **Places API** (para búsqueda)
- ✅ **Geocoding API** (opcional, para geocodificación)

**Pasos:**
1. Busca en la librería
2. Click en la API
3. Click en "Enable"

### 3. Verificar Billing
1. Ve a **Billing**
2. Asegúrate de que hay un método de pago activo
3. Verifica que el proyecto está vinculado al billing

### 4. Revisar Restricciones de API Key
1. Ve a **APIs & Services > Credentials**
2. Click en tu API Key
3. En "Application restrictions":
   - Si está en "HTTP referrers", agrega:
     ```
     localhost:3000
     localhost:3001
     http://localhost:3000/*
     http://localhost:3001/*
     ```
   - Para producción, agrega tu dominio

4. En "API restrictions":
   - Asegúrate de que "Maps JavaScript API" está permitida

### 5. Verificar Cuota
1. Ve a **APIs & Services > Quotas**
2. Busca "Maps JavaScript API"
3. Verifica que la cuota de uso no esté al límite

## 🧪 Prueba en Navegador

1. Abre http://localhost:3000/clinics
2. Abre la **consola del navegador** (F12)
3. Busca errores sobre Google Maps
4. Deberías ver:
   - Mapa cargado
   - Marcadores visibles (verde = tu ubicación, rosa = clínicas)

### Errores Comunes

| Error | Solución |
|-------|----------|
| `RefererNotAllowedMapError` | Agregar localhost a restricciones de API Key |
| `MissingKeyMapError` | API Key no configurada en `.env` |
| `ApiProjectMapsDisabled` | Habilitar Maps JavaScript API en Cloud Console |
| Mapa gris sin marcadores | API key válida pero Maps JavaScript API no habilitada |

## 📝 Variables de Entorno

Tu `.env` ya tiene:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBOZ_q59tfVMpo2is4CK6SNLrZz9L331lY
```

Si cambias la key:
1. Actualiza el `.env`
2. Reinicia el servidor: `npm run dev`

## 🔍 Debug

Si el mapa se abre pero no ves marcadores:

1. **Consola del navegador (F12)**:
   ```javascript
   // Verifica si la API está cargada
   console.log(window.google)
   ```

2. **Verifica los datos**:
   - Los marcadores deben tener `lat` y `lng` válidos
   - Los números deben ser tipo `number`, no string

3. **Recarga completamente**:
   ```bash
   # Terminal
   npm run dev
   
   # Navegador
   Ctrl+Shift+R (recarga sin caché)
   ```

## 📞 Si Sigue Sin Funcionar

Comparte en consola (F12 > Network):
- ¿Qué errores ves?
- ¿La solicitud a Google Maps devuelve 200 OK?
- ¿Ves el mapa pero sin marcadores?
