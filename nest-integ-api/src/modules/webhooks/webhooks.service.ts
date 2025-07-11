import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { WebhooksRepository } from './webhooks.repository';
import {
  WebhookRequestDto,
  SalesLeadWebhookDto,
  PaymentNotificationWebhookDto,
} from './dto/webhook.dto';
import { WebhookType, WebhookStatus } from './schemas/webhook-log.schema';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  private readonly SENSITIVE_HEADERS = ['authorization', 'cookie'];

  constructor(private readonly webhooksRepository: WebhooksRepository) {}

  private filterSensitiveHeaders(
    headers: Record<string, string>,
  ): Record<string, string> {
    const filtered: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();

      if (this.SENSITIVE_HEADERS.includes(lowerKey)) {
        filtered[key] = '[SENSITIVE_HEADER_MASKED]';
      } else {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  async processWebhook(
    webhookData: WebhookRequestDto,
    headers: Record<string, string>,
    ipAddress: string,
  ): Promise<any> {
    const startTime = Date.now();
    let webhookLog: any = null;
    const filteredHeaders = this.filterSensitiveHeaders(headers);

    try {
      webhookLog = await this.webhooksRepository.createWebhookLog({
        type: webhookData.type,
        source: webhookData.source,
        payload: webhookData.data,
        headers: filteredHeaders,
        status: WebhookStatus.PROCESSING,
        userAgent: headers['user-agent'],
        ipAddress,
      });

      this.logger.log(
        `Processing webhook: ${webhookData.type} from ${webhookData.source}`,
      );

      let processingResult: any;
      switch (webhookData.type) {
        case WebhookType.SALES_LEAD:
          processingResult = await this.processSalesLead(
            webhookData.data as SalesLeadWebhookDto,
          );
          break;
        case WebhookType.PAYMENT_NOTIFICATION:
          processingResult = await this.processPaymentNotification(
            webhookData.data as PaymentNotificationWebhookDto,
          );
          break;
        default:
          throw new BadRequestException(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `Unsupported webhook type: ${webhookData.type}`,
          );
      }

      const responseTime = Date.now() - startTime;

      await this.webhooksRepository.updateWebhookLog(
        webhookLog._id.toString(),
        {
          status: WebhookStatus.SUCCESS,
          processingResult: JSON.stringify(processingResult),
          responseTime,
        },
      );

      return {
        success: true,
        message: 'Webhook processed successfully',
        data: {
          webhookId: webhookLog._id.toString(),
          type: webhookData.type,
          processedAt: new Date(),
          responseTime,
          result: processingResult,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.logger.error(
        `Webhook processing failed: ${error.message}`,
        error.stack,
      );

      if (webhookLog) {
        try {
          await this.webhooksRepository.updateWebhookLog(
            webhookLog._id.toString(),
            {
              status: WebhookStatus.FAILED,
              errorMessage: error.message,
              responseTime,
            },
          );
        } catch (updateError) {
          this.logger.error('Failed to update webhook log:', updateError);
        }
      }

      throw error;
    }
  }

  private processSalesLead(leadData: SalesLeadWebhookDto): any {
    try {
      if (!leadData.name || !leadData.email) {
        throw new BadRequestException(
          'Name and email are required for sales leads',
        );
      }

      const leadId = crypto.randomUUID();

      const processedLead = {
        leadId,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone || null,
        company: leadData.company || null,
        message: leadData.message || null,
        source: leadData.source || 'webhook',
        estimatedValue: leadData.estimatedValue || 0,
        priority: leadData.priority || 'medium',
        status: 'new',
        createdAt: new Date(),
        assignedTo: null,
      };

      this.logger.log(`Sales lead processed: ${leadId} - ${leadData.email}`);

      return {
        leadId,
        status: 'processed',
        message: 'Sales lead has been successfully processed and added to CRM',
        data: processedLead,
      };
    } catch (error) {
      this.logger.error('Error processing sales lead:', error);
      throw error;
    }
  }

  private processPaymentNotification(
    paymentData: PaymentNotificationWebhookDto,
  ): any {
    try {
      if (
        !paymentData.invoiceId ||
        !paymentData.paymentId ||
        !paymentData.amount
      ) {
        throw new BadRequestException(
          'Invoice ID, payment ID, and amount are required for payment notifications',
        );
      }

      const processedPayment = {
        paymentId: paymentData.paymentId,
        invoiceId: paymentData.invoiceId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        gateway: paymentData.gateway || 'unknown',
        transactionId: paymentData.transactionId || null,
        notes: paymentData.notes || null,
        paidAt: paymentData.paidAt ? new Date(paymentData.paidAt) : new Date(),
        processedAt: new Date(),
      };

      this.logger.log(
        `Payment notification processed: ${paymentData.paymentId} for invoice ${paymentData.invoiceId}`,
      );

      return {
        paymentId: paymentData.paymentId,
        status: 'processed',
        message: 'Payment notification has been successfully processed',
        data: processedPayment,
      };
    } catch (error) {
      this.logger.error('Error processing payment notification:', error);
      throw error;
    }
  }

  async getRecentWebhooks(limit: number = 10): Promise<any> {
    try {
      const webhooks = await this.webhooksRepository.getRecentWebhooks(limit);

      return {
        success: true,
        message: 'Recent webhooks retrieved successfully',
        data: webhooks,
      };
    } catch (error) {
      this.logger.error('Error getting recent webhooks:', error);
      throw error;
    }
  }
}
