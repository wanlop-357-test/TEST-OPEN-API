# TEST Open API

NestJS API project ที่ใช้ code เป็น source of truth สำหรับสร้าง OpenAPI/Swagger document และ sync เข้า Apidog ผ่าน `openapi.yaml`

## AI Assistants Must Read First

ก่อนให้ AI assistant ตัวใดแก้ code ใน repo นี้ ต้องอ่าน:

- `AGENTS.md`
- `docs/project-rules.md`

กฎสำคัญที่สุด: ห้าม AI assistant รันคำสั่ง `git` เอง ยกเว้นผู้ใช้สั่งชัดเจนในข้อความล่าสุด

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

- `docs/project-rules.md`
- `docs/apidog-guide.md`
- `docs/api-conventions.md`
- `docs/api-change-log.md`
- `CONTRIBUTING.md`

Manual sync:

```bash
APIDOG_PROJECT_ID=1276414 \
APIDOG_API_TOKEN=your_token \
APIDOG_OPENAPI_URL=https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/dev/openapi.yaml \
npm run apidog:check

APIDOG_PROJECT_ID=1276414 \
APIDOG_API_TOKEN=your_token \
APIDOG_OPENAPI_URL=https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/dev/openapi.yaml \
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

## สรุปคำสั่งเมื่อมี API Change

ให้ตรวจ API contract ก่อน sync เข้า Apidog ทุกครั้ง

### 1. ตรวจ API contract

รันคำสั่งหลัก:

```bash
npm run verify:api
```

คำสั่งนี้ใช้ตรวจว่า API change พร้อมส่งต่อหรือยัง โดยต้องผ่าน lint, test, generate OpenAPI, validate OpenAPI และ diff contract ตาม workflow ของโปรเจกต์

ถ้าต้องแยกรันทีละขั้น:

```bash
npm run lint:check
npm run test
npm run openapi:generate
npm run openapi:validate
npm run openapi:diff
```

### 2. ตรวจไฟล์ OpenAPI ที่ generate แล้ว

หลัง `npm run openapi:generate` ต้องตรวจว่าไฟล์เหล่านี้เปลี่ยนตรงกับ API จริง:

```text
openapi.yaml
openapi.json
```

สิ่งที่ต้องดู:

- path ใหม่หรือ path ที่แก้ต้องอยู่ครบ
- request body, query, params และ response schema ต้องตรงกับ DTO
- error response ต้องเป็น format มาตรฐาน
- ไม่มี field ลับ เช่น password, token, secret หรือ internal key
- ถ้าเป็น breaking change ต้องอัปเดต `docs/api-change-log.md`

### 3. ตรวจ Apidog config ก่อน sync

ก่อน sync ให้เช็กว่า env สำหรับ Apidog พร้อม:

```bash
npm run apidog:check
```

ต้องตรวจว่าค่าเหล่านี้ถูกต้อง:

```text
APIDOG_PROJECT_ID
APIDOG_API_TOKEN
APIDOG_OPENAPI_URL
```

`APIDOG_OPENAPI_URL` ต้องเป็น raw URL ที่ Apidog server เข้าถึงได้ และต้องชี้ไปยัง branch ที่ต้องการ sync จริง

### 4. Sync เข้า Apidog

เมื่อ `verify:api` ผ่าน และ `apidog:check` ผ่านแล้ว ค่อย sync:

```bash
npm run apidog:sync
```

### Checklist เวลา API เปลี่ยน

- แก้ Controller, DTO, Service และ Test
- DTO ต้องมี validation และ `@ApiProperty`
- Endpoint ต้องมี Swagger decorator ครบ
- รัน `npm run verify:api`
- ตรวจ `openapi.yaml` และ `openapi.json`
- อัปเดต `docs/api-change-log.md` ถ้า contract เปลี่ยน
- รัน `npm run apidog:check`
- Sync Apidog เฉพาะเมื่อ config ถูกต้องและพร้อมเผยแพร่ contract

## Frontend/App ตรวจสอบก่อน Generate Client

หลัง backend มี API change ให้ frontend และ app ตรวจตามลำดับนี้ก่อน generate code หรือเริ่มแก้ integration

### 1. รอ backend ตรวจ contract ผ่าน

Backend ต้องยืนยันว่าคำสั่งนี้ผ่านแล้ว:

```bash
npm run verify:api
```

ถ้ายังไม่ผ่าน ห้าม frontend/app generate client จาก spec ชุดนั้น เพราะ contract อาจยังไม่สมบูรณ์

### 2. ตรวจว่า Apidog sync แล้ว

Backend ต้อง sync เข้า Apidog หลังตรวจผ่าน:

```bash
npm run apidog:check
npm run apidog:sync
```

จากนั้น frontend/app เปิด Apidog project แล้วตรวจ endpoint ที่เปลี่ยน:

```text
https://app.apidog.com/project/1276414
```

สิ่งที่ต้องดู:

- endpoint ใหม่หรือ endpoint ที่แก้มีอยู่จริง
- method และ path ถูกต้อง
- request body, query params และ path params ตรงกับ requirement
- response schema ตรงกับหน้าจอหรือ flow ที่ frontend/app จะใช้
- error response เป็น format มาตรฐานเดียวกัน
- auth requirement ถูกต้อง เช่น public หรือ bearer token

### 3. ตรวจ breaking change

ก่อน generate client ต้องอ่าน:

```text
docs/api-change-log.md
docs/api-conventions.md
```

ถ้ามี breaking change ให้ frontend/app ตรวจผลกระทบก่อน:

- field ถูกลบหรือ rename หรือไม่
- enum value เปลี่ยนหรือไม่
- validation rule เข้มขึ้นหรือไม่
- response status เปลี่ยนหรือไม่
- pagination หรือ error format เปลี่ยนหรือไม่
- auth requirement เปลี่ยนหรือไม่

### 4. Generate client หลังตรวจผ่าน

เมื่อ Apidog และ OpenAPI ถูกต้องแล้ว ค่อย generate client สำหรับแต่ละ platform จาก `openapi.yaml` หรือ URL ที่ทีมกำหนด

ตัวอย่าง source ที่ใช้ generate:

```text
openapi.yaml
https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/dev/openapi.yaml
```

หลัง generate client ต้องตรวจว่า type ที่ได้ตรงกับหน้าจอจริง และไม่มี field สำคัญหายไป

### Frontend/App Checklist

- Backend ยืนยันว่า `npm run verify:api` ผ่าน
- Backend sync Apidog แล้ว
- Apidog แสดง endpoint/schema ล่าสุด
- อ่าน `docs/api-change-log.md` แล้ว
- ตรวจ breaking change แล้ว
- Generate client ใหม่แล้ว
- Build frontend/app ผ่าน
- Flow ที่ใช้ endpoint ที่เปลี่ยนผ่าน manual test หรือ automated test
