'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  Pill,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthGuard } from '@/components/auth/auth-guard';
import { DURATIONS } from '@/constants/animations';

interface MedicalRecord {
  id: string;
  petName: string;
  date: string;
  type: 'consultation' | 'vaccination' | 'surgery' | 'checkup';
  veterinarian: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  attachments: number;
}

export default function MedicalHistoryPage() {
  const router = useRouter();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      // Simulamos datos para demo
      setRecords([
        {
          id: '1',
          petName: 'Max',
          date: '2026-05-25',
          type: 'vaccination',
          veterinarian: 'Dra. Laura García',
          description: 'Vacunación anual contra la rabia',
          diagnosis: 'Mascota saludable',
          treatment: 'Vacuna antirrábica administrada',
          attachments: 2,
        },
        {
          id: '2',
          petName: 'Luna',
          date: '2026-05-20',
          type: 'consultation',
          veterinarian: 'Dr. Carlos Martínez',
          description: 'Revisión de otitis',
          diagnosis: 'Otitis leve',
          treatment: 'Antibióticos tópicos prescritos',
          attachments: 3,
        },
        {
          id: '3',
          petName: 'Buddy',
          date: '2026-05-15',
          type: 'checkup',
          veterinarian: 'Dra. Laura García',
          description: 'Chequeo general anual',
          diagnosis: 'Excelente estado de salud',
          treatment: 'Sin tratamiento requerido',
          attachments: 1,
        },
        {
          id: '4',
          petName: 'Max',
          date: '2026-04-10',
          type: 'surgery',
          veterinarian: 'Dr. Carlos Martínez',
          description: 'Extracción de diente dañado',
          diagnosis: 'Caries severa',
          treatment: 'Extracción dental exitosa',
          attachments: 4,
        },
      ]);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap = {
      consultation: <Activity className="w-5 h-5" />,
      vaccination: <Pill className="w-5 h-5" />,
      surgery: <AlertCircle className="w-5 h-5" />,
      checkup: <Activity className="w-5 h-5" />,
    };
    return iconMap[type as keyof typeof iconMap];
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      consultation: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Consulta' },
      vaccination: { bg: 'bg-green-100', text: 'text-green-700', label: 'Vacunación' },
      surgery: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cirugía' },
      checkup: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chequeo' },
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <Badge className={`${config.bg} ${config.text}`}>{config.label}</Badge>
    );
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.petName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-600 font-medium">
            Cargando historial médico...
          </p>
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
              Historial Clínico
            </h1>
            <p className="text-gray-600">Consulta el historial médico de tus mascotas</p>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Registros Médicos
                </h2>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Registro
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Buscar por mascota o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-600 w-5 h-5" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-full"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="consultation">Consulta</option>
                    <option value="vaccination">Vacunación</option>
                    <option value="surgery">Cirugía</option>
                    <option value="checkup">Chequeo</option>
                  </select>
                </div>
              </div>

              {/* Records Timeline */}
              <div className="space-y-4">
                {filteredRecords.map((record, index) => (
                  <motion.div
                    key={record.id}
                    variants={itemVariants}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-amber-100 rounded-lg text-amber-600 group-hover:bg-amber-200 transition-colors">
                          {getTypeIcon(record.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {record.petName}
                            </h3>
                            {getTypeBadge(record.type)}
                          </div>
                          <p className="text-gray-700 mb-2">{record.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {new Date(record.date).toLocaleDateString('es-ES')}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="w-4 h-4" />
                              {record.veterinarian}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <FileText className="w-4 h-4" />
                              {record.attachments} archivos
                            </div>
                          </div>
                          {record.diagnosis && (
                            <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-300">
                              <p className="text-sm font-medium text-blue-900">
                                Diagnóstico: {record.diagnosis}
                              </p>
                            </div>
                          )}
                          {record.treatment && (
                            <div className="mt-2 p-3 bg-green-50 rounded border-l-4 border-green-300">
                              <p className="text-sm font-medium text-green-900">
                                Tratamiento: {record.treatment}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button className="ml-4 bg-gray-100 hover:bg-gray-200 text-gray-700">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No se encontraron registros</p>
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </AuthGuard>
  );
}
