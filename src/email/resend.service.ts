import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
export class ResendService {
  private resend: Resend;
  private emailFrom: string;
  private frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_KEY'));
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
      const { data, error } = await this.resend.emails.send({
        from: this.emailFrom,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('Resend Error:', error);
        throw new InternalServerErrorException('Failed to send email');
      }

      return data;
    } catch (err: any) {
      console.error('Resend Error:', err);
      throw new InternalServerErrorException('Email service unavailable');
    }
  }

  async sendEmailRegister(to: string, name: string) {
    const template = registerTemplate(name, this.frontendUrl);
    return await this.sendEmail(to, template);
  }

  async sendEmailForgotPassword(to: string, name: string, token: string) {
    const template = forgotPasswordTemplate(name, this.frontendUrl, token);
    return this.sendEmail(to, template);
  }

  async sendEmailPurchase(to: string, name: string) {
    const template = purchaseTemplate(name, this.frontendUrl);
    return this.sendEmail(to, template);
  }

  async sendEmailPurchaseError(to: string, name: string) {
    const template = purchaseErrorTemplate(name, this.frontendUrl);
    return this.sendEmail(to, template);
  }
}
