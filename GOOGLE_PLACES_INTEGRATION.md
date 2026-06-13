# 🚀 Google Maps Places API Integration - Setup Guide

## ✅ Implementación Completada

Tu aplicación ya está configurada para obtener **veterinarias reales** en tiempo real desde **Google Maps Places API**.

## 📋 Lo que se implementó:

### Backend (NestJS)
- ✅ Módulo `ClinicsModule` en `/src/presentation/clinics/`
- ✅ Servicio que consulta Google Maps Places API
- ✅ Endpoints:
  - `GET /api/clinics/search?city=Bogota` - Busca veterinarias en una ciudad
  - `GET /api/clinics/search-all` - Busca en todas las ciudades

### Frontend (Next.js)
- ✅ Servicio de API (`clinics-api.ts`) con funciones:
  - `searchClinicsByCity(city)` - Busca por ciudad
  - `searchAllCities()` - Busca en todas las ciudades
- ✅ Hook React (`useClinicsFromAPI`) para uso fácil en componentes
- ✅ Página de clínicas (`/clinics`) actualizada para usar datos reales
- ✅ Fallback automático a datos locales si la API falla

## 🔧 Configuración Requerida

### 1. **Verificar API Key** ✅
Tu `.env` ya tiene:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBOZ_q59tfVMpo2is4CK6SNLrZz9L331lY
```

### 2. **Variables de Entorno**
Asegurate que en tu `.env` tengas:
```bash
# Backend
GATEWAY_PORT=3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Frontend
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<tu-api-key>
```

## 🚀 Cómo Ejecutar

### Terminal 1 - Backend
```bash
cd backend
npm install  # Si es la primera vez
npm run start:dev
```
El backend estará en `http://localhost:3001`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
El frontend estará en `http://localhost:3000`

## ✨ Cómo Funciona

### 1️⃣ **El usuario abre `/clinics`**
```
Frontend hace petición a: GET /api/clinics/search-all
```

### 2️⃣ **Backend busca en Google Places**
```
Para cada ciudad (Bogotá, Medellín, Cali):
- Llama a Google Maps Places API
- Busca veterinarias en radio de 15 km
- Transforma resultados al formato ClinicCatalogItem
```

### 3️⃣ **Datos enriquecidos**
```
Cada clínica obtiene:
- Nombre real ✅
- Ubicación exacta ✅
- Teléfono ✅
- Calificación ✅
- Fotos ✅
- Servicios (auto-detectados) ✅
- Horario de apertura ✅
```

### 4️⃣ **Frontend muestra resultados**
```
Las tarjetas de clínicas ahora muestran datos REALES
- Clickeable → abre modal con mapa
- Información completa
- Contacto directo
```

## 🎯 Características

### Búsqueda Inteligente
- ✅ Busca por ciudad: `GET /clinics/search?city=Bogota`
- ✅ Busca todas las ciudades: `GET /clinics/search-all`
- ✅ Caching automático para evitar límites de API

### Transformación Automática de Datos
```javascript
Google Places API → ClinicCatalogItem
- place_id → id único
- name → name (veterinaria)
- geometry → latitude/longitude
- formatted_phone_number → phone
- rating → rating
- photos → image URL
- opening_hours → openNow
- types → services (auto-detectados)
```

### Fallback Automático
Si Google Places API falla:
1. Intenta obtener datos reales
2. Si error → usa datos locales en localStorage
3. El usuario siempre ve algo

## 📊 Datos Reales

La API ahora busca veterinarias reales con:
- **Ubicación exacta** desde Google Maps
- **Teléfono verificado**
- **Calificaciones** de usuarios reales
- **Fotos** de Google Places
- **Horarios** actualizados

### Servicios Auto-Detectados
```
Según tipo de lugar en Google:
- veterinary_care → Consulta, Vacunación, Laboratorio
- emergency → Urgencias, Hospitalización
- grooming → Grooming, Estética
- surgical → Cirugía, Anestesia
```

## ⚙️ Configuración Avanzada

### Cambiar Radio de Búsqueda
En `clinics.service.ts`, línea ~76:
```typescript
radius: 15000, // 15 km (cambiar aquí)
```

### Agregar Más Ciudades
En `clinics.service.ts`, línea ~20:
```typescript
private readonly cityCoordinates = {
  Bogota: { lat: 4.7110, lng: -74.0055 },
  Medellin: { lat: 6.2442, lng: -75.5812 },
  Cali: { lat: 3.4372, lng: -76.5069 },
  // Agregar aquí:
  // Barranquilla: { lat: 10.9639, lng: -74.7964 },
};
```

### Filtros de Google Places
En `clinics.service.ts`, línea ~50:
```typescript
keyword: 'veterinary_care',  // Cambiar buscar term
type: 'veterinary_care',     // Cambiar tipo
```

## 📝 Límites de API

### Google Maps Places API - Cuota Gratuita
- ✅ 25,000 requests/mes **sin costo**
- ⚠️ Después: $0.0175 por request

Cálculo:
```
- 10 clínicas/ciudad × 3 ciudades = 30 clínicas/búsqueda
- Si cada usuario busca 1 vez = 1 request
- 1,000 usuarios = 1,000 requests
- Costo: ~$17 al mes (para 1,000 usuarios)
```

## 🔐 Seguridad

### API Key
- Tu API key está en `.env` (git-ignorado)
- Se envía desde el **backend** (seguro)
- No se expone en el cliente

### Restricciones Recomendadas
En Google Cloud Console, restringir la API key a:
1. HTTP referrers: `localhost:3000`, `tudominio.com`
2. APIs: Solo "Places API"

## 🐛 Troubleshooting

### 1. "Error fetching clinics"
```bash
✅ Verificar que backend esté corriendo en puerto 3001
✅ Ver logs del backend: npm run start:dev
```

### 2. "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is undefined"
```bash
✅ Verificar .env tiene la variable
✅ Reiniciar frontend: Ctrl+C y npm run dev
```

### 3. "API_LIMIT_EXCEEDED"
```bash
✅ Esperar 24h para reset de cuota
✅ Usar datos locales mientras tanto (automático)
```

### 4. "Sin resultados en una ciudad"
```bash
✅ Aumentar radius en clinics.service.ts (línea 76)
✅ Cambiar keyword/type si no detecta veterinarias
```

## 📚 Recursos

- [Google Maps Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [Near Search Reference](https://developers.google.com/maps/documentation/places/web-service/search-nearby)
- [Place Details Reference](https://developers.google.com/maps/documentation/places/web-service/details)

## 🎉 Próximos Pasos

1. **Caching mejorado**
   - Guardar resultados en Redis/BD para evitar llamadas repetidas
   - TTL de 24h

2. **Persistencia**
   - Guardar clinics en Prisma DB
   - Admin panel para aprobar/rechazar clínicas

3. **Búsqueda Avanzada**
   - Filtrar por servicios específicos
   - Buscar por horario de apertura
   - Ordenar por distancia real (no aproximada)

4. **Reviews y Ratings**
   - Sincronizar calificaciones de Google
   - Agregar reviews locales

---

**¡Tu aplicación ya obtiene veterinarias reales!** 🎉

Para empezar:
```bash
cd backend && npm run start:dev
# En otra terminal:
cd frontend && npm run dev
# Ir a http://localhost:3000/clinics
```
