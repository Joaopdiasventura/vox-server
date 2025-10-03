import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Transporter, createTransport } from "nodemailer";
import { SendEmailDto } from "./dto/send-email.dto";

@Injectable()
export class EmailService {
  private transporter: Transporter;

  public constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      service: "Gmail",
      auth: {
        user: this.configService.get<string>("email.address"),
        pass: this.configService.get<string>("email.password"),
      },
    });
  }

  public async sendMail(sendEmailDto: SendEmailDto): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Vox" <${this.configService.get<string>("email.address")}>`,
        ...sendEmailDto,
      });
    } catch (err) {
      Logger.error(err);
      throw new Error(
        "Erro ao enviar o email, tente novamente mais tarde ou contate o suporte",
      );
    }
  }

  public createValidationButton(token: string): string {
    return `
        <div style="text-align: center;">
            <div style="margin-top: 20px;">
              <a href="${this.configService.get<string>("client.url")}/user/validateEmail/${token}">
                <button 
                  style="background-color: #000000; color: white; border: none; padding: 10px 20px; font-size: 16px; border-radius: 10px;">
                  VALIDAR CONTA
                </button>
              </a>
            </div>
        </div>
        `;
  }
}
