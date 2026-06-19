'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-navy rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Cargando analítica...</p>
      </div>
    </div>
  );
}
