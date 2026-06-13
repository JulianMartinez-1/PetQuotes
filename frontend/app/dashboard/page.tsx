'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Calendar,
  Users,
  PawPrint,
  TrendingUp,
  Clock,
  AlertCircle,
  MapPin,
  Star,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthGuard } from '@/components/auth/auth-guard';
import { DURATIONS } from '@/constants/animations';
import { CLINIC_CATALOG } from '@/lib/clinic-catalog';
import {
  getUserProfileSettings,
} from '@/lib/user-profile';
import { useAuthState } from '@/store/auth-state';

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalPets: number;
  totalUsers: number;
  appointmentsThisMonth: number;
}

const chartDataAppointments = [
  { month: 'Ene', appointments: 65 },
  { month: 'Feb', appointments: 78 },
  { month: 'Mar', appointments: 92 },
  { month: 'Abr', appointments: 85 },
  { month: 'May', appointments: 110 },
];

const chartDataServices = [
  { name: 'Consulta', value: 35 },
  { name: 'Vacunas', value: 25 },
  { name: 'Cirugía', value: 20 },
  { name: 'Dental', value: 20 },
];

const COLORS = ['#f59e0b', '#10b981', '#f87171', '#60a5fa'];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthState();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalPets: 0,
    totalUsers: 0,
    appointmentsThisMonth: 0,
  });
  const [userCity, setUserCity] = useState('Bogota');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    if (user) {
      const defaults = getUserProfileSettings(
        user.id,
        user.email.split("@")[0]
      );
      setUserCity(defaults.city);
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      // Aquí iría la llamada a la API
      setStats({
        totalAppointments: 342,
        pendingAppointments: 24,
        completedAppointments: 318,
        totalPets: 156,
        totalUsers: 89,
        appointmentsThisMonth: 45,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATIONS.base },
    },
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Bienvenido a tu panel de control</p>
          </motion.div>

          {/* Nearby Clinics Widget */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    💼 Veterinarias en {userCity}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Encuentra clínicas cercanas y especialistas
                  </p>
                </div>
                <Link href={`/clinics?city=${userCity}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Ver todas →
                  </motion.button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CLINIC_CATALOG.filter(clinic => clinic.city === userCity)
                  .slice(0, 3)
                  .map((clinic) => (
                    <motion.div
                      key={clinic.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm flex-1">
                          {clinic.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-semibold text-gray-700">
                            {clinic.rating}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                        <MapPin size={12} />
                        {clinic.neighborhood}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {clinic.services.slice(0, 2).map((service) => (
                          <Badge
                            key={service}
                            variant="secondary"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          {clinic.openNow ? (
                            <span className="text-green-600 font-semibold">✓ Abierto ahora</span>
                          ) : (
                            <span className="text-gray-500">Cerrado</span>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Citas Totales</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.totalAppointments}
                    </p>
                    <Badge className="mt-3 bg-green-100 text-green-700">
                      +12% este mes
                    </Badge>
                  </div>
                  <Calendar className="w-12 h-12 text-amber-500 opacity-20" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Citas Pendientes</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.pendingAppointments}
                    </p>
                    <Badge className="mt-3 bg-yellow-100 text-yellow-700">
                      Requieren atención
                    </Badge>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Mascotas Registradas</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.totalPets}
                    </p>
                    <Badge className="mt-3 bg-blue-100 text-blue-700">
                      +5 esta semana
                    </Badge>
                  </div>
                  <PawPrint className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Usuarios Activos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.totalUsers}
                    </p>
                    <Badge className="mt-3 bg-purple-100 text-purple-700">
                      +3 nuevos
                    </Badge>
                  </div>
                  <Users className="w-12 h-12 text-purple-500 opacity-20" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Completadas</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.completedAppointments}
                    </p>
                    <Badge className="mt-3 bg-green-100 text-green-700">
                      93% tasa éxito
                    </Badge>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Este Mes</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.appointmentsThisMonth}
                    </p>
                    <Badge className="mt-3 bg-orange-100 text-orange-700">
                      En progreso
                    </Badge>
                  </div>
                  <AlertCircle className="w-12 h-12 text-orange-500 opacity-20" />
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Charts */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Citas por Mes
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartDataAppointments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="appointments"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Distribución por Servicio
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartDataServices}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartDataServices.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Actividad Reciente
              </h2>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between pb-4 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        Cita completada: Vacunación de Max
                      </p>
                      <p className="text-sm text-gray-600">Hace 2 horas</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Completada</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </AuthGuard>
  );
}
