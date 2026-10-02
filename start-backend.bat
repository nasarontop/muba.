@echo off
echo ========================================
echo   MobiTPV Backend - Servidor Local
echo ========================================
echo.
echo Iniciando el servidor backend...
echo Punto de salud: http://localhost:3001/api/health
echo Panel web: Abre index.html en tu navegador
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

cd /d "%~dp0backend"
node server.js

pause