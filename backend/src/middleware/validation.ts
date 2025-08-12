import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
export const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required()
});

export const driverSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  currentShiftHours: Joi.number().min(0).max(24).required(),
  pastWeekHours: Joi.number().min(0).max(168).required()
});

export const routeSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  distanceKm: Joi.number().min(0.1).max(1000).required(),
  trafficLevel: Joi.string().valid('Low', 'Medium', 'High').required(),
  baseTimeMinutes: Joi.number().min(1).max(1440).required()
});

export const orderSchema = Joi.object({
  valueRs: Joi.number().min(0.01).max(1000000).required(),
  routeId: Joi.string().required(),
  deliveryTimestamp: Joi.date().required(),
  status: Joi.string().valid('Pending', 'In Progress', 'Delivered', 'Late').optional()
});

export const simulationParamsSchema = Joi.object({
  numberOfDrivers: Joi.number().min(1).max(50).required(),
  routeStartTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  maxHoursPerDriver: Joi.number().min(1).max(24).required()
});