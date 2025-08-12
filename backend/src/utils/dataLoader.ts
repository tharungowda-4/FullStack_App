import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';
import Driver from '../models/Driver.js';
import Route from '../models/Route.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.URL);
const __dirname = path.dirname(__filename);

interface CSVDriver {
  name: string;
  currentShiftHours: string;
  pastWeekHours: string;
}

interface CSVRoute {
  name: string;
  distanceKm: string;
  trafficLevel: string;
  baseTimeMinutes: string;
}

interface CSVOrder {
  valueRs: string;
  routeName: string;
  deliveryDate: string;
  status?: string;
}

export const loadInitialData = async (): Promise<void> => {
  try {
    // Create default admin user
    await createDefaultUser();
    
    // Check if data already exists
    const driverCount = await Driver.countDocuments();
    const routeCount = await Route.countDocuments();
    const orderCount = await Order.countDocuments();
    
    if (driverCount > 0 && routeCount > 0 && orderCount > 0) {
      console.log('Initial data already exists, skipping CSV import');
      return;
    }

    // Load CSV data files
    const csvDataPath = path.join(__dirname, '../data');
    
    // Create sample CSV files if they don't exist
    await createSampleCSVFiles(csvDataPath);
    
    // Load drivers
    if (driverCount === 0) {
      await loadDriversFromCSV(path.join(csvDataPath, 'drivers.csv'));
    }
    
    // Load routes
    if (routeCount === 0) {
      await loadRoutesFromCSV(path.join(csvDataPath, 'routes.csv'));
    }
    
    // Load orders
    if (orderCount === 0) {
      await loadOrdersFromCSV(path.join(csvDataPath, 'orders.csv'));
    }
    
    console.log('✅ Initial data loaded successfully');
  } catch (error) {
    console.error('❌ Error loading initial data:', error);
  }
};

const createDefaultUser = async (): Promise<void> => {
  try {
    const existingUser = await User.findOne({ username: 'admin' });
    if (!existingUser) {
      const user = new User({
        username: 'admin',
        passwordHash: 'admin123', // Will be hashed by the pre-save middleware
        role: 'admin'
      });
      await user.save();
      console.log('✅ Default admin user created (username: admin, password: admin123)');
    }
  } catch (error) {
    console.error('❌ Error creating default user:', error);
  }
};

const createSampleCSVFiles = async (csvDataPath: string): Promise<void> => {
  // Ensure data directory exists
  if (!fs.existsSync(csvDataPath)) {
    fs.mkdirSync(csvDataPath, { recursive: true });
  }

  // Sample drivers data
  const driversCSV = `name,currentShiftHours,pastWeekHours
John Doe,6.5,42
Jane Smith,8.2,45
Mike Johnson,4.3,38
Sarah Wilson,7.8,40
David Brown,5.2,35
Emily Davis,6.9,44
Chris Taylor,8.5,48
Lisa Anderson,3.7,32
Tom Wilson,7.1,41
Anna Martinez,5.8,36`;

  // Sample routes data
  const routesCSV = `name,distanceKm,trafficLevel,baseTimeMinutes
Downtown to Mall,12.5,High,45
Airport Route,25.3,Medium,65
Suburban Loop,8.7,Low,30
Industrial Zone,15.2,High,55
City Center Express,6.8,Medium,25
University District,9.4,Low,35
Business Park,18.6,Medium,60
Residential Area,11.3,Low,40
Shopping Complex,14.7,High,50
Medical District,7.2,Medium,28`;

  // Sample orders data
  const ordersCSV = `valueRs,routeName,deliveryDate,status
1250.00,Downtown to Mall,2024-01-15T10:30:00Z,Pending
750.50,Airport Route,2024-01-15T14:15:00Z,Pending
2100.75,Suburban Loop,2024-01-15T09:00:00Z,In Progress
890.25,Industrial Zone,2024-01-15T16:45:00Z,Pending
1500.00,City Center Express,2024-01-15T11:20:00Z,Delivered
675.80,University District,2024-01-15T13:30:00Z,Pending
3200.50,Business Park,2024-01-15T08:45:00Z,In Progress
450.25,Residential Area,2024-01-15T15:10:00Z,Late
1800.90,Shopping Complex,2024-01-15T12:00:00Z,Pending
925.75,Medical District,2024-01-15T17:30:00Z,Pending`;

  const driversPath = path.join(csvDataPath, 'drivers.csv');
  const routesPath = path.join(csvDataPath, 'routes.csv');
  const ordersPath = path.join(csvDataPath, 'orders.csv');

  if (!fs.existsSync(driversPath)) {
    fs.writeFileSync(driversPath, driversCSV);
  }
  if (!fs.existsSync(routesPath)) {
    fs.writeFileSync(routesPath, routesCSV);
  }
  if (!fs.existsSync(ordersPath)) {
    fs.writeFileSync(ordersPath, ordersCSV);
  }
};

const loadDriversFromCSV = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const drivers: CSVDriver[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: CSVDriver) => {
        drivers.push(data);
      })
      .on('end', async () => {
        try {
          for (const driverData of drivers) {
            const driver = new Driver({
              name: driverData.name,
              currentShiftHours: parseFloat(driverData.currentShiftHours),
              pastWeekHours: parseFloat(driverData.pastWeekHours)
            });
            await driver.save();
          }
          console.log(`✅ Loaded ${drivers.length} drivers from CSV`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
};

const loadRoutesFromCSV = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const routes: CSVRoute[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: CSVRoute) => {
        routes.push(data);
      })
      .on('end', async () => {
        try {
          for (const routeData of routes) {
            const route = new Route({
              name: routeData.name,
              distanceKm: parseFloat(routeData.distanceKm),
              trafficLevel: routeData.trafficLevel as 'Low' | 'Medium' | 'High',
              baseTimeMinutes: parseInt(routeData.baseTimeMinutes)
            });
            await route.save();
          }
          console.log(`✅ Loaded ${routes.length} routes from CSV`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
};

const loadOrdersFromCSV = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const orders: CSVOrder[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: CSVOrder) => {
        orders.push(data);
      })
      .on('end', async () => {
        try {
          const routes = await Route.find();
          const routeMap = new Map(routes.map(route => [route.name, route._id]));

          for (const orderData of orders) {
            const routeId = routeMap.get(orderData.routeName);
            if (!routeId) {
              console.warn(`Route "${orderData.routeName}" not found, skipping order`);
              continue;
            }

            const order = new Order({
              valueRs: parseFloat(orderData.valueRs),
              routeId: routeId,
              deliveryTimestamp: new Date(orderData.deliveryDate),
              status: orderData.status || 'Pending'
            });
            await order.save();
          }
          console.log(`✅ Loaded ${orders.length} orders from CSV`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
};