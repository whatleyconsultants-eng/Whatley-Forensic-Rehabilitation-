import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendMagicLink(email: string, token: string) {
  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your Login Link - Life Care Planning Portal',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background-color: #0284c7; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to Life Care Planning Portal</h2>
            <p>Click the button below to securely log in to your account:</p>
            <a href="${magicLink}" class="button">Log In to Portal</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0284c7;">${magicLink}</p>
            <p><strong>This link will expire in 15 minutes.</strong></p>
            <div class="footer">
              <p>If you didn't request this login link, you can safely ignore this email.</p>
              <p>For security reasons, please do not forward this email to anyone.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to Life Care Planning Portal\n\nClick this link to log in: ${magicLink}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this login link, you can safely ignore this email.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendInvoiceNotification(email: string, invoiceNumber: string, amount: number) {
  const portalLink = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `New Invoice ${invoiceNumber} - Life Care Planning`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .invoice-box { 
              background-color: #f8f9fa; 
              border-left: 4px solid #0284c7; 
              padding: 15px; 
              margin: 20px 0; 
            }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background-color: #0284c7; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Invoice Available</h2>
            <p>You have received a new invoice from Life Care Planning.</p>
            <div class="invoice-box">
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            </div>
            <p>Log in to the portal to view your invoice and make a payment:</p>
            <a href="${portalLink}" class="button">View Invoice</a>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending invoice notification:', error);
    return { success: false, error };
  }
}

export async function sendPaymentConfirmation(email: string, invoiceNumber: string, amount: number) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Payment Confirmation - Invoice ${invoiceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .success-box { 
              background-color: #d4edda; 
              border-left: 4px solid #28a745; 
              padding: 15px; 
              margin: 20px 0; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Payment Received</h2>
            <div class="success-box">
              <p>✓ Your payment has been successfully processed.</p>
            </div>
            <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p><strong>Amount Paid:</strong> $${amount.toFixed(2)}</p>
            <p>Thank you for your payment. A receipt has been sent to this email address.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    // Also notify admin
    if (process.env.ADMIN_EMAIL) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: `Payment Received - ${invoiceNumber}`,
        html: `<p>Payment received for invoice ${invoiceNumber}: $${amount.toFixed(2)}</p><p>Client: ${email}</p>`,
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
    return { success: false, error };
  }
}
