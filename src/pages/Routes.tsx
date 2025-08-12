import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Route as RouteIcon, Navigation } from 'lucide-react';
import { routesAPI } from '../services/api';
import { Route } from '../types';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast, { Toaster } from 'react-hot-toast';

const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    distanceKm: 0,
    trafficLevel: 'Low' as 'Low' | 'Medium' | 'High',
    baseTimeMinutes: 0
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data = await routesAPI.getAll();
      setRoutes(data);
    } catch (error) {
      toast.error('Failed to fetch routes');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      distanceKm: 0,
      trafficLevel: 'Low',
      baseTimeMinutes: 0
    });
    setEditingRoute(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Route name is required');
      return;
    }

    if (formData.distanceKm <= 0) {
      toast.error('Distance must be greater than 0');
      return;
    }

    if (formData.baseTimeMinutes <= 0) {
      toast.error('Base time must be greater than 0');
      return;
    }

    try {
      if (editingRoute) {
        await routesAPI.update(editingRoute._id!, formData);
        toast.success('Route updated successfully');
      } else {
        await routesAPI.create(formData);
        toast.success('Route created successfully');
      }
      
      fetchRoutes();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      distanceKm: route.distanceKm,
      trafficLevel: route.trafficLevel,
      baseTimeMinutes: route.baseTimeMinutes
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) {
      return;
    }

    try {
      await routesAPI.delete(id);
      toast.success('Route deleted successfully');
      fetchRoutes();
    } catch (error) {
      toast.error('Failed to delete route');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'distanceKm' || name === 'baseTimeMinutes' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const calculateFuelCost = (route: Route) => {
    const baseCost = route.distanceKm * 5;
    const trafficSurcharge = route.trafficLevel === 'High' ? route.distanceKm * 2 : 0;
    return baseCost + trafficSurcharge;
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
          <Navigation className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Routes Management</h1>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Route</span>
        </Button>
      </div>

      {/* Route Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRoute ? 'Edit Route' : 'Add New Route'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Downtown to Mall"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance (km)
                </label>
                <input
                  type="number"
                  name="distanceKm"
                  value={formData.distanceKm}
                  onChange={handleChange}
                  min="0.1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Traffic Level
                </label>
                <select
                  name="trafficLevel"
                  value={formData.trafficLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Time (minutes)
                </label>
                <input
                  type="number"
                  name="baseTimeMinutes"
                  value={formData.baseTimeMinutes}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingRoute ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Routes List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {routes.length === 0 ? (
          <div className="text-center py-12">
            <RouteIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No routes found. Add your first route to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Route Name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Distance
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Traffic Level
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Base Time
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Est. Fuel Cost
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{route.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {route.distanceKm} km
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTrafficColor(route.trafficLevel)}`}>
                        {route.trafficLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {route.baseTimeMinutes} min
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ₹{calculateFuelCost(route).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(route)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(route._id!)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Routes;