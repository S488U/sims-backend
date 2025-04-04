export const appLogger = (req, res, next) => {
  console.log(
    `[Log]: ${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`
  );
  next();
};
