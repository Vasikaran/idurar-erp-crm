import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookLog, WebhookLogDocument } from './schemas/webhook-log.schema';

@Injectable()
export class WebhooksRepository {
  private readonly logger = new Logger(WebhooksRepository.name);

  constructor(
    @InjectModel(WebhookLog.name)
    private webhookLogModel: Model<WebhookLogDocument>,
  ) {}

  async createWebhookLog(
    logData: Partial<WebhookLog>,
  ): Promise<WebhookLogDocument> {
    try {
      const webhookLog = new this.webhookLogModel(logData);
      return await webhookLog.save();
    } catch (error) {
      this.logger.error('Error creating webhook log:', error);
      throw error;
    }
  }

  async updateWebhookLog(
    id: string,
    updateData: Partial<WebhookLog>,
  ): Promise<WebhookLogDocument | null> {
    try {
      return await this.webhookLogModel.findByIdAndUpdate(
        id,
        { ...updateData, processedAt: new Date() },
        { new: true },
      );
    } catch (error) {
      this.logger.error('Error updating webhook log:', error);
      throw error;
    }
  }

  async getRecentWebhooks(limit: number = 10): Promise<WebhookLogDocument[]> {
    try {
      return await this.webhookLogModel
        .find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      this.logger.error('Error getting recent webhooks:', error);
      throw error;
    }
  }
}
