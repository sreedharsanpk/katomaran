import { Controller, Post, Headers, Req } from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('github')
  async handleWebhook(
    @Headers('x-hub-signature-256') signature: string,
    @Headers('x-github-delivery') deliveryId: string,
    @Headers('x-github-event') eventType: string,
    @Req() req: any,
  ) {
    return this.webhookService.processWebhook(
      signature,
      deliveryId,
      eventType,
      req.rawBody,
      req.body,
    );
  }
}
