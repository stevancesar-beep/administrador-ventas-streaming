import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/cuentas/[id] - Obtener una cuenta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cuenta = await prisma.cuenta.findUnique({
      where: { id: params.id },
      include: {
        suscripciones: {
          include: {
            cliente: true,
          },
        },
      },
    });

    if (!cuenta) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(cuenta);
  } catch (error) {
    console.error('Error al obtener cuenta:', error);
    return NextResponse.json(
      { error: 'Error al obtener cuenta' },
      { status: 500 }
    );
  }
}

// PUT /api/cuentas/[id] - Actualizar una cuenta
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { plataforma, email, password, perfil, maxPerfiles } = body;

    const cuenta = await prisma.cuenta.update({
      where: { id: params.id },
      data: {
        plataforma,
        email,
        password,
        perfil,
        maxPerfiles,
      },
    });

    return NextResponse.json(cuenta);
  } catch (error) {
    console.error('Error al actualizar cuenta:', error);
    return NextResponse.json(
      { error: 'Error al actualizar cuenta' },
      { status: 500 }
    );
  }
}

// DELETE /api/cuentas/[id] - Eliminar una cuenta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.cuenta.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return NextResponse.json(
      { error: 'Error al eliminar cuenta' },
      { status: 500 }
    );
  }
}
