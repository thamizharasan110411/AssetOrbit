import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export function validate(rules = []) {
  return [
    ...rules,
    (req, _res, next) => {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        throw new ApiError(422, 'Validation failed.', result.array());
      }

      next();
    }
  ];
}
