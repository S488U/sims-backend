import { handleDatabaseError } from "../utils/errorUtils.js";

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    const formattedError = handleDatabaseError(err);
    next(formattedError);
  });
};
