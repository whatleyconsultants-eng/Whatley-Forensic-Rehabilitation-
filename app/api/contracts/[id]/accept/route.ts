import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find contract
    const contract = await prisma.contract.findFirst({
      where: {
        id: params.id,
        userId: userPayload.userId,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    if (contract.status === 'accepted') {
      return NextResponse.json(
        { error: 'Contract already accepted' },
        { status: 400 }
      );
    }

    // Get IP address for audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';

    // Update contract status
    const updatedContract = await prisma.contract.update({
      where: { id: params.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
        ipAddress: ipAddress.split(',')[0].trim(),
      },
    });

    return NextResponse.json({
      message: 'Contract accepted successfully',
      contract: updatedContract,
    });
  } catch (error) {
    console.error('Accept contract error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
