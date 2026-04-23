import { app } from './app.js';
import { config } from './config.js';
import { prisma } from './lib/prisma.js';

const start = async () => {
  try {
    await prisma.$connect();
    app.listen(config.port, () => {
      console.log(`Health Platform API listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

start();
