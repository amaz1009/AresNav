# run-local.ps1 - Start AresNav Backend and Frontend simultaneously
[CmdletBinding()]
param()

$root = $PSScriptRoot
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "           AresNav — Live Full-Stack Workstation          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Check backend venv
$python = Join-Path $backendDir ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    Write-Host "Setting up backend virtual environment..." -ForegroundColor Yellow
    Set-Location $backendDir
    uv venv --python 3.12 .venv
    uv pip install -e ".[dev]"
}

# Start backend in a dedicated window
Write-Host "1. Launching Backend (FastAPI / Uvicorn) on http://127.0.0.1:8000..." -ForegroundColor Green
$backendCmd = "Set-Location '$backendDir'; & '$python' -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# Start frontend in a dedicated window
Write-Host "2. Launching Frontend (Vite) on http://localhost:5173..." -ForegroundColor Green
$frontendCmd = "Set-Location '$frontendDir'; npm.cmd run dev -- --host"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "`nBoth services are running!" -ForegroundColor Cyan
Write-Host "  -> Frontend UI:  http://localhost:5173" -ForegroundColor White
Write-Host "  -> Backend API:  http://127.0.0.1:8000/api/v1/health" -ForegroundColor White
Write-Host "  -> Swagger Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
