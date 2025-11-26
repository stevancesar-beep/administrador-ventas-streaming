'use client';

import { useEffect, useState } from 'react';
import { Users, Tv, CreditCard, DollarSign, AlertCircle } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface Stats {
  totalClientes: number;
  totalCuentas: number;
  suscripcionesActivas: number;
  ingresosMes: number;
  suscripcionesPorVencer: Array<{
    id: string;
    fechaFin: string;
    precio: number;
    cliente: { nombre: string };
    cuenta: { plataforma: string };
  }>;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar estadísticas:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">Error al cargar datos</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Clientes"
          value={stats.totalClientes}
          icon={Users}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Cuentas Disponibles"
          value={stats.totalCuentas}
          icon={Tv}
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Suscripciones Activas"
          value={stats.suscripcionesActivas}
          icon={CreditCard}
          iconColor="text-green-600"
        />
        <StatsCard
          title="Ingresos del Mes"
          value={`$${stats.ingresosMes.toFixed(2)}`}
          icon={DollarSign}
          iconColor="text-emerald-600"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <CardTitle>Suscripciones Próximas a Vencer</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {stats.suscripcionesPorVencer.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay suscripciones próximas a vencer
            </p>
          ) : (
            <div className="space-y-3">
              {stats.suscripcionesPorVencer.map((suscripcion) => {
                const diasRestantes = differenceInDays(
                  new Date(suscripcion.fechaFin),
                  new Date()
                );
                const esUrgente = diasRestantes <= 3;

                return (
                  <div
                    key={suscripcion.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {suscripcion.cliente.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        {suscripcion.cuenta.plataforma}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={esUrgente ? 'danger' : 'warning'}>
                        {diasRestantes === 0
                          ? 'Vence hoy'
                          : diasRestantes === 1
                          ? 'Vence mañana'
                          : `${diasRestantes} días`}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(suscripcion.fechaFin), 'dd MMM yyyy', {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
