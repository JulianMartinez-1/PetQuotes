# Database Operations Runbook

## Migration policy

- Production and staging must use `prisma migrate deploy`.
- `prisma db push` is guarded by `scripts/guard-db-push.mjs` and blocked unless both conditions are true:
  - `NODE_ENV=development`
  - `ALLOW_DB_PUSH=true`

## Bootstrap minimum data

Run minimum seed for auth and appointment services:

```bash
npm run db:seed:minimum
```

Default seed data:
- Admin user: `SEED_ADMIN_EMAIL` (default `admin@petquotes.local`)
- Demo pets: `pet-demo-001`, `pet-demo-002` owned by `client-demo-001`
- Demo appointment: `appt-demo-001`

## Backup

```bash
npm run db:backup
```

This command creates custom-format dumps in `./backups` for both databases:
- `auth-db-<timestamp>.dump`
- `appointment-db-<timestamp>.dump`

Requirements:
- `pg_dump` available in PATH
- `AUTH_DATABASE_URL` and `APPOINTMENT_DATABASE_URL` set

## Restore

```bash
npm run db:restore -- -AuthDump ./backups/auth-db-<timestamp>.dump -AppointmentDump ./backups/appointment-db-<timestamp>.dump
```

Requirements:
- `pg_restore` available in PATH
- `AUTH_DATABASE_URL` and `APPOINTMENT_DATABASE_URL` set

## Restore drill cadence

- Staging restore drill: weekly
- Production restore drill: monthly
- Drill exit criteria:
  - Services start with restored databases
  - `/api/ready` returns 200
  - Login + create appointment smoke flow succeeds

## Automated restore drill

Run full drill (without restore from dump):

```bash
npm run db:restore:drill
```

Run drill including restore from backups:

```bash
npm run db:restore:drill -- -AuthDump ./backups/auth-db-<timestamp>.dump -AppointmentDump ./backups/appointment-db-<timestamp>.dump
```

Standalone smoke validation:

```bash
npm run test:smoke:booking
```
