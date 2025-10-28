#!/bin/bash
# Script para aplicar migration no Supabase

echo "🔧 Aplicando migration no Supabase..."

# Executa o SQL diretamente (você precisará configurar credenciais)
supabase db remote execute < APPLY_MIGRATION.sql

echo "✅ Migration aplicada!"

