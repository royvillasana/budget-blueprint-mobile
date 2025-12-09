#!/bin/bash

# Script para conectar a Supabase y ejecutar migraciones
# Uso: ./deploy.sh "postgresql://user:password@host:5432/postgres"

if [ -z "$1" ]; then
  echo "❌ Error: Necesitas proporcionar la connection string de Supabase"
  echo ""
  echo "Uso:"
  echo "  ./deploy.sh 'postgresql://user:password@host:5432/postgres'"
  echo ""
  echo "Para obtener tu connection string:"
  echo "  1. Ve a https://supabase.com/dashboard"
  echo "  2. Selecciona tu proyecto"
  echo "  3. Haz clic en 'Connect' (arriba a la derecha)"
  echo "  4. Copia la URI (PostgreSQL)"
  exit 1
fi

CONNECTION_STRING=$1

echo "📦 Iniciando deploy a Supabase..."
echo "🔌 Conectando a: $CONNECTION_STRING"

# Ejecutar las migraciones simplificadas primero
echo ""
echo "📝 Ejecutando migración simplificada..."
psql "$CONNECTION_STRING" < supabase/migrations/20251208_simplified_schema.sql

if [ $? -eq 0 ]; then
  echo "✅ Migración completada exitosamente"
else
  echo "❌ Error en la migración"
  exit 1
fi

echo ""
echo "✅ Deploy completado"
