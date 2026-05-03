# TEST Open API

NestJS API project ที่ใช้ code เป็น source of truth สำหรับสร้าง OpenAPI/Swagger document และ sync เข้า Apidog ผ่าน `openapi.yaml`

## Setup Project

```bash
npm install
cp .env.example .env
npm run start:dev
```

Swagger UI จะอยู่ที่:

```text
http://localhost:3000/docs
```

Health check จะอยู่ที่:

```text
http://localhost:3000/api/v1/health
```

## Commands ที่ใช้บ่อย

```bash
npm run start:dev
npm run build
npm run lint
npm run lint:check
npm run format
npm run test
npm run test:cov
npm run verify:quick
npm run verify:api
npm run openapi:generate
```

## Architecture Overview

```text
src/
├── common/
│   ├── decorators/    # decorator กลาง เช่น Swagger error responses มาตรฐาน
│   ├── dto/           # DTO กลาง เช่น error response format
│   ├── filters/       # exception filters สำหรับจัดรูปแบบ error response
│   ├── interceptors/  # interceptors กลาง เช่น request/response logging
│   ├── interfaces/    # type/interface ที่ใช้ร่วมกัน
│   └── middleware/    # middleware กลาง เช่น request id
├── config/            # app/env/sentry config
├── modules/           # business feature modules เช่น health, auth, users
├── openapi/           # setup Swagger/OpenAPI
├── scripts/           # scripts สำหรับ generate openapi.json/openapi.yaml
├── app.module.ts      # root module
└── main.ts            # bootstrap application
```

แนวทางของ project นี้:

- Code คือ source of truth
- ทุก endpoint ต้องมี Swagger decorators
- ทุก DTO ต้องมี validation และ `@ApiProperty`
- ทุก endpoint ใช้ error response format เดียวกัน
- มี request id, logging และ Sentry ตั้งแต่เริ่ม project

## Environment

ดูตัวอย่างค่า env ได้ที่ `.env.example`

ค่าหลัก:

- `APP_PORT`: port ของ API default คือ `3000`
- `API_PREFIX`: prefix ของ API default คือ `api/v1`
- `SWAGGER_PATH`: path ของ Swagger UI default คือ `docs`
- `SENTRY_DSN`: ใส่เมื่อพร้อมส่ง error เข้า Sentry

## Database / ORM

Phase 1 ยังไม่ผูก database และ ORM เพราะจะเลือกตาม requirement ถัดไป:

- Database: PostgreSQL / MySQL / MongoDB
- ORM: TypeORM / Prisma / Mongoose

## Apidog Sync

เอกสารทีมอยู่ที่:

- `docs/apidog-guide.md`
- `docs/api-conventions.md`
- `docs/api-change-log.md`
- `CONTRIBUTING.md`

Manual sync:

```bash
APIDOG_PROJECT_ID=1276414 \
APIDOG_API_TOKEN=your_token \
APIDOG_OPENAPI_URL=https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/main/openapi.yaml \
npm run apidog:check

APIDOG_PROJECT_ID=1276414 \
APIDOG_API_TOKEN=your_token \
APIDOG_OPENAPI_URL=https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/main/openapi.yaml \
npm run apidog:sync
```

Manual import เข้า project เดิม:

```text
https://app.apidog.com/project/1276414
```

Pre-deploy hook:

```bash
npm run predeploy
```
