#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Rosellea Setup...\n');

const checks = [];

// Check if required files exist
const requiredFiles = [
  'client/package.json',
  'client/vite.config.js',
  'client/.env',
  'client/src/App.jsx',
  'client/src/main.jsx',
  'client/public/images/placeholder.jpg',
  'server/package.json',
  'server/.env',
  'server/server.js',
  'server/database.js',
  'server/scripts/seedProducts.js'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  checks.push({
    name: `📁 ${file}`,
    status: exists,
    message: exists ? 'Found' : 'Missing'
  });
});

// Check package.json scripts
const rootPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const hasDevScript = rootPackage.scripts && rootPackage.scripts.dev;
checks.push({
  name: '📜 Root dev script',
  status: hasDevScript,
  message: hasDevScript ? 'Configured' : 'Missing'
});

// Check environment variables
const serverEnvPath = path.join(__dirname, 'server', '.env');
if (fs.existsSync(serverEnvPath)) {
  const serverEnv = fs.readFileSync(serverEnvPath, 'utf8');
  const hasMongoUri = serverEnv.includes('MONGODB_URI');
  const hasJwtSecret = serverEnv.includes('JWT_SECRET');
  
  checks.push({
    name: '🔐 MongoDB URI',
    status: hasMongoUri,
    message: hasMongoUri ? 'Configured' : 'Missing'
  });
  
  checks.push({
    name: '🔑 JWT Secret',
    status: hasJwtSecret,
    message: hasJwtSecret ? 'Configured' : 'Missing'
  });
}

// Display results
console.log('📋 Setup Verification Results:\n');

let allPassed = true;
checks.forEach(check => {
  const icon = check.status ? '✅' : '❌';
  console.log(`${icon} ${check.name}: ${check.message}`);
  if (!check.status) allPassed = false;
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Your setup is ready.');
  console.log('\n🚀 To start development:');
  console.log('   npm run dev');
  console.log('\n📊 To seed database:');
  console.log('   npm run seed');
} else {
  console.log('⚠️  Some issues found. Please fix them before proceeding.');
  console.log('\n📖 Check REPORT.md for detailed setup instructions.');
}

console.log('\n🌟 Rosellea E-commerce - Ready to Launch!');