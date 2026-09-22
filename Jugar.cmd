@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js 22 o posterior y volve a abrir este archivo.
  pause
  exit /b 1
)
if not exist "node_modules\vite" (
  call npm install
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo.
echo Abri http://127.0.0.1:5173 en tu navegador.
echo Deja esta ventana abierta mientras jugas. Ctrl+C para cerrar.
echo.
call npm run dev
