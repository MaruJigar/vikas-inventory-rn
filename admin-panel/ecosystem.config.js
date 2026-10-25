module.exports = {
  apps: [
    {
      name: "vikas-admin",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      cwd: "/var/www/vikas-inventory-rn/admin-panel",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
