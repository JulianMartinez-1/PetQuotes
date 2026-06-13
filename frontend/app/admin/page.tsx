'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Settings,
  BarChart3,
  Lock,
  Shield,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthGuard } from '@/components/auth/auth-guard';
import { DURATIONS } from '@/constants/animations';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'veterinarian' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Simulamos datos para demo
      setUsers([
        {
          id: '1',
          email: 'admin@clinic.com',
          name: 'Dr. Carlos Martínez',
          role: 'admin',
          status: 'active',
          createdAt: '2025-01-15',
        },
        {
          id: '2',
          email: 'vet@clinic.com',
          name: 'Dra. Laura García',
          role: 'veterinarian',
          status: 'active',
          createdAt: '2025-02-20',
        },
        {
          id: '3',
          email: 'user@example.com',
          name: 'Juan Pérez',
          role: 'user',
          status: 'active',
          createdAt: '2025-03-10',
        },
      ]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { bg: 'bg-red-100', text: 'text-red-700', label: 'Administrador' },
      veterinarian: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'Veterinario',
      },
      user: { bg: 'bg-green-100', text: 'text-green-700', label: 'Usuario' },
    };
    const config = roleConfig[role as keyof typeof roleConfig];
    return (
      <Badge className={`${config.bg} ${config.text}`}>{config.label}</Badge>
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-600 font-medium">Cargando panel administrativo...</p>
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
              Panel Administrativo
            </h1>
            <p className="text-gray-600">Administración de usuarios y configuración</p>
          </motion.div>

          {/* Admin Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Usuarios</p>
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
                    <p className="text-gray-600 text-sm font-medium">Administradores</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {users.filter((u) => u.role === 'admin').length}
                    </p>
                  </div>
                  <Shield className="w-12 h-12 text-red-500 opacity-20" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Veterinarios</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {users.filter((u) => u.role === 'veterinarian').length}
                    </p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Users Management */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Gestión de Usuarios
                </h2>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
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
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">Todos los roles</option>
                    <option value="admin">Administrador</option>
                    <option value="veterinarian">Veterinario</option>
                    <option value="user">Usuario</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Rol
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Estado
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-gray-900">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              user.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {user.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="p-2 hover:bg-blue-50 rounded text-blue-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          {/* Settings Section */}
          <motion.div variants={itemVariants} className="mt-8">
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Configuración del Sistema
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Lock className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Configuración de Seguridad
                      </p>
                      <p className="text-sm text-gray-600">Gestionar permisos y roles</p>
                    </div>
                  </div>
                  <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                    Configurar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Settings className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Configuración General</p>
                      <p className="text-sm text-gray-600">
                        Parámetros del sistema
                      </p>
                    </div>
                  </div>
                  <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                    Configurar
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </AuthGuard>
  );
}
