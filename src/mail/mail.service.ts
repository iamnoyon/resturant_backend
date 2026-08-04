import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.logger.log(`Resend initialized ${apiKey ? '' : '(WARNING: no API key)'}`);
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    try {
      const fromName = this.configService.get<string>(
        'MAIL_FROM_NAME',
        'Cloud Cafe',
      );
      const fromEmail = this.configService.get<string>(
        'MAIL_FROM',
        'noreply@cloudcafe.com',
      );

      const { data, error } = await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${options.to}: ${error.message}`, error);
        return false;
      }

      this.logger.log(`Email sent to ${options.to} (id: ${data?.id})`);
      return true;
    } catch (error) {
      this.logger.error(`Unexpected error sending to ${options.to}: ${error.message}`, error.stack);
      return false;
    }
  }
}
