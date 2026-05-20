# Frontend Improvements - Implementation Guide

## Overview
Se han implementado mejoras significativas en la interfaz de usuario del frontend:

1. **ServiceCard Component** - Cards mejoradas y clickeables para servicios
2. **API Integration** - Integración con backend para traer clínicas
3. **Specialized Clinics Section** - Muestra clínicas por tipo de servicio
4. **Landing Page Updates** - Página principal con nuevos componentes

---

## New Components

### 1. ServiceCard (`components/ui/service-card.tsx`)
**Propósito**: Card de servicio clickeable que navega a la página del servicio

**Props**:
- `icon: ReactNode` - Emoji o icono del servicio
- `title: string` - Nombre del servicio
- `description: string` - Descripción breve
- `href: string` - URL a la que navega
- `color: "orange" | "green" | "teal" | "warning"` - Color del card
- `delay?: number` - Delay para animación
- `className?: string` - Clases Tailwind adicionales

**Características**:
- Hover animation con lift
- Animación de "Learn More" con flecha
- Línea decorativa en la parte superior
- Completamente responsivo

**Ejemplo de uso**:
```tsx
<ServiceCard
  icon="🩺"
  title="Consulta Veterinaria"
  description="Diagnósticos y tratamientos de expertos"
  href="/services/consulta-veterinaria"
  color="orange"
/>
```

### 2. SpecializedClinics (`components/sections/specialized-clinics-api.tsx`)
**Propósito**: Muestra clínicas verificadas especializadas en un servicio

**Props**:
- `serviceType: string` - Tipo de servicio (ej: "consulta-veterinaria")
- `serviceTitle: string` - Título del servicio para mostrar
- `limit?: number` - Número de clínicas a mostrar (default: 6)
- `className?: string` - Clases Tailwind adicionales

**Características**:
- Carga datos del backend automáticamente
- Muestra loading indicator mientras carga
- Maneja errores con fallback a datos mock
- Tarjetas con rating, verificación, contacto
- Links a detalles de la clínica
- Botón "Ver todas las clínicas"

**Integración con Backend**:
```typescript
// Usa clinicsService.getVerified() para traer clínicas
// El backend debe exponer: GET /clinics/verified?page=X&limit=Y
```

---

## API Services

### `lib/services-api.ts`
Contiene servicios para hacer llamadas a la API del backend

**Servicios disponibles**:

#### clinicsService
```typescript
// Get all clinics with pagination
clinicsService.getAll(page?: number, limit?: number)

// Get verified clinics
clinicsService.getVerified(page?: number, limit?: number)

// Get top-rated clinics
clinicsService.getTopRated(limit?: number)

// Search clinics
clinicsService.search(query: string, page?: number, limit?: number)
```

#### professionalsService
```typescript
// Get professionals by specialty
professionalsService.getBySpecialty(specialty: string, page?: number, limit?: number)

// Get professional by ID
professionalsService.getById(id: string)

// Get availability for a professional
professionalsService.getAvailability(professionalId: string)
```

---

## Updated Pages

### Landing Page (`app/page.tsx`)
**Cambios**:
- Importa `ServiceCard` en lugar de `FeaturesGrid`
- Servicios ahora tienen propiedades `href` para navegación
- Nuevo grid que usa `ServiceCard` con animaciones

### Service Pages
Todas las páginas de servicios han sido actualizadas:

#### `/services/consulta-veterinaria`
#### `/services/bano-grooming`
#### `/services/vacunacion`
#### `/services/estetica`

**Cambios en todas**:
- Importan `SpecializedClinics` desde `specialized-clinics-api`
- Llaman al componente con props dinámicas
- Ya no usan datos hardcodeados de clínicas
- El componente carga datos del backend automáticamente

---

## Environment Configuration

### `.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT_MS=10000
NEXT_PUBLIC_APP_NAME=PetQuotes
NEXT_PUBLIC_APP_ENV=development
```

**Nota**: Asegúrate de que `NEXT_PUBLIC_API_BASE_URL` apunte correctamente al backend

---

## Backend Requirements

Para que el frontend funcione correctamente, el backend debe exponer:

### Endpoints esperados

```
GET /clinics
  Params: page (number), limit (number)
  Response: ClinicResponse[]

GET /clinics/verified
  Params: page (number), limit (number)
  Response: ClinicResponse[]

GET /clinics/top-rated
  Params: limit (number)
  Response: ClinicResponse[]

GET /clinics/search
  Params: q (string), page (number), limit (number)
  Response: ClinicResponse[]

GET /clinics/:id
  Response: ClinicResponse

GET /professionals
  Params: specialty (string), branchId (string), page (number), limit (number)
  Response: ProfessionalResponse[]

GET /professionals/:id
  Response: ProfessionalResponse

GET /professionals/:id/availability
  Response: AvailabilityResponse[]
```

### Response Types

```typescript
interface ClinicResponse {
  id: string;
  ownerUserId: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  website?: string;
  licenseNumber: string;
  logo?: string;
  rating: number;
  isVerified: boolean;
}

interface ProfessionalResponse {
  id: string;
  userId: string;
  branchId: string;
  specialty: string;
  licenseNumber: string;
  yearsOfExperience: number;
  bio?: string;
  profileImage?: string;
  isActive: boolean;
}

interface AvailabilityResponse {
  id: string;
  professionalId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}
```

---

## How It Works - Flow

### 1. User visits homepage
- Landing page carga con 4 ServiceCards clickeables
- Cada card tiene color único y animación hover

### 2. User clicks "Learn More" on a service
- Navega a `/services/[service-name]`
- Página muestra información sobre el servicio

### 3. Specialized Clinics loads
- Componente monta y llama a `clinicsService.getVerified()`
- Backend retorna lista de clínicas verificadas
- Frontend muestra cards de clínicas con:
  - Nombre, descripción, rating
  - Teléfono, email
  - Estado de verificación
  - Link a detalles

### 4. User clicks on a clinic
- Navega a `/clinics/[clinic-id]`
- Página muestra detalles completos de la clínica

---

## Styling & Animations

### Color System
- **orange**: Consulta Veterinaria
- **green**: Baño & Grooming
- **teal**: Vacunación
- **warning/yellow**: Estética

### Animations
- Hover effects: `whileHover={{ y: -8 }}`
- Stagger: `staggerChildren: 0.1`
- Spring: `type: "spring", stiffness: 300`

### Responsive
- Mobile: 1 column
- Tablet: 2-3 columns
- Desktop: 3-4 columns

---

## Troubleshooting

### Clínicas no cargan
1. Verifica que `NEXT_PUBLIC_API_BASE_URL` sea correcto
2. Asegúrate de que el backend esté ejecutándose en `localhost:3001`
3. Revisa la consola del navegador para errores CORS
4. Verifica que el endpoint `/clinics/verified` esté implementado

### Componente muestra spinner infinito
- Backend probablemente está tardando
- Revisa los logs del backend
- Verifica que la query sea correcta

### Token de autenticación no funciona
- `requestJson` automáticamente agrega token desde `localStorage`
- Asegúrate de que el backend incluya token en `localStorage` después del login

---

## Next Steps / Features to Add

1. **Filtros avanzados** en la sección de clínicas
2. **Search in real-time** con debounce
3. **Ubicación geográfica** usando Google Maps
4. **Reservas integradas** desde las cards
5. **Reviews y ratings** de usuarios
6. **Favoritos** para clínicas

---

## File Changes Summary

### New Files
- `frontend/components/ui/service-card.tsx`
- `frontend/components/sections/specialized-clinics-api.tsx`
- `frontend/lib/services-api.ts`
- `frontend/.env.local`

### Modified Files
- `frontend/app/page.tsx` - Importa ServiceCard, actualiza grid de servicios
- `frontend/app/services/consulta-veterinaria/page.tsx` - Usa SpecializedClinics API
- `frontend/app/services/bano-grooming/page.tsx` - Usa SpecializedClinics API
- `frontend/app/services/vacunacion/page.tsx` - Usa SpecializedClinics API
- `frontend/app/services/estetica/page.tsx` - Usa SpecializedClinics API

