# Data Quality Report — PetQuotes Analytics Service

**Generado:** 2026-06-20  
**Fuente de datos:** PostgreSQL `pet_quotes_db` (esquema Prisma v5.18)  
**Pipeline:** `analytics-service/pipeline/cleaners.py`

---

## Inventario de tablas (Fase 1 — Auditoría de schema)

| Tabla | Columnas clave | Nulos esperados | Unicidad |
|-------|---------------|-----------------|----------|
| `users` | id, email, full_name, role, email_verified, created_at | phone, locked_until, profile_image | email (UNIQUE) |
| `pets` | id, owner_id, species, vaccines_up_to_date, created_at | name, breed, birth_date, weight, microchip, blood_type | microchip (UNIQUE, nullable) |
| `appointments` | id, client_id, pet_id, status, start_time, created_at | end_time, cancellation_reason | idempotency_key (UNIQUE, nullable) |
| `clinics` | id, owner_user_id, name, is_verified, created_at | rating (default 0), description, phone, email | license_number (UNIQUE, nullable) |
| `branches` | id, clinic_id, name, city, created_at | postal_code, phone, opening_hours | ninguno adicional |
| `professionals` | id, user_id, branch_id, specialty, is_active | license_number, years_of_experience, bio | user_id (UNIQUE), license_number (UNIQUE, nullable) |
| `veterinary_services` | id, clinic_id, name, price, category, is_active | description | ninguno adicional |
| `vaccines` | id, pet_id, name, date_administered, created_at | expiry_date, next_due_date, veterinarian | ninguno |
| `medications` | id, pet_id, name, start_date, status, created_at | end_date, prescribed_by, reason | ninguno |
| `notifications` | id, user_id, type, read, created_at | read_at, data | ninguno adicional |

---

## Decisiones de calidad de datos

### `users`

| Columna | Nulos | Decisión | Justificación |
|---------|-------|----------|---------------|
| `phone` | Muchos | **Mantener None** | Opcional por diseño; los clientes no están obligados a proveerlo. No se usa en ninguna métrica de analytics. |
| `locked_until` | Mayoría | **Mantener None** | None = cuenta no bloqueada. Es el estado normal. Convertir a datetime con `errors='coerce'`. |
| `profile_image` | Muchos | **Eliminar columna** | No se usa en ningún cálculo de analytics. Reduce memoria. |
| Duplicados | Ninguno esperado | `drop_duplicates(subset=['email'])` | `email` es UNIQUE en DB, pero se aplica como medida de defensa ante datos exportados parcialmente. |

**Tipos aplicados:**
- `created_at` → `datetime64[UTC]`  
- `locked_until` → `datetime64[UTC]` (nullable)  
- `email_verified` → `bool`  

---

### `pets`

| Columna | Nulos | Decisión | Justificación |
|---------|-------|----------|---------------|
| `species` | Rarísimos (NOT NULL en schema) | `fillna('Unknown')`, lowercase | Guard defensivo; sin species válida el groupby crearía un bucket NaN. |
| `name` | Posibles | **Mantener None** | Mascota sin nombre registrado es válida. No se agrupa por nombre en métricas. |
| `breed` | Muchos | **Mantener None** | Agrupamiento es por `species`, no por `breed`. Rellenar con 'Unknown' generaría un bucket artificial. |
| `birth_date` | Muchos | **Mantener None** | No se puede calcular edad sin fecha. No se rellena — imputar sería incorrecto. |
| `weight` | Muchos | **Mantener None** | Se usa solo en estadísticas descriptivas opcionales. Imputar con mediana modificaría distribución real. |
| `blood_type` | Mayoría | **Eliminar columna** | No se usa en ninguna métrica de analytics. |

**Tipos aplicados:**
- `birth_date` → `datetime64[UTC]` (nullable)  
- `created_at` → `datetime64[UTC]`  
- `species` → `str` (lowercase, stripped)  

---

### `appointments`

| Columna | Nulos | Decisión | Justificación |
|---------|-------|----------|---------------|
| `end_time` | Muchos | **Mantener None** | Cita en curso o pendiente no tiene end_time. No imputable. |
| `cancellation_reason` | Mayoría | **Eliminar columna** | Solo relevante para CANCELLED. No aporta a métricas de tendencia o KPI. Reduce memoria. |
| `status` | Ninguno | Cast a `category` | Enum de 5 valores conocidos; category dtype reduce memoria ~80%. |

**Tipos aplicados:**
- `start_time`, `end_time` → `datetime64[UTC]`  
- `created_at` → `datetime64[UTC]`  
- `status` → `category`  

---

### `clinics`

| Columna | Nulos | Decisión | Justificación |
|---------|-------|----------|---------------|
| `rating` | Rarísimos (default 0 en schema) | `fillna(0.0)` | 0 es el valor de negocio correcto para "sin rating aún". No es un dato faltante real. |
| `is_verified` | Rarísimos | `fillna(False)` | Default lógico: si no se sabe si está verificada, asumimos que no lo está. |

---

### `professionals`

| Columna | Nulos | Decisión | Justificación |
|---------|-------|----------|---------------|
| `years_of_experience` | Muchos | **Mantener None** (cast a float) | Imputar con mediana modificaría el KPI "promedio de experiencia". El display debe mostrar N/A. |
| `is_active` | Rarísimos | `fillna(True)` | Default de schema. Si no hay dato, asumimos activo. |

---

### `vaccines`

| Columna | Nulos | Decisión | Justificación |
|---------|-------|----------|---------------|
| `expiry_date` | Muchos | **Mantener None** | Vacuna sin fecha de vencimiento no está vencida; no imputable. |
| `next_due_date` | Muchos | **Mantener None** | Ídem anterior. Solo se filtra `WHERE next_due_date IS NOT NULL` para alertas. |

---

### `medications`

| Columna | Nulos | Decisión | Justificación |
|---------|-------|----------|---------------|
| `end_date` | Muchos | **Mantener None** | Medicamento activo puede no tener fecha de fin. |
| `status` | Ninguno | Cast a `category` | Enum ACTIVE/COMPLETED/DISCONTINUED. |

---

## Métricas calculables (Fase 3 — Propuesta)

### Resumen General (KPIs)
- Total usuarios, mascotas, clínicas, citas
- Citas completadas y tasa de conversión
- Nuevos usuarios hoy / nuevas citas hoy
- Distribución de citas por estado
- Tendencia de citas por día

### Usuarios
- Total por rol (CLIENT / VETERINARY / ADMIN)
- Usuarios verificados vs no verificados
- Usuarios con cuenta bloqueada
- Nuevos usuarios hoy / esta semana / este mes
- Tendencia de registros por día

### Citas / Engagement
- Total de citas con filtros de fecha y clínica
- Tasa de completado y cancelación
- Distribución por estado
- Citas por clínica y por profesional
- Top 10 mascotas más atendidas
- Top 10 clientes más activos

### No calculables (datos insuficientes o no presentes)
- Retención cohort (requeriría timestamps de última actividad, no disponibles)
- Ingresos reales (precios de servicios existen pero no hay tabla de pagos)
- NPS / satisfacción (no existe tabla de ratings de citas)

---

## Nota sobre producción

En producción se recomienda:
1. Crear usuario PostgreSQL de solo lectura: `CREATE USER pet_quotes_ro ...`
2. `GRANT SELECT ON ALL TABLES IN SCHEMA public TO pet_quotes_ro`
3. Usar `ANALYTICS_DB_URL=postgresql://pet_quotes_ro:...` en el `.env` del servicio
