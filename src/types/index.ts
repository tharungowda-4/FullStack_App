export interface Driver {
  _id?: string;
  name: string;
  currentShiftHours: number;
  pastWeekHours: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Route {
  _id?: string;
  name: string;
  distanceKm: number;
  trafficLevel: 'Low' | 'Medium' | 'High';
  baseTimeMinutes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  _id?: string;
  valueRs: number;
  routeId: string;
  deliveryTimestamp: Date;
  status: 'Pending' | 'In Progress' | 'Delivered' | 'Late';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SimulationParams {
  numberOfDrivers: number;
  routeStartTime: string;
  maxHoursPerDriver: number;
}

export interface SimulationResult {
  _id?: string;
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
  simulationParams: SimulationParams;
}

export interface KPIData {
  totalProfit: number;
  efficiencyScore: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  fuelCostBreakdown: {
    baseCost: number;
    trafficSurcharge: number;
    total: number;
  };
}

export interface User {
  _id?: string;
  username: string;
  role: 'admin';
  createdAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}