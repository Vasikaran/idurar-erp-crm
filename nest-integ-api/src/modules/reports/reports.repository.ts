/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { Client, ClientDocument } from './schemas/client.schema';

@Injectable()
export class ReportsRepository {
  private readonly logger = new Logger(ReportsRepository.name);

  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  async countInvoices(matchStage: any): Promise<number> {
    try {
      return await this.invoiceModel.countDocuments(matchStage);
    } catch (error) {
      this.logger.error('Error counting invoices:', error);
      throw error;
    }
  }

  async getRevenueAggregation(matchStage: any): Promise<any> {
    try {
      const pipeline = [
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
      ];

      const result = await this.invoiceModel
        .aggregate(pipeline as any[])
        .exec();
      return (
        result[0] || {
          totalRevenue: 0,
          totalPaidAmount: 0,
          totalPendingAmount: 0,
        }
      );
    } catch (error) {
      this.logger.error('Error getting revenue aggregation:', error);
      throw error;
    }
  }

  async getInvoicesByStatus(matchStage: any): Promise<Record<string, number>> {
    try {
      const pipeline = [
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ];

      const result = await this.invoiceModel
        .aggregate(pipeline as any[])
        .exec();
      return result.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
    } catch (error) {
      this.logger.error('Error getting invoices by status:', error);
      throw error;
    }
  }

  async getInvoicesByMonth(matchStage: any): Promise<Record<string, number>> {
    try {
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ];

      const result = await this.invoiceModel
        .aggregate(pipeline as any[])
        .exec();
      return result.reduce((acc, item) => {
        const key = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
        acc[key] = item.count;
        return acc;
      }, {});
    } catch (error) {
      this.logger.error('Error getting invoices by month:', error);
      throw error;
    }
  }

  async getTopClientsByRevenue(
    matchStage: any,
    limit: number = 10,
  ): Promise<any[]> {
    try {
      const pipeline = [
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
      ];

      return await this.invoiceModel.aggregate(pipeline as any[]).exec();
    } catch (error) {
      this.logger.error('Error getting top clients:', error);
      throw error;
    }
  }

  async getPaymentStatusSummary(
    matchStage: any,
  ): Promise<Record<string, { count: number; amount: number }>> {
    try {
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
            amount: { $sum: '$total' },
          },
        },
      ];

      const result = await this.invoiceModel
        .aggregate(pipeline as any[])
        .exec();
      return result.reduce((acc, item) => {
        acc[item._id] = { count: item.count, amount: item.amount };
        return acc;
      }, {});
    } catch (error) {
      this.logger.error('Error getting payment status summary:', error);
      throw error;
    }
  }

  async getClientInsightsAggregation(
    matchStage: any,
    limit: number = 20,
  ): Promise<any[]> {
    try {
      const pipeline = [
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
            paidInvoices: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] },
            },
            avgAmount: { $avg: '$total' },
          },
        },
        {
          $addFields: {
            averageInvoiceAmount: { $round: ['$avgAmount', 2] },
            paymentBehavior: {
              $cond: [
                {
                  $gte: [{ $divide: ['$paidInvoices', '$totalInvoices'] }, 0.8],
                },
                'excellent',
                {
                  $cond: [
                    {
                      $gte: [
                        { $divide: ['$paidInvoices', '$totalInvoices'] },
                        0.6,
                      ],
                    },
                    'good',
                    'needs_attention',
                  ],
                },
              ],
            },
          },
        },
        { $sort: { totalAmount: -1 } },
        { $limit: limit },
      ];

      return await this.invoiceModel.aggregate(pipeline as any[]).exec();
    } catch (error) {
      this.logger.error('Error getting client insights:', error);
      throw error;
    }
  }

  async getRevenueByCurrency(matchStage: any): Promise<Record<string, number>> {
    try {
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$currency',
            amount: { $sum: '$total' },
          },
        },
      ];

      const result = await this.invoiceModel
        .aggregate(pipeline as any[])
        .exec();
      return result.reduce((acc, item) => {
        acc[item._id] = item.amount;
        return acc;
      }, {});
    } catch (error) {
      this.logger.error('Error getting revenue by currency:', error);
      throw error;
    }
  }

  async getMonthlyRevenueTrend(matchStage: any): Promise<any[]> {
    try {
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            revenue: { $sum: '$total' },
            invoiceCount: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
          $project: {
            month: {
              $dateToString: {
                format: '%Y-%m',
                date: {
                  $dateFromParts: {
                    year: '$_id.year',
                    month: '$_id.month',
                  },
                },
              },
            },
            revenue: 1,
            invoiceCount: 1,
          },
        },
      ];

      return await this.invoiceModel.aggregate(pipeline as any[]).exec();
    } catch (error) {
      this.logger.error('Error getting monthly revenue trend:', error);
      throw error;
    }
  }

  async getRevenueByStatus(matchStage: any): Promise<Record<string, number>> {
    try {
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            amount: { $sum: '$total' },
          },
        },
      ];

      const result = await this.invoiceModel
        .aggregate(pipeline as any[])
        .exec();
      return result.reduce((acc, item) => {
        acc[item._id] = item.amount;
        return acc;
      }, {});
    } catch (error) {
      this.logger.error('Error getting revenue by status:', error);
      throw error;
    }
  }

  async getOverdueInvoicesAmount(matchStage: any): Promise<number> {
    try {
      const overdueMatchStage = {
        ...matchStage,
        status: 'overdue',
      };

      const pipeline = [
        { $match: overdueMatchStage },
        {
          $group: {
            _id: null,
            totalOverdue: { $sum: '$total' },
          },
        },
      ];

      const result = await this.invoiceModel
        .aggregate(pipeline as any[])
        .exec();
      return result[0]?.totalOverdue || 0;
    } catch (error) {
      this.logger.error('Error getting overdue invoices amount:', error);
      throw error;
    }
  }
}
