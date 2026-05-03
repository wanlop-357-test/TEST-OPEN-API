#!/usr/bin/env bash
set -euo pipefail

npm run lint:check
npm test
npm run openapi:generate
npm run openapi:validate
npm run openapi:diff
npm run apidog:sync
