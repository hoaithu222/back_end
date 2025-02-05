import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SendEmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail({
    sendTo,
    subject,
    html,
  }: {
    sendTo: string;
    subject: string;
    html: string;
  }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"MyShop 👻" <${process.env.EMAIL_USER}>`,
        to: sendTo,
        subject: subject,
        html: html,
      });

      console.log('Email sent:', info.messageId);
      return { success: true, data: info };
    } catch (error) {
      console.error('Error occurred while sending email:', error);
      return { success: false, error };
    }
  }
}
