# Configurar Cron Jobs (cron-job.org)

Guia paso a paso para evitar que Supabase Free pause el proyecto por inactividad.

---

## Por que es necesario

Supabase Free pausa automaticamente los proyectos tras **7 dias sin actividad**. Esto tumbaria la web de pedidos. Configurando estos cron jobs, el proyecto se mantiene activo indefinidamente.

---

## Paso 1: Crear cuenta en cron-job.org

1. Ve a [https://cron-job.org](https://cron-job.org)
2. Click en **Sign Up** (esquina superior derecha)
3. Registrate con email y contrasena
4. Confirma tu email

> El plan gratuito permite hasta 4 cron jobs — solo necesitamos 2.

---

## Paso 2: Crear cron job "Keepalive"

Este job hace un ping simple a la base de datos para mantener el proyecto activo.

1. En el dashboard, click **Create Cronjob**
2. Rellena los campos:

| Campo | Valor |
|-------|-------|
| **Title** | `Bakery Keepalive` |
| **URL** | `https://jvajkjedeoieqvcdpgwj.supabase.co/functions/v1/keepalive` |
| **Execution schedule** | Every **5 days** (o selecciona dias especificos: lunes y jueves) |
| **Request method** | `GET` |
| **Enabled** | Si |

3. En la seccion **Advanced**:
   - No se necesitan headers
   - Timeout: dejar por defecto (30s)
   - Notifications: activar "On failure" si quieres recibir alertas

4. Click **Create**

### Verificar que funciona

Copia la URL en el navegador:
```
https://jvajkjedeoieqvcdpgwj.supabase.co/functions/v1/keepalive
```

Deberia devolver:
```json
{"ok": true, "timestamp": "2026-02-19T..."}
```

---

## Paso 3: Crear cron job "Cleanup"

Este job limpia datos antiguos de la base de datos semanalmente.

1. En el dashboard, click **Create Cronjob**
2. Rellena los campos:

| Campo | Valor |
|-------|-------|
| **Title** | `Bakery Cleanup` |
| **URL** | `https://jvajkjedeoieqvcdpgwj.supabase.co/functions/v1/cleanup` |
| **Execution schedule** | Every **Sunday** at 04:00 (horario de baja actividad) |
| **Request method** | `POST` |
| **Enabled** | Si |

3. En la seccion **Advanced** > **Headers**, añadir:

| Header | Valor |
|--------|-------|
| `Authorization` | `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YWpramVkZW9pZXF2Y2RwZ3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTgyOTUsImV4cCI6MjA4NjA5NDI5NX0.oJ8s8NwlBBuCM2xTWNvgKRRN4f_Zb_E7ZZs_0lCw1iA` |
| `Content-Type` | `application/json` |

4. Click **Create**

### Que limpia este job

| Tabla | Condicion | Retencion |
|-------|-----------|-----------|
| `audit_log` | Todos los registros | 6 meses |
| `notifications` | Solo las leidas (`is_read = true`) | 30 dias |
| `inventory_movements` | Todos los registros | 1 ano |

---

## Paso 4: Verificar en el dashboard

1. Tras crear ambos cron jobs, veras algo asi en tu dashboard:

```
Bakery Keepalive    GET   Every 5 days     Enabled
Bakery Cleanup      POST  Every Sunday     Enabled
```

2. Puedes forzar una ejecucion manual haciendo click en **Run Now** para comprobar que funcionan
3. En el historial de ejecuciones, deberia mostrar **Status 200**

---

## Resumen

| Cron Job | Metodo | Frecuencia | Auth | Proposito |
|----------|--------|------------|------|-----------|
| Keepalive | `GET` | Cada 5 dias | No | Evitar auto-pausa |
| Cleanup | `POST` | Domingos 04:00 | Si (Bearer token) | Limpiar datos antiguos |

---

## Troubleshooting

### El keepalive devuelve error
- Verifica que el proyecto no este ya pausado en [app.supabase.com](https://app.supabase.com)
- Si esta pausado, reactivalo manualmente desde el dashboard de Supabase

### El cleanup devuelve 401 Unauthorized
- Revisa que el header `Authorization` tenga el prefijo `Bearer ` (con espacio)
- Verifica que la anon key no haya sido rotada en Supabase

### El cleanup devuelve 405 Method Not Allowed
- Asegurate de que el metodo sea `POST`, no `GET`
