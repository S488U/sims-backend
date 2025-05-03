function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

export const mainRoute = async (req, res, next) => {
    const baseUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const uptime = formatUptime(process.uptime());

    const html = `
  <!DOCTYPE html>
  <html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>API Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Space Grotesk', sans-serif;
      }
    </style>
  </head>
  <body class="bg-[#0f0f1a] text-white">
    <div class="min-h-screen flex items-center justify-center p-6">
      <div class="max-w-xl w-full bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-purple-700">
        <h1 class="text-3xl sm:text-4xl font-bold text-purple-400 mb-4">🚀 SIMS Server Status</h1>
        <p class="text-lg mb-2">✅ <span class="font-semibold">Message:</span> Working</p>
        <p class="text-lg mb-2">📡 <span class="font-semibold">Status:</span> 200 OK</p>
        <p class="text-lg mb-2">⏱️ <span class="font-semibold">Uptime:</span> ${uptime}</p>
        <p class="text-lg mb-2">📄 <span class="font-semibold">Endpoints List:</span> 
          <a href="${baseUrl}endpoints.txt" target="_blank" class="text-purple-400 underline">View Endpoints</a>
        </p>
        <p class="text-lg mb-2">📚 <span class="font-semibold">API Doc:</span> 
          <a href="https://documenter.getpostman.com/view/32326364/2sB2cUANcX" target="_blank" class="text-purple-400 underline">View Postman Docs</a>
        </p>
        <p class="text-lg mt-4">🖥️ <span class="font-semibold">Frontend Dashboard:</span> 
          <a href="https://sims-dashboard-front.vercel.app/" target="_blank" class="text-purple-400 underline">sims-dashboard-front.vercel.app</a>
        </p>
      </div>
    </div>
  </body>
  </html>
  `;

    res.status(200).send(html);

}