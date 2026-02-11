import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async processWebhook(
    signature: string,
    deliveryId: string,
    eventType: string,
    rawBody: Buffer,
    body: any,
  ) {
    const secret = process.env.GITHUB_WEBHOOK_SECRET!;

    // 🔐 1️⃣ Verify signature
    const expectedSignature =
      'sha256=' +
      crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

    if (
      !signature ||
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      )
    ) {
      throw new UnauthorizedException('Invalid signature');
    }

    // 🔁 2️⃣ Idempotency check
    const existing = await this.prisma.gitHubWebhookEvent.findUnique({
      where: { deliveryId },
    });

    if (existing) {
      return existing.response;
    }

    // 🧠 3️⃣ Business logic
    const responsePayload = {
      received: true,
      eventType,
      repository: body.repository?.full_name ?? null,
    };

    // 💾 4️⃣ Save event (ONLY schema fields)
    await this.prisma.gitHubWebhookEvent.create({
      data: {
        deliveryId,
        eventType,
        payload: body,
        response: responsePayload,
      },
    });

    return responsePayload;
  }
}
