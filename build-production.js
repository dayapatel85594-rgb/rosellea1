#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🏗️  Building Rosellea for Production...\n');

// Check if .env files exist
const serverEnvPath = join(__dirname, 'server', '.env');
const clientEnvPath = join(__dirname, 'client', '.env');

if (!fs.existsSync(serverEnvPath)) {
  console.error('❌ Server .env file not found.');
  process.exit(1);
}

if (!fs.existsSync(clientEnvPath)) {
  console.error('❌ Client .env file not found.');
  process.exit(1);
}

// Build client
console.log('📦 Building client...');
const clientBuild = spawn('npm', ['run', 'build'], {
  cwd: join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

clientBuild.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Client build completed successfully!');
    console.log('\n🚀 Production build ready!');
    console.log('\n📋 To deploy:');
    console.log('   1. Upload the entire project to your server');
    console.log('   2. Set NODE_ENV=production in server/.env');
    console.log('   3. Run: npm run start');
    console.log('\n🌟 Rosellea is ready for production!');
  } else {
    console.error('❌ Client build failed');
    process.exit(1);
  }
});

clientBuild.on('error', (err) => {
  console.error('❌ Build error:', err);
  process.exit(1);
});