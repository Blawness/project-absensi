#!/usr/bin/env node

import { execSync } from 'child_process';

// Get port from environment or use default
const port = process.env.PORT || 3002;

// Log startup information
console.log('🚀 Starting Absensi Standalone Server');
console.log(`📍 Port: ${port}`);
console.log(`🌐 URL: http://localhost:${port}`);
console.log('');

// Execute Next.js start command with the specified port
try {
  execSync(`next start -p ${port}`, {
    stdio: 'inherit',
    env: { ...process.env, PORT: port }
  });
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}
