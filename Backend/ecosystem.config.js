module.exports = {
  apps: [
    {
      name: "vikas-backend",
      script: "dist/src/main.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};