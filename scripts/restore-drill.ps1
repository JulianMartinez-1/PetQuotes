Param(
  [string]$AuthDump,
  [string]$AppointmentDump
)

$ErrorActionPreference = "Stop"

Write-Host "[DRILL] Starting core services" -ForegroundColor Cyan

docker compose up -d --build auth-db appointment-db redis rabbitmq elasticsearch auth-service appointment-service api-gateway

Write-Host "[DRILL] Waiting for /api/ready" -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  try {
    $resp = Invoke-WebRequest -Uri "http://localhost:3001/api/ready" -UseBasicParsing -TimeoutSec 5
    if ($resp.StatusCode -eq 200) {
      $ready = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 2
  }
}

if (-not $ready) {
  throw "Gateway did not reach ready state"
}

if ($AuthDump -and $AppointmentDump) {
  Write-Host "[DRILL] Running restore from dumps" -ForegroundColor Cyan

  if (-not (Test-Path $AuthDump)) {
    throw "Auth dump not found: $AuthDump"
  }
  if (-not (Test-Path $AppointmentDump)) {
    throw "Appointment dump not found: $AppointmentDump"
  }

  $authPassword = if ($env:AUTH_DB_APP_PASSWORD) { $env:AUTH_DB_APP_PASSWORD } else { "auth_app_dev_change_me" }
  $appointmentPassword = if ($env:APPOINTMENT_DB_APP_PASSWORD) { $env:APPOINTMENT_DB_APP_PASSWORD } else { "appointment_app_dev_change_me" }

  $env:AUTH_DATABASE_URL = "postgresql://auth_app:$authPassword@localhost:5433/auth_db?schema=public"
  $env:APPOINTMENT_DATABASE_URL = "postgresql://appointment_app:$appointmentPassword@localhost:5434/appointment_db?schema=public"

  & ./scripts/db-restore.ps1 -AuthDump $AuthDump -AppointmentDump $AppointmentDump
}

Write-Host "[DRILL] Applying migrations and seed" -ForegroundColor Cyan

docker compose exec -T auth-service npx prisma migrate deploy
docker compose exec -T appointment-service npx prisma migrate deploy
docker compose exec -T auth-service npm run prisma:seed
docker compose exec -T appointment-service npm run prisma:seed

Write-Host "[DRILL] Re-checking /api/ready" -ForegroundColor Cyan
$resp2 = Invoke-WebRequest -Uri "http://localhost:3001/api/ready" -UseBasicParsing -TimeoutSec 10
if ($resp2.StatusCode -ne 200) {
  throw "Ready check failed after migrate/seed"
}

Write-Host "[DRILL] Running smoke login+booking" -ForegroundColor Cyan
node ./scripts/smoke-login-booking.mjs
if ($LASTEXITCODE -ne 0) {
  throw "Smoke login+booking failed"
}

Write-Host "[DRILL] SUCCESS" -ForegroundColor Green
