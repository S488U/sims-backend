import express from "express";

const router = express.Router();

function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 3600));
  seconds %= 24 * 3600;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

router.get("/", (req, res) => {
  res.status(200).json({
    message: "working",
    status: "200",
    uptime: formatUptime(process.uptime()),
    endpointsList: `${req.protocol}://${req.get("host")}${req.originalUrl}endpoints.txt`,
    API_DOC: "https://documenter.getpostman.com/view/32326364/2sB2cUANcX",
  });
});

export default router;
