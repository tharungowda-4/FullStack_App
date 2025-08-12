import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Settings } from 'lucide-react';
import { simulationAPI } from '../services/api';
import { SimulationParams } from '../types';
import Button from '../components/UI/Button';
import toast, { Toaster } from 'react-hot-toast';

const Simulation: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useState<SimulationParams>({
    numberOfDrivers: 5,
    routeStartTime: '09:00',
    maxHoursPerDriver: 8
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: name === 'numberOfDrivers' || name === 'maxHoursPerDriver' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (params.numberOfDrivers < 1 || params.numberOfDrivers > 50) {
      toast.error('Number of drivers must be between 1 and 50');
      return;
    }
    
    if (params.maxHoursPerDriver < 1 || params.maxHoursPerDriver > 24) {
      toast.error('Max hours per driver must be between 1 and 24');
      return;
    }

    if (!params.routeStartTime) {
      toast.error('Please select a route start time');
      return;
    }

    setIsLoading(true);
    try {
      const result = await simulationAPI.run(params);
      toast.success('Simulation completed successfully!');
      
      // Navigate to dashboard to view results
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Simulation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const presetConfigurations = [
    {
      name: 'Peak Hours',
      params: { numberOfDrivers: 10, routeStartTime: '08:00', maxHoursPerDriver: 10 }
    },
    {
      name: 'Off Peak',
      params: { numberOfDrivers: 5, routeStartTime: '14:00', maxHoursPerDriver: 6 }
    },
    {
      name: 'Night Shift',
      params: { numberOfDrivers: 3, routeStartTime: '22:00', maxHoursPerDriver: 8 }
    }
  ];

  const applyPreset = (presetParams: SimulationParams) => {
    setParams(presetParams);
    toast.success('Preset configuration applied');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Toaster position="top-right" />
      
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Delivery Simulation</h1>
        <p className="text-gray-600">
          Configure simulation parameters and run delivery optimization
        </p>
      </div>

      {/* Preset Configurations */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Quick Presets</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presetConfigurations.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.params)}
              className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border"
            >
              <p className="font-medium text-gray-900">{preset.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {preset.params.numberOfDrivers} drivers, {preset.params.routeStartTime}, {preset.params.maxHoursPerDriver}h max
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Simulation Parameters
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="numberOfDrivers" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Available Drivers
            </label>
            <input
              type="number"
              id="numberOfDrivers"
              name="numberOfDrivers"
              min="1"
              max="50"
              value={params.numberOfDrivers}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Range: 1-50 drivers
            </p>
          </div>

          <div>
            <label htmlFor="routeStartTime" className="block text-sm font-medium text-gray-700 mb-2">
              Route Start Time
            </label>
            <input
              type="time"
              id="routeStartTime"
              name="routeStartTime"
              value={params.routeStartTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              When drivers begin their routes
            </p>
          </div>

          <div>
            <label htmlFor="maxHoursPerDriver" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Hours per Driver per Day
            </label>
            <input
              type="number"
              id="maxHoursPerDriver"
              name="maxHoursPerDriver"
              min="1"
              max="24"
              value={params.maxHoursPerDriver}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Range: 1-24 hours (drivers with &gt;8 hours experience 30% speed decrease)
            </p>
          </div>

          <Button
            type="submit"
            className="w-full flex items-center justify-center space-x-2"
            isLoading={isLoading}
            size="lg"
          >
            <Play className="h-5 w-5" />
            <span>Run Simulation</span>
          </Button>
        </form>
      </div>

      {/* Simulation Rules */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">Simulation Rules</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Late Delivery Penalty: ₹50 if delivery exceeds base route time + 10 minutes</li>
          <li>• Driver Fatigue: Drivers working &gt;8 hours experience 30% speed decrease next day</li>
          <li>• High-Value Bonus: Orders &gt;₹1000 delivered on-time receive +10% bonus</li>
          <li>• Fuel Cost: ₹5/km base rate + ₹2/km surcharge for high traffic routes</li>
        </ul>
      </div>
    </div>
  );
};

export default Simulation;