import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listUsers, updateUser } from '../models/userModel.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await listUsers({
    role: req.query.role,
    department: req.query.department,
    search: req.query.search
  });

  res.json({ data: users });
});

export const patchUser = asyncHandler(async (req, res) => {
  const user = await updateUser(req.params.id, req.body);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  res.json({ user });
});
