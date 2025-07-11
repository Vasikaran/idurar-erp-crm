import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsNumber,
  IsObject,
  Min,
} from 'class-validator';
import { WebhookType } from '../schemas/webhook-log.schema';

export class SalesLeadWebhookDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Acme Corporation' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: 'Interested in your ERP solution' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ example: 'website_contact_form' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @ApiPropertyOptional({ example: 'high' })
  @IsOptional()
  @IsString()
  priority?: string;
}

export class PaymentNotificationWebhookDto {
  @ApiProperty({ example: 'inv_12345' })
  @IsString()
  invoiceId: string;

  @ApiProperty({ example: 'pay_67890' })
  @IsString()
  paymentId: string;

  @ApiProperty({ example: 1250.5 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'completed' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ example: 'stripe' })
  @IsOptional()
  @IsString()
  gateway?: string;

  @ApiPropertyOptional({ example: 'txn_abc123' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ example: 'Payment processed successfully' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  @IsOptional()
  @IsString()
  paidAt?: string;
}

export class WebhookRequestDto {
  @ApiProperty({
    enum: WebhookType,
    example: WebhookType.SALES_LEAD,
    description: 'Type of webhook payload',
  })
  @IsEnum(WebhookType)
  type: WebhookType;

  @ApiProperty({
    example: 'external_crm_system',
    description: 'Source system sending the webhook',
  })
  @IsString()
  source: string;

  @ApiProperty({
    description: 'Webhook payload data - varies by type',
    oneOf: [
      { $ref: '#/components/schemas/SalesLeadWebhookDto' },
      { $ref: '#/components/schemas/PaymentNotificationWebhookDto' },
    ],
  })
  @IsObject()
  data: SalesLeadWebhookDto | PaymentNotificationWebhookDto;

  @ApiPropertyOptional({ example: 'webhook_12345' })
  @IsOptional()
  @IsString()
  webhookId?: string;
}

export class WebhookResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Webhook processed successfully' })
  message: string;

  @ApiProperty()
  data: {
    webhookId: string;
    type: WebhookType;
    processedAt: Date;
    responseTime: number;
    result: any;
  };
}
