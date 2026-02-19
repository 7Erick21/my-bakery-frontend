/**
 * Send a WhatsApp message via Meta's WhatsApp Cloud API.
 * Requires: WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, ADMIN_WHATSAPP_NUMBER env vars.
 *
 * Uses a pre-approved template for order notifications.
 * Falls back silently if not configured.
 */
export async function sendWhatsAppNotification(params: {
  orderRef: string;
  total: string;
  customerName: string;
}) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

  if (!token || !phoneId || !adminNumber) {
    return;
  }

  try {
    await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: adminNumber,
        type: 'template',
        template: {
          name: 'nuevo_pedido_bizum',
          language: { code: 'es' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: params.orderRef },
                { type: 'text', text: params.total },
                { type: 'text', text: params.customerName }
              ]
            }
          ]
        }
      })
    });
  } catch {
    // Non-blocking: WhatsApp notification failure shouldn't block order creation
  }
}
