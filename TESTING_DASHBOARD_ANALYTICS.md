# 🚀 GUÍA RÁPIDA: PROBAR EL DASHBOARD DE ANALÍTICA

## ✅ Prerrequisitos

```bash
# ✅ Backend corriendo
http://localhost:3001

# ✅ Frontend corriendo
http://localhost:3000

# ✅ PostgreSQL con datos
docker compose up -d

# ✅ Prisma migrations ejecutadas
# (Se ejecutan automáticamente en backend startup)
```

---

## 📝 PASO 1: Crear Credencial ADMIN

Si aún no existe:

```bash
cd backend
npm run seed
```

**Credenciales:**
```
Email: admin@petquotes.local
Password: Admin@123456
Role: ADMIN
```

---

## 🔑 PASO 2: Login en el Frontend

```
1. Ir a http://localhost:3000/login
2. Email: admin@petquotes.local
3. Password: Admin@123456
4. Click "Iniciar Sesión"
```

---

## 📊 PASO 3: Acceder al Dashboard

```
URL: http://localhost:3000/admin/analytics

✅ Debería ver:
  - Barra de filtros
  - Grid de 8 KPIs con números animados
  - Múltiples gráficas interactivas
  - Datos REALES de la BD
```

---

## 🔍 PASO 4: Probar Filtros

### **Cambiar Rango de Fechas**
```
1. En FiltersBar, modificar "Fecha Inicio" y "Fecha Fin"
2. Los gráficos se actualizan automáticamente
3. Max rango: 1 año
```

### **Filtrar por Estado de Cita**
```
1. Seleccionar estado en dropdown (PENDING, COMPLETED, CANCELLED)
2. Los números de citas y gráficas cambian
```

### **Restablecer Filtros**
```
1. Click en botón "Restablecer"
2. Vuelve a default: últimos 30 días
```

---

## 📈 PASO 5: Verificar Datos REALES

### **Citas por Día (Gráfico de Línea)**
```
- Muestra una línea con la cantidad de citas por día
- Si no hay datos para ese rango → aparece vacío
- Hover sobre puntos para ver valores exactos
```

### **KPIs Principales**
```
Total Usuarios:      ← count(users)
Total Mascotas:      ← count(pets)
Total Clínicas:      ← count(clinics)
Total Citas:         ← count(appointments)
Citas Completadas:   ← count(appointments where status=COMPLETED)
Tasa de Conversión:  ← (completadas / total) * 100
Nuevos Usuarios Hoy: ← count(users where createdAt >= today)
Nuevas Citas Hoy:    ← count(appointments where createdAt >= today)
```

---

## 🧪 PASO 6: Pruebas Manual (DevTools)

### **Ver Solicitudes HTTP**

```
1. F12 → Network tab
2. Ir a /admin/analytics
3. Ver peticiones:
   ✅ GET /api/analytics/dashboard
   ✅ GET /api/analytics/users
   ✅ GET /api/analytics/pets
   ✅ GET /api/analytics/appointments
   ✅ GET /api/analytics/clinics
   ✅ GET /api/analytics/professionals
   ✅ GET /api/analytics/services
```

### **Ver Datos en Response**

```
1. Click en cualquier request
2. Tab "Response"
3. Verificar estructura JSON
4. Todos los números deben ser > 0 si hay datos
```

### **Verificar React Query Caché**

```
1. F12 → Console
2. Cambiar fechas sin recargar
3. Las queries se reutilizan de caché (5 min TTL)
4. Segunda vez es MUCHO más rápida
```

---

## 🔐 PASO 7: Verificar Seguridad

### **Test: Acceso sin ADMIN**

```bash
# 1. Logout
# 2. Login con usuario CLIENT
# 3. Intentar acceder a /admin/analytics
# ❌ Debería mostrar "Acceso Denegado"
```

### **Test: Sin Autenticación**

```bash
# 1. En navegador privado (sin login)
# 2. Ir a http://localhost:3000/admin/analytics
# ❌ Debería redirigir a /login
```

### **Test: JWT Inválido**

```bash
curl -H "Authorization: Bearer INVALID_TOKEN" \
  http://localhost:3001/api/analytics/dashboard
# ❌ Respuesta: 401 Unauthorized
```

---

## ⚡ PASO 8: Probar Performance

### **Métrica: Tiempo de Carga**

```
Esperado:
- Primera carga: 1-2 segundos
- Carga con caché: < 100ms
- Cambio de filtros: 0.5-1 segundo

Para medir:
1. F12 → Network tab
2. Disable caché (si quieres forzar nueva consulta)
3. Medir tiempo de request
```

### **Métrica: Animaciones Suave**

```
Los KPIs deben tener:
✅ CountUp animation (números animan de 0 → valor real)
✅ Suave por 0.5 segundos
✅ Sin lag o stuttering
```

---

## 📊 PASO 9: Inspeccionar Gráficas

### **Time Series (Línea)**
```
✅ Eje X: Fechas en formato YYYY-MM-DD
✅ Eje Y: Números (cantidad de citas)
✅ Tooltip al hover
✅ Legend en la parte superior
```

### **Bar Chart (Barras)**
```
✅ Barras horizontales o verticales
✅ Colores diferenciados
✅ Etiquetas legibles
✅ Valores correctos
```

### **Pie Chart (Circular)**
```
✅ Segmentos con colores diferentes
✅ Etiquetas mostrando nombre + número
✅ Tooltip al hover
✅ Legend lateral
```

---

## 🐛 PASO 10: Troubleshooting

### **Problema: "Error de conexión" o "Cannot fetch"**

**Solución:**
```bash
# ✅ Verificar que backend está corriendo
curl http://localhost:3001/health

# ✅ Verificar que BD está corriendo
docker compose ps

# ✅ Reiniciar todo
docker compose down
docker compose up -d
npm run dev (en backend)
npm run dev (en frontend)
```

### **Problema: "Acceso Denegado" pero soy ADMIN**

**Solución:**
```bash
# ✅ Verificar que el JWT es válido
# En DevTools: Application → Cookies → buscar token

# ✅ Re-login
# Logout y vuelve a login con admin@petquotes.local

# ✅ Verificar rol en BD
SELECT id, email, role FROM "User" WHERE email = 'admin@petquotes.local';
# Debería mostrar role: 'ADMIN'
```

### **Problema: "No hay datos" en gráficas**

**Solución:**
```bash
# ✅ Verificar que hay datos en la BD
SELECT COUNT(*) FROM "Appointment";

# ✅ Verificar rango de fechas
# Los filtros deben abarcar fechas reales de los datos

# ✅ Aumentar rango de fechas
# Por defecto es últimos 30 días
# Cambiar a "últimos 90 días" o todo el tiempo
```

### **Problema: Performance lento**

**Solución:**
```bash
# ✅ Verificar índices en BD
\d "Appointment"
# Debería tener índices en (status, startTime, clinicId)

# ✅ Limpiar caché React Query
# F12 → Application → Clear all site data

# ✅ Reiniciar backend
# Ctrl+C en terminal backend
# npm run dev
```

---

## 🎯 CHECKLIST FINAL

```
✅ Backend corriendo (http://localhost:3001)
✅ Frontend corriendo (http://localhost:3000)
✅ PostgreSQL activo con datos
✅ Login como admin@petquotes.local
✅ Acceso a /admin/analytics exitoso
✅ KPIs mostrando números reales
✅ Gráficas renderizando datos
✅ Filtros aplicándose dinámicamente
✅ React Query caché funcionando
✅ Seguridad: solo ADMIN accede
✅ Performance: carga en < 2 segundos

🎉 ¡DASHBOARD LISTO PARA PRODUCCIÓN!
```

---

## 📞 COMANDOS ÚTILES

```bash
# Ver logs del backend
npm run dev (backend)

# Ver logs del frontend
npm run dev (frontend)

# Verificar BD
psql -U postgres -d petquotes

# Reiniciar todo
docker compose restart
npm run seed (backend)

# Generar cliente Prisma
npx prisma generate

# Ejecutar migrations
npm run migrate (backend)
```

---

**Guía rápida completada.**  
**Tiempo estimado: 5-10 minutos**  
**¡Disfrutá del Dashboard! 🎉**
