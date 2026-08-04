import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const smtpHost = configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const smtpPort = configService.get<number>('SMTP_PORT', 587);
    const smtpUser = configService.get<string>('SMTP_USER');
    const smtpPass = (configService.get<string>('SMTP_PASS') || '').replace(/\s/g, '');

    this.logger.log(`SMTP config: host=${smtpHost}, port=${smtpPort}, user=${smtpUser}, pass=${smtpPass ? '***' : 'MISSING'}`);

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async onModuleInit() {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified — mail service is ready');
    } catch (error) {
      this.logger.error(`SMTP connection failed: ${error.message}`);
    }
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    try {
      const fromName = this.configService.get<string>(
        'MAIL_FROM_NAME',
        'Restaurant Management',
      );
      const fromEmail = this.configService.get<string>(
        'MAIL_FROM',
        this.configService.get<string>('SMTP_USER', ''),
      );

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      this.logger.log(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
