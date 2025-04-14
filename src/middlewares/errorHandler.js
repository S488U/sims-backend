import chalk from "chalk";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`${chalk.red.bold(`[Error] : ${message} | ${statusCode}`)}`);

  res.status(statusCode).json({
    success: false,
    error: {
      statusCode,
      message,
    },
  });
};
