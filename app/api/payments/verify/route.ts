import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { retrievePaymentIntent } from '@/lib/stripe';
import { sendPaymentConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      );
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    const invoiceId = paymentIntent.metadata.invoiceId;

    // Find invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: userPayload.userId,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      // Check if payment already recorded
      const existingPayment = await prisma.payment.findFirst({
        where: { stripePaymentId: paymentIntentId },
      });

      if (!existingPayment) {
        // Record payment
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            stripePaymentId: paymentIntentId,
            amount: invoice.amount,
            status: 'succeeded',
          },
        });

        // Update invoice status
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'paid',
            paidAt: new Date(),
          },
        });

        // Send confirmation email
        await sendPaymentConfirmation(
          userPayload.email,
          invoice.invoiceNumber,
          invoice.amount
        );
      }

      return NextResponse.json({
        status: 'succeeded',
        message: 'Payment confirmed',
      });
    } else {
      return NextResponse.json({
        status: paymentIntent.status,
        error: 'Payment not completed',
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
