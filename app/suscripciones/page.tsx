'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface Suscripcion {
  id: string;
  clienteId: string;
  cuentaId: string;
  fechaInicio: string;
  fechaFin: string;
  precio: number;
  estado: string;
  renovacion: boolean;
  observaciones?: string;
  cliente: { id: string; nombre: string };
  cuenta: { id: string; plataforma: string };
  pagos: Array<{ id: string; monto: number }>;
}

interface Cliente {
  id: string;
  nombre: string;
}

interface Cuenta {
  id: string;
  plataforma: string;
}

export default function SuscripcionesPage() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSuscripcion, setEditingSuscripcion] = useState<Suscripcion | null>(null);
  const [formData, setFormData] = useState({
    clienteId: '',
    cuentaId: '',
    fechaInicio: '',
    fechaFin: '',
    precio: '',
    estado: 'activa',
    renovacion: true,
    observaciones: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [suscRes, clientesRes, cuentasRes] = await Promise.all([
        fetch('/api/suscripciones'),
        fetch('/api/clientes'),
        fetch('/api/cuentas'),
      ]);

      const [suscData, clientesData, cuentasData] = await Promise.all([
        suscRes.json(),
        clientesRes.json(),
        cuentasRes.json(),
      ]);

      setSuscripciones(suscData);
      setClientes(clientesData);
      setCuentas(cuentasData);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingSuscripcion
        ? `/api/suscripciones/${editingSuscripcion.id}`
        : '/api/suscripciones';
      const method = editingSuscripcion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio),
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          clienteId: '',
          cuentaId: '',
          fechaInicio: '',
          fechaFin: '',
          precio: '',
          estado: 'activa',
          renovacion: true,
          observaciones: '',
        });
        setEditingSuscripcion(null);
        loadData();
      }
    } catch (error) {
      console.error('Error al guardar suscripción:', error);
    }
  };

  const handleEdit = (suscripcion: Suscripcion) => {
    setEditingSuscripcion(suscripcion);
    setFormData({
      clienteId: suscripcion.clienteId,
      cuentaId: suscripcion.cuentaId,
      fechaInicio: format(new Date(suscripcion.fechaInicio), 'yyyy-MM-dd'),
      fechaFin: format(new Date(suscripcion.fechaFin), 'yyyy-MM-dd'),
      precio: suscripcion.precio.toString(),
      estado: suscripcion.estado,
      renovacion: suscripcion.renovacion,
      observaciones: suscripcion.observaciones || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta suscripción?')) return;

    try {
      const res = await fetch(`/api/suscripciones/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error al eliminar suscripción:', error);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'success' | 'danger' | 'warning'> = {
      activa: 'success',
      vencida: 'danger',
      cancelada: 'warning',
    };
    return variants[estado] || 'default';
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Suscripciones</h1>
        <Button
          onClick={() => {
            setEditingSuscripcion(null);
            const hoy = format(new Date(), 'yyyy-MM-dd');
            const unMesDespues = format(
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              'yyyy-MM-dd'
            );
            setFormData({
              clienteId: '',
              cuentaId: '',
              fechaInicio: hoy,
              fechaFin: unMesDespues,
              precio: '',
              estado: 'activa',
              renovacion: true,
              observaciones: '',
            });
            setShowModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Suscripción
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Plataforma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suscripciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No hay suscripciones registradas
                    </td>
                  </tr>
                ) : (
                  suscripciones.map((suscripcion) => {
                    const diasRestantes = differenceInDays(
                      new Date(suscripcion.fechaFin),
                      new Date()
                    );

                    return (
                      <tr key={suscripcion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {suscripcion.cliente.nombre}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {suscripcion.cuenta.plataforma}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {format(new Date(suscripcion.fechaFin), 'dd MMM yyyy', {
                              locale: es,
                            })}
                          </div>
                          {suscripcion.estado === 'activa' && diasRestantes >= 0 && (
                            <div className="text-xs text-gray-500">
                              {diasRestantes === 0
                                ? 'Vence hoy'
                                : `${diasRestantes} días restantes`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${suscripcion.precio.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getEstadoBadge(suscripcion.estado)}>
                            {suscripcion.estado}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(suscripcion)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(suscripcion.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-8">
            <h2 className="text-xl font-bold mb-4">
              {editingSuscripcion ? 'Editar Suscripción' : 'Nueva Suscripción'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.clienteId}
                  onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuenta *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.cuentaId}
                  onChange={(e) => setFormData({ ...formData, cuentaId: e.target.value })}
                  required
                >
                  <option value="">Selecciona una cuenta</option>
                  {cuentas.map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {cuenta.plataforma}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Fecha Inicio *"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaInicio: e.target.value })
                  }
                  required
                />
                <Input
                  label="Fecha Fin *"
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Precio *"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  required
                >
                  <option value="activa">Activa</option>
                  <option value="vencida">Vencida</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="renovacion"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.renovacion}
                  onChange={(e) =>
                    setFormData({ ...formData, renovacion: e.target.checked })
                  }
                />
                <label htmlFor="renovacion" className="ml-2 text-sm text-gray-700">
                  Renovación automática
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSuscripcion(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSuscripcion ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
