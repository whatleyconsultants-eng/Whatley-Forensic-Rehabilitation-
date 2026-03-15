import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find magic link
    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
    });

    if (!magicLink) {
      return NextResponse.json(
        { error: 'Invalid login link' },
        { status: 401 }
      );
    }

    // Check if expired
    if (magicLink.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Login link has expired. Please request a new one.' },
        { status: 401 }
      );
    }

    // Check if already used
    if (magicLink.used) {
      return NextResponse.json(
        { error: 'Login link has already been used' },
        { status: 401 }
      );
    }

    // Mark as used
    await prisma.magicLink.update({
      where: { token },
      data: { used: true },
    });

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: magicLink.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT token
    const authToken = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Create response with cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firmName: user.firmName,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify magic link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
