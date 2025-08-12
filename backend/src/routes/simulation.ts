import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest, simulationParamsSchema } from '../middleware/validation.js';
import { SimulationEngine } from '../services/simulationEngine.js';
import SimulationResult from '../models/SimulationResult.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireAdmin);

const simulationEngine = new SimulationEngine();

// Run simulation
router.post('/run', validateRequest(simulationParamsSchema), async (req, res) => {
  try {
    const params = req.body;
    
    // Run simulation
    const result = await simulationEngine.runSimulation(params);
    
    // Save to database
    const simulationResult = new SimulationResult({
      ...result,
      simulationParams: params,
      timestamp: new Date()
    });
    
    await simulationResult.save();
    
    res.json(simulationResult);
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ 
      message: 'Simulation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get simulation history
router.get('/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const history = await SimulationResult.find()
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip(Number(offset));
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching simulation history:', error);
    res.status(500).json({ message: 'Failed to fetch simulation history' });
  }
});

// Get current KPIs (latest simulation results)
router.get('/kpis', async (req, res) => {
  try {
    const latestSimulation = await SimulationResult.findOne().sort({ timestamp: -1 });
    
    if (!latestSimulation) {
      // Return default KPI data if no simulations exist
      return res.json({
        totalProfit: 0,
        efficiencyScore: 0,
        onTimeDeliveries: 0,
        lateDeliveries: 0,
        fuelCostBreakdown: {
          baseCost: 0,
          trafficSurcharge: 0,
          total: 0
        }
      });
    }
    
    res.json({
      totalProfit: latestSimulation.totalProfit,
      efficiencyScore: latestSimulation.efficiencyScore,
      onTimeDeliveries: latestSimulation.onTimeDeliveries,
      lateDeliveries: latestSimulation.lateDeliveries,
      fuelCostBreakdown: latestSimulation.fuelCostBreakdown
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ message: 'Failed to fetch KPI data' });
  }
});

// Get simulation analytics
router.get('/analytics', async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { timestamp: { $gte: weekAgo } };
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = { timestamp: { $gte: monthAgo } };
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateFilter = { timestamp: { $gte: yearAgo } };
        break;
    }
    
    const analytics = await SimulationResult.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalSimulations: { $sum: 1 },
          avgProfit: { $avg: '$totalProfit' },
          maxProfit: { $max: '$totalProfit' },
          minProfit: { $min: '$totalProfit' },
          avgEfficiency: { $avg: '$efficiencyScore' },
          totalDeliveries: { $sum: { $add: ['$onTimeDeliveries', '$lateDeliveries'] } },
          totalOnTime: { $sum: '$onTimeDeliveries' },
          totalLate: { $sum: '$lateDeliveries' }
        }
      }
    ]);
    
    const result = analytics[0] || {
      totalSimulations: 0,
      avgProfit: 0,
      maxProfit: 0,
      minProfit: 0,
      avgEfficiency: 0,
      totalDeliveries: 0,
      totalOnTime: 0,
      totalLate: 0
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

export default router;