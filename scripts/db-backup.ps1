Param(
  [string]$BackupDir = "./backups"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

if (-not $env:AUTH_DATABASE_URL -or -not $env:APPOINTMENT_DATABASE_URL) {
  throw "AUTH_DATABASE_URL and APPOINTMENT_DATABASE_URL must be set"
}

$authOut = Join-Path $BackupDir "auth-db-$timestamp.dump"
$appointmentOut = Join-Path $BackupDir "appointment-db-$timestamp.dump"

pg_dump --format=custom --file="$authOut" "$env:AUTH_DATABASE_URL"
pg_dump --format=custom --file="$appointmentOut" "$env:APPOINTMENT_DATABASE_URL"

Write-Host "Backup completed:" -ForegroundColor Green
Write-Host " - $authOut"
Write-Host " - $appointmentOut"
