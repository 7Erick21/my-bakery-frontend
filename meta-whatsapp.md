# Guia: Conectar WhatsApp Cloud API para notificaciones

## Que hace

Cuando un cliente hace un pedido con Bizum, te llega un WhatsApp automatico con:
- Numero de pedido
- Total a cobrar
- Nombre del cliente

Gratis hasta 1.000 mensajes/mes con la API de Meta.

---

## Paso 1: Crear Meta Business Portfolio

1. Ve a [business.facebook.com](https://business.facebook.com)
2. Inicia sesion con tu cuenta de Facebook
3. Click **"Crear cuenta"** (o "Create account")
4. Rellena:
   - Nombre del negocio: `My Bakery` (o el nombre real)
   - Tu nombre
   - Email de trabajo
5. Confirma el email que te envian

---

## Paso 2: Crear App en Meta Developers

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Inicia sesion con la misma cuenta de Facebook
3. Click **"My Apps"** > **"Create App"**
4. Selecciona **"Other"** > **"Next"**
5. Selecciona **"Business"** > **"Next"**
6. Rellena:
   - App name: `My Bakery Notifications`
   - Contact email: tu email
   - Business Portfolio: selecciona el que creaste en el Paso 1
7. Click **"Create App"**

---

## Paso 3: Activar WhatsApp en la App

1. En el panel de tu app, ve a **"Add Products"** (menu lateral)
2. Busca **"WhatsApp"** y click **"Set up"**
3. Selecciona tu Business Portfolio y continua

---

## Paso 4: Obtener el Phone Number ID

1. Ve a **WhatsApp** > **API Setup** (en el menu lateral)
2. En la seccion **"From"** veras un numero de telefono de test
3. Debajo del numero aparece el **Phone number ID** (es un numero largo, ej: `103456789012345`)
4. Copia ese ID

> Para produccion: puedes vincular tu numero real de WhatsApp Business.
> Ve a WhatsApp > Phone Numbers > Add Phone Number y sigue las instrucciones.

---

## Paso 5: Crear Token permanente

### Token temporal (para probar rapido):
1. En **WhatsApp** > **API Setup** veras un **"Temporary access token"**
2. Copialo, dura 24 horas

### Token permanente (para produccion):
1. Ve a [business.facebook.com](https://business.facebook.com)
2. **Business Settings** > **System Users** (menu lateral izquierdo)
3. Click **"Add"** para crear un System User:
   - Nombre: `whatsapp-notifications`
   - Rol: **Admin**
4. Click en el system user creado > **"Add Assets"**
5. Selecciona **Apps** > tu app `My Bakery Notifications` > activa **Full Control**
6. Click **"Generate New Token"**
7. Selecciona la app
8. Marca estos permisos:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
9. Click **"Generate Token"** y copia el token (empieza por `EAA...`)

---

## Paso 6: Crear el Message Template

1. Ve a [business.facebook.com](https://business.facebook.com)
2. **WhatsApp Manager** > **Account Tools** > **Message Templates**
3. Click **"Create Template"**
4. Configura:
   - **Category**: `Utility`
   - **Name**: `nuevo_pedido_bizum`
   - **Language**: `Spanish (es)`
5. En el **Body** escribe exactamente:
   ```
   Nuevo pedido Bizum #{{1}} por {{2}} de {{3}}. Verifica el pago y confirma el pedido.
   ```
   - `{{1}}` = referencia del pedido (ej: `A1B2C3D4`)
   - `{{2}}` = total (ej: `12,50 EUR`)
   - `{{3}}` = nombre del cliente
6. Añade **muestras** de los parametros para la revision:
   - `{{1}}`: `A1B2C3D4`
   - `{{2}}`: `12,50 EUR`
   - `{{3}}`: `Juan Garcia`
7. Click **"Submit"**
8. Espera la aprobacion (normalmente minutos, a veces horas)

---

## Paso 7: Añadir a tu numero de test como receptor

Antes de poder enviar mensajes, necesitas registrar tu numero:

1. En **WhatsApp** > **API Setup**
2. En la seccion **"To"**, click **"Manage phone number list"**
3. Añade tu numero personal de WhatsApp
4. Recibes un codigo por WhatsApp para verificar
5. Introduce el codigo

---

## Paso 8: Configurar variables de entorno

Edita el archivo `.env.local` y descomenta/rellena:

```env
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_ID=103456789012345
ADMIN_WHATSAPP_NUMBER=34612345678
```

- **WHATSAPP_TOKEN**: el token del Paso 5
- **WHATSAPP_PHONE_ID**: el Phone Number ID del Paso 4
- **ADMIN_WHATSAPP_NUMBER**: tu numero con codigo de pais, sin `+`, sin espacios
  - Ejemplo Espana: `34612345678`

Recuerda tambien añadir estas variables en **Vercel** > **Settings** > **Environment Variables** para produccion.

---

## Paso 9: Probar

1. Levanta el servidor local: `pnpm dev`
2. Haz un pedido de prueba seleccionando **Bizum** como metodo de pago
3. Deberia llegarte un WhatsApp con los datos del pedido

Si no llega:
- Verifica que el template `nuevo_pedido_bizum` esta **aprobado** (estado "Active")
- Verifica que tu numero esta en la lista de receptores (Paso 7)
- Comprueba los logs del servidor por si hay errores en la consola

---

## Costes

| Concepto | Coste |
|----------|-------|
| Primeros 1.000 mensajes utility/mes | Gratis |
| Mensajes adicionales (utility, Espana) | ~0.03 EUR/mensaje |

Para una panaderia con pedidos normales, el tier gratuito es mas que suficiente.

---

## Para produccion: numero real de WhatsApp Business

Si quieres usar tu numero real de negocio en vez del de test:

1. **WhatsApp** > **Phone Numbers** > **Add Phone Number**
2. Introduce tu numero de WhatsApp Business
3. Verificalo con el codigo SMS/llamada
4. Actualiza `WHATSAPP_PHONE_ID` con el nuevo ID

> Importante: un numero solo puede estar vinculado a WhatsApp Business App O a la API, no a ambos simultaneamente. Si usas WhatsApp Business App en tu movil con ese numero, tendras que desvincularlo primero.
