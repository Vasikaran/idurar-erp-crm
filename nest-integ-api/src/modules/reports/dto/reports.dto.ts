import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';

export enum ReportPeriod {
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_YEAR = 'last_year',
  CURRENT_MONTH = 'current_month',
  CURRENT_YEAR = 'current_year',
}

export class ReportQueryDto {
  @ApiPropertyOptional({ enum: ReportPeriod })
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;
}

export class SummaryReportDto {
  @ApiProperty()
  totalInvoices: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalPaidAmount: number;

  @ApiProperty()
  totalPendingAmount: number;

  @ApiProperty()
  invoicesByStatus: Record<string, number>;

  @ApiProperty()
  invoicesByMonth: Record<string, number>;

  @ApiProperty()
  topClients: Array<{
    _id: string;
    name: string;
    email: string;
    totalInvoices: number;
    totalAmount: number;
    lastInvoiceDate: Date;
  }>;

  @ApiProperty()
  paymentSummary: Record<string, { count: number; amount: number }>;

  @ApiProperty()
  generatedAt: Date;
}

export class ClientInsightDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  totalInvoices: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  averageInvoiceAmount: number;

  @ApiProperty()
  lastInvoiceDate: Date;

  @ApiProperty()
  paymentBehavior: string;
}

export class RevenueBreakdownDto {
  @ApiProperty()
  period: string;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  paidRevenue: number;

  @ApiProperty()
  pendingRevenue: number;

  @ApiProperty()
  overdueRevenue: number;

  @ApiProperty()
  byStatus: Record<string, number>;

  @ApiProperty()
  byCurrency: Record<string, number>;

  @ApiProperty()
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    invoiceCount: number;
  }>;
}
