import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  valueRs: number;
  routeId: mongoose.Types.ObjectId;
  deliveryTimestamp: Date;
  status: 'Pending' | 'In Progress' | 'Delivered' | 'Late';
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  valueRs: {
    type: Number,
    required: [true, 'Order value is required'],
    min: [0.01, 'Order value must be at least 0.01'],
    max: [1000000, 'Order value cannot exceed 1,000,000']
  },
  routeId: {
    type: Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route ID is required']
  },
  deliveryTimestamp: {
    type: Date,
    required: [true, 'Delivery timestamp is required']
  },
  status: {
    type: String,
    required: [true, 'Order status is required'],
    enum: {
      values: ['Pending', 'In Progress', 'Delivered', 'Late'],
      message: 'Status must be Pending, In Progress, Delivered, or Late'
    },
    default: 'Pending'
  }
}, {
  timestamps: true
});

orderSchema.index({ routeId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ deliveryTimestamp: 1 });
orderSchema.index({ valueRs: 1 });

export default mongoose.model<IOrder>('Order', orderSchema);