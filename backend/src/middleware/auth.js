import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { findUserById } from '../models/userModel.js';
import { ApiError } from '../utils/ApiError.js';

export async function authenticate(req, _res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Authentication token is required.');
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await findUserById(payload.id);

    if (!user) {
      throw new ApiError(401, 'Authenticated user no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }

    next();
  };
}
