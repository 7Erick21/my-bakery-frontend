import { Resend } from 'resend';

/**
 * Send a Bizum order notification email to the admin.
 * Contains order details + direct link to the dashboard order page.
 */
export async function sendBizumAdminNotification(params: {
  orderRef: string;
  orderId: string;
  total: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmailRaw = process.env.ADMIN_EMAIL;
  if (!apiKey || !adminEmailRaw) return;

  // Support multiple emails separated by comma
  const adminEmails = adminEmailRaw
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);
  if (adminEmails.length === 0) return;

  const resend = new Resend(apiKey);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const dashboardLink = `${appUrl}/dashboard/orders/${params.orderId}`;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'My Bakery <pedidos@my-bakery.app>',
      to: adminEmails,
      subject: `Nuevo pedido Bizum #${params.orderRef} - ${params.total}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d97706;">Nuevo pedido con Bizum</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #fbbf24; color: #6b7280;">Pedido</td>
              <td style="padding: 8px; border-bottom: 1px solid #fbbf24; font-weight: bold;">#${params.orderRef}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #fbbf24; color: #6b7280;">Total</td>
              <td style="padding: 8px; border-bottom: 1px solid #fbbf24; font-weight: bold;">${params.total}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #fbbf24; color: #6b7280;">Cliente</td>
              <td style="padding: 8px; border-bottom: 1px solid #fbbf24;">${params.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #fbbf24; color: #6b7280;">Email</td>
              <td style="padding: 8px; border-bottom: 1px solid #fbbf24;">${params.customerEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #fbbf24; color: #6b7280;">Fecha</td>
              <td style="padding: 8px; border-bottom: 1px solid #fbbf24;">${params.createdAt}</td>
            </tr>
          </table>
          <p>El cliente debe enviar el pago por Bizum. Verifica la recepcion del pago y marca el pedido como pagado.</p>
          <a href="${dashboardLink}"
             style="display: inline-block; margin-top: 12px; padding: 10px 24px; background: #f59e0b; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Ver pedido en el dashboard
          </a>
          <hr style="border: none; border-top: 1px solid #fbbf24; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            Email generado automaticamente por My Bakery.
          </p>
        </div>
      `
    });
  } catch {
    // Non-blocking
  }
}
