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

export interface VeterinaryApprovalRequestData {
  to: string;
  adminName: string;
  applicantName: string;
  applicantEmail: string;
  veterinaryType: 'CLINIC' | 'INDEPENDENT';
  clinicName?: string;
  serviceArea?: string;
}

export interface VeterinaryRejectionData {
  to: string;
  applicantName: string;
  veterinaryType: 'CLINIC' | 'INDEPENDENT';
  clinicName?: string;
  reason: string;
}

export interface VeterinaryApprovalData {
  to: string;
  applicantName: string;
  veterinaryType: 'CLINIC' | 'INDEPENDENT';
  clinicName?: string;
  loginUrl: string;
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

  private get from(): string {
    return this.config.get<string>('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev';
  }

  private get isDev(): boolean {
    return this.config.get<string>('NODE_ENV') !== 'production';
  }

  private devRecipient(realTo: string): { to: string; subjectPrefix: string } {
    const redirect = this.config.get<string>('RESEND_DEV_REDIRECT_EMAIL');
    return this.isDev && redirect
      ? { to: redirect, subjectPrefix: `[DEV → ${realTo}] ` }
      : { to: realTo, subjectPrefix: '' };
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`Skipping email to ${to}: RESEND_API_KEY not set`);
      return;
    }
    const { to: recipient, subjectPrefix } = this.devRecipient(to);
    try {
      const { error } = await this.resend.emails.send({
        from: `PetQuotes <${this.from}>`,
        to: recipient,
        subject: `${subjectPrefix}${subject}`,
        html,
      });
      if (error) {
        this.logger.error(`Resend error for ${recipient}: ${error.message}`);
      } else {
        this.logger.log(`Email sent to ${recipient}`);
      }
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err);
    }
  }

  async sendAppointmentConfirmation(data: AppointmentConfirmationData): Promise<void> {
    const dateStr = data.startTime.toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      timeZone: 'America/Bogota',
    });
    const timeStr = data.startTime.toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'America/Bogota',
    });
    await this.send(
      data.to,
      `✅ Cita confirmada — ${data.clinicName}`,
      this.buildAppointmentHtml({ ...data, dateStr, timeStr }),
    );
  }

  async sendVeterinaryApprovalRequest(data: VeterinaryApprovalRequestData): Promise<void> {
    const typeLabel = data.veterinaryType === 'CLINIC' ? 'Veterinaria (clínica)' : 'Veterinario independiente';
    const entityLabel = data.veterinaryType === 'CLINIC'
      ? (data.clinicName ?? 'Sin nombre')
      : (data.serviceArea ?? 'Zona no especificada');

    await this.send(
      data.to,
      `🐾 Nueva solicitud: ${typeLabel} — ${data.applicantName}`,
      `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:36px 40px;text-align:center;">
            <div style="font-size:36px;margin-bottom:12px;">🐾</div>
            <h1 style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:700;">Nueva solicitud pendiente</h1>
            <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;">PetQuotes · Panel de Administración</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 24px;">
            <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hola <strong>${data.adminName}</strong>,</p>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">Se ha registrado una nueva solicitud de <strong>${typeLabel}</strong> que requiere tu aprobación:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
              <tr><td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;">
                <p style="margin:0 0 3px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Solicitante</p>
                <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${data.applicantName}</p>
                <p style="margin:0;color:#64748b;font-size:13px;">${data.applicantEmail}</p>
              </td></tr>
              <tr><td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;">
                <p style="margin:0 0 3px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Tipo</p>
                <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${typeLabel}</p>
              </td></tr>
              <tr><td style="padding:14px 20px;">
                <p style="margin:0 0 3px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">${data.veterinaryType === 'CLINIC' ? 'Nombre de la clínica' : 'Zona de atención'}</p>
                <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${entityLabel}</p>
              </td></tr>
            </table>
            <p style="margin:24px 0 0;color:#64748b;font-size:14px;">Ingresa al panel de administración para revisar y aprobar o rechazar esta solicitud.</p>
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
</html>`,
    );
  }

  async sendVeterinaryApproval(data: VeterinaryApprovalData): Promise<void> {
    const typeLabel = data.veterinaryType === 'CLINIC' ? 'clínica veterinaria' : 'perfil de veterinario independiente';
    const entityLabel = data.clinicName ? `"${data.clinicName}"` : 'tu solicitud';

    await this.send(
      data.to,
      `🎉 ¡Tu solicitud en PetQuotes fue aprobada!`,
      `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);padding:36px 40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🎉</div>
            <h1 style="margin:0 0 6px;color:#fff;font-size:24px;font-weight:700;">¡Solicitud aprobada!</h1>
            <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;">PetQuotes · Registro Veterinario</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 24px;">
            <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hola <strong>${data.applicantName}</strong>,</p>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
              Nos complace informarte que tu solicitud para registrar ${entityLabel} como ${typeLabel} en PetQuotes ha sido <strong style="color:#16a34a;">aprobada</strong>. 🐾
            </p>
            <p style="margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.6;">
              Ya puedes acceder a tu cuenta y gestionar toda la información de tu veterinaria: foto, descripción, servicios, datos de contacto y más.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${data.loginUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#1d4ed8 0%,#06b6d4 100%);color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.01em;">
                  Ir a Mi Veterinaria →
                </a>
              </td></tr>
            </table>
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
</html>`,
    );
  }

  async sendVeterinaryRejection(data: VeterinaryRejectionData): Promise<void> {
    const typeLabel = data.veterinaryType === 'CLINIC' ? 'clínica veterinaria' : 'perfil de veterinario independiente';
    const entityLabel = data.clinicName ? `"${data.clinicName}"` : 'tu solicitud';

    await this.send(
      data.to,
      `Actualización sobre tu solicitud en PetQuotes`,
      `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:36px 40px;text-align:center;">
            <div style="font-size:36px;margin-bottom:12px;">🐾</div>
            <h1 style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:700;">Actualización de tu solicitud</h1>
            <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;">PetQuotes · Registro Veterinario</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 24px;">
            <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hola <strong>${data.applicantName}</strong>,</p>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
              Hemos revisado tu solicitud para registrar ${entityLabel} como ${typeLabel} en PetQuotes. Lamentablemente, en esta ocasión no podemos aprobarla.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff3f3;border-radius:12px;overflow:hidden;border:1px solid #fecaca;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 8px;color:#b91c1c;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Motivo del rechazo</p>
                <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">${data.reason}</p>
              </td></tr>
            </table>
            <p style="margin:24px 0 0;color:#64748b;font-size:14px;line-height:1.6;">Si tienes dudas o crees que hubo un error, puedes contactarnos respondiendo este correo.</p>
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
</html>`,
    );
  }

  private buildAppointmentHtml(data: {
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
