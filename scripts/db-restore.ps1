Param(
  [Parameter(Mandatory=$true)][string]$AuthDump,
  [Parameter(Mandatory=$true)][string]$AppointmentDump
)

$ErrorActionPreference = "Stop"

if (-not $env:AUTH_DATABASE_URL -or -not $env:APPOINTMENT_DATABASE_URL) {
  throw "AUTH_DATABASE_URL and APPOINTMENT_DATABASE_URL must be set"
}

pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$env:AUTH_DATABASE_URL" "$AuthDump"
pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$env:APPOINTMENT_DATABASE_URL" "$AppointmentDump"

Write-Host "Restore completed." -ForegroundColor Green
