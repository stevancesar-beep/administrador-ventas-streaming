'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface Cuenta {
  id: string;
  plataforma: string;
  email: string;
  password: string;
  perfil?: string;
  maxPerfiles: number;
  suscripciones: Array<{
    id: string;
    estado: string;
  }>;
}

export default function CuentasPage() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState<Cuenta | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    plataforma: '',
    email: '',
    password: '',
    perfil: '',
    maxPerfiles: 1,
  });

  useEffect(() => {
    loadCuentas();
  }, []);

  const loadCuentas = async () => {
    try {
      const res = await fetch('/api/cuentas');
      const data = await res.json();
      setCuentas(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCuenta
        ? `/api/cuentas/${editingCuenta.id}`
        : '/api/cuentas';
      const method = editingCuenta ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ plataforma: '', email: '', password: '', perfil: '', maxPerfiles: 1 });
        setEditingCuenta(null);
        loadCuentas();
      }
    } catch (error) {
      console.error('Error al guardar cuenta:', error);
    }
  };

  const handleEdit = (cuenta: Cuenta) => {
    setEditingCuenta(cuenta);
    setFormData({
      plataforma: cuenta.plataforma,
      email: cuenta.email,
      password: cuenta.password,
      perfil: cuenta.perfil || '',
      maxPerfiles: cuenta.maxPerfiles,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta?')) return;

    try {
      const res = await fetch(`/api/cuentas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadCuentas();
      }
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
    }
  };

  const togglePassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cuentas de Streaming</h1>
        <Button
          onClick={() => {
            setEditingCuenta(null);
            setFormData({ plataforma: '', email: '', password: '', perfil: '', maxPerfiles: 1 });
            setShowModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cuenta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cuentas.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No hay cuentas registradas
          </div>
        ) : (
          cuentas.map((cuenta) => {
            const suscripcionesActivas = cuenta.suscripciones.filter(
              (s) => s.estado === 'activa'
            ).length;
            const espaciosDisponibles = cuenta.maxPerfiles - suscripcionesActivas;

            return (
              <Card key={cuenta.id}>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {cuenta.plataforma}
                      </h3>
                      <Badge
                        variant={espaciosDisponibles > 0 ? 'success' : 'warning'}
                      >
                        {espaciosDisponibles > 0
                          ? `${espaciosDisponibles} disponibles`
                          : 'Completa'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="text-gray-900 font-mono text-xs break-all">
                          {cuenta.email}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Contraseña:</span>
                          <button
                            onClick={() => togglePassword(cuenta.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {showPasswords[cuenta.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-gray-900 font-mono text-xs break-all">
                          {showPasswords[cuenta.id]
                            ? cuenta.password
                            : '••••••••'}
                        </p>
                      </div>

                      {cuenta.perfil && (
                        <div>
                          <span className="text-gray-500">Perfil:</span>
                          <p className="text-gray-900">{cuenta.perfil}</p>
                        </div>
                      )}

                      <div>
                        <span className="text-gray-500">Espacios:</span>
                        <p className="text-gray-900">
                          {suscripcionesActivas} / {cuenta.maxPerfiles} ocupados
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-3 border-t">
                      <button
                        onClick={() => handleEdit(cuenta)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cuenta.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCuenta ? 'Editar Cuenta' : 'Nueva Cuenta'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Plataforma *"
                value={formData.plataforma}
                onChange={(e) => setFormData({ ...formData, plataforma: e.target.value })}
                placeholder="Netflix, Spotify, Disney+..."
                required
              />
              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Contraseña *"
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Input
                label="Perfil"
                value={formData.perfil}
                onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                placeholder="Nombre del perfil (opcional)"
              />
              <Input
                label="Máximo de perfiles *"
                type="number"
                min="1"
                value={formData.maxPerfiles}
                onChange={(e) =>
                  setFormData({ ...formData, maxPerfiles: parseInt(e.target.value) })
                }
                required
              />
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCuenta(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCuenta ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
