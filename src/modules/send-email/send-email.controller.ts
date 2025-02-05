import { Controller, Post, Body } from '@nestjs/common';
import { SendEmailService } from './send-email.service';

@Controller('send-email')
export class SendEmailController {
  constructor(private readonly sendEmailService: SendEmailService) {}

  @Post()
  async sendEmail(
    @Body() body: { sendTo: string; subject: string; html: string },
  ) {
    const { sendTo, subject, html } = body;

    const response = await this.sendEmailService.sendEmail({
      sendTo,
      subject,
      html,
    });

    if (!response.success) {
      return {
        success: false,
        message: 'Failed to send email',
        error: response.error,
      };
    }

    return {
      success: true,
      message: 'Email sent successfully',
      data: response.data,
    };
  }
}
