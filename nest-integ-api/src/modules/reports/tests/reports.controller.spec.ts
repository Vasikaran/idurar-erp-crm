/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from '../reports.controller';
import { ReportsService } from '../reports.service';
import { ReportQueryDto, ReportPeriod } from '../dto/reports.dto';
import { ApiResponse } from '../../../common/dto/response.dto';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: jest.Mocked<ReportsService>;

  const mockReportsService = {
    getSummaryReport: jest.fn(),
    getClientInsights: jest.fn(),
    getRevenueBreakdown: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should return summary report', async () => {
      const query: ReportQueryDto = {
        period: ReportPeriod.LAST_30_DAYS,
      };

      const mockSummaryData = {
        totalInvoices: 100,
        totalRevenue: 50000,
        totalPaidAmount: 35000,
        totalPendingAmount: 15000,
        invoicesByStatus: { sent: 20, paid: 60, overdue: 20 },
        invoicesByMonth: { '2025-01': 25, '2025-02': 30 },
        topClients: [
          {
            _id: 'client1',
            name: 'Client 1',
            email: 'client1@example.com', // Added missing property
            totalInvoices: 15, // Added missing property
            totalAmount: 10000,
            lastInvoiceDate: new Date('2025-01-15'), // Added missing property
          },
          {
            _id: 'client2',
            name: 'Client 2',
            email: 'client2@example.com', // Added missing property
            totalInvoices: 8, // Added missing property
            totalAmount: 8000,
            lastInvoiceDate: new Date('2025-01-10'), // Added missing property
          },
        ],
        paymentSummary: {
          paid: { count: 60, amount: 35000 },
          pending: { count: 40, amount: 15000 },
        },
        generatedAt: new Date('2025-01-15'),
      };

      service.getSummaryReport.mockResolvedValue(mockSummaryData);

      const result = await controller.getSummary(query);

      expect(result).toBeInstanceOf(ApiResponse);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Summary report generated successfully');
      expect(result.data).toEqual(mockSummaryData);
      expect(service.getSummaryReport).toHaveBeenCalledWith(query);
    });
  });

  describe('getClientInsights', () => {
    it('should return client insights', async () => {
      const query: ReportQueryDto = {
        period: ReportPeriod.CURRENT_MONTH,
      };

      const mockInsightsData = [
        {
          _id: 'client1',
          name: 'Client 1',
          email: 'client1@example.com',
          totalInvoices: 10,
          totalAmount: 25000,
          lastInvoiceDate: new Date('2025-01-15'),
          paidInvoices: 9,
          averageInvoiceAmount: 2500,
          paymentBehavior: 'excellent',
        },
        {
          _id: 'client2',
          name: 'Client 2',
          email: 'client2@example.com',
          totalInvoices: 5,
          totalAmount: 12000,
          lastInvoiceDate: new Date('2025-01-10'),
          paidInvoices: 3,
          averageInvoiceAmount: 2400,
          paymentBehavior: 'needs_attention',
        },
      ];

      service.getClientInsights.mockResolvedValue(mockInsightsData);

      const result = await controller.getClientInsights(query);

      expect(result).toBeInstanceOf(ApiResponse);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Client insights generated successfully');
      expect(result.data).toEqual(mockInsightsData);
      expect(service.getClientInsights).toHaveBeenCalledWith(query);
    });

    it('should handle empty client insights', async () => {
      const query: ReportQueryDto = {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      service.getClientInsights.mockResolvedValue([]);

      const result = await controller.getClientInsights(query);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(service.getClientInsights).toHaveBeenCalledWith(query);
    });
  });

  describe('getRevenueBreakdown', () => {
    it('should return revenue breakdown', async () => {
      const query: ReportQueryDto = {
        period: ReportPeriod.CURRENT_YEAR,
      };

      const mockRevenueData = {
        period: 'Current Year',
        totalRevenue: 100000,
        paidRevenue: 80000,
        pendingRevenue: 20000,
        overdueRevenue: 5000,
        byStatus: { sent: 15000, paid: 80000, overdue: 5000 },
        byCurrency: { USD: 80000, EUR: 20000 },
        monthlyTrend: [
          { month: '2025-01', revenue: 25000, invoiceCount: 10 },
          { month: '2025-02', revenue: 30000, invoiceCount: 12 },
        ],
      };

      service.getRevenueBreakdown.mockResolvedValue(mockRevenueData);

      const result = await controller.getRevenueBreakdown(query);

      expect(result).toBeInstanceOf(ApiResponse);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Revenue breakdown generated successfully');
      expect(result.data).toEqual(mockRevenueData);
      expect(service.getRevenueBreakdown).toHaveBeenCalledWith(query);
    });

    it('should handle custom date range', async () => {
      const query: ReportQueryDto = {
        startDate: '2025-01-01',
        endDate: '2025-03-31',
      };

      const mockRevenueData = {
        period: 'custom',
        totalRevenue: 75000,
        paidRevenue: 60000,
        pendingRevenue: 15000,
        overdueRevenue: 0,
        byStatus: { sent: 15000, paid: 60000 },
        byCurrency: { USD: 75000 },
        monthlyTrend: [
          { month: '2025-01', revenue: 25000, invoiceCount: 10 },
          { month: '2025-02', revenue: 25000, invoiceCount: 8 },
          { month: '2025-03', revenue: 25000, invoiceCount: 12 },
        ],
      };

      service.getRevenueBreakdown.mockResolvedValue(mockRevenueData);

      const result = await controller.getRevenueBreakdown(query);

      expect(result.success).toBe(true);
      expect(result.data?.period).toBe('custom');
      expect(service.getRevenueBreakdown).toHaveBeenCalledWith(query);
    });
  });
});
