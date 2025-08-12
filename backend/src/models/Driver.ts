import mongoose, { Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  name: string;
  currentShiftHours: number;
  pastWeekHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<IDriver>({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  currentShiftHours: {
    type: Number,
    required: [true, 'Current shift hours is required'],
    min: [0, 'Hours cannot be negative'],
    max: [24, 'Hours cannot exceed 24']
  },
  pastWeekHours: {
    type: Number,
    required: [true, 'Past week hours is required'],
    min: [0, 'Hours cannot be negative'],
    max: [168, 'Hours cannot exceed 168 (7 days * 24 hours)']
  }
}, {
  timestamps: true
});

driverSchema.index({ name: 1 });

export default mongoose.model<IDriver>('Driver', driverSchema);