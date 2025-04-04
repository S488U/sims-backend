export const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode || 500;
  return error;
};

export const handleDatabaseError = (err) => {
  if (err.code === 11000) {
    return createError("Duplicate Entry, item already exists in the database", 400);
  }

  if (err.name === "ValidationError") {
    return createError(
      Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
      400
    );
  }

  if (err.name === "CastError") {
    return createError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  return createError(err.message || "An unexpected database error occurred", 500);
};
