import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { ordersAPI, routesAPI } from '../services/api';
import { Order, Route } from '../types';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast, { Toaster } from 'react-hot-toast';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    valueRs: 0,
    routeId: '',
    deliveryTimestamp: '',
    status: 'Pending' as 'Pending' | 'In Progress' | 'Delivered' | 'Late'
  });

  useEffect(() => {
    Promise.all([fetchOrders(), fetchRoutes()]);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const data = await routesAPI.getAll();
      setRoutes(data);
    } catch (error) {
      toast.error('Failed to fetch routes');
    }
  };

  const resetForm = () => {
    setFormData({
      valueRs: 0,
      routeId: '',
      deliveryTimestamp: '',
      status: 'Pending'
    });
    setEditingOrder(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.valueRs <= 0) {
      toast.error('Order value must be greater than 0');
      return;
    }

    if (!formData.routeId) {
      toast.error('Please select a route');
      return;
    }

    if (!formData.deliveryTimestamp) {
      toast.error('Please select a delivery date and time');
      return;
    }

    try {
      const orderData = {
        ...formData,
        deliveryTimestamp: new Date(formData.deliveryTimestamp)
      };

      if (editingOrder) {
        await ordersAPI.update(editingOrder._id!, orderData);
        toast.success('Order updated successfully');
      } else {
        await ordersAPI.create(orderData);
        toast.success('Order created successfully');
      }
      
      fetchOrders();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      valueRs: order.valueRs,
      routeId: order.routeId,
      deliveryTimestamp: new Date(order.deliveryTimestamp).toISOString().slice(0, 16),
      status: order.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      await ordersAPI.delete(id);
      toast.success('Order deleted successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valueRs' ? parseFloat(value) || 0 : value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Late': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r._id === routeId);
    return route ? route.name : 'Unknown Route';
  };

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
          <Package className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Order</span>
        </Button>
      </div>

      {/* Order Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingOrder ? 'Edit Order' : 'Add New Order'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Value (₹)
                </label>
                <input
                  type="number"
                  name="valueRs"
                  value={formData.valueRs}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route
                </label>
                <select
                  name="routeId"
                  value={formData.routeId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a route</option>
                  {routes.map(route => (
                    <option key={route._id} value={route._id}>
                      {route.name} ({route.distanceKm}km)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="deliveryTimestamp"
                  value={formData.deliveryTimestamp}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Late">Late</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingOrder ? 'Update' : 'Create'}
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

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders found. Add your first order to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Order Value
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Route
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Delivery Time
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Priority
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">₹{order.valueRs.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getRouteName(order.routeId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(order.deliveryTimestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.valueRs > 1000 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.valueRs > 1000 ? 'High Value' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order._id!)}
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

export default Orders;