/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Ip,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { WebhookRequestDto, WebhookResponseDto } from './dto/webhook.dto';
import { Public } from '../auth/public.decorator';
import { ApiResponse as CustomResponse } from '../../common/dto/response.dto';

@ApiTags('Webhooks')
@Controller('webhook')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @Public()
  @ApiOperation({
    summary: 'Process external webhook',
    description:
      'Accepts JSON payloads for external system integration (e.g., sales leads, payment notifications)',
  })
  @ApiBody({
    type: WebhookRequestDto,
    examples: {
      'Sales Lead': {
        summary: 'Sales Lead Webhook',
        description: 'Example of a sales lead webhook payload',
        value: {
          type: 'sales_lead',
          source: 'website_contact_form',
          webhookId: 'webhook_12345',
          data: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            company: 'Acme Corporation',
            message: 'Interested in your ERP solution',
            source: 'website_contact_form',
            estimatedValue: 50000,
            priority: 'high',
          },
        },
      },
      'Payment Notification': {
        summary: 'Payment Notification Webhook',
        description: 'Example of a payment notification webhook payload',
        value: {
          type: 'payment_notification',
          source: 'stripe_gateway',
          webhookId: 'webhook_67890',
          data: {
            invoiceId: 'inv_12345',
            paymentId: 'pay_67890',
            amount: 1250.5,
            currency: 'USD',
            status: 'completed',
            gateway: 'stripe',
            transactionId: 'txn_abc123',
            notes: 'Payment processed successfully',
            paidAt: '2024-01-15T10:30:00Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    type: WebhookResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid webhook payload' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async processWebhook(
    @Body() webhookData: WebhookRequestDto,
    @Headers() headers: Record<string, string>,
    @Ip() ipAddress: string,
  ): Promise<WebhookResponseDto> {
    return await this.webhooksService.processWebhook(
      webhookData,
      headers,
      ipAddress,
    );
  }

  @Get('recent')
  @ApiOperation({
    summary: 'Get recent webhooks',
    description: 'Retrieve recently processed webhooks for monitoring',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent webhooks retrieved successfully',
  })
  async getRecentWebhooks(
    @Query('limit') limit: number = 10,
  ): Promise<CustomResponse<any>> {
    const result = await this.webhooksService.getRecentWebhooks(limit);
    return new CustomResponse(result.success, result.message, result.data);
  }
}
