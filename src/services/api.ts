import axios from 'axios';
import { AuthResponse, Driver, Route, Order, SimulationParams, SimulationResult, KPIData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login', { username, password }).then(res => res.data),
  
  verifyToken: (): Promise<{ user: any }> =>
    api.get('/auth/verify').then(res => res.data)
};

// Drivers API
export const driversAPI = {
  getAll: (): Promise<Driver[]> =>
    api.get('/drivers').then(res => res.data),
  
  getById: (id: string): Promise<Driver> =>
    api.get(`/drivers/${id}`).then(res => res.data),
  
  create: (driver: Omit<Driver, '_id'>): Promise<Driver> =>
    api.post('/drivers', driver).then(res => res.data),
  
  update: (id: string, driver: Partial<Driver>): Promise<Driver> =>
    api.put(`/drivers/${id}`, driver).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/drivers/${id}`)
};

// Routes API
export const routesAPI = {
  getAll: (): Promise<Route[]> =>
    api.get('/routes').then(res => res.data),
  
  getById: (id: string): Promise<Route> =>
    api.get(`/routes/${id}`).then(res => res.data),
  
  create: (route: Omit<Route, '_id'>): Promise<Route> =>
    api.post('/routes', route).then(res => res.data),
  
  update: (id: string, route: Partial<Route>): Promise<Route> =>
    api.put(`/routes/${id}`, route).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/routes/${id}`)
};

// Orders API
export const ordersAPI = {
  getAll: (): Promise<Order[]> =>
    api.get('/orders').then(res => res.data),
  
  getById: (id: string): Promise<Order> =>
    api.get(`/orders/${id}`).then(res => res.data),
  
  create: (order: Omit<Order, '_id'>): Promise<Order> =>
    api.post('/orders', order).then(res => res.data),
  
  update: (id: string, order: Partial<Order>): Promise<Order> =>
    api.put(`/orders/${id}`, order).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/orders/${id}`)
};

// Simulation API
export const simulationAPI = {
  run: (params: SimulationParams): Promise<SimulationResult> =>
    api.post('/simulation/run', params).then(res => res.data),
  
  getHistory: (): Promise<SimulationResult[]> =>
    api.get('/simulation/history').then(res => res.data),
  
  getKPIs: (): Promise<KPIData> =>
    api.get('/simulation/kpis').then(res => res.data)
};