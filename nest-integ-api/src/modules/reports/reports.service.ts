/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import {
  ReportQueryDto,
  SummaryReportDto,
  ClientInsightDto,
  RevenueBreakdownDto,
  ReportPeriod,
} from './dto/reports.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly reportsRepository: ReportsRepository) {}

  async getSummaryReport(query: ReportQueryDto): Promise<SummaryReportDto> {
    try {
      const matchStage = this.buildMatchStage(query);

      const [
        totalInvoices,
        revenueData,
        statusData,
        monthlyData,
        topClients,
        paymentData,
      ] = await Promise.all([
        this.reportsRepository.countInvoices(matchStage),
        this.reportsRepository.getRevenueAggregation(matchStage),
        this.reportsRepository.getInvoicesByStatus(matchStage),
        this.reportsRepository.getInvoicesByMonth(matchStage),
        this.reportsRepository.getTopClientsByRevenue(matchStage, 10),
        this.reportsRepository.getPaymentStatusSummary(matchStage),
      ]);

      return {
        totalInvoices,
        totalRevenue: revenueData.totalRevenue,
        totalPaidAmount: revenueData.totalPaidAmount,
        totalPendingAmount: revenueData.totalPendingAmount,
        invoicesByStatus: statusData,
        invoicesByMonth: monthlyData,
        topClients,
        paymentSummary: paymentData,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error generating summary report:', error);
      throw error;
    }
  }

  async getClientInsights(query: ReportQueryDto): Promise<ClientInsightDto[]> {
    try {
      const matchStage = this.buildMatchStage(query);
      return await this.reportsRepository.getClientInsightsAggregation(
        matchStage,
        20,
      );
    } catch (error) {
      this.logger.error('Error getting client insights:', error);
      throw error;
    }
  }

  async getRevenueBreakdown(
    query: ReportQueryDto,
  ): Promise<RevenueBreakdownDto> {
    try {
      const matchStage = this.buildMatchStage(query);

      const [
        revenueData,
        statusBreakdown,
        currencyBreakdown,
        monthlyTrend,
        overdueAmount,
      ] = await Promise.all([
        this.reportsRepository.getRevenueAggregation(matchStage),
        this.reportsRepository.getRevenueByStatus(matchStage),
        this.reportsRepository.getRevenueByCurrency(matchStage),
        this.reportsRepository.getMonthlyRevenueTrend(matchStage),
        this.reportsRepository.getOverdueInvoicesAmount(matchStage),
      ]);

      return {
        period: this.getPeriodLabel(query.period),
        totalRevenue: revenueData.totalRevenue,
        paidRevenue: revenueData.totalPaidAmount,
        pendingRevenue: revenueData.totalPendingAmount,
        overdueRevenue: overdueAmount,
        byStatus: statusBreakdown,
        byCurrency: currencyBreakdown,
        monthlyTrend,
      };
    } catch (error) {
      this.logger.error('Error getting revenue breakdown:', error);
      throw error;
    }
  }

  private buildMatchStage(query: ReportQueryDto): any {
    const baseMatch = { removed: { $ne: true } };
    const dateFilter = this.buildDateFilter(query);

    return { ...baseMatch, ...dateFilter };
  }

  private buildDateFilter(query: ReportQueryDto): any {
    if (query.startDate && query.endDate) {
      return {
        date: {
          $gte: new Date(query.startDate),
          $lte: new Date(query.endDate),
        },
      };
    }

    if (query.period) {
      return this.getDateRangeForPeriod(query.period);
    }

    return {};
  }

  private getDateRangeForPeriod(period: ReportPeriod): any {
    const now = new Date();

    switch (period) {
      case ReportPeriod.LAST_30_DAYS:
        return {
          date: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        };
      case ReportPeriod.LAST_90_DAYS:
        return {
          date: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
        };
      case ReportPeriod.CURRENT_MONTH:
        return {
          date: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        };
      case ReportPeriod.CURRENT_YEAR:
        return {
          date: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1),
          },
        };
      default:
        return {};
    }
  }

  private getPeriodLabel(period?: ReportPeriod): string {
    if (!period) return 'custom';

    const labels = {
      [ReportPeriod.LAST_30_DAYS]: 'Last 30 Days',
      [ReportPeriod.LAST_90_DAYS]: 'Last 90 Days',
      [ReportPeriod.CURRENT_MONTH]: 'Current Month',
      [ReportPeriod.CURRENT_YEAR]: 'Current Year',
      [ReportPeriod.LAST_YEAR]: 'Last Year',
    };

    return labels[period] || 'custom';
  }
}
