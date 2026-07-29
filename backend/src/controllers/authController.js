import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  countUsers,
  createUser,
  findUserByEmail
} from '../models/userModel.js';

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export const register = asyncHandler(async (req, res) => {
  const existing = await findUserByEmail(req.body.email);

  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const totalUsers = await countUsers();
  const role = totalUsers === 0 ? req.body.role || 'Admin' : 'Employee';
  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const user = await createUser({
    name: req.body.name,
    email: req.body.email,
    passwordHash,
    role,
    department: req.body.department
  });

  res.status(201).json({
    user,
    token: signToken(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const user = await findUserByEmail(req.body.email, true);

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password_hash);

  if (!validPassword) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  delete user.password_hash;

  res.json({
    user,
    token: signToken(user)
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.json({ message: 'Logged out successfully.' });
});
