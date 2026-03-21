# Roadmap de mejoras (3 sprints)

## Objetivo
Llevar PET QUOTES a un nivel mas robusto en seguridad, calidad, rendimiento y operacion, con entregables medibles por sprint.

## Estado de ejecucion (actualizado)

Completado en codigo en esta iteracion:
1. Contrato de error estandar con requestId en Auth y Appointment.
2. Retry con backoff en API Gateway para fallas transitorias upstream.
3. Timeout defensivo en cliente web usando AbortController.
4. Idempotency key enviada desde frontend en creacion de citas.
5. Pruebas unitarias de retry en gateway.
6. Diagrama de arquitectura actualizado con bloque Production Hardening.

Completado en este bloque adicional:
1. Metricas de negocio en Auth Service (registro, login, refresh, logout).
2. Metricas de negocio en Appointment Service (create/idempotency/cache/status/reschedule).
3. Export Prometheus de eventos de negocio (petquotes_business_event_total).
4. Migracion de idempotency hardened con CREATE INDEX IF NOT EXISTS para evitar P3018 en re-ejecuciones.
5. Error boundary por ruta en Bookings para aislar fallas del modulo.
6. Loading skeleton por ruta en Bookings para mejorar UX percibida.
7. Test unitario de export Prometheus para metricas de negocio en Auth y Appointment.
8. Preflight de disponibilidad en script e2e para diagnostico mas claro cuando backend no esta arriba.

Validacion ejecutada:
1. Test gateway: OK.
2. Lint/Typecheck gateway: OK.
3. Lint/Typecheck auth-service: OK.
4. Lint/Typecheck appointment-service: OK.
5. Lint web: OK.
6. Test gateway (retry/backoff): OK.
7. Typecheck auth-service tras metricas de negocio: OK.
8. Typecheck appointment-service tras metricas de negocio: OK.
9. Docker compose (auth-db, appointment-db, redis, rabbitmq, elasticsearch, auth-service, appointment-service, api-gateway): OK.
10. Prisma migrate deploy (auth-service y appointment-service): OK (sin pendientes).
11. E2E integrado Sprint 1 + Sprint 2 (scripts/e2e-sprint2.mjs): OK.
12. Pipeline global local (ci:lint, ci:build, ci:test:unit): OK.

## Supuestos de planificacion
- Sprint de 2 semanas.
- Equipo mixto frontend + backend.
- Se prioriza estabilidad del flujo login -> booking -> reprogramacion.

## Priorizacion
1. P0: Seguridad, confiabilidad del flujo de citas, estandares de error.
2. P1: Observabilidad de negocio, rendimiento y UX critica.
3. P2: Escalabilidad, endurecimiento operativo y deuda tecnica.

---

## Sprint 1 (P0): Seguridad y confiabilidad base

### Backend
1. Unificar autenticacion y autorizacion en todos los servicios.
- Entregable: guardas JWT/RBAC consistentes para gateway y servicios.
- DoD: mismo formato de errores auth, mismo criterio de expiracion token.

2. Estandarizar contrato de errores.
- Entregable: respuesta de error unica (code, message, requestId, details).
- DoD: todos los endpoints principales responden con el mismo shape.

3. Robustecer idempotencia en creacion de citas.
- Entregable: validacion de x-idempotency-key + persistencia segura.
- DoD: reintentos no generan citas duplicadas.

4. Timeouts + retries con backoff en llamadas internas.
- Entregable: politicas por cliente HTTP interno.
- DoD: errores transitorios se recuperan sin degradar UX.

5. Health/readiness profundos.
- Entregable: /health y /ready validando dependencias reales (DB, Redis, Rabbit, Elastic segun servicio).
- DoD: readiness falla correctamente cuando dependencia critica cae.

### Frontend
1. UX de estados criticos.
- Entregable: loading, empty y error states consistentes en login, bookings, clinics.
- DoD: no hay pantallas en blanco ni bloqueos silenciosos.

2. Manejo unificado de errores API.
- Entregable: normalizador de errores para mostrar mensajes claros.
- DoD: errores 4xx/5xx tienen feedback visible y accionable.

3. Hardening de formularios.
- Entregable: validacion inline, disable submit en pending, mensajes de campo.
- DoD: formularios no envian payload invalido.

### QA y CI
1. Tests de integracion backend (gateway + auth + appointment).
- DoD: escenarios felices y fallas criticas cubiertos.

2. E2E de flujo principal en web.
- DoD: login -> crear cita -> listar cita -> reprogramar.

### KPI de salida Sprint 1
- 0 duplicados en creacion con reintentos.
- Reduccion de errores 5xx en flujo de booking.
- 100% endpoints core con requestId y error shape comun.

---

## Sprint 2 (P1): Observabilidad y performance real

### Backend
1. Metricas de negocio.
- Entregable: counters y latencias para login, booking, cancel, reschedule.
- DoD: panel en Grafana con KPIs de negocio y tecnico.

2. Alertas orientadas a usuario.
- Entregable: alertas por p95 alto, error rate, fallo readiness.
- DoD: alertas accionables con runbook asociado.

3. Estrategia de cache Redis.
- Entregable: politicas TTL e invalidacion por dominio.
- DoD: mejora medible de latencia sin inconsistencias funcionales.

4. Estabilizar eventos RabbitMQ.
- Entregable: contrato de eventos versionado + manejo de reintentos.
- DoD: consumidores toleran duplicados y errores temporales.

### Frontend
1. Rendimiento de carga inicial.
- Entregable: code splitting por ruta pesada, lazy load de modulos de mapa.
- DoD: mejora en tiempo interactivo en home y bookings.

2. React Query tuning.
- Entregable: staleTime, invalidaciones y retries por dominio.
- DoD: menos refetch inutil, UI mas estable.

3. Accesibilidad.
- Entregable: foco visible, labels correctos, teclado completo.
- DoD: checklist WCAG basico cumplido en vistas criticas.

### QA y CI
1. Pruebas de carga ligeras automatizadas.
- Entregable: smoke perf en endpoints de auth y bookings.
- DoD: umbrales definidos y controlados por CI.

2. Seguridad de dependencias e imagenes.
- Entregable: escaneo automatizado en pipeline.
- DoD: reporte visible y politica para CVEs criticos.

### KPI de salida Sprint 2
- p95 de endpoints criticos dentro de objetivo acordado.
- Dashboard de negocio operando en Grafana.
- Menor tiempo de carga en frontend en rutas principales.

---

## Sprint 3 (P2): Escalabilidad y madurez operativa

### Backend
1. Outbox pattern en procesos criticos de citas.
- Entregable: publicacion confiable de eventos con consistencia transaccional.
- DoD: sin perdida de eventos ante reinicios/fallos.

2. Versionado de APIs y contratos.
- Entregable: estrategia v1/v2 + politica de deprecacion.
- DoD: cambios futuros sin romper clientes existentes.

3. Auditoria funcional.
- Entregable: log de acciones sensibles (auth, status cambios, permisos).
- DoD: trazabilidad completa por requestId y usuario.

4. Politica de migraciones zero-downtime.
- Entregable: playbook para cambios de schema graduales.
- DoD: despliegues sin corte para cambios comunes.

### Frontend
1. Error boundaries por modulo.
- Entregable: aislamiento de fallas por seccion.
- DoD: falla local no derriba toda la app.

2. Telemetria de funnel.
- Entregable: eventos front para registro, login y booking.
- DoD: conversion visible y medible por etapa.

3. Consolidacion de design tokens.
- Entregable: sistema de tokens y componentes base consistente.
- DoD: uniformidad visual y menor deuda UI.

### DevOps y operacion
1. Compose por entorno (dev/test/ci).
- Entregable: perfiles y configuraciones separadas.
- DoD: menor friccion local y CI mas estable.

2. Runbooks de incidentes.
- Entregable: procedimientos para caidas de DB, Rabbit, Redis y gateway.
- DoD: tiempo de recuperacion esperado definido.

3. Versionado de imagenes y trazabilidad deploy.
- Entregable: tags semanticos + digest pinning.
- DoD: rollback confiable por version.

### KPI de salida Sprint 3
- Mejor resiliencia ante fallos de infraestructura.
- Mejor trazabilidad operativa y de negocio.
- Plataforma lista para crecimiento de trafico y nuevos modulos.

---

## Backlog recomendado (orden de ejecucion)
1. Unificar auth/RBAC.
2. Error contract comun.
3. Idempotencia y retries.
4. Integracion tests core.
5. UX de errores y estados en web.
6. Metricas de negocio + dashboard.
7. Performance frontend + cache tuning.
8. Outbox + versionado de contratos.
9. Auditoria y runbooks.
10. Endurecimiento CI/CD y seguridad continua.

## Riesgos si no se ejecuta
1. Duplicados en citas y errores de consistencia.
2. Dificultad para diagnosticar incidentes por falta de trazabilidad.
3. Degradacion de UX en escenarios de error/red lenta.
4. Mayor costo de evolucion por deuda tecnica acumulada.

## Indicadores sugeridos (global)
1. Error rate por endpoint.
2. p95 y p99 de login/booking.
3. Exito de flujo login -> booking.
4. Tiempo medio de recuperacion (MTTR).
5. Cobertura de pruebas en modulos criticos.
