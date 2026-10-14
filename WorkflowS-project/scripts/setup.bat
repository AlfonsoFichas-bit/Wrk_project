@echo off
REM Script para ejecutar automáticamente todo en Windows

echo.
echo 🚀 WorkflowS - Setup Automático (Windows)
echo ==========================================
echo.

REM Paso 1: Verificar PostgreSQL
echo ▶ Verificando PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ PostgreSQL no está instalado o no está en PATH
    echo.
    echo Soluciones:
    echo   1. Instala PostgreSQL desde https://www.postgresql.org/download/windows/
    echo   2. O usa Docker: docker run -d --name postgres-workflows -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=workflow_db -p 5432:5432 postgres:latest
    echo.
    pause
    exit /b 1
)
echo ✓ PostgreSQL encontrado

REM Paso 2: Ejecutar migraciones
echo ▶ Ejecutando migraciones...
call npm run migrate:dev -- --name init >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Error en migraciones
    echo.
    echo Intenta:
    echo   npx prisma migrate dev
    echo.
    pause
    exit /b 1
)
echo ✓ Migraciones completadas

REM Paso 3: Iniciar desarrollo
echo ▶ Iniciando Frontend y Backend...
echo.
echo ========================================
echo 📍 Accede a:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo    Studio:   http://localhost:5555
echo.
echo ⚠️  Presiona Ctrl+C para detener
echo ========================================
echo.

call npm run dev:all

pause
