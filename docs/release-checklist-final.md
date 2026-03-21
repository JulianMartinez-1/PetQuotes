# Checklist Final de Release (Merge + Produccion)

Fecha: 2026-03-21

## Estado final

- Listo para merge: SI
- Listo para produccion: SI

## Gate de merge

- [x] Lint global en workspaces: OK
- [x] Build global en workspaces: OK
- [x] Tests unitarios globales: OK
- [x] E2E integrado Sprint 1 + Sprint 2: OK
- [x] Documentacion de roadmap actualizada con estado real
- [x] Diagrama de arquitectura actualizado
- [x] Artefactos temporales de CI eliminados del workspace local (`.ci-run-logs`, `.ci-run-logs-new`, zips)

## Gate de produccion

- [x] `npm audit --json`: 0 vulnerabilidades (critical/high/moderate/low)
- [x] `docker compose up -d --build` para stack core: OK
- [x] `prisma migrate deploy` en `auth-service`: OK
- [x] `prisma migrate deploy` en `appointment-service`: OK
- [x] Health/readiness en servicios core: OK
- [x] Metricas tecnicas y de negocio expuestas en endpoints Prometheus: OK
- [x] Restore drill automatizado (`npm run db:restore:drill`): SUCCESS
- [x] Backup operativo validado via contenedor PostgreSQL (dump de auth y appointment generado en `backups/`)

## Evidencia ejecutada

1. `npm run ci:lint; npm run ci:build; npm run ci:test:unit` -> Exit code 0.
2. `npm run test:sprint2:e2e` -> Sprint 1 OK + Sprint 2 OK.
3. `npm audit --json` -> total vulnerabilities: 0.
4. `docker compose exec -T auth-service npx prisma migrate deploy` -> sin pendientes.
5. `docker compose exec -T appointment-service npx prisma migrate deploy` -> sin pendientes.
6. `npm run db:restore:drill` -> SUCCESS, incluyendo smoke login+booking.
7. Backup desde contenedores:
	- `docker compose exec -T auth-db pg_dump -U postgres -d auth_db -Fc > backups/auth-db-container-<timestamp>.dump`
	- `docker compose exec -T appointment-db pg_dump -U postgres -d appointment_db -Fc > backups/appointment-db-container-<timestamp>.dump`

## Checklist operativo previo a deploy real

- [x] Variables de entorno base validadas en `.env` para entorno objetivo.
- [x] Runbook de DB disponible en `docs/db-operations.md`.
- [x] Alertas base en Prometheus definidas (`observability/prometheus-alerts.yml`).
- [x] Dashboard base de Grafana provisionado.
- [ ] Confirmar secretos/credenciales reales de entorno productivo (fuera del repo).
- [x] Restore drill local validado.
- [ ] Instalar `pg_dump`/`pg_restore` en host de operacion o estandarizar backup via contenedor para runbook definitivo.

## Decision de release

Aprobado para merge y despliegue a produccion, sujeto a completar los dos checks operativos de entorno (secretos reales y simulacro final de restore).
