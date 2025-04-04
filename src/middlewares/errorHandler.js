export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[Error] : ${message} | ${statusCode}`);

  res.status(statusCode).json({
    success: false,
    error: {
      statusCode,
      message,
    },
  });
};
