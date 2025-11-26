import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/pagos - Obtener todos los pagos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const suscripcionId = searchParams.get('suscripcionId');

    const where = suscripcionId ? { suscripcionId } : {};

    const pagos = await prisma.pago.findMany({
      where,
      include: {
        suscripcion: {
          include: {
            cliente: true,
            cuenta: true,
          },
        },
      },
      orderBy: {
        fechaPago: 'desc',
      },
    });

    return NextResponse.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return NextResponse.json(
      { error: 'Error al obtener pagos' },
      { status: 500 }
    );
  }
}

// POST /api/pagos - Registrar un nuevo pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { suscripcionId, monto, fechaPago, metodoPago, comprobante, notas } = body;

    if (!suscripcionId || monto === undefined) {
      return NextResponse.json(
        { error: 'Suscripción y monto son requeridos' },
        { status: 400 }
      );
    }

    const pago = await prisma.pago.create({
      data: {
        suscripcionId,
        monto: parseFloat(monto),
        fechaPago: fechaPago ? new Date(fechaPago) : new Date(),
        metodoPago,
        comprobante,
        notas,
      },
      include: {
        suscripcion: {
          include: {
            cliente: true,
            cuenta: true,
          },
        },
      },
    });

    return NextResponse.json(pago, { status: 201 });
  } catch (error) {
    console.error('Error al crear pago:', error);
    return NextResponse.json(
      { error: 'Error al crear pago' },
      { status: 500 }
    );
  }
}
