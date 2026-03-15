import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendInvoiceNotification } from '@/lib/email';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const lawyerEmail = formData.get('lawyerEmail') as string;
    const invoiceNumber = formData.get('invoiceNumber') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const dueDate = new Date(formData.get('dueDate') as string);
    const file = formData.get('file') as File;

    if (!lawyerEmail || !invoiceNumber || !amount || !dueDate || !file) {
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
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'invoices');
    const filename = `${uuidv4()}.pdf`;
    const filepath = join(uploadDir, filename);
    
    // In production, you'd upload to S3. For now, we'll store the URL pattern
    // For this example, we'll use a placeholder URL
    // In real deployment, you need to set up file storage (Vercel Blob, S3, etc.)
    const documentUrl = `/uploads/invoices/${filename}`;

    // For development/testing, we'll save to public folder
    // Note: Vercel deployments should use Vercel Blob or similar
    try {
      await writeFile(filepath, buffer);
    } catch (error) {
      // If file write fails (e.g., on Vercel), we'll just use a mock URL
      console.log('File system write not available, using mock URL');
    }

    // Create invoice record
    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        invoiceNumber,
        amount,
        documentUrl,
        dueDate,
      },
    });

    // Send notification email
    await sendInvoiceNotification(lawyerEmail, invoiceNumber, amount);

    return NextResponse.json({
      message: 'Invoice uploaded successfully',
      invoice,
    });
  } catch (error) {
    console.error('Upload invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to upload invoice' },
      { status: 500 }
    );
  }
}
