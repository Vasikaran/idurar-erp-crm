/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { ReportsRepository } from '../reports.repository';
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';
import { Client } from '../schemas/client.schema';

describe('ReportsRepository', () => {
  let repository: ReportsRepository;
  let invoiceModel: jest.Mocked<Model<InvoiceDocument>>;

  const mockInvoiceModel = {
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    find: jest.fn(),
  };

  const mockClientModel = {
    find: jest.fn(),
    aggregate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsRepository,
        {
          provide: getModelToken(Invoice.name),
          useValue: mockInvoiceModel,
        },
        {
          provide: getModelToken(Client.name),
          useValue: mockClientModel,
        },
      ],
    }).compile();

    repository = module.get<ReportsRepository>(ReportsRepository);
    invoiceModel = module.get(getModelToken(Invoice.name));

    // Mock Logger
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('countInvoices', () => {
    it('should count invoices with match stage', async () => {
      const matchStage = { removed: { $ne: true } };
      const expectedCount = 50;

      invoiceModel.countDocuments.mockResolvedValue(expectedCount);

      const result = await repository.countInvoices(matchStage);

      expect(result).toBe(expectedCount);
      expect(invoiceModel.countDocuments).toHaveBeenCalledWith(matchStage);
    });

    it('should handle errors in countInvoices', async () => {
      const matchStage = { removed: { $ne: true } };
      const error = new Error('Database error');

      invoiceModel.countDocuments.mockRejectedValue(error);

      await expect(repository.countInvoices(matchStage)).rejects.toThrow(error);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error counting invoices:',
        error,
      );
    });
  });

  describe('getRevenueAggregation', () => {
    it('should return revenue aggregation data', async () => {
      const matchStage = { removed: { $ne: true } };
      const mockResult = [
        {
          totalRevenue: 100000,
          totalPaidAmount: 80000,
          totalPendingAmount: 20000,
        },
      ];

      const mockAggregate = {
        exec: jest.fn().mockResolvedValue(mockResult),
      } as any;

      invoiceModel.aggregate.mockReturnValue(mockAggregate);

      const result = await repository.getRevenueAggregation(matchStage);

      expect(result).toEqual(mockResult[0]);
      expect(invoiceModel.aggregate).toHaveBeenCalledWith([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalPaidAmount: {
              $sum: {
                $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0],
              },
            },
            totalPendingAmount: {
              $sum: {
                $cond: [{ $ne: ['$paymentStatus', 'paid'] }, '$total', 0],
              },
            },
          },
        },
      ]);
    });

    it('should return default values when no data found', async () => {
      const matchStage = { removed: { $ne: true } };
      const mockAggregate = {
        exec: jest.fn().mockResolvedValue([]),
      } as any;

      invoiceModel.aggregate.mockReturnValue(mockAggregate);

      const result = await repository.getRevenueAggregation(matchStage);

      expect(result).toEqual({
        totalRevenue: 0,
        totalPaidAmount: 0,
        totalPendingAmount: 0,
      });
    });

    it('should handle errors in getRevenueAggregation', async () => {
      const matchStage = { removed: { $ne: true } };
      const error = new Error('Aggregation error');

      invoiceModel.aggregate.mockImplementation(() => {
        throw error;
      });

      await expect(
        repository.getRevenueAggregation(matchStage),
      ).rejects.toThrow(error);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error getting revenue aggregation:',
        error,
      );
    });
  });

  describe('getInvoicesByStatus', () => {
    it('should return invoices grouped by status', async () => {
      const matchStage = { removed: { $ne: true } };
      const mockResult = [
        { _id: 'sent', count: 20 },
        { _id: 'paid', count: 60 },
        { _id: 'overdue', count: 20 },
      ];

      const mockAggregate = {
        exec: jest.fn().mockResolvedValue(mockResult),
      } as any;

      invoiceModel.aggregate.mockReturnValue(mockAggregate);

      const result = await repository.getInvoicesByStatus(matchStage);

      expect(result).toEqual({
        sent: 20,
        paid: 60,
        overdue: 20,
      });

      expect(invoiceModel.aggregate).toHaveBeenCalledWith([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
    });

    it('should handle errors in getInvoicesByStatus', async () => {
      const matchStage = { removed: { $ne: true } };
      const error = new Error('Status aggregation error');

      invoiceModel.aggregate.mockImplementation(() => {
        throw error;
      });

      await expect(repository.getInvoicesByStatus(matchStage)).rejects.toThrow(
        error,
      );
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error getting invoices by status:',
        error,
      );
    });
  });

  describe('getTopClientsByRevenue', () => {
    it('should return top clients by revenue', async () => {
      const matchStage = { removed: { $ne: true } };
      const limit = 10;
      const mockResult = [
        {
          _id: 'client1',
          name: 'Client 1',
          email: 'client1@example.com',
          totalInvoices: 15,
          totalAmount: 50000,
          lastInvoiceDate: new Date('2025-01-15'),
        },
        {
          _id: 'client2',
          name: 'Client 2',
          email: 'client2@example.com',
          totalInvoices: 10,
          totalAmount: 30000,
          lastInvoiceDate: new Date('2025-01-10'),
        },
      ];

      const mockAggregate = {
        exec: jest.fn().mockResolvedValue(mockResult),
      } as any;

      invoiceModel.aggregate.mockReturnValue(mockAggregate);

      const result = await repository.getTopClientsByRevenue(matchStage, limit);

      expect(result).toEqual(mockResult);
      expect(invoiceModel.aggregate).toHaveBeenCalledWith([
        { $match: matchStage },
        {
          $lookup: {
            from: 'clients',
            localField: 'client',
            foreignField: '_id',
            as: 'clientInfo',
          },
        },
        { $unwind: '$clientInfo' },
        {
          $group: {
            _id: '$client',
            name: { $first: '$clientInfo.name' },
            email: { $first: '$clientInfo.email' },
            totalInvoices: { $sum: 1 },
            totalAmount: { $sum: '$total' },
            lastInvoiceDate: { $max: '$date' },
          },
        },
        { $sort: { totalAmount: -1 } },
        { $limit: limit },
      ]);
    });

    it('should use default limit when not provided', async () => {
      const matchStage = { removed: { $ne: true } };
      const mockAggregate = {
        exec: jest.fn().mockResolvedValue([]),
      } as any;

      invoiceModel.aggregate.mockReturnValue(mockAggregate);

      await repository.getTopClientsByRevenue(matchStage);

      expect(invoiceModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ $limit: 10 })]),
      );
    });
  });

  describe('getClientInsightsAggregation', () => {
    it('should return client insights with payment behavior analysis', async () => {
      const matchStage = { removed: { $ne: true } };
      const limit = 20;
      const mockResult = [
        {
          _id: 'client1',
          name: 'Client 1',
          email: 'client1@example.com',
          totalInvoices: 10,
          totalAmount: 25000,
          paidInvoices: 9,
          averageInvoiceAmount: 2500,
          paymentBehavior: 'excellent',
        },
      ];

      const mockAggregate = {
        exec: jest.fn().mockResolvedValue(mockResult),
      } as any;

      invoiceModel.aggregate.mockReturnValue(mockAggregate);

      const result = await repository.getClientInsightsAggregation(
        matchStage,
        limit,
      );

      expect(result).toEqual(mockResult);
      expect(invoiceModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          { $match: matchStage },
          expect.objectContaining({
            $lookup: {
              from: 'clients',
              localField: 'client',
              foreignField: '_id',
              as: 'clientInfo',
            },
          }),
          { $unwind: '$clientInfo' },
          expect.objectContaining({
            $group: expect.objectContaining({
              _id: '$client',
              name: { $first: '$clientInfo.name' },
              email: { $first: '$clientInfo.email' },
              totalInvoices: { $sum: 1 },
              totalAmount: { $sum: '$total' },
              paidInvoices: {
                $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] },
              },
              avgAmount: { $avg: '$total' },
            }),
          }),
          expect.objectContaining({
            $addFields: expect.objectContaining({
              averageInvoiceAmount: { $round: ['$avgAmount', 2] },
              paymentBehavior: expect.any(Object),
            }),
          }),
          { $sort: { totalAmount: -1 } },
          { $limit: limit },
        ]),
      );
    });
  });

  describe('getOverdueInvoicesAmount', () => {
    it('should return total overdue amount', async () => {
      const matchStage = { removed: { $ne: true } };
      const mockResult = [{ totalOverdue: 15000 }];

      const mockAggregate = {
        exec: jest.fn().mockResolvedValue(mockResult),
      } as any;

      invoiceModel.aggregate.mockReturnValue(mockAggregate);

      const result = await repository.getOverdueInvoicesAmount(matchStage);

      expect(result).toBe(15000);
      expect(invoiceModel.aggregate).toHaveBeenCalledWith([
        { $match: { ...matchStage, status: 'overdue' } },
        {
          $group: {
            _id: null,
            totalOverdue: { $sum: '$total' },
          },
        },
      ]);
    });

    it('should return 0 when no overdue invoices found', async () => {
      const matchStage = { removed: { $ne: true } };
      const mockAggregate = {
        exec: jest.fn().mockResolvedValue([]),
      } as any;

      invoiceModel.aggregate.mockReturnValue(mockAggregate);

      const result = await repository.getOverdueInvoicesAmount(matchStage);

      expect(result).toBe(0);
    });
  });
});
