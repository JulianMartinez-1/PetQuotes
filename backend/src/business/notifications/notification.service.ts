import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface AppointmentConfirmationData {
  to: string;
  clientName: string;
  clinicName: string;
  petName: string;
  service: string;
  startTime: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private resend: Resend | null = null;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY not configured — email notifications disabled');
    }
  }

  async sendAppointmentConfirmation(data: AppointmentConfirmationData): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`Skipping email to ${data.to}: RESEND_API_KEY not set`);
      return;
    }

    const from = this.config.get<string>('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev';

    const dateStr = data.startTime.toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      timeZone: 'America/Bogota',
    });
    const timeStr = data.startTime.toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit',
      hour12: true,
      timeZone: 'America/Bogota',
    });

    const isDev = this.config.get<string>('NODE_ENV') !== 'production';
    const recipient = isDev
      ? (this.config.get<string>('RESEND_FROM_EMAIL') ?? data.to)
      : data.to;
    const subject = isDev
      ? `[DEV → ${data.to}] ✅ Cita confirmada — ${data.clinicName}`
      : `✅ Cita confirmada — ${data.clinicName}`;

    try {
      const { error } = await this.resend.emails.send({
        from: `PetQuotes <${from}>`,
        to: recipient,
        subject,
        html: this.buildHtml({ ...data, dateStr, timeStr }),
      });

      if (error) {
        this.logger.error(`Resend error for ${recipient}: ${error.message}`);
      } else {
        this.logger.log(`Confirmation email sent to ${recipient}${isDev ? ` (dev redirect from ${data.to})` : ''}`);
      }
    } catch (err) {
      this.logger.error(`Failed to send confirmation email to ${data.to}`, err);
    }
  }

  private buildHtml(data: {
    clientName: string;
    clinicName: string;
    petName: string;
    service: string;
    dateStr: string;
    timeStr: string;
  }): string {
    const row = (label: string, value: string, last = false) => `
      <tr>
        <td style="padding:18px 24px;${last ? '' : 'border-bottom:1px solid #e2e8f0;'}">
          <p style="margin:0 0 3px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">${label}</p>
          <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${value}</p>
        </td>
      </tr>`;

    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:36px 40px;text-align:center;">
            <div style="font-size:36px;margin-bottom:12px;">🐾</div>
            <h1 style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">¡Tu cita está confirmada!</h1>
            <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;">PetQuotes · Reservas Veterinarias</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 24px;">
            <p style="margin:0 0 6px;color:#334155;font-size:15px;">Hola <strong>${data.clientName}</strong>,</p>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">La cita para <strong>${data.petName}</strong> ha sido revisada y confirmada por la clínica. Aquí están todos los detalles:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
              ${row('Clínica', data.clinicName)}
              ${row('Servicio', data.service)}
              ${row('Mascota', data.petName)}
              ${row('Fecha', data.dateStr)}
              ${row('Hora (Colombia)', data.timeStr, true)}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;">
            <p style="margin:0 0 6px;color:#64748b;font-size:13px;line-height:1.6;">Si tienes alguna pregunta, contacta directamente a la clínica.</p>
            <p style="margin:0;color:#64748b;font-size:13px;">¡Hasta pronto! 🐶🐱</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">PetQuotes · Plataforma de reservas veterinarias</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }
}
