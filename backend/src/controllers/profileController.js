import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  findUserByEmail,
  findUserById,
  updatePassword,
  updateUser
} from '../models/userModel.js';

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateUser(req.user.id, {
    name: req.body.name,
    department: req.body.department
  });

  res.json({ user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await findUserByEmail(req.user.email, true);
  const validPassword = await bcrypt.compare(req.body.currentPassword, user.password_hash);

  if (!validPassword) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  const passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  await updatePassword(req.user.id, passwordHash);

  res.json({ message: 'Password changed successfully.' });
});

export const refreshProfile = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  res.json({ user });
});
