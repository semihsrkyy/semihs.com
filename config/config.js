module.exports = {
  app: {
    name: 'VFS Global Monitor',
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development'
  },
  vfsGlobal: {
    baseUrl: 'https://www.vfs.com',
    countries: [
      'Turkey',
      'India',
      'Pakistan',
      'Bangladesh',
      'Nepal',
      'Sri Lanka'
    ],
    checkInterval: 60000 // Check every 60 seconds
  },
  database: {
    mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/vfs-monitor'
  },
  bot: {
    maxRetries: 3,
    timeout: 30000
  }
};