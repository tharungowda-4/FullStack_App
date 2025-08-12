import { Router } from 'express';
import Order from '../models/Order.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest, orderSchema } from '../middleware/validation.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('routeId', 'name distanceKm trafficLevel')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('routeId', 'name distanceKm trafficLevel');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Create new order
router.post('/', validateRequest(orderSchema), async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    await order.populate('routeId', 'name distanceKm trafficLevel');
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Update order
router.put('/:id', validateRequest(orderSchema), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('routeId', 'name distanceKm trafficLevel');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Failed to update order' });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
});

export default router;