#!/bin/bash

# Script interactivo para ejecutar migraciones de forma fácil

echo ""
echo "╔════════════════════════════════════════╗"
echo "║    🗂️  WorkflowS - Migration Helper    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para imprimir
print_step() {
    echo -e "${YELLOW}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Paso 1: Verificar PostgreSQL
print_step "Verificando PostgreSQL..."

if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL no está instalado"
    echo ""
    print_info "Instala PostgreSQL desde: https://www.postgresql.org/download/"
    echo "O usa Docker:"
    echo ""
    echo "  docker run -d --name postgres-workflows \\"
    echo "    -e POSTGRES_USER=postgres \\"
    echo "    -e POSTGRES_PASSWORD=123456 \\"
    echo "    -e POSTGRES_DB=workflow_db \\"
    echo "    -p 5432:5432 \\"
    echo "    postgres:latest"
    echo ""
    exit 1
fi

# Intenta conectar
if psql -U postgres -d workflow_db -c "SELECT 1" &> /dev/null; then
    print_success "PostgreSQL conectado a workflow_db"
elif psql -U postgres -d postgres -c "SELECT 1" &> /dev/null; then
    print_success "PostgreSQL encontrado (necesita crear BD)"
    
    print_step "Creando base de datos workflow_db..."
    psql -U postgres -c "CREATE DATABASE workflow_db;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "Base de datos creada"
    else
        print_error "Error al crear BD (podría ya existir)"
    fi
else
    print_error "No se puede conectar a PostgreSQL"
    echo ""
    echo "Verifica:"
    echo "  1. PostgreSQL está corriendo"
    echo "  2. Usuario es 'postgres'"
    echo "  3. Password es correcta en .env"
    echo ""
    exit 1
fi

echo ""

# Paso 2: Mostrar información del .env
print_step "Verificando .env..."

if [ -f .env ]; then
    DATABASE_URL=$(grep DATABASE_URL .env | cut -d'=' -f2)
    print_success ".env encontrado"
    print_info "DATABASE_URL: $DATABASE_URL"
else
    print_error ".env no encontrado"
    exit 1
fi

echo ""

# Paso 3: Opción de migración
echo "¿Qué deseas hacer?"
echo ""
echo "  1) Crear migraciones (primera vez)"
echo "  2) Ver estado de migraciones"
echo "  3) Resetear BD (⚠️  ELIMINA TODOS LOS DATOS)"
echo "  4) Ver BD en Prisma Studio"
echo "  5) Salir"
echo ""
read -p "Selecciona una opción [1-5]: " choice

case $choice in
    1)
        echo ""
        print_step "Ejecutando: npm run migrate:dev"
        echo ""
        npm run migrate:dev
        
        if [ $? -eq 0 ]; then
            echo ""
            print_success "Migraciones completadas"
            echo ""
            print_info "Próximos pasos:"
            echo "  • Ver BD: npm run prisma:studio"
            echo "  • Iniciar app: npm run dev:all"
        else
            echo ""
            print_error "Error en migraciones"
            exit 1
        fi
        ;;
    2)
        echo ""
        print_step "Verificando estado de migraciones..."
        echo ""
        npx prisma migrate status
        ;;
    3)
        echo ""
        print_error "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos"
        read -p "¿Estás seguro? (y/n): " confirm
        
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            echo ""
            print_step "Reseteando base de datos..."
            npx prisma migrate reset
            
            if [ $? -eq 0 ]; then
                echo ""
                print_success "Base de datos reseteada"
            fi
        else
            print_info "Operación cancelada"
        fi
        ;;
    4)
        echo ""
        print_step "Abriendo Prisma Studio..."
        print_info "Se abrirá en http://localhost:5555"
        echo ""
        npm run prisma:studio
        ;;
    5)
        echo ""
        print_info "¡Hasta luego!"
        exit 0
        ;;
    *)
        print_error "Opción no válida"
        exit 1
        ;;
esac

echo ""
