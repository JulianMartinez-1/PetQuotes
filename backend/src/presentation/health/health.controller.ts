import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('health')
export class HealthController {
  /**
   * Health check endpoint
   * GET /health
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  health() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Diagnóstico de módulos
   * GET /health/diagnostics
   */
  @Get('diagnostics')
  @HttpCode(HttpStatus.OK)
  diagnostics() {
    return {
      status: 'diagnostics',
      modules: {
        clinics: {
          enabled: true,
          endpoints: [
            'GET /api/clinics/search?city=Bogota',
            'GET /api/clinics/search?city=Medellin',
            'GET /api/clinics/search?city=Cali',
            'GET /api/clinics/search-all',
          ],
        },
      },
      env: {
        GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✅ Configurada' : '❌ Falta',
        NODE_ENV: process.env.NODE_ENV,
        GATEWAY_PORT: process.env.GATEWAY_PORT || 3001,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

