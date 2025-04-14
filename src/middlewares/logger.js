import chalk from "chalk";

export const appLogger = (req, res, next) => {
  const methodColor = {
    GET: chalk.green.bold,
    POST: chalk.yellow.bold,
    PUT: chalk.blue.bold,
    DELETE: chalk.red.bold,
    PATCH: chalk.magenta.bold,
    DEFAULT: chalk.white.bold
  };

  const colorizeMethod = methodColor[req.method] || methodColor.DEFAULT;

  console.log(`\n${chalk.green.bold('[Log]:')} ${colorizeMethod(req.method)} ${chalk.cyan(`${req.protocol}://${req.get("host")}${req.originalUrl}`)}`);

  next();
};
