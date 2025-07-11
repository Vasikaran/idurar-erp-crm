import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ collection: 'invoices', timestamps: true })
export class Invoice {
  @Prop({ required: true })
  number: number;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  status: string;

  @Prop()
  paymentStatus: string;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  subTotal: number;

  @Prop({ required: true })
  taxTotal: number;

  @Prop({ required: true })
  taxRate: number;

  @Prop({ default: 0 })
  credit: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  date: Date;

  @Prop()
  expiredDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Client' })
  client: Types.ObjectId;

  @Prop({ type: Array, default: [] })
  items: Array<{
    itemName: string;
    description: string;
    quantity: number;
    price: number;
    total: number;
    notes?: string;
  }>;

  @Prop()
  notesSummary: string;

  @Prop()
  summaryGeneratedAt: Date;

  @Prop({ default: false })
  removed: boolean;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
