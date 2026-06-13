'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  MoreVertical,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthGuard } from '@/components/auth/auth-guard';
import { DURATIONS } from '@/constants/animations';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  petsCount: number;
  totalAppointments: number;
  totalSpent: number;
  avatar?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Simulamos datos para demo
      setUsers([
        {
          id: '1',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '+34 655 123 456',
          address: 'Calle Principal 123, Madrid',
          joinDate: '2025-01-15',
          status: 'active',
          petsCount: 2,
          totalAppointments: 8,
          totalSpent: 450,
        },
        {
          id: '2',
          name: 'María García',
          email: 'maria@example.com',
          phone: '+34 654 987 321',
          address: 'Avenida del Parque 45, Barcelona',
          joinDate: '2025-02-20',
          status: 'active',
          petsCount: 1,
          totalAppointments: 3,
          totalSpent: 180,
        },
        {
          id: '3',
          name: 'Carlos López',
          email: 'carlos@example.com',
          phone: '+34 656 789 012',
          address: 'Plaza Mayor 78, Valencia',
          joinDate: '2025-03-10',
          status: 'active',
          petsCount: 3,
          totalAppointments: 12,
          totalSpent: 720,
        },
        {
          id: '4',
          name: 'Ana Rodríguez',
          email: 'ana@example.com',
          phone: '+34 657 456 789',
          address: 'Calle Menor 34, Sevilla',
          joinDate: '2025-04-05',
          status: 'inactive',
          petsCount: 1,
          totalAppointments: 2,
          totalSpent: 120,
        },
      ]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Activo' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactivo' },
      suspended: { bg: 'bg-red-100', text: 'text-red-700', label: 'Suspendido' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.bg} ${config.text}`}>{config.label}</Badge>
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-600 font-medium">Cargando usuarios...</p>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600">
              Administra todos los usuarios del sistema
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Usuarios
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {users.length}
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Activos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {users.filter((u) => u.status === 'active').length}
                    </p>
                  </div>
                  <Shield className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Gasto Total
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      €{users.reduce((sum, u) => sum + u.totalSpent, 0)}
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-orange-500 opacity-20" />
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Usuarios Registrados
                </h2>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-600 w-5 h-5" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 flex-1"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                    <option value="suspended">Suspendidos</option>
                  </select>
                </div>
              </div>

              {/* Grid View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    variants={itemVariants}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {user.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(user.status)}
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {user.address}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Se unió{' '}
                        {new Date(user.joinDate).toLocaleDateString('es-ES')}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">
                          {user.petsCount}
                        </p>
                        <p className="text-xs text-gray-600">Mascotas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">
                          {user.totalAppointments}
                        </p>
                        <p className="text-xs text-gray-600">Citas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">
                          €{user.totalSpent}
                        </p>
                        <p className="text-xs text-gray-600">Gastado</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button className="flex-1 bg-red-100 hover:bg-red-200 text-red-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No se encontraron usuarios</p>
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </AuthGuard>
  );
}
