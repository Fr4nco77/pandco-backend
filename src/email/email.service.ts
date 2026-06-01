import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { registerTemplate } from './templates/registerTemplate.js';
import { forgotPasswordTemplate } from './templates/forgotPasswordTemplate.js';
import { purchaseErrorTemplate } from './templates/purchaseErrorTemplate.js';
import { purchaseTemplate } from './templates/purchaseTemplate.js';
import { ConfigService } from '@nestjs/config';

interface EmailContent {
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private mailer: Resend;
  private emailFrom: string;
  private frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.mailer = new Resend(this.configService.get<string>('RESEND_KEY'));
    this.emailFrom = this.configService.get<string>(
      'MAIL_FROM',
      'onboarding@resend.dev',
    );
    this.frontendUrl = this.configService.get<string>(
      'FRONTEND',
      'http://localhost:3001',
    );
  }

  private async sendEmail(to: string, { subject, html }: EmailContent) {
    try {
      const { data, error } = await this.mailer.emails.send({
        from: this.emailFrom,
        to,
        subject,
        html,
      });

      if (error) {
        console.error(
          `[EmailService] Resend API Error sending to ${to}:`,
          error,
        );
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err: any) {
      console.error(
        `[EmailService] Network/Provider Error sending to ${to}:`,
        err,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: err.message };
    }
  }

  async sendEmailRegister(to: string, name: string) {
    const template = registerTemplate(name, this.frontendUrl);
    await this.sendEmail(to, template);
  }

  async sendEmailForgotPassword(to: string, name: string, token: string) {
    const template = forgotPasswordTemplate(name, this.frontendUrl, token);
    await this.sendEmail(to, template);
  }

  async sendEmailPurchase(to: string, name: string) {
    const template = purchaseTemplate(name, this.frontendUrl);
    await this.sendEmail(to, template);
  }

  async sendEmailPurchaseError(to: string, name: string) {
    const template = purchaseErrorTemplate(name, this.frontendUrl);
    await this.sendEmail(to, template);
  }
}
