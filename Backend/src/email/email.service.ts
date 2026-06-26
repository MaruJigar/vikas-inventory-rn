import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const auth =
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      ...(auth ? { auth } : {}),
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 15 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">Company Name Inc.</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Company Name" <noreply@company.com>',
        to,
        subject: 'Password Reset Request',
        html: htmlTemplate,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new InternalServerErrorException(
        'Failed to send password reset email',
      );
    }
  }
}
