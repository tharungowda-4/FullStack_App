import mongoose, { Document, Schema } from 'mongoose';

export interface ISimulationResult extends Document {
  timestamp: Date;
  totalProfit: number;
  efficiencyScore: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  fuelCostBreakdown: {
    baseCost: number;
    trafficSurcharge: number;
    total: number;
  };
  simulationParams: {
    numberOfDrivers: number;
    routeStartTime: string;
    maxHoursPerDriver: number;
  };
}

const simulationResultSchema = new Schema<ISimulationResult>({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  totalProfit: {
    type: Number,
    required: true
  },
  efficiencyScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  onTimeDeliveries: {
    type: Number,
    required: true,
    min: 0
  },
  lateDeliveries: {
    type: Number,
    required: true,
    min: 0
  },
  fuelCostBreakdown: {
    baseCost: {
      type: Number,
      required: true,
      min: 0
    },
    trafficSurcharge: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  simulationParams: {
    numberOfDrivers: {
      type: Number,
      required: true,
      min: 1
    },
    routeStartTime: {
      type: String,
      required: true
    },
    maxHoursPerDriver: {
      type: Number,
      required: true,
      min: 1,
      max: 24
    }
  }
}, {
  timestamps: false
});

simulationResultSchema.index({ timestamp: -1 });

export default mongoose.model<ISimulationResult>('SimulationResult', simulationResultSchema);