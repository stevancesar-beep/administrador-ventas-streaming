import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/suscripciones - Obtener todas las suscripciones
export async function GET() {
  try {
    const suscripciones = await prisma.suscripcion.findMany({
      include: {
        cliente: true,
        cuenta: true,
        pagos: true,
      },
      orderBy: {
        fechaFin: 'asc',
      },
    });

    return NextResponse.json(suscripciones);
  } catch (error) {
    console.error('Error al obtener suscripciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener suscripciones' },
      { status: 500 }
    );
  }
}

// POST /api/suscripciones - Crear una nueva suscripción
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clienteId,
      cuentaId,
      fechaInicio,
      fechaFin,
      precio,
      estado,
      renovacion,
      observaciones,
    } = body;

    if (!clienteId || !cuentaId || !fechaFin || precio === undefined) {
      return NextResponse.json(
        { error: 'Cliente, cuenta, fecha fin y precio son requeridos' },
        { status: 400 }
      );
    }

    const suscripcion = await prisma.suscripcion.create({
      data: {
        clienteId,
        cuentaId,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
        fechaFin: new Date(fechaFin),
        precio: parseFloat(precio),
        estado: estado || 'activa',
        renovacion: renovacion !== undefined ? renovacion : true,
        observaciones,
      },
      include: {
        cliente: true,
        cuenta: true,
      },
    });

    return NextResponse.json(suscripcion, { status: 201 });
  } catch (error) {
    console.error('Error al crear suscripción:', error);
    return NextResponse.json(
      { error: 'Error al crear suscripción' },
      { status: 500 }
    );
  }
}
