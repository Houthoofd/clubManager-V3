module.exports = {
  apps: [
    {
      name: "clubmanager-backend",
      script: "./dist/server.js",
      cwd: "/home/bartok-48/clubManager-V3/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env_production: {
        NODE_ENV: "production",
      },
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
