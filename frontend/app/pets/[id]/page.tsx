'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  dateOfBirth?: string;
}

interface Vaccine {
  id: string;
  name: string;
  dateAdministered: string;
  expiryDate?: string;
  nextDueDate?: string;
  veterinarian?: string;
  clinic?: string;
  status: 'CURRENT' | 'EXPIRED' | 'PENDING';
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  reason?: string;
  startDate: string;
  endDate?: string;
  status: string;
  isActive: boolean;
  daysRemaining?: number;
}

interface Appointment {
  id: string;
  date: string;
  time?: string;
  type: string;
  veterinarian?: string;
  clinic?: string;
  notes?: string;
}

export default function PetDetailPage() {
  const params = useParams();
  const petId = params?.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vaccinas' | 'medicamentos' | 'citas'>('vaccinas');

  useEffect(() => {
    if (petId) {
      fetchPetData();
    }
  }, [petId]);

  const fetchPetData = async () => {
    try {
      setLoading(true);
      const [petRes, vaccinesRes, medicationsRes, appointmentsRes] = await Promise.all([
        fetch(`/api/session/pets/${petId}`),
        fetch(`/api/session/pets/${petId}/vaccines`),
        fetch(`/api/session/pets/${petId}/medications`),
        fetch(`/api/session/pets/${petId}/appointments`),
      ]);

      if (!petRes.ok) throw new Error('Failed to fetch pet');
      setPet(await petRes.json());

      if (vaccinesRes.ok) setVaccines(await vaccinesRes.json());
      if (medicationsRes.ok) setMedications(await medicationsRes.json());
      if (appointmentsRes.ok) setAppointments(await appointmentsRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-600 font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error || 'Mascota no encontrada'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pet Header Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start gap-8">
            <div className="text-7xl">{pet.species === 'Perro' ? '🐕' : '🐈'}</div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{pet.name}</h1>
              <div className="grid grid-cols-2 gap-4 text-gray-600">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Especie</p>
                  <p className="text-lg font-semibold text-gray-900">{pet.species}</p>
                </div>
                {pet.breed && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase">Raza</p>
                    <p className="text-lg font-semibold text-gray-900">{pet.breed}</p>
                  </div>
                )}
                {pet.dateOfBirth && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase">Nacimiento</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(pet.dateOfBirth).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {['vaccinas', 'medicamentos', 'citas'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`flex-1 py-4 px-6 font-semibold text-center uppercase text-sm transition ${
                    activeTab === tab
                      ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'vaccinas' && `💉 Vacunas (${vaccines.length})`}
                  {tab === 'medicamentos' && `💊 Medicamentos (${medications.length})`}
                  {tab === 'citas' && `📅 Citas (${appointments.length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* Vaccines Tab */}
            {activeTab === 'vaccinas' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial de Vacunas</h2>
                {vaccines.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No hay vacunas registradas</p>
                    <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2 rounded-lg transition">
                      Agregar Vacuna
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vaccines.map((vaccine) => (
                      <div
                        key={vaccine.id}
                        className={`p-4 rounded-lg border-2 ${
                          vaccine.status === 'CURRENT'
                            ? 'border-green-200 bg-green-50'
                            : vaccine.status === 'EXPIRED'
                            ? 'border-red-200 bg-red-50'
                            : 'border-amber-200 bg-amber-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{vaccine.name}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-semibold">Aplicada</p>
                                <p className="text-gray-900">
                                  {new Date(vaccine.dateAdministered).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                              {vaccine.expiryDate && (
                                <div>
                                  <p className="text-gray-500 font-semibold">Vencimiento</p>
                                  <p className="text-gray-900">
                                    {new Date(vaccine.expiryDate).toLocaleDateString('es-ES')}
                                  </p>
                                </div>
                              )}
                              {vaccine.nextDueDate && (
                                <div>
                                  <p className="text-gray-500 font-semibold">Próxima Dosis</p>
                                  <p className="text-gray-900">
                                    {new Date(vaccine.nextDueDate).toLocaleDateString('es-ES')}
                                  </p>
                                </div>
                              )}
                              {vaccine.veterinarian && (
                                <div>
                                  <p className="text-gray-500 font-semibold">Veterinario</p>
                                  <p className="text-gray-900">{vaccine.veterinarian}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <span
                              className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase ${
                                vaccine.status === 'CURRENT'
                                  ? 'bg-green-200 text-green-800'
                                  : vaccine.status === 'EXPIRED'
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-amber-200 text-amber-800'
                              }`}
                            >
                              {vaccine.status === 'CURRENT' && '✓ Vigente'}
                              {vaccine.status === 'EXPIRED' && '✗ Vencida'}
                              {vaccine.status === 'PENDING' && '⏱ Pendiente'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Medications Tab */}
            {activeTab === 'medicamentos' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Medicamentos</h2>
                {medications.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No hay medicamentos registrados</p>
                    <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2 rounded-lg transition">
                      Agregar Medicamento
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medications.map((med) => (
                      <div
                        key={med.id}
                        className={`p-4 rounded-lg border-2 ${
                          med.isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{med.name}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-semibold">Dosis</p>
                                <p className="text-gray-900">{med.dosage}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-semibold">Frecuencia</p>
                                <p className="text-gray-900">{med.frequency}</p>
                              </div>
                              {med.reason && (
                                <div>
                                  <p className="text-gray-500 font-semibold">Razón</p>
                                  <p className="text-gray-900">{med.reason}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-gray-500 font-semibold">Inicio</p>
                                <p className="text-gray-900">
                                  {new Date(med.startDate).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                              {med.daysRemaining !== undefined && med.daysRemaining > 0 && (
                                <div>
                                  <p className="text-gray-500 font-semibold">Dias Restantes</p>
                                  <p className="text-gray-900 font-bold">{med.daysRemaining}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <span
                              className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase ${
                                med.isActive
                                  ? 'bg-blue-200 text-blue-800'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              {med.isActive ? '💊 Activo' : '✓ Completado'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'citas' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Citas Proximales</h2>
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No hay citas registradas</p>
                    <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2 rounded-lg transition">
                      Agendar Cita
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-4 rounded-lg border-2 border-green-200 bg-green-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{apt.type}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                              <div>
                                <p className="text-gray-500 font-semibold">Fecha</p>
                                <p className="text-gray-900 font-semibold">
                                  {new Date(apt.date).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                              {apt.time && (
                                <div>
                                  <p className="text-gray-500 font-semibold">Hora</p>
                                  <p className="text-gray-900">{apt.time}</p>
                                </div>
                              )}
                              {apt.veterinarian && (
                                <div>
                                  <p className="text-gray-500 font-semibold">Veterinario</p>
                                  <p className="text-gray-900">{apt.veterinarian}</p>
                                </div>
                              )}
                              {apt.clinic && (
                                <div>
                                  <p className="text-gray-500 font-semibold">Clínica</p>
                                  <p className="text-gray-900">{apt.clinic}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className="inline-block px-4 py-2 rounded-full text-xs font-bold uppercase bg-green-200 text-green-800">
                              📅 Agendada
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
