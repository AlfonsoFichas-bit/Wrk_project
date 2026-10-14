@echo off
REM Script interactivo para migraciones en Windows

cls
echo.
echo ╔════════════════════════════════════════╗
echo ║    🗂️  WorkflowS - Migration Helper    ║
echo ╚════════════════════════════════════════╝
echo.

REM Verificar PostgreSQL
echo ▶ Verificando PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo ✗ PostgreSQL no está instalado
    echo.
    echo ℹ Instala desde: https://www.postgresql.org/download/windows/
    echo O usa Docker:
    echo.
    echo   docker run -d --name postgres-workflows ^
    echo     -e POSTGRES_USER=postgres ^
    echo     -e POSTGRES_PASSWORD=123456 ^
    echo     -e POSTGRES_DB=workflow_db ^
    echo     -p 5432:5432 ^
    echo     postgres:latest
    echo.
    pause
    exit /b 1
)

REM Intentar conectar
psql -U postgres -d workflow_db -c "SELECT 1" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL conectado a workflow_db
) else (
    echo ▶ Creando base de datos workflow_db...
    psql -U postgres -c "CREATE DATABASE workflow_db;" 2>nul
    if %errorlevel% equ 0 (
        echo ✓ Base de datos creada
    ) else (
        echo ✗ Error al crear BD
    )
)

echo.

REM Verificar .env
echo ▶ Verificando .env...
if exist .env (
    echo ✓ .env encontrado
    for /f "tokens=2 delims==" %%A in ('findstr /I "DATABASE_URL" .env') do (
        echo ℹ DATABASE_URL: %%A
    )
) else (
    echo ✗ .env no encontrado
    pause
    exit /b 1
)

echo.
echo ¿Qué deseas hacer?
echo.
echo   1) Crear migraciones (primera vez)
echo   2) Ver estado de migraciones
echo   3) Resetear BD (⚠️  ELIMINA TODOS LOS DATOS)
echo   4) Ver BD en Prisma Studio
echo   5) Salir
echo.
set /p choice="Selecciona una opción [1-5]: "

if "%choice%"=="1" (
    echo.
    echo ▶ Ejecutando: npm run migrate:dev
    echo.
    call npm run migrate:dev
    
    if %errorlevel% equ 0 (
        echo.
        echo ✓ Migraciones completadas
        echo.
        echo ℹ Próximos pasos:
        echo   • Ver BD: npm run prisma:studio
        echo   • Iniciar app: npm run dev:all
    ) else (
        echo.
        echo ✗ Error en migraciones
        pause
        exit /b 1
    )
)

if "%choice%"=="2" (
    echo.
    echo ▶ Verificando estado de migraciones...
    echo.
    call npx prisma migrate status
)

if "%choice%"=="3" (
    echo.
    echo ⚠️  ADVERTENCIA: Esto eliminará TODOS los datos
    set /p confirm="¿Estás seguro? (y/n): "
    
    if /i "%confirm%"=="y" (
        echo.
        echo ▶ Reseteando base de datos...
        call npx prisma migrate reset
        
        if %errorlevel% equ 0 (
            echo.
            echo ✓ Base de datos reseteada
        )
    ) else (
        echo ℹ Operación cancelada
    )
)

if "%choice%"=="4" (
    echo.
    echo ▶ Abriendo Prisma Studio...
    echo ℹ Se abrirá en http://localhost:5555
    echo.
    call npm run prisma:studio
)

if "%choice%"=="5" (
    echo.
    echo ℹ ¡Hasta luego!
    exit /b 0
)

echo.
pause
