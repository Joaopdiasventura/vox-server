import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Transporter, createTransport } from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
@Processor('email')
export class EmailService extends WorkerHost {
  private transporter: Transporter;

  public constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    private readonly configService: ConfigService,
  ) {
    super();
    this.transporter = createTransport({
      service: 'Gmail',
      auth: {
        user: this.configService.get<string>('email.address'),
        pass: this.configService.get<string>('email.password'),
      },
    });
  }

  public async enqueueMail(sendEmailDto: SendEmailDto): Promise<void> {
    try {
      await this.emailQueue.add('send-email', sendEmailDto, {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });
    } catch (err) {
      Logger.error(err, 'EmailService');
      throw new InternalServerErrorException(
        'Erro ao enfileirar o email, tente novamente mais tarde ou contate o suporte',
      );
    }
  }

  public async process({ data }: Job<SendEmailDto>): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Vox" <${this.configService.get<string>('email.address')}>`,
        ...data,
      });
    } catch (err) {
      Logger.error(err, 'EmailService');
      throw new InternalServerErrorException(
        'Erro ao enviar o email, tente novamente mais tarde ou contate o suporte',
      );
    }
  }

  public createNewPasswordMessage(password: string): string {
    const url = this.configService.get<string>('client.url');
    return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:32px 0;margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#010108;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fbfbff;border-radius:16px;box-shadow:0 10px 30px rgba(1,1,8,.08);overflow:hidden;border:1px solid #cecece;">
            <tr>
              <td style="background:linear-gradient(135deg,#b20000,#860909);padding:24px;color:#fbfbff;font-weight:700;font-size:20px;letter-spacing:.3px;">VOX • Nova senha gerada</td>
            </tr>
            <tr>
              <td style="padding:24px;font-size:16px;line-height:1.55;">
                <p style="margin:0 0 12px;">Olá,</p>
                <p style="margin:0 0 16px;">Uma nova senha temporária foi criada para sua conta.</p>
                <div style="display:inline-block;margin:16px 0;padding:14px 18px;border-radius:12px;background:#e8e8e8;border:1px solid #cecece;font-size:18px;font-weight:700;letter-spacing:.5px;color:#010108;">${password}</div>
                <p style="margin:16px 0;">Use-a para acessar o sistema e, em seguida, altere sua senha em “Minha conta”.</p>
                <p style="margin:24px 0;">
                  <a href="${url}" style="display:inline-block;background:#b20000;color:#fbfbff;text-decoration:none;padding:14px 22px;border-radius:10px;font-weight:700;border:1px solid #860909;">Acessar o sistema</a>
                </p>
                <p style="margin:0 0 12px;font-size:13px;color:#111111;">Se o botão não funcionar, copie e cole este link no navegador:</p>
                <p style="margin:0 0 24px;word-break:break-all;"><a href="${url}" style="color:#b20000;text-decoration:underline;">${url}</a></p>
                <p style="margin:0;color:#111111;font-size:12px;">Por segurança, não compartilhe esta senha. Caso não tenha solicitado, ignore este e-mail.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px;background:#cccccc;color:#111111;font-size:12px;">© ${new Date().getFullYear()} VOX</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
  }

  public createAccountValidationMessage(token: string): string {
    const url = `${this.configService.get<string>('client.url')}/user/access/validate/${token}`;
    return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:32px 0;margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#010108;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fbfbff;border-radius:16px;box-shadow:0 10px 30px rgba(1,1,8,.08);overflow:hidden;border:1px solid #cecece;">
            <tr>
              <td style="background:linear-gradient(135deg,#b20000,#860909);padding:24px;color:#fbfbff;font-weight:700;font-size:20px;letter-spacing:.3px;">VOX • Confirmação de conta</td>
            </tr>
            <tr>
              <td style="padding:24px;font-size:16px;line-height:1.55;">
                <p style="margin:0 0 12px;">Olá,</p>
                <p style="margin:0 0 16px;">Seja bem-vindo ao Vox! Antes de começar, confirme sua conta clicando no botão abaixo:</p>
                <p style="margin:24px 0;">
                  <a href="${url}" style="display:inline-block;background:#b20000;color:#fbfbff;text-decoration:none;padding:14px 22px;border-radius:10px;font-weight:700;border:1px solid #860909;">Validar minha conta</a>
                </p>
                <p style="margin:0 0 12px;font-size:13px;color:#111111;">Se o botão não funcionar, copie e cole este link no navegador:</p>
                <p style="margin:0 0 24px;word-break:break-all;"><a href="${url}" style="color:#b20000;text-decoration:underline;">${url}</a></p>
                <p style="margin:0;color:#111111;font-size:12px;">Se você não criou uma conta, ignore este e-mail com segurança.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px;background:#cccccc;color:#111111;font-size:12px;">© ${new Date().getFullYear()} VOX</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `;
  }
}
