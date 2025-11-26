import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clientes - Obtener todos los clientes
export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        suscripciones: {
          include: {
            cuenta: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    );
  }
}

// POST /api/clientes - Crear un nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, notas } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        email,
        telefono,
        notas,
      },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    );
  }
}
