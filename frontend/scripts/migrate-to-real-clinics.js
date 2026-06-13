#!/usr/bin/env node

/**
 * Script de Utilidad para Limpiar Clínicas de Ejemplo
 * 
 * Uso:
 *   node frontend/scripts/migrate-to-real-clinics.js
 */

const fs = require('fs');
const path = require('path');

const CLINIC_CATALOG_PATH = path.join(__dirname, '../lib/clinic-catalog.ts');

console.log('🏥 Script de Migración a Clínicas Reales\n');
console.log('Este script prepara la aplicación para usar clínicas reales.\n');

// Leer el archivo actual
if (fs.existsSync(CLINIC_CATALOG_PATH)) {
  const content = fs.readFileSync(CLINIC_CATALOG_PATH, 'utf-8');
  
  // Contar clínicas actuales
  const clinicCount = (content.match(/id:/g) || []).length;
  console.log(`✓ Clínicas de ejemplo encontradas: ${clinicCount}`);
  
  // Mostrar ubicaciones
  const cities = content.match(/city: "([^"]+)"/g) || [];
  const uniqueCities = [...new Set(cities.map(c => c.match(/"([^"]+)"/)[1]))];
  console.log(`✓ Ciudades: ${uniqueCities.join(', ')}`);
  
  console.log('\n📝 Pasos siguientes para integrar clínicas reales:\n');
  
  console.log('1. Opción A: Reemplazar datos de ejemplo');
  console.log('   - Edita: frontend/lib/clinic-catalog.ts');
  console.log('   - Reemplaza las clínicas falsas con datos reales\n');
  
  console.log('2. Opción B: Usar API del Backend');
  console.log('   - Configura: NEXT_PUBLIC_API_URL en .env.local');
  console.log('   - Usa: fetchClinicsFromAPI() de frontend/lib/clinics-api.ts\n');
  
  console.log('3. Estructura requerida para cada clínica:');
  console.log(`
  {
    id: string;           // ID único
    name: string;         // Nombre de la clínica
    city: string;         // Ciudad (sin país)
    neighborhood: string; // Barrio
    services: string[];   // Servicios ofrecidos
    rating: number;       // Rating 0-5
    phone: string;        // Teléfono
    latitude: number;     // Latitud
    longitude: number;    // Longitud
    description: string;  // Descripción
    image: string;        // URL de imagen
  }
  `);
  
  console.log('📋 Documentación: Ver CLINICAS_REALES_INTEGRACION.md\n');
  console.log('✨ Listo para migración a clínicas reales!\n');
} else {
  console.error('❌ No se encontró: ' + CLINIC_CATALOG_PATH);
  process.exit(1);
}
