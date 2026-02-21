import { Resend } from 'resend';

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Send an invoice email with PDF attachment.
 */
export async function sendInvoiceEmail(to: string, invoiceNumber: string, pdfBuffer: ArrayBuffer) {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'My Bakery <pedidos@my-bakery.app>',
    to,
    subject: `Factura ${invoiceNumber} - My Bakery`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">My Bakery</h2>
        <p>Hola,</p>
        <p>Adjuntamos la factura <strong>${invoiceNumber}</strong> correspondiente a tu pedido.</p>
        <p>Gracias por tu compra.</p>
        <hr style="border: none; border-top: 1px solid #fbbf24; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          Este email ha sido generado automaticamente. Si tienes alguna duda, contacta con nosotros.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,
        content: Buffer.from(pdfBuffer)
      }
    ]
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return data;
}
