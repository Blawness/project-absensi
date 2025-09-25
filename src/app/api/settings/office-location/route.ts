import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get office location setting
    const setting = await prisma.setting.findUnique({
      where: { key: 'office_location' },
    });

    if (!setting) {
      // Return default location if setting not found
      return NextResponse.json({
        success: true,
        data: {
          center: {
            latitude: -6.2088,
            longitude: 106.8456,
          },
          radius: 100,
          tolerance: 10,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: setting.value,
    });

  } catch (error) {
    console.error('Error fetching office location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
