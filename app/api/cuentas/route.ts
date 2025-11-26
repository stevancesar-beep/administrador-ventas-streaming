import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/cuentas - Obtener todas las cuentas
export async function GET() {
  try {
    const cuentas = await prisma.cuenta.findMany({
      include: {
        suscripciones: {
          include: {
            cliente: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(cuentas);
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    return NextResponse.json(
      { error: 'Error al obtener cuentas' },
      { status: 500 }
    );
  }
}

// POST /api/cuentas - Crear una nueva cuenta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plataforma, email, password, perfil, maxPerfiles } = body;

    if (!plataforma || !email || !password) {
      return NextResponse.json(
        { error: 'Plataforma, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const cuenta = await prisma.cuenta.create({
      data: {
        plataforma,
        email,
        password,
        perfil,
        maxPerfiles: maxPerfiles || 1,
      },
    });

    return NextResponse.json(cuenta, { status: 201 });
  } catch (error) {
    console.error('Error al crear cuenta:', error);
    return NextResponse.json(
      { error: 'Error al crear cuenta' },
      { status: 500 }
    );
  }
}
