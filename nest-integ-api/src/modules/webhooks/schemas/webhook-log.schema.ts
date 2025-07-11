import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookLogDocument = WebhookLog & Document;

export enum WebhookStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PROCESSING = 'processing',
}

export enum WebhookType {
  SALES_LEAD = 'sales_lead',
  PAYMENT_NOTIFICATION = 'payment_notification',
}

@Schema({ collection: 'webhook_logs', timestamps: true })
export class WebhookLog {
  @Prop({ required: true, enum: WebhookType })
  type: WebhookType;

  @Prop({ required: true })
  source: string;

  @Prop({ required: true, type: Object })
  payload: Record<string, any>;

  @Prop({ required: true, type: Object })
  headers: Record<string, string>;

  @Prop({
    required: true,
    enum: WebhookStatus,
    default: WebhookStatus.PROCESSING,
  })
  status: WebhookStatus;

  @Prop()
  processingResult?: string;

  @Prop()
  errorMessage?: string;

  @Prop()
  responseTime?: number;

  @Prop()
  processedAt?: Date;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);
