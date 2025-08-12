import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { History as HistoryIcon, TrendingUp, Calendar } from 'lucide-react';
import { simulationAPI } from '../services/api';
import { SimulationResult } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast, { Toaster } from 'react-hot-toast';

const History: React.FC = () => {
  const [history, setHistory] = useState<SimulationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await simulationAPI.getHistory();
      setHistory(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error: any) {
      toast.error('Failed to fetch simulation history');
    } finally {
      setIsLoading(false);
    }
  };

  const filterHistoryByTimeframe = (data: SimulationResult[]) => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedTimeframe) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.timestamp) >= cutoffDate);
  };

  const filteredHistory = filterHistoryByTimeframe(history);

  const formatChartData = (data: SimulationResult[]) => {
    return data.map((item, index) => ({
      index: index + 1,
      timestamp: new Date(item.timestamp).toLocaleDateString(),
      totalProfit: item.totalProfit,
      efficiencyScore: item.efficiencyScore,
      onTimeDeliveries: item.onTimeDeliveries,
      lateDeliveries: item.lateDeliveries,
      totalFuelCost: item.fuelCostBreakdown.total
    })).reverse(); // Reverse to show chronological order in charts
  };

  const chartData = formatChartData(filteredHistory);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <HistoryIcon className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Simulation History</h1>
        </div>
        
        {/* Timeframe Filter */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as 'all' | 'week' | 'month')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Time</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <HistoryIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No simulation history found. Run a simulation to see results here.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Simulations</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredHistory.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Profit</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{filteredHistory.length > 0 
                      ? (filteredHistory.reduce((sum, item) => sum + item.totalProfit, 0) / filteredHistory.length).toFixed(2)
                      : '0.00'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Efficiency</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredHistory.length > 0 
                      ? (filteredHistory.reduce((sum, item) => sum + item.efficiencyScore, 0) / filteredHistory.length).toFixed(1)
                      : '0.0'
                    }%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Trend */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Profit']} />
                    <Line 
                      type="monotone" 
                      dataKey="totalProfit" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Efficiency Trend */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Score Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Efficiency']} />
                    <Line 
                      type="monotone" 
                      dataKey="efficiencyScore" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Delivery Performance */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Performance</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="onTimeDeliveries" fill="#10B981" name="On Time" />
                    <Bar dataKey="lateDeliveries" fill="#EF4444" name="Late" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fuel Cost Trend */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Cost Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Fuel Cost']} />
                    <Line 
                      type="monotone" 
                      dataKey="totalFuelCost" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      dot={{ fill: '#F59E0B' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Simulations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">Date</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">Drivers</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">Start Time</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">Profit</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">Efficiency</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">Deliveries</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHistory.slice(0, 10).map((simulation) => (
                    <tr key={simulation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(simulation.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {simulation.simulationParams.numberOfDrivers}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {simulation.simulationParams.routeStartTime}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">
                        ₹{simulation.totalProfit.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600">
                        {simulation.efficiencyScore.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="text-green-600">{simulation.onTimeDeliveries}</span> / 
                        <span className="text-red-600 ml-1">{simulation.lateDeliveries}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default History;