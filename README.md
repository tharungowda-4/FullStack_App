# GreenCart Logistics - Delivery Simulation & KPI Dashboard

A comprehensive full-stack application for managing delivery operations, running simulations, and analyzing KPIs for logistics optimization.

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Axios** for API communication
- **React Router** for navigation
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** authentication with bcrypt
- **Joi** for request validation
- **CSV parsing** for initial data loading

### Database
- **MongoDB Atlas** (cloud) or local MongoDB
- Collections: Drivers, Routes, Orders, SimulationResults, Users

## 📋 Features

### Core Functionality
- **JWT Authentication** - Admin login with secure token-based auth
- **Dashboard** - Real-time KPI display with interactive charts
- **Simulation Engine** - Delivery optimization with configurable parameters
- **CRUD Management** - Full management of drivers, routes, and orders
- **History Tracking** - Detailed simulation history with analytics

### Simulation Logic
- **Late Delivery Penalty**: ₹50 if delivery > base time + 10 minutes
- **Driver Fatigue Rule**: >8 hours/day → 30% speed decrease
- **High-Value Bonus**: Orders >₹1000 delivered on-time → +10% bonus
- **Fuel Cost Calculation**: ₹5/km base + ₹2/km traffic surcharge for high traffic

### Charts & Analytics
- Profit trends over time
- Delivery performance (on-time vs late)
- Fuel cost breakdown
- Efficiency score tracking

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB installation

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup
```bash
npm install
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## 📊 Sample Data

The application automatically loads sample data on first startup:
- **10 Drivers** with varying shift hours and experience
- **10 Routes** with different distances and traffic levels
- **10 Orders** with various values and delivery requirements

## 🔐 Default Credentials

- **Username**: admin
- **Password**: admin123

## 📱 Usage Guide

### Running Simulations
1. Navigate to the Simulation page
2. Configure parameters:
   - Number of drivers (1-50)
   - Route start time (HH:mm format)
   - Max hours per driver (1-24)
3. Click "Run Simulation"
4. View results on the Dashboard

### Managing Data
- **Drivers**: Add/edit driver information and work hours
- **Routes**: Configure routes with distance, traffic, and timing
- **Orders**: Manage delivery orders with values and schedules

### Analyzing Performance
- **Dashboard**: View real-time KPIs and charts
- **History**: Track simulation trends over time
- **Analytics**: Compare performance across different time periods

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React contexts (Auth)
│   ├── pages/           # Page components
│   ├── services/        # API service layer
│   ├── types/           # TypeScript definitions
│   └── utils/           # Utility functions

backend/
├── src/
│   ├── config/          # Database configuration
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic services
│   └── utils/           # Utility functions
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Data Management
- `GET/POST/PUT/DELETE /api/drivers` - Driver CRUD
- `GET/POST/PUT/DELETE /api/routes` - Route CRUD
- `GET/POST/PUT/DELETE /api/orders` - Order CRUD

### Simulation
- `POST /api/simulation/run` - Execute simulation
- `GET /api/simulation/history` - Get simulation history
- `GET /api/simulation/kpis` - Get current KPI data

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

Test coverage includes:
- Simulation logic validation
- KPI calculation accuracy
- Authentication flow
- CRUD operations

## 🚀 Deployment

### Backend (Render)
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables

### Frontend (Vercel)
1. Import project to Vercel
2. Set framework preset to "Vite"
3. Add environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Configure database access
3. Add connection string to environment variables

## 🔒 Security Features

- **JWT Authentication** with secure token expiration
- **Password Hashing** using bcrypt with salt rounds
- **Request Validation** with Joi schemas
- **Rate Limiting** to prevent abuse
- **CORS Protection** with whitelist
- **Helmet.js** for security headers

## 📈 Performance Optimizations

- **Code Splitting** with React.lazy()
- **API Response Caching** for frequent queries
- **Database Indexing** on frequently queried fields
- **Compressed Responses** with gzip
- **Optimized Bundle** with tree shaking

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify MongoDB URI in .env
- Check network access in MongoDB Atlas
- Ensure IP whitelist includes your deployment

**Authentication Errors**
- Verify JWT_SECRET is set
- Check token expiration settings
- Clear browser localStorage if needed

**Simulation Failures**
- Ensure sample data is loaded
- Check driver/route/order availability
- Verify simulation parameters are valid

## 👨‍💻 Development

### Code Style
- ESLint + Prettier for consistent formatting
- TypeScript strict mode enabled
- Conventional commit messages

### Adding Features
1. Create feature branch
2. Implement with tests
3. Update documentation
4. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests for any improvements.

---

For support or questions, please open an issue on GitHub.