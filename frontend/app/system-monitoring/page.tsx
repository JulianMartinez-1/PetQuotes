'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Activity,
  Database,
  Server,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  HardDrive,
  Cpu,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth/auth-guard';
import { DURATIONS } from '@/constants/animations';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: string;
  requestsPerSecond: number;
  errorRate: number;
  responseTime: number;
  activeUsers: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  service: string;
  message: string;
}

const cpuData = [
  { time: '00:00', cpu: 35 },
  { time: '04:00', cpu: 42 },
  { time: '08:00', cpu: 58 },
  { time: '12:00', cpu: 65 },
  { time: '16:00', cpu: 48 },
  { time: '20:00', cpu: 52 },
  { time: '24:00', cpu: 38 },
];

const memoryData = [
  { time: '00:00', memory: 45 },
  { time: '04:00', memory: 52 },
  { time: '08:00', memory: 68 },
  { time: '12:00', memory: 75 },
  { time: '16:00', memory: 62 },
  { time: '20:00', memory: 58 },
  { time: '24:00', memory: 48 },
];

const requestsData = [
  { time: '00:00', requests: 120 },
  { time: '04:00', requests: 150 },
  { time: '08:00', requests: 280 },
  { time: '12:00', requests: 350 },
  { time: '16:00', requests: 290 },
  { time: '20:00', requests: 240 },
  { time: '24:00', requests: 180 },
];

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2026-05-29 14:30:45',
    level: 'success',
    service: 'API Backend',
    message: 'Backup de base de datos completado exitosamente',
  },
  {
    id: '2',
    timestamp: '2026-05-29 14:25:12',
    level: 'info',
    service: 'Frontend',
    message: 'Deploy v2.1.0 completado',
  },
  {
    id: '3',
    timestamp: '2026-05-29 14:15:33',
    level: 'warning',
    service: 'Database',
    message: 'Uso de memoria en 85%, considere optimizar',
  },
  {
    id: '4',
    timestamp: '2026-05-29 14:10:22',
    level: 'error',
    service: 'Cache Server',
    message: 'Conexión perdida con Redis, reconectando...',
  },
];

export default function SystemMonitoringPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 52,
    memoryUsage: 58,
    diskUsage: 42,
    uptime: '45 días, 8 horas',
    requestsPerSecond: 285,
    errorRate: 0.23,
    responseTime: 145,
    activeUsers: 156,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      // Simulamos datos que cambian
      setMetrics((prev) => ({
        ...prev,
        cpuUsage: Math.min(100, Math.max(20, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.min(
          100,
          Math.max(30, prev.memoryUsage + (Math.random() - 0.5) * 8)
        ),
        requestsPerSecond: Math.max(200, prev.requestsPerSecond + Math.random() * 100 - 50),
      }));
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricStatus = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      healthy: 'text-green-600 bg-green-50',
      warning: 'text-yellow-600 bg-yellow-50',
      critical: 'text-red-600 bg-red-50',
    };
    return colors[status as keyof typeof colors];
  };

  const getLevelIcon = (level: string) => {
    const icons = {
      success: <CheckCircle className="w-5 h-5 text-green-600" />,
      info: <Activity className="w-5 h-5 text-blue-600" />,
      warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
      error: <AlertTriangle className="w-5 h-5 text-red-600" />,
    };
    return icons[level as keyof typeof icons];
  };

  if (loading && Object.values(metrics).some((v) => v === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-600 font-medium">
            Cargando monitoreo del sistema...
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

  const cpuStatus = getMetricStatus(metrics.cpuUsage, {
    warning: 70,
    critical: 90,
  });
  const memoryStatus = getMetricStatus(metrics.memoryUsage, {
    warning: 75,
    critical: 90,
  });
  const diskStatus = getMetricStatus(metrics.diskUsage, {
    warning: 80,
    critical: 95,
  });

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
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Monitoreo del Sistema
              </h1>
              <p className="text-gray-600">Control en tiempo real de infraestructura</p>
            </div>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </motion.div>

          {/* Metrics Overview */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Card className={`p-6 ${getStatusColor(cpuStatus)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-2">CPU</p>
                    <p className="text-3xl font-bold">{metrics.cpuUsage.toFixed(1)}%</p>
                    <p className="text-sm mt-2 opacity-75">Uso actual</p>
                  </div>
                  <Cpu className="w-12 h-12 opacity-20" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className={`p-6 ${getStatusColor(memoryStatus)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-2">Memoria</p>
                    <p className="text-3xl font-bold">
                      {metrics.memoryUsage.toFixed(1)}%
                    </p>
                    <p className="text-sm mt-2 opacity-75">Uso actual</p>
                  </div>
                  <HardDrive className="w-12 h-12 opacity-20" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className={`p-6 ${getStatusColor(diskStatus)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-2">Disco</p>
                    <p className="text-3xl font-bold">{metrics.diskUsage.toFixed(1)}%</p>
                    <p className="text-sm mt-2 opacity-75">Uso total</p>
                  </div>
                  <Database className="w-12 h-12 opacity-20" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 font-medium mb-2">Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.uptime}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">99.9% disponible</p>
                  </div>
                  <Server className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Requests/Segundo
                  </h3>
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {metrics.requestsPerSecond.toFixed(0)}
                </p>
                <Badge className="mt-3 bg-blue-100 text-blue-700">
                  +5% hora anterior
                </Badge>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Tasa de Error</h3>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {metrics.errorRate.toFixed(2)}%
                </p>
                <Badge className="mt-3 bg-green-100 text-green-700">
                  Normal
                </Badge>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Tiempo Respuesta
                  </h3>
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {metrics.responseTime}ms
                </p>
                <Badge className="mt-3 bg-green-100 text-green-700">
                  Óptimo
                </Badge>
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
                  Uso de CPU (últimas 24h)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cpuData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      fill="#f59e0b"
                      stroke="#d97706"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Uso de Memoria (últimas 24h)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={memoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="memory"
                      fill="#10b981"
                      stroke="#059669"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Requests (últimas 24h)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={requestsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Usuarios Activos
                  </h2>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  {metrics.activeUsers}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(metrics.activeUsers / 200) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  {Math.round((metrics.activeUsers / 200) * 100)}% de capacidad
                </p>
              </Card>
            </motion.div>
          </motion.div>

          {/* System Logs */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Logs del Sistema
                </h2>
                <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>

              <div className="space-y-3">
                {mockLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {getLevelIcon(log.level)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {log.service}
                        </span>
                        <span className="text-xs text-gray-500">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-gray-600">{log.message}</p>
                    </div>
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
