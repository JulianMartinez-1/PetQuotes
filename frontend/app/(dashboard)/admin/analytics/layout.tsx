'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/store/auth-state';

export default function AnalyticsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuthState();

  // Proteger acceso solo para ADMIN
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 mb-6">
            Solo administradores pueden acceder a este panel.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-navy text-white px-6 py-2 rounded-lg hover:bg-navy/90"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-navy">Panel de Analítica</h1>
          <p className="text-gray-600 mt-1">
            Métricas y análisis de la plataforma
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
