/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ReportsService } from '../reports.service';
import { ReportsRepository } from '../reports.repository';
import { ReportQueryDto, ReportPeriod } from '../dto/reports.dto';

describe('ReportsService', () => {
  let service: ReportsService;
  let repository: jest.Mocked<ReportsRepository>;

  const mockReportsRepository = {
    countInvoices: jest.fn(),
    getRevenueAggregation: jest.fn(),
    getInvoicesByStatus: jest.fn(),
    getInvoicesByMonth: jest.fn(),
    getTopClientsByRevenue: jest.fn(),
    getPaymentStatusSummary: jest.fn(),
    getClientInsightsAggregation: jest.fn(),
    getRevenueByStatus: jest.fn(),
    getRevenueByCurrency: jest.fn(),
    getMonthlyRevenueTrend: jest.fn(),
    getOverdueInvoicesAmount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: ReportsRepository,
          useValue: mockReportsRepository,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    repository = module.get(ReportsRepository);

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummaryReport', () => {
    it('should return comprehensive summary report', async () => {
      const query: ReportQueryDto = {
        period: ReportPeriod.LAST_30_DAYS,
      };

      const mockData = {
        totalInvoices: 100,
        revenueData: {
          totalRevenue: 50000,
          totalPaidAmount: 35000,
          totalPendingAmount: 15000,
        },
        statusData: { sent: 20, paid: 60, overdue: 20 },
        monthlyData: { '2025-01': 25, '2025-02': 30 },
        topClients: [{ _id: 'client1', name: 'Client 1', totalAmount: 10000 }],
        paymentData: {
          paid: { count: 60, amount: 35000 },
          pending: { count: 40, amount: 15000 },
        },
      };

      repository.countInvoices.mockResolvedValue(mockData.totalInvoices);
      repository.getRevenueAggregation.mockResolvedValue(mockData.revenueData);
      repository.getInvoicesByStatus.mockResolvedValue(mockData.statusData);
      repository.getInvoicesByMonth.mockResolvedValue(mockData.monthlyData);
      repository.getTopClientsByRevenue.mockResolvedValue(mockData.topClients);
      repository.getPaymentStatusSummary.mockResolvedValue(
        mockData.paymentData,
      );

      const result = await service.getSummaryReport(query);

      expect(result).toEqual({
        totalInvoices: 100,
        totalRevenue: 50000,
        totalPaidAmount: 35000,
        totalPendingAmount: 15000,
        invoicesByStatus: mockData.statusData,
        invoicesByMonth: mockData.monthlyData,
        topClients: mockData.topClients,
        paymentSummary: mockData.paymentData,
        generatedAt: expect.any(Date),
      });

      expect(repository.countInvoices).toHaveBeenCalledWith(
        expect.objectContaining({
          removed: { $ne: true },
          date: expect.any(Object),
        }),
      );
      expect(repository.getRevenueAggregation).toHaveBeenCalledTimes(1);
      expect(repository.getInvoicesByStatus).toHaveBeenCalledTimes(1);
      expect(repository.getInvoicesByMonth).toHaveBeenCalledTimes(1);
      expect(repository.getTopClientsByRevenue).toHaveBeenCalledWith(
        expect.any(Object),
        10,
      );
      expect(repository.getPaymentStatusSummary).toHaveBeenCalledTimes(1);
    });

    it('should handle errors and log them', async () => {
      const query: ReportQueryDto = {};
      const error = new Error('Database error');

      repository.countInvoices.mockRejectedValue(error);

      await expect(service.getSummaryReport(query)).rejects.toThrow(error);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error generating summary report:',
        error,
      );
    });
  });

  describe('getClientInsights', () => {
    it('should return client insights data', async () => {
      const query: ReportQueryDto = {
        period: ReportPeriod.CURRENT_MONTH,
      };

      const mockInsights = [
        {
          _id: 'client1',
          name: 'Client 1',
          email: 'client1@example.com',
          totalInvoices: 10,
          totalAmount: 25000,
          paymentBehavior: 'excellent',
        },
      ];

      repository.getClientInsightsAggregation.mockResolvedValue(mockInsights);

      const result = await service.getClientInsights(query);

      expect(result).toEqual(mockInsights);
      expect(repository.getClientInsightsAggregation).toHaveBeenCalledWith(
        expect.objectContaining({
          removed: { $ne: true },
          date: expect.any(Object),
        }),
        20,
      );
    });

    it('should handle errors in client insights', async () => {
      const query: ReportQueryDto = {};
      const error = new Error('Repository error');

      repository.getClientInsightsAggregation.mockRejectedValue(error);

      await expect(service.getClientInsights(query)).rejects.toThrow(error);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error getting client insights:',
        error,
      );
    });
  });

  describe('getRevenueBreakdown', () => {
    it('should return revenue breakdown data', async () => {
      const query: ReportQueryDto = {
        period: ReportPeriod.CURRENT_YEAR,
      };

      const mockData = {
        revenueData: {
          totalRevenue: 100000,
          totalPaidAmount: 80000,
          totalPendingAmount: 20000,
        },
        statusBreakdown: { sent: 15000, paid: 80000, overdue: 5000 },
        currencyBreakdown: { USD: 80000, EUR: 20000 },
        monthlyTrend: [
          { month: '2025-01', revenue: 25000, invoiceCount: 10 },
          { month: '2025-02', revenue: 30000, invoiceCount: 12 },
        ],
        overdueAmount: 5000,
      };

      repository.getRevenueAggregation.mockResolvedValue(mockData.revenueData);
      repository.getRevenueByStatus.mockResolvedValue(mockData.statusBreakdown);
      repository.getRevenueByCurrency.mockResolvedValue(
        mockData.currencyBreakdown,
      );
      repository.getMonthlyRevenueTrend.mockResolvedValue(
        mockData.monthlyTrend,
      );
      repository.getOverdueInvoicesAmount.mockResolvedValue(
        mockData.overdueAmount,
      );

      const result = await service.getRevenueBreakdown(query);

      expect(result).toEqual({
        period: 'Current Year',
        totalRevenue: 100000,
        paidRevenue: 80000,
        pendingRevenue: 20000,
        overdueRevenue: 5000,
        byStatus: mockData.statusBreakdown,
        byCurrency: mockData.currencyBreakdown,
        monthlyTrend: mockData.monthlyTrend,
      });

      expect(repository.getRevenueAggregation).toHaveBeenCalledTimes(1);
      expect(repository.getRevenueByStatus).toHaveBeenCalledTimes(1);
      expect(repository.getRevenueByCurrency).toHaveBeenCalledTimes(1);
      expect(repository.getMonthlyRevenueTrend).toHaveBeenCalledTimes(1);
      expect(repository.getOverdueInvoicesAmount).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in revenue breakdown', async () => {
      const query: ReportQueryDto = {};
      const error = new Error('Revenue breakdown error');

      repository.getRevenueAggregation.mockRejectedValue(error);

      await expect(service.getRevenueBreakdown(query)).rejects.toThrow(error);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error getting revenue breakdown:',
        error,
      );
    });
  });

  describe('buildMatchStage', () => {
    it('should build match stage with custom date range', () => {
      const query: ReportQueryDto = {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      const result = service['buildMatchStage'](query);

      expect(result).toEqual({
        removed: { $ne: true },
        date: {
          $gte: new Date('2025-01-01'),
          $lte: new Date('2025-01-31'),
        },
      });
    });

    it('should build match stage with period filter', () => {
      const query: ReportQueryDto = {
        period: ReportPeriod.LAST_30_DAYS,
      };

      const result = service['buildMatchStage'](query);

      expect(result).toEqual({
        removed: { $ne: true },
        date: { $gte: expect.any(Date) },
      });
    });

    it('should build match stage without date filter', () => {
      const query: ReportQueryDto = {};

      const result = service['buildMatchStage'](query);

      expect(result).toEqual({
        removed: { $ne: true },
      });
    });
  });

  describe('getPeriodLabel', () => {
    it('should return correct labels for different periods', () => {
      expect(service['getPeriodLabel'](ReportPeriod.LAST_30_DAYS)).toBe(
        'Last 30 Days',
      );
      expect(service['getPeriodLabel'](ReportPeriod.CURRENT_MONTH)).toBe(
        'Current Month',
      );
      expect(service['getPeriodLabel'](ReportPeriod.CURRENT_YEAR)).toBe(
        'Current Year',
      );
      expect(service['getPeriodLabel'](undefined)).toBe('custom');
    });
  });
});
