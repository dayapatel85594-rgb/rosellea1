#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Rosellea Development Environment...\n');

// Check if .env files exist
const serverEnvPath = join(__dirname, 'server', '.env');
const clientEnvPath = join(__dirname, 'client', '.env');

if (!fs.existsSync(serverEnvPath)) {
  console.error('❌ Server .env file not found. Please create server/.env with required variables.');
  process.exit(1);
}

if (!fs.existsSync(clientEnvPath)) {
  console.error('❌ Client .env file not found. Please create client/.env with VITE_API_URL=/api');
  process.exit(1);
}

// Start server
console.log('🔧 Starting backend server...');
const server = spawn('npm', ['run', 'dev'], {
  cwd: join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// Wait a bit for server to start
setTimeout(() => {
  console.log('🎨 Starting frontend client...');
  const client = spawn('npm', ['run', 'dev'], {
    cwd: join(__dirname, 'client'),
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development environment...');
    server.kill('SIGINT');
    client.kill('SIGINT');
    process.exit(0);
  });

  client.on('error', (err) => {
    console.error('❌ Client error:', err);
  });

}, 3000);

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

console.log('\n✅ Development environment starting...');
console.log('📡 Backend: http://localhost:5000');
console.log('🎨 Frontend: http://localhost:5173');
console.log('\nPress Ctrl+C to stop both servers\n');