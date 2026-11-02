@echo off
title Mundo Juega
cd /d "%~dp0"
echo ==========================================
echo          MUNDO JUEGA - INICIO
echo ==========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: No se encuentra Node.js.
  echo Instala Node.js desde https://nodejs.org/ y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)
echo Revisando e instalando dependencias...
call npm install
if errorlevel 1 (
  echo.
  echo ERROR al instalar dependencias. Revisa tu conexion a internet.
  pause
  exit /b 1
)
echo.
echo Abriendo Mundo Juega en el navegador...
start "" http://localhost:3001
echo.
echo La tienda esta funcionando. NO cierres esta ventana mientras la uses.
echo Para apagar el servidor, presiona Ctrl + C.
echo.
call npm start
pause
