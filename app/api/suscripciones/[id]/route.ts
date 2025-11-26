import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/suscripciones/[id] - Obtener una suscripción específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const suscripcion = await prisma.suscripcion.findUnique({
      where: { id },
      include: {
        cliente: true,
        cuenta: true,
        pagos: {
          orderBy: {
            fechaPago: 'desc',
          },
        },
      },
    });

    if (!suscripcion) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(suscripcion);
  } catch (error) {
    console.error('Error al obtener suscripción:', error);
    return NextResponse.json(
      { error: 'Error al obtener suscripción' },
      { status: 500 }
    );
  }
}

// PUT /api/suscripciones/[id] - Actualizar una suscripción
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const suscripcion = await prisma.suscripcion.update({
      where: { id },
      data: {
        clienteId,
        cuentaId,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin) : undefined,
        precio: precio !== undefined ? parseFloat(precio) : undefined,
        estado,
        renovacion,
        observaciones,
      },
      include: {
        cliente: true,
        cuenta: true,
      },
    });

    return NextResponse.json(suscripcion);
  } catch (error) {
    console.error('Error al actualizar suscripción:', error);
    return NextResponse.json(
      { error: 'Error al actualizar suscripción' },
      { status: 500 }
    );
  }
}

// DELETE /api/suscripciones/[id] - Eliminar una suscripción
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.suscripcion.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Suscripción eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar suscripción:', error);
    return NextResponse.json(
      { error: 'Error al eliminar suscripción' },
      { status: 500 }
    );
  }
}
