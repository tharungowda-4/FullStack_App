import mongoose, { Document, Schema } from 'mongoose';

export interface IRoute extends Document {
  name: string;
  distanceKm: number;
  trafficLevel: 'Low' | 'Medium' | 'High';
  baseTimeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const routeSchema = new Schema<IRoute>({
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  distanceKm: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0.1, 'Distance must be at least 0.1 km'],
    max: [1000, 'Distance cannot exceed 1000 km']
  },
  trafficLevel: {
    type: String,
    required: [true, 'Traffic level is required'],
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: 'Traffic level must be Low, Medium, or High'
    }
  },
  baseTimeMinutes: {
    type: Number,
    required: [true, 'Base time is required'],
    min: [1, 'Base time must be at least 1 minute'],
    max: [1440, 'Base time cannot exceed 1440 minutes (24 hours)']
  }
}, {
  timestamps: true
});

routeSchema.index({ name: 1 });
routeSchema.index({ trafficLevel: 1 });

export default mongoose.model<IRoute>('Route', routeSchema);