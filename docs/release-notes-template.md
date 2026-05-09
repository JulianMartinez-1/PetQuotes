# Release Notes Template (GitHub)

## Release

- Version: vX.Y.Z
- Fecha: YYYY-MM-DD
- Commit base: <hash>
- Autor/Owner: <nombre>

## Resumen ejecutivo

Breve descripcion de que incluye esta release y que problema resuelve.

## Cambios incluidos

### Backend

- Estandarizacion de contrato de errores con requestId en servicios core.
- Retry con backoff en API Gateway para fallas transitorias.
- Endpoints de health/ready y mejoras de resiliencia.
- Metricas de negocio expuestas en formato Prometheus.

### Frontend

- Timeout defensivo en cliente API.
- Idempotency key en creacion de citas.
- Error boundary y loading de ruta para Bookings.
- Mejoras de UX en estados de error/carga.

### Data e Infra

- Migraciones Prisma hardened (evita conflictos en re-ejecucion).
- Flujo de verificacion con Docker Compose + e2e.
- Observabilidad base en Prometheus/Grafana.

### QA y validaciones

- Lint global: OK
- Build global: OK
- Unit tests: OK
- E2E Sprint 1 + 2: OK
- Audit de dependencias: OK

## Evidencia

- CI run: <url>
- E2E run: <url>
- Dashboard/metricas: <url>
- Issue de release: <url>

## Riesgos conocidos

- [ ] Ninguno
- [ ] Si aplica, describir riesgo, impacto, mitigacion y owner

## Rollback

- Estrategia: revert del commit/tag + redeploy
- Comando sugerido: git revert <hash> (o rollback de imagen/tag)
- Validacion post-rollback: health/ready + smoke login/booking

## Checklist de salida

- [ ] Deploy en produccion completado
- [ ] Post-deploy checklist ejecutado
- [ ] Monitoreo 30 min sin alertas criticas
- [ ] Comunicacion de cierre publicada
