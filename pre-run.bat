@echo off
setlocal enabledelayedexpansion
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9090') do (
    tasklist /FI "PID eq %%a" | findstr java.exe >nul
    if not errorlevel 1 (
        echo Cerrando java.exe en puerto 9090 (PID %%a)...
        taskkill /PID %%a /F
    )
)