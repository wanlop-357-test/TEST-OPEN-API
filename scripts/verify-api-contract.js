#!/usr/bin/env node

const { execFileSync } = require('node:child_process');

/**
 * ฟังก์ชันรัน npm script และหยุดทันทีเมื่อ command ล้มเหลว
 *
 * @param {string} scriptName ชื่อ npm script ที่ต้องการรัน
 * @returns {void}
 */
function runScript(scriptName) {
  process.stdout.write(`\n> npm run ${scriptName}\n`);
  execFileSync('npm', ['run', scriptName], { stdio: 'inherit' });
}

/**
 * ฟังก์ชันตรวจคุณภาพ API contract ก่อน push ขึ้น Git
 *
 * @returns {void}
 */
function verifyApiContract() {
  runScript('lint:check');
  runScript('test');
  runScript('openapi:generate');
  runScript('openapi:validate');
  runScript('openapi:diff');
}

try {
  verifyApiContract();
  process.stdout.write('\nAPI contract verification passed\n');
} catch (error) {
  const message =
    error instanceof Error ? error.message : 'Unknown verification error';

  process.stderr.write(`\nAPI contract verification failed: ${message}\n`);
  process.exitCode = 1;
}
