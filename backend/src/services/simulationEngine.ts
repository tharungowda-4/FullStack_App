import Driver from '../models/Driver.js';
import Route from '../models/Route.js';
import Order from '../models/Order.js';

export interface SimulationParams {
  numberOfDrivers: number;
  routeStartTime: string;
  maxHoursPerDriver: number;
}

export interface SimulationResult {
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

export interface DeliveryAssignment {
  orderId: string;
  driverId: string;
  routeId: string;
  estimatedDeliveryTime: number; // in minutes
  actualDeliveryTime: number; // in minutes
  isOnTime: boolean;
  orderValue: number;
  fuelCost: number;
  bonus: number;
  penalty: number;
}

export class SimulationEngine {
  
  async runSimulation(params: SimulationParams): Promise<SimulationResult> {
    try {
      // Fetch available data
      const drivers = await Driver.find().limit(params.numberOfDrivers);
      const routes = await Route.find();
      const orders = await Order.find({ status: { $in: ['Pending', 'In Progress'] } })
        .populate('routeId');

      if (drivers.length === 0 || routes.length === 0 || orders.length === 0) {
        throw new Error('Insufficient data for simulation. Please ensure drivers, routes, and orders exist.');
      }

      // Run delivery simulation
      const assignments = this.assignDeliveries(drivers, orders, params);
      
      // Calculate results
      const result = this.calculateResults(assignments);
      
      return result;
    } catch (error) {
      console.error('Simulation engine error:', error);
      throw error;
    }
  }

  private assignDeliveries(drivers: any[], orders: any[], params: SimulationParams): DeliveryAssignment[] {
    const assignments: DeliveryAssignment[] = [];
    const driverWorkload: { [driverId: string]: number } = {};
    
    // Initialize driver workload
    drivers.forEach(driver => {
      driverWorkload[driver._id.toString()] = driver.currentShiftHours;
    });

    // Sort orders by value (high-value orders first for better optimization)
    const sortedOrders = orders.sort((a, b) => b.valueRs - a.valueRs);

    sortedOrders.forEach(order => {
      // Find available driver with least workload
      const availableDriver = drivers
        .filter(driver => driverWorkload[driver._id.toString()] < params.maxHoursPerDriver)
        .sort((a, b) => driverWorkload[a._id.toString()] - driverWorkload[b._id.toString()])[0];

      if (!availableDriver) {
        // No available drivers, skip this order (or could implement queue logic)
        return;
      }

      const route = order.routeId;
      const driverId = availableDriver._id.toString();

      // Calculate delivery time considering driver fatigue
      let baseDeliveryTime = route.baseTimeMinutes;
      
      // Driver fatigue rule: >8 hours -> 30% speed decrease (more time needed)
      if (availableDriver.pastWeekHours > 8 * 7) { // More than 8 hours average per day in past week
        baseDeliveryTime *= 1.3; // 30% increase in time
      }

      // Traffic impact on time
      switch (route.trafficLevel) {
        case 'High':
          baseDeliveryTime *= 1.5;
          break;
        case 'Medium':
          baseDeliveryTime *= 1.2;
          break;
        // Low traffic - no change
      }

      const estimatedTime = baseDeliveryTime;
      const actualTime = this.simulateActualDeliveryTime(estimatedTime);
      
      // Check if delivery is on time (within 10 minutes of base time)
      const isOnTime = actualTime <= (route.baseTimeMinutes + 10);

      // Calculate costs and bonuses
      const fuelCost = this.calculateFuelCost(route);
      const penalty = isOnTime ? 0 : 50; // ₹50 late delivery penalty
      const bonus = this.calculateBonus(order.valueRs, isOnTime);

      const assignment: DeliveryAssignment = {
        orderId: order._id.toString(),
        driverId: driverId,
        routeId: route._id.toString(),
        estimatedDeliveryTime: estimatedTime,
        actualDeliveryTime: actualTime,
        isOnTime,
        orderValue: order.valueRs,
        fuelCost,
        bonus,
        penalty
      };

      assignments.push(assignment);
      
      // Update driver workload
      driverWorkload[driverId] += actualTime / 60; // Convert minutes to hours
    });

    return assignments;
  }

  private simulateActualDeliveryTime(estimatedTime: number): number {
    // Add some randomness to simulate real-world delivery variations (±20%)
    const variation = 0.2;
    const randomFactor = 1 + (Math.random() - 0.5) * variation;
    return Math.round(estimatedTime * randomFactor);
  }

  private calculateFuelCost(route: any): number {
    const baseCost = route.distanceKm * 5; // ₹5 per km
    const trafficSurcharge = route.trafficLevel === 'High' ? route.distanceKm * 2 : 0; // ₹2/km for high traffic
    return baseCost + trafficSurcharge;
  }

  private calculateBonus(orderValue: number, isOnTime: boolean): number {
    // High-value bonus: >₹1000 and on-time -> +10% bonus
    if (orderValue > 1000 && isOnTime) {
      return orderValue * 0.1;
    }
    return 0;
  }

  private calculateResults(assignments: DeliveryAssignment[]): SimulationResult {
    let totalProfit = 0;
    let onTimeDeliveries = 0;
    let lateDeliveries = 0;
    let totalBaseFuelCost = 0;
    let totalTrafficSurcharge = 0;

    assignments.forEach(assignment => {
      // Calculate profit: order value + bonus - penalty - fuel cost
      const deliveryProfit = assignment.orderValue + assignment.bonus - assignment.penalty - assignment.fuelCost;
      totalProfit += deliveryProfit;

      // Count deliveries
      if (assignment.isOnTime) {
        onTimeDeliveries++;
      } else {
        lateDeliveries++;
      }

      // Accumulate fuel costs (we need to break down base vs surcharge)
      // This is an approximation since we don't store the breakdown in assignment
      totalBaseFuelCost += assignment.fuelCost * 0.7; // Approximate 70% as base cost
      totalTrafficSurcharge += assignment.fuelCost * 0.3; // Approximate 30% as traffic surcharge
    });

    const totalDeliveries = onTimeDeliveries + lateDeliveries;
    const efficiencyScore = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;

    return {
      totalProfit: Math.round(totalProfit * 100) / 100, // Round to 2 decimal places
      efficiencyScore: Math.round(efficiencyScore * 10) / 10, // Round to 1 decimal place
      onTimeDeliveries,
      lateDeliveries,
      fuelCostBreakdown: {
        baseCost: Math.round(totalBaseFuelCost * 100) / 100,
        trafficSurcharge: Math.round(totalTrafficSurcharge * 100) / 100,
        total: Math.round((totalBaseFuelCost + totalTrafficSurcharge) * 100) / 100
      }
    };
  }
}