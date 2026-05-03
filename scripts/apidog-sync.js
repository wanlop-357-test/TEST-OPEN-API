#!/usr/bin/env node

const requiredEnv = ['APIDOG_API_TOKEN', 'APIDOG_OPENAPI_URL'];

/**
 * ฟังก์ชันโหลดค่า .env แบบง่ายสำหรับ script นี้โดยไม่เพิ่ม dependency
 */
function loadDotEnv() {
  const { existsSync, readFileSync } = require('node:fs');
  const envPath = '.env';

  if (!existsSync(envPath)) {
    return;
  }

  readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const trimmedLine = line.trim();

      if (trimmedLine === '' || trimmedLine.startsWith('#')) {
        return;
      }

      const separatorIndex = trimmedLine.indexOf('=');

      if (separatorIndex === -1) {
        return;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^"(.*)"$/, '$1');

      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
}

/**
 * ฟังก์ชันอ่านค่า environment variable ที่จำเป็นสำหรับ sync เข้า Apidog
 */
function getRequiredEnv(name) {
  const value = process.env[name];

  if (value === undefined || value.trim() === '') {
    throw new Error(`${name} is required`);
  }

  return value;
}

/**
 * ฟังก์ชันสร้าง request body สำหรับ Apidog import OpenAPI API
 */
function createImportPayload(openApiUrl) {
  return {
    input: {
      url: openApiUrl,
    },
    options: {
      targetEndpointFolderId: Number(process.env.APIDOG_ENDPOINT_FOLDER_ID ?? 0),
      targetSchemaFolderId: Number(process.env.APIDOG_SCHEMA_FOLDER_ID ?? 0),
      endpointOverwriteBehavior: process.env.APIDOG_ENDPOINT_OVERWRITE_BEHAVIOR ?? 'OVERWRITE_EXISTING',
      schemaOverwriteBehavior: process.env.APIDOG_SCHEMA_OVERWRITE_BEHAVIOR ?? 'OVERWRITE_EXISTING',
      updateFolderOfChangedEndpoint: process.env.APIDOG_UPDATE_FOLDER_OF_CHANGED_ENDPOINT === 'true',
      prependBasePath: process.env.APIDOG_PREPEND_BASE_PATH === 'true',
    },
  };
}

/**
 * ฟังก์ชันตรวจ environment ก่อนเริ่ม sync
 */
function validateEnvironment() {
  requiredEnv.forEach((name) => {
    getRequiredEnv(name);
  });
}

/**
 * ฟังก์ชัน sync OpenAPI URL เข้า Apidog project เดิมของบริษัท
 */
async function syncApidog() {
  loadDotEnv();
  validateEnvironment();

  const projectId = process.env.APIDOG_PROJECT_ID ?? '1276414';
  const apiToken = getRequiredEnv('APIDOG_API_TOKEN');
  const openApiUrl = getRequiredEnv('APIDOG_OPENAPI_URL');
  const locale = process.env.APIDOG_LOCALE ?? 'en-US';
  const apiVersion = process.env.APIDOG_API_VERSION ?? '2024-03-28';
  const endpoint = `https://api.apidog.com/v1/projects/${projectId}/import-openapi?locale=${locale}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'X-Apidog-Api-Version': apiVersion,
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createImportPayload(openApiUrl)),
  });
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Apidog sync failed with ${response.status}: ${responseText}`);
  }

  process.stdout.write(`Apidog sync completed for project ${projectId}\n`);
  process.stdout.write(`${responseText}\n`);
}

/**
 * ฟังก์ชันตรวจ config ที่ต้องใช้ sync โดยไม่เรียก Apidog API
 */
function checkApidogConfig() {
  loadDotEnv();

  const projectId = process.env.APIDOG_PROJECT_ID ?? '1276414';
  const apiToken = process.env.APIDOG_API_TOKEN;
  const openApiUrl = process.env.APIDOG_OPENAPI_URL;

  process.stdout.write(`APIDOG_PROJECT_ID: ${projectId}\n`);
  process.stdout.write(`APIDOG_API_TOKEN: ${apiToken === undefined || apiToken.trim() === '' ? 'missing' : 'set'}\n`);
  process.stdout.write(
    `APIDOG_OPENAPI_URL: ${
      openApiUrl === undefined || openApiUrl.trim() === '' ? 'missing' : openApiUrl
    }\n`,
  );

  validateEnvironment();
  process.stdout.write('Apidog sync config is ready\n');
}

/**
 * ฟังก์ชัน entrypoint สำหรับ sync หรือ check config
 */
async function main() {
  if (process.argv[2] === 'check') {
    checkApidogConfig();
    return;
  }

  await syncApidog();
}

void main().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown Apidog sync error';

  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
