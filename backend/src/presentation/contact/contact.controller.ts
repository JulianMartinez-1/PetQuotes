import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '@/business/notifications/notification.service';
import { ContactDto } from './contact.dto';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly notifications: NotificationService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async submit(@Body() dto: ContactDto) {
    const adminEmail =
      this.config.get<string>('CONTACT_EMAIL') ??
      this.config.get<string>('RESEND_FROM_EMAIL') ??
      'admin@petquotes.online';

    await this.notifications['send'](
      adminEmail,
      `📬 Consulta de ${dto.name} — PetQuotes`,
      `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:36px 40px;text-align:center;">
            <div style="font-size:36px;margin-bottom:12px;">📬</div>
            <h1 style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:700;">Nueva consulta recibida</h1>
            <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;">PetQuotes · Formulario de contacto</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
              <tr><td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;">
                <p style="margin:0 0 3px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Nombre</p>
                <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${dto.name}</p>
              </td></tr>
              <tr><td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;">
                <p style="margin:0 0 3px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Email</p>
                <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${dto.email}</p>
              </td></tr>
              <tr><td style="padding:14px 20px;">
                <p style="margin:0 0 3px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Mensaje</p>
                <p style="margin:0;color:#1e293b;font-size:15px;line-height:1.6;">${dto.message.replace(/\n/g, '<br>')}</p>
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

    return { message: 'Consulta enviada correctamente' };
  }
}
