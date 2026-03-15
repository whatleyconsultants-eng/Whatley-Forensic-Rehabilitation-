import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const lawyerEmail = formData.get('lawyerEmail') as string;
    const file = formData.get('file') as File;

    if (!lawyerEmail || !file) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: lawyerEmail.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: lawyerEmail.toLowerCase(),
        },
      });
    }

    // Save file to public directory (in production, use S3 or similar)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'contracts');
    const filename = `${uuidv4()}.pdf`;
    const filepath = join(uploadDir, filename);
    
    const documentUrl = `/uploads/contracts/${filename}`;

    // For development/testing, save to public folder
    try {
      await writeFile(filepath, buffer);
    } catch (error) {
      console.log('File system write not available, using mock URL');
    }

    // Create contract record
    const contract = await prisma.contract.create({
      data: {
        userId: user.id,
        documentUrl,
      },
    });

    return NextResponse.json({
      message: 'Contract uploaded successfully',
      contract,
    });
  } catch (error) {
    console.error('Upload contract error:', error);
    return NextResponse.json(
      { error: 'Failed to upload contract' },
      { status: 500 }
    );
  }
}
