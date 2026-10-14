#!/bin/bash

# Script para ejecutar automáticamente toda la configuración

echo "🚀 WorkflowS - Setup Automático"
echo "================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Paso 1: Verificar si PostgreSQL está corriendo
print_step "Verificando PostgreSQL..."

if command -v psql &> /dev/null; then
    if psql -U postgres -d workflow_db -c "SELECT 1" &> /dev/null; then
        print_success "PostgreSQL está corriendo"
    else
        print_error "PostgreSQL no responde"
        echo "Intenta iniciar: brew services start postgresql (macOS) o sudo systemctl start postgresql (Linux)"
        exit 1
    fi
else
    print_error "PostgreSQL no está instalado"
    echo "Opción: Usa Docker: docker run -d --name postgres-workflows -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=workflow_db -p 5432:5432 postgres:latest"
    exit 1
fi

# Paso 2: Ejecutar migraciones
print_step "Ejecutando migraciones..."
npm run migrate:dev -- --name init > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_success "Migraciones ejecutadas"
else
    print_error "Error en migraciones"
    exit 1
fi

# Paso 3: Iniciar desarrollo
print_step "Iniciando Frontend y Backend..."
print_success "¡Listo! Abriendo navegador..."

echo ""
echo "📍 Accede a:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   Studio:   http://localhost:5555 (para ver BD)"
echo ""
echo "Presiona Ctrl+C para detener"
echo ""

npm run dev:all
