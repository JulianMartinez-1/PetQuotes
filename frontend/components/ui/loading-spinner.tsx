'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-12 h-12 border-4 border-border border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-text-secondary font-medium">Cargando analítica...</p>
      </div>
    </div>
  );
}
