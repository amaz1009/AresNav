@echo off
setlocal
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

if not exist "%BACKEND%\.venv\Scripts\python.exe" (
    echo [setup] Creating backend virtual environment, this takes a minute...
    pushd "%BACKEND%"
    py -3.12 -m venv .venv || goto :fail
    .venv\Scripts\python.exe -m pip install -e ".[dev]" || goto :fail
    popd
)

if not exist "%FRONTEND%\node_modules" (
    echo [setup] Installing frontend packages...
    pushd "%FRONTEND%"
    call npm ci || goto :fail
    popd
)

echo Starting backend on http://127.0.0.1:8000 ...
start "AresNav Backend" /d "%BACKEND%" cmd /k ".venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo Starting frontend on http://localhost:5173 ...
start "AresNav Frontend" /d "%FRONTEND%" cmd /k "npm run dev -- --host"

timeout /t 6 /nobreak >nul
start "" "http://localhost:5173"
goto :eof

:fail
echo.
echo [error] Setup failed. Read the messages above, fix the problem, and run this file again.
pause
exit /b 1
