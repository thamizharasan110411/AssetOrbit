import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory
} from '../models/categoryModel.js';

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await listCategories();
  res.json({ data: categories });
});

export const postCategory = asyncHandler(async (req, res) => {
  const category = await createCategory(req.body);
  res.status(201).json({ category });
});

export const putCategory = asyncHandler(async (req, res) => {
  const category = await updateCategory(req.params.id, req.body);

  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }

  res.json({ category });
});

export const removeCategory = asyncHandler(async (req, res) => {
  const deleted = await deleteCategory(req.params.id);

  if (!deleted) {
    throw new ApiError(404, 'Category not found.');
  }

  res.json({ message: 'Category deleted successfully.' });
});
