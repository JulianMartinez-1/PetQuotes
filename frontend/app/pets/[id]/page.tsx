'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Syringe,
  Pill,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

function toAmPm(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

const VACCINE_STATUS_CONFIG = {
  CURRENT: { label: 'Vigente', className: 'bg-success/15 border-success/40 text-success' },
  EXPIRED: { label: 'Vencida', className: 'bg-danger/15 border-danger/40 text-danger' },
  PENDING: { label: 'Pendiente', className: 'bg-warning/15 border-warning/40 text-warning' },
};

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 bg-border-light rounded w-36 mb-6" />
        <div className="bg-surface rounded-2xl border border-border/40 p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-border-light shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-border-light rounded w-48" />
              <div className="flex gap-6">
                <div className="h-4 bg-border-light rounded w-24" />
                <div className="h-4 bg-border-light rounded w-24" />
                <div className="h-4 bg-border-light rounded w-24" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border/40 overflow-hidden">
          <div className="flex border-b border-border/40">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-14 bg-border-light/40" />
            ))}
          </div>
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-border-light rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">{label}</p>
      <p className={cn('text-sm font-semibold', highlight ? 'text-primary-600' : 'text-text-primary')}>
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 border-2 border-primary-100 flex items-center justify-center mx-auto mb-4">
        <Icon size={28} className="text-primary-400" />
      </div>
      <p className="font-semibold text-text-primary mb-1">{title}</p>
      <p className="text-sm text-text-secondary mb-5 max-w-xs mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref as never}>
          <Button variant="outline" size="sm">
            {actionLabel}
            <ChevronRight size={14} />
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
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

  if (loading) return <SkeletonLoader />;

  if (!pet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center p-8 bg-surface rounded-2xl border border-border/40 shadow-sm max-w-sm w-full">
          <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={26} className="text-danger" />
          </div>
          <p className="font-semibold text-text-primary mb-1">Mascota no encontrada</p>
          <p className="text-sm text-text-secondary mb-5">
            {error || 'No pudimos cargar los datos de esta mascota.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => router.push('/pets')}>
            <ChevronLeft size={14} />
            Volver a mis mascotas
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'vaccinas' as const, label: 'Vacunas', count: vaccines.length, icon: Syringe },
    { id: 'medicamentos' as const, label: 'Medicamentos', count: medications.length, icon: Pill },
    { id: 'citas' as const, label: 'Citas', count: appointments.length, icon: CalendarDays },
  ];

  const speciesEmoji = pet.species === 'Perro' ? '🐕' : '🐈';
  const age =
    pet.dateOfBirth
      ? Math.floor(
          (Date.now() - new Date(pet.dateOfBirth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : null;

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/pets')}
          className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary mb-6 transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Mis mascotas
        </motion.button>

        {/* Pet Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-surface rounded-2xl border border-border/40 shadow-sm p-6 sm:p-8 mb-6"
        >
          <div className="flex items-start gap-5 sm:gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-4xl shadow-lg shrink-0 select-none">
              {speciesEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">{pet.name}</h1>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <InfoField label="Especie" value={pet.species} />
                {pet.breed && <InfoField label="Raza" value={pet.breed} />}
                {age !== null && (
                  <InfoField label="Edad" value={`${age} ${age === 1 ? 'año' : 'años'}`} />
                )}
                {pet.dateOfBirth && (
                  <InfoField
                    label="Nacimiento"
                    value={new Date(pet.dateOfBirth).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs + Content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="bg-surface rounded-2xl border border-border/40 shadow-sm overflow-hidden"
        >
          {/* Tab Bar */}
          <div className="flex border-b border-border/40">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-4 px-3 text-sm font-semibold transition-all',
                    isActive
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/60'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                  )}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full font-bold',
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-border-light text-text-muted'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">

              {/* ── Vacunas ── */}
              {activeTab === 'vaccinas' && (
                <motion.div
                  key="vaccinas"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-base font-bold text-text-primary mb-5 flex items-center gap-2">
                    <Syringe size={16} className="text-primary-500" />
                    Historial de vacunas
                  </h2>
                  {vaccines.length === 0 ? (
                    <EmptyState
                      icon={Syringe}
                      title="Sin vacunas registradas"
                      description="Las vacunas aplicadas por tu veterinaria aparecerán aquí"
                    />
                  ) : (
                    <div className="space-y-3">
                      {vaccines.map((vaccine) => {
                        const cfg =
                          VACCINE_STATUS_CONFIG[vaccine.status] ??
                          VACCINE_STATUS_CONFIG.PENDING;
                        return (
                          <div
                            key={vaccine.id}
                            className="rounded-xl border border-border/30 bg-background p-5"
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <h3 className="font-bold text-text-primary">{vaccine.name}</h3>
                              <Badge
                                className={cn(
                                  'text-xs font-semibold border px-2.5 py-1 whitespace-nowrap shrink-0',
                                  cfg.className
                                )}
                              >
                                {cfg.label}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <InfoField
                                label="Aplicada"
                                value={new Date(vaccine.dateAdministered).toLocaleDateString('es-ES')}
                              />
                              {vaccine.expiryDate && (
                                <InfoField
                                  label="Vencimiento"
                                  value={new Date(vaccine.expiryDate).toLocaleDateString('es-ES')}
                                />
                              )}
                              {vaccine.nextDueDate && (
                                <InfoField
                                  label="Próxima dosis"
                                  value={new Date(vaccine.nextDueDate).toLocaleDateString('es-ES')}
                                />
                              )}
                              {vaccine.veterinarian && (
                                <InfoField label="Veterinario" value={vaccine.veterinarian} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Medicamentos ── */}
              {activeTab === 'medicamentos' && (
                <motion.div
                  key="medicamentos"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-base font-bold text-text-primary mb-5 flex items-center gap-2">
                    <Pill size={16} className="text-primary-500" />
                    Medicamentos
                  </h2>
                  {medications.length === 0 ? (
                    <EmptyState
                      icon={Pill}
                      title="Sin medicamentos registrados"
                      description="Los medicamentos prescritos por tu veterinaria aparecerán aquí"
                    />
                  ) : (
                    <div className="space-y-3">
                      {medications.map((med) => (
                        <div
                          key={med.id}
                          className="rounded-xl border border-border/30 bg-background p-5"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-bold text-text-primary">{med.name}</h3>
                            <Badge
                              className={cn(
                                'text-xs font-semibold border px-2.5 py-1 whitespace-nowrap shrink-0',
                                med.isActive
                                  ? 'bg-secondary/10 border-secondary/30 text-secondary-700'
                                  : 'bg-border/30 border-border text-text-muted'
                              )}
                            >
                              {med.isActive ? 'Activo' : 'Completado'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <InfoField label="Dosis" value={med.dosage} />
                            <InfoField label="Frecuencia" value={med.frequency} />
                            {med.reason && <InfoField label="Razón" value={med.reason} />}
                            <InfoField
                              label="Inicio"
                              value={new Date(med.startDate).toLocaleDateString('es-ES')}
                            />
                            {med.daysRemaining !== undefined && med.daysRemaining > 0 && (
                              <InfoField
                                label="Días restantes"
                                value={`${med.daysRemaining} días`}
                                highlight
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Citas ── */}
              {activeTab === 'citas' && (
                <motion.div
                  key="citas"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-base font-bold text-text-primary mb-5 flex items-center gap-2">
                    <CalendarDays size={16} className="text-primary-500" />
                    Citas
                  </h2>
                  {appointments.length === 0 ? (
                    <EmptyState
                      icon={CalendarDays}
                      title="Sin citas registradas"
                      description="Las citas veterinarias de esta mascota aparecerán aquí"
                      actionLabel="Buscar clínica"
                      actionHref="/clinics"
                    />
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="rounded-xl border border-border/30 bg-background p-5"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-bold text-text-primary">{apt.type}</h3>
                            <Badge className="text-xs font-semibold border px-2.5 py-1 bg-mint/10 border-mint/30 text-mint-700 whitespace-nowrap shrink-0">
                              Agendada
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <InfoField
                              label="Fecha"
                              value={new Date(apt.date).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            />
                            {apt.time && <InfoField label="Hora" value={toAmPm(apt.time)} />}
                            {apt.veterinarian && (
                              <InfoField label="Veterinario" value={apt.veterinarian} />
                            )}
                            {apt.clinic && <InfoField label="Clínica" value={apt.clinic} />}
                          </div>
                          {apt.notes && (
                            <p className="mt-3 text-xs text-text-secondary bg-surface-light rounded-lg px-3 py-2 border border-border/20">
                              📝 {apt.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
