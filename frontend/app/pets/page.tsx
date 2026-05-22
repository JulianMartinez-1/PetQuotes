'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  dateOfBirth?: string;
  photo?: string;
}

export default function PetsPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await fetch('/api/session/pets');
      if (!response.ok) throw new Error('Failed to fetch pets');
      const data = await response.json();
      setPets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching pets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-600 font-medium">Cargando mascotas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gesión de Mascotas</h1>
          <p className="text-gray-600">
            Administra la salud, vacunas y medicamentos de tus mascotas
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {pets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No tienes mascotas registradas
            </h2>
            <p className="text-gray-600 mb-8">
              Comienza agregando tu primera mascota para hacer seguimiento de su salud
            </p>
            <Link
              href="/register"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-lg transition"
            >
              Agregar Mascota
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <Link key={pet.id} href={`/pets/${pet.id}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer group">
                  {/* Pet Image */}
                  <div className="aspect-square bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                    {pet.species === 'Perro' ? '🐕' : '🐈'}
                  </div>

                  {/* Pet Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pet.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">Especie:</span> {pet.species}
                      </p>
                      {pet.breed && (
                        <p>
                          <span className="font-semibold">Raza:</span> {pet.breed}
                        </p>
                      )}
                      {pet.dateOfBirth && (
                        <p>
                          <span className="font-semibold">Naci:</span>{' '}
                          {new Date(pet.dateOfBirth).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/pets/${pet.id}`);
                      }}
                      className="mt-6 w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold py-2 px-4 rounded-lg transition"
                    >
                      Ver Detalles →
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
