@echo off
rem ----------------------------------------------------------------------
rem install-requirements.bat - one-time setup for AresNav on a new Windows PC.
rem Installs Python 3.12 and Node.js if missing (via winget), then the backend
rem packages (backend\requirements.txt) and the frontend packages (npm ci).
rem Safe to run again: anything already installed is skipped.
rem ----------------------------------------------------------------------
setlocal EnableExtensions

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "NEEDRESTART="

echo === AresNav installer ===
echo.

rem --- 1. Tools: Python 3.12 and Node.js 20 or newer ---------------------
py -3.12 --version >nul 2>&1
if errorlevel 1 (
    call :install_tool "Python 3.12" Python.Python.3.12 || goto :fail
    set "NEEDRESTART=1"
)

set "NODE_OK="
where node >nul 2>&1 && node -e "process.exit(Number(process.versions.node.split('.')[0])>=20?0:1)" && set "NODE_OK=1"
if not defined NODE_OK (
    call :install_tool "Node.js LTS" OpenJS.NodeJS.LTS || goto :fail
    set "NEEDRESTART=1"
)

rem A freshly installed tool is not visible to this window until it is reopened.
if defined NEEDRESTART (
    echo.
    echo [done] Tools were installed. Close this window and run this file again.
    pause
    exit /b 0
)

rem --- 2. Backend: virtual environment and packages ----------------------
echo [1/3] Setting up the backend...
if not exist "%BACKEND%\.venv\Scripts\python.exe" (
    py -3.12 -m venv "%BACKEND%\.venv" || goto :fail
)
"%BACKEND%\.venv\Scripts\python.exe" -m pip install --upgrade pip || goto :fail
"%BACKEND%\.venv\Scripts\python.exe" -m pip install -r "%BACKEND%\requirements.txt" || goto :fail

rem --- 3. Frontend packages ----------------------------------------------
echo [2/3] Setting up the frontend...
pushd "%FRONTEND%" || goto :fail
call npm ci
if errorlevel 1 (
    popd
    goto :fail
)
popd

rem --- 4. Settings file --------------------------------------------------
echo [3/3] Checking settings...
if not exist "%ROOT%.env" if exist "%ROOT%.env.example" copy "%ROOT%.env.example" "%ROOT%.env" >nul

rem --- 5. Map data is not in git: warn if it is missing ------------------
dir /b "%BACKEND%\data\processed\*.tif" >nul 2>&1
if errorlevel 1 (
    echo.
    echo [warning] No map data found in backend\data\processed.
    echo           The site will start, but raster layers will show as unavailable.
    echo           Copy the processed, raw, renders and surface_images folders into backend\data.
)

echo.
echo [done] Setup complete. Start the app with start-marswalk.bat
pause
goto :eof

rem --- Subroutine: install a tool with winget ----------------------------
:install_tool
where winget >nul 2>&1
if errorlevel 1 (
    echo [error] winget was not found. Install %~1 manually, then run this file again.
    exit /b 1
)
echo [setup] Installing %~1 with winget...
winget install -e --id %~2 --accept-package-agreements --accept-source-agreements
if errorlevel 1 exit /b 1
exit /b 0

:fail
echo.
echo [error] Setup failed. Read the messages above, fix the problem, and run this file again.
pause
exit /b 1