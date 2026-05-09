# Checklist post-deploy (corto)

Uso: copiar/pegar en el issue de release y completar estado.

## Estado general

- [ ] Deploy completado en produccion
- [ ] Version/tag desplegado coincide con release
- [ ] Sin incidentes P0/P1 en los primeros 15 minutos

## Verificacion funcional rapida (5-10 min)

- [ ] GET /api/health = 200
- [ ] GET /api/ready = 200
- [ ] Login cliente: OK
- [ ] Crear cita: OK
- [ ] Consultar historial por mascota: OK
- [ ] Reprogramar cita (rol VETERINARY/ADMIN): OK

## Verificacion de observabilidad

- [ ] Gateway metrics disponibles: /api/metrics/prometheus
- [ ] Auth metrics disponibles: /metrics/prometheus
- [ ] Appointment metrics disponibles: /metrics/prometheus
- [ ] Dashboard Grafana carga datos actuales
- [ ] No alertas criticas activas en Prometheus

## Verificacion de datos y operacion

- [ ] Migraciones aplicadas sin error
- [ ] Backup/restore policy confirmada para entorno
- [ ] Logs con x-request-id visibles para requests de prueba

## Cierre

- [ ] Release aprobado para operacion normal
- [ ] Si hubo incidencias, issue de seguimiento creado con owner y ETA
