@echo off
echo ========================================
echo   MobiTPV - Sistema Completo
echo ========================================
echo.
echo 1. Iniciando backend en localhost:3001...

start "MobiTPV Backend" cmd /k "cd /d "%~dp0backend" && echo Iniciando servidor backend... && node server.js"

echo 2. Esperando 3 segundos...
timeout /t 3 /nobreak > nul

echo 3. Abriendo interfaz web...
start "" "%~dp0index.html"

echo.
echo ✅ Sistema MobiTPV iniciado:
echo    - Backend: http://localhost:3001
echo    - Frontend: index.html abierto en navegador
echo    - Login demo: admin@mobitpv.es / demo1234
echo.
echo Para detener: Cierra las ventanas del servidor
echo ========================================

pause