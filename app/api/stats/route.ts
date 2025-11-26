import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener estadísticas generales
    const [
      totalClientes,
      totalCuentas,
      totalSuscripciones,
      suscripcionesActivas,
      suscripcionesVencidas,
    ] = await Promise.all([
      prisma.cliente.count(),
      prisma.cuenta.count(),
      prisma.suscripcion.count(),
      prisma.suscripcion.count({ where: { estado: 'activa' } }),
      prisma.suscripcion.count({ where: { estado: 'vencida' } }),
    ]);

    // Calcular ingresos del mes actual
    const fechaInicioMes = new Date();
    fechaInicioMes.setDate(1);
    fechaInicioMes.setHours(0, 0, 0, 0);

    const ingresosMes = await prisma.pago.aggregate({
      where: {
        fechaPago: {
          gte: fechaInicioMes,
        },
      },
      _sum: {
        monto: true,
      },
    });

    // Obtener suscripciones próximas a vencer (próximos 7 días)
    const hoy = new Date();
    const proximaSemana = new Date();
    proximaSemana.setDate(hoy.getDate() + 7);

    const suscripcionesPorVencer = await prisma.suscripcion.findMany({
      where: {
        estado: 'activa',
        fechaFin: {
          gte: hoy,
          lte: proximaSemana,
        },
      },
      include: {
        cliente: true,
        cuenta: true,
      },
      orderBy: {
        fechaFin: 'asc',
      },
      take: 10,
    });

    return NextResponse.json({
      totalClientes,
      totalCuentas,
      totalSuscripciones,
      suscripcionesActivas,
      suscripcionesVencidas,
      ingresosMes: ingresosMes._sum.monto || 0,
      suscripcionesPorVencer,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
